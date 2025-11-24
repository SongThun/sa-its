import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseApi, enrollmentApi } from '../services/api';
import type { Course, EnrollmentProgress } from '../types';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [ongoingCourses, setOngoingCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, EnrollmentProgress>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [courses, cats] = await Promise.all([
        courseApi.getAllCourses(),
        courseApi.getCategories(),
      ]);
      setAllCourses(courses);
      setCategories(['All', ...cats]);

      if (user) {
        const ongoing = await enrollmentApi.getOngoingCourses(user.id);
        setOngoingCourses(ongoing);

        // Load progress for enrolled courses
        const progressPromises = user.enrolledCourses.map((courseId) =>
          enrollmentApi.getCourseProgress(user.id, courseId)
        );
        const progressResults = await Promise.all(progressPromises);
        const progressObj: Record<string, EnrollmentProgress> = {};
        progressResults.forEach((progress) => {
          progressObj[progress.courseId] = progress;
        });
        setProgressMap(progressObj);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isEnrolled = (courseId: string) => user?.enrolledCourses.includes(courseId) || false;

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h1>Welcome back, {user?.firstName}!</h1>
            <p>Continue your learning journey where you left off.</p>
          </div>
          <div className="welcome-stats">
            <div className="welcome-stat">
              <span className="stat-number">{user?.enrolledCourses.length || 0}</span>
              <span className="stat-text">Courses</span>
            </div>
            <div className="welcome-stat">
              <span className="stat-number">{user?.completedLessons.length || 0}</span>
              <span className="stat-text">Lessons</span>
            </div>
          </div>
        </div>

        {ongoingCourses.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Continue Learning</h2>
              <span className="section-subtitle">Pick up where you left off</span>
            </div>
            <div className="ongoing-courses">
              {ongoingCourses.map((course) => (
                <div
                  key={course.id}
                  className="ongoing-course-card"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <div className="ongoing-course-image">
                    <img src={course.thumbnail} alt={course.title} />
                    <div className="play-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>
                  <div className="ongoing-course-info">
                    <span className="course-category-badge">{course.category}</span>
                    <h3>{course.title}</h3>
                    <p className="instructor">{course.instructor}</p>
                    <div className="progress-section">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progressMap[course.id]?.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="progress-percentage">
                        {progressMap[course.id]?.progress || 0}% complete
                      </span>
                    </div>
                    <p className="last-accessed">
                      Last accessed: {course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Browse Courses</h2>
            <span className="section-subtitle">Explore our course catalog</span>
          </div>

          <div className="filters-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="course-card"
              >
                <div className="course-image">
                  <img src={course.thumbnail} alt={course.title} />
                  {isEnrolled(course.id) && (
                    <span className="enrolled-badge">Enrolled</span>
                  )}
                </div>
                <div className="course-content">
                  <span className="course-category">{course.category}</span>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-instructor">{course.instructor}</p>
                  <div className="course-meta">
                    <span className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      {course.duration}
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">📊</span>
                      {course.level}
                    </span>
                  </div>
                  <div className="course-footer">
                    <div className="course-rating">
                      <span className="star">★</span>
                      <span>{course.rating}</span>
                      <span className="students">({course.studentsCount.toLocaleString()} students)</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="no-results">
              <p>No courses found matching your criteria.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
