import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseApi } from '../services/api';
import type { Course } from '../types';
import './Courses.css';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const [coursesData, categoriesData] = await Promise.all([
        courseApi.getAllCourses(),
        courseApi.getCategories(),
      ]);
      setCourses(coursesData);
      setCategories(['All', ...categoriesData]);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const isEnrolled = (courseId: string) => user?.enrolledCourses.includes(courseId) || false;

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  if (isLoading) {
    return (
      <div className="courses-loading">
        <div className="spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-hero">
        <div className="hero-content">
          <h1>Explore Our Courses</h1>
          <p>Discover thousands of courses to help you grow your skills</p>
          <div className="hero-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for courses, topics, or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="courses-container">
        <div className="filters-section">
          <div className="filter-group">
            <label>Category</label>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Level</label>
            <div className="filter-buttons">
              {levels.map((level) => (
                <button
                  key={level}
                  className={`filter-btn ${selectedLevel === level ? 'active' : ''}`}
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="courses-results">
          <div className="results-header">
            <span className="results-count">{filteredCourses.length} courses found</span>
            {(searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All') && (
              <button
                className="clear-filters"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <Link key={course.id} to={`/course/${course.id}`} className="course-card">
                <div className="card-image">
                  <img src={course.thumbnail} alt={course.title} />
                  {isEnrolled(course.id) && (
                    <span className="enrolled-badge">Enrolled</span>
                  )}
                  <span className={`level-badge ${course.level.toLowerCase()}`}>
                    {course.level}
                  </span>
                </div>
                <div className="card-content">
                  <span className="card-category">{course.category}</span>
                  <h3 className="card-title">{course.title}</h3>
                  <p className="card-description">{course.description.slice(0, 100)}...</p>
                  <div className="card-instructor">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`}
                      alt={course.instructor}
                      className="instructor-avatar"
                    />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="card-footer">
                    <div className="card-rating">
                      <span className="star">★</span>
                      <span className="rating-value">{course.rating}</span>
                      <span className="rating-count">({course.studentsCount.toLocaleString()})</span>
                    </div>
                    <div className="card-duration">
                      <span>⏱️</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="no-courses">
              <div className="no-courses-icon">📚</div>
              <h3>No courses found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
