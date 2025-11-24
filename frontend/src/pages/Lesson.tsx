import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseApi, progressApi, enrollmentApi } from '../services/api';
import type { Course, Lesson as LessonType, EnrollmentProgress } from '../types';
import './Lesson.css';

export default function Lesson() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonType | null>(null);
  const [progress, setProgress] = useState<EnrollmentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [courseId, lessonId, isAuthenticated, navigate]);

  const loadData = async () => {
    if (!courseId || !lessonId || !user) return;
    setIsLoading(true);
    try {
      const [courseData, progressData] = await Promise.all([
        courseApi.getCourseById(courseId),
        enrollmentApi.getCourseProgress(user.id, courseId),
      ]);

      if (courseData) {
        setCourse(courseData);
        // Find current lesson
        for (const module of courseData.modules) {
          const lesson = module.lessons.find((l) => l.id === lessonId);
          if (lesson) {
            setCurrentLesson(lesson);
            break;
          }
        }
        // Update last accessed
        await progressApi.updateLastAccessed(courseId);
      }
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!user || !lessonId) return;
    setIsCompleting(true);
    try {
      const isAlreadyCompleted = progress?.completedLessons.includes(lessonId);
      if (isAlreadyCompleted) {
        await progressApi.uncompleteLesson(user.id, lessonId);
      } else {
        await progressApi.completeLesson(user.id, lessonId);
      }
      refreshUser();
      // Reload progress
      if (courseId) {
        const newProgress = await enrollmentApi.getCourseProgress(user.id, courseId);
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('Failed to update lesson completion:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const isLessonCompleted = (id: string) => {
    return progress?.completedLessons.includes(id) || false;
  };

  const getCurrentLessonIndex = () => {
    if (!course) return { moduleIndex: 0, lessonIndex: 0 };
    for (let mi = 0; mi < course.modules.length; mi++) {
      for (let li = 0; li < course.modules[mi].lessons.length; li++) {
        if (course.modules[mi].lessons[li].id === lessonId) {
          return { moduleIndex: mi, lessonIndex: li };
        }
      }
    }
    return { moduleIndex: 0, lessonIndex: 0 };
  };

  const getAdjacentLessons = () => {
    if (!course) return { prev: null, next: null };
    const allLessons: { lesson: LessonType; moduleTitle: string }[] = [];
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        allLessons.push({ lesson, moduleTitle: module.title });
      });
    });

    const currentIndex = allLessons.findIndex((l) => l.lesson.id === lessonId);
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
    };
  };

  const { prev, next } = getAdjacentLessons();

  if (isLoading) {
    return (
      <div className="lesson-loading">
        <div className="spinner"></div>
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="lesson-not-found">
        <h2>Lesson not found</h2>
        <Link to={`/course/${courseId}`}>Back to course</Link>
      </div>
    );
  }

  return (
    <div className="lesson-page">
      <div className={`lesson-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to={`/course/${courseId}`} className="back-to-course">
            ← Back to Course
          </Link>
          <button
            className="toggle-sidebar"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>

        <div className="sidebar-progress">
          <div className="progress-header">
            <span className="progress-label">Course Progress</span>
            <span className="progress-value">{progress?.progress || 0}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress?.progress || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="sidebar-modules">
          {course.modules.map((module, moduleIndex) => (
            <div key={module.id} className="sidebar-module">
              <div className="module-header">
                <span className="module-number">{moduleIndex + 1}</span>
                <span className="module-title">{module.title}</span>
              </div>
              <div className="module-lessons">
                {module.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    to={`/course/${courseId}/lesson/${lesson.id}`}
                    className={`sidebar-lesson ${lesson.id === lessonId ? 'active' : ''} ${isLessonCompleted(lesson.id) ? 'completed' : ''}`}
                  >
                    <span className="lesson-status-icon">
                      {isLessonCompleted(lesson.id) ? '✓' : lesson.type === 'video' ? '▶' : '📄'}
                    </span>
                    <span className="lesson-title">{lesson.title}</span>
                    <span className="lesson-duration">{lesson.duration}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lesson-main">
        <div className="lesson-header">
          <div className="lesson-breadcrumb">
            <span>{course.title}</span>
            <span className="breadcrumb-separator">›</span>
            <span>{course.modules[getCurrentLessonIndex().moduleIndex]?.title}</span>
          </div>
          <h1>{currentLesson.title}</h1>
          <div className="lesson-meta">
            <span className="meta-item">
              {currentLesson.type === 'video' ? '📹 Video' : '📄 Article'}
            </span>
            <span className="meta-item">⏱️ {currentLesson.duration}</span>
          </div>
        </div>

        <div className="lesson-content">
          {currentLesson.type === 'video' && currentLesson.content.videoUrl && (
            <div className="video-container">
              <iframe
                src={currentLesson.content.videoUrl}
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {currentLesson.content.text && (
            <div className="text-content">
              <pre>{currentLesson.content.text}</pre>
            </div>
          )}
        </div>

        <div className="lesson-actions">
          <button
            className={`complete-btn ${isLessonCompleted(lessonId || '') ? 'completed' : ''}`}
            onClick={handleCompleteLesson}
            disabled={isCompleting}
          >
            {isCompleting ? (
              'Updating...'
            ) : isLessonCompleted(lessonId || '') ? (
              <>
                <span className="check-icon">✓</span>
                Completed - Click to Undo
              </>
            ) : (
              <>
                <span className="circle-icon">○</span>
                Mark as Complete
              </>
            )}
          </button>
        </div>

        <div className="lesson-navigation">
          {prev ? (
            <Link
              to={`/course/${courseId}/lesson/${prev.lesson.id}`}
              className="nav-btn prev"
            >
              <span className="nav-direction">← Previous</span>
              <span className="nav-title">{prev.lesson.title}</span>
            </Link>
          ) : (
            <div></div>
          )}
          {next ? (
            <Link
              to={`/course/${courseId}/lesson/${next.lesson.id}`}
              className="nav-btn next"
            >
              <span className="nav-direction">Next →</span>
              <span className="nav-title">{next.lesson.title}</span>
            </Link>
          ) : (
            <Link to={`/course/${courseId}`} className="nav-btn next finish">
              <span className="nav-direction">Finish Course 🎉</span>
              <span className="nav-title">Back to Course Overview</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
