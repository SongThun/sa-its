import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseApi, enrollmentApi } from '../services/api';
import type { Course, EnrollmentProgress } from '../types';
import './CourseDetail.css';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<EnrollmentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const isEnrolled = user?.enrolledCourses.includes(courseId || '') || false;

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (isEnrolled && user && courseId) {
      loadProgress();
    }
  }, [isEnrolled, user, courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const courseData = await courseApi.getCourseById(courseId);
      setCourse(courseData);
      // Expand first module by default
      if (courseData?.modules.length) {
        setExpandedModules(new Set([courseData.modules[0].id]));
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user || !courseId) return;
    try {
      const progressData = await enrollmentApi.getCourseProgress(user.id, courseId);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user || !courseId) return;
    setIsEnrolling(true);
    try {
      await enrollmentApi.enrollInCourse(user.id, courseId);
      refreshUser();
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!user || !courseId) return;
    setIsEnrolling(true);
    try {
      await enrollmentApi.unenrollFromCourse(user.id, courseId);
      refreshUser();
      setProgress(null);
    } catch (error) {
      console.error('Failed to unenroll:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.completedLessons.includes(lessonId) || false;
  };

  const getTotalLessons = () => {
    return course?.modules.reduce((acc, module) => acc + module.lessons.length, 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="course-detail-loading">
        <div className="spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-not-found">
        <h2>Course not found</h2>
        <Link to="/courses">Browse all courses</Link>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <div className="course-hero">
        <div className="hero-content">
          <div className="hero-info">
            <span className="course-badge">{course.category}</span>
            <h1>{course.title}</h1>
            <p className="course-description">{course.description}</p>
            <div className="course-instructor-info">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`}
                alt={course.instructor}
                className="instructor-avatar"
              />
              <div>
                <span className="instructor-label">Instructor</span>
                <span className="instructor-name">{course.instructor}</span>
              </div>
            </div>
            <div className="course-stats">
              <div className="stat">
                <span className="stat-icon">★</span>
                <span className="stat-value">{course.rating}</span>
                <span className="stat-label">Rating</span>
              </div>
              <div className="stat">
                <span className="stat-icon">👥</span>
                <span className="stat-value">{course.studentsCount.toLocaleString()}</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat">
                <span className="stat-icon">⏱️</span>
                <span className="stat-value">{course.duration}</span>
                <span className="stat-label">Duration</span>
              </div>
              <div className="stat">
                <span className="stat-icon">📊</span>
                <span className="stat-value">{course.level}</span>
                <span className="stat-label">Level</span>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <img src={course.thumbnail} alt={course.title} className="hero-thumbnail" />
            <div className="hero-card-content">
              {isEnrolled ? (
                <>
                  <div className="enrolled-status">
                    <span className="enrolled-icon">✓</span>
                    <span>You're enrolled!</span>
                  </div>
                  {progress && (
                    <div className="progress-info">
                      <div className="progress-bar-large">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {progress.progress}% complete ({progress.completedLessons.length}/{getTotalLessons()} lessons)
                      </span>
                    </div>
                  )}
                  <Link
                    to={`/course/${courseId}/lesson/${course.modules[0]?.lessons[0]?.id}`}
                    className="continue-btn"
                  >
                    {progress && progress.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </Link>
                  <button onClick={handleUnenroll} className="unenroll-btn" disabled={isEnrolling}>
                    {isEnrolling ? 'Processing...' : 'Unenroll'}
                  </button>
                </>
              ) : (
                <>
                  <div className="price-section">
                    <span className="price">Free</span>
                    <span className="price-note">Full access to all content</span>
                  </div>
                  <button
                    onClick={handleEnroll}
                    className="enroll-btn"
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                  <ul className="course-includes">
                    <li><span>📹</span> {getTotalLessons()} lessons</li>
                    <li><span>📚</span> {course.modules.length} modules</li>
                    <li><span>📱</span> Mobile access</li>
                    <li><span>🏆</span> Certificate of completion</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="course-content-section">
        <div className="content-container">
          <div className="section-header">
            <h2>Course Content</h2>
            <p>
              {course.modules.length} modules • {getTotalLessons()} lessons • {course.duration}
            </p>
          </div>

          <div className="modules-list">
            {course.modules.map((module, moduleIndex) => (
              <div key={module.id} className="module-item">
                <button
                  className={`module-header ${expandedModules.has(module.id) ? 'expanded' : ''}`}
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="module-title">
                    <span className="module-number">{moduleIndex + 1}</span>
                    <div>
                      <h3>{module.title}</h3>
                      <p>{module.description}</p>
                    </div>
                  </div>
                  <div className="module-meta">
                    <span className="lesson-count">{module.lessons.length} lessons</span>
                    <span className={`expand-icon ${expandedModules.has(module.id) ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                </button>

                {expandedModules.has(module.id) && (
                  <div className="lessons-list">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="lesson-item">
                        {isEnrolled ? (
                          <Link
                            to={`/course/${courseId}/lesson/${lesson.id}`}
                            className="lesson-link"
                          >
                            <span className="lesson-status">
                              {isLessonCompleted(lesson.id) ? (
                                <span className="completed-icon">✓</span>
                              ) : (
                                <span className="lesson-number">{lessonIndex + 1}</span>
                              )}
                            </span>
                            <div className="lesson-info">
                              <span className="lesson-title">{lesson.title}</span>
                              <span className="lesson-meta">
                                <span className="lesson-type">
                                  {lesson.type === 'video' ? '📹' : lesson.type === 'text' ? '📄' : '❓'}
                                </span>
                                {lesson.duration}
                              </span>
                            </div>
                            <span className="lesson-arrow">→</span>
                          </Link>
                        ) : (
                          <div className="lesson-link locked">
                            <span className="lesson-status">
                              <span className="locked-icon">🔒</span>
                            </span>
                            <div className="lesson-info">
                              <span className="lesson-title">{lesson.title}</span>
                              <span className="lesson-meta">
                                <span className="lesson-type">
                                  {lesson.type === 'video' ? '📹' : lesson.type === 'text' ? '📄' : '❓'}
                                </span>
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
