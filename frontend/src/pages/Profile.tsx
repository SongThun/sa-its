import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentApi } from '../services/api';
import type { Course } from '../types';
import './Profile.css';

export default function Profile() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio || '',
      });
      loadEnrolledCourses();
    }
  }, [isAuthenticated, user, navigate]);

  const loadEnrolledCourses = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const courses = await enrollmentApi.getEnrolledCourses(user.id);
      setEnrolledCourses(courses);
    } catch (error) {
      console.error('Failed to load enrolled courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    await updateUser(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio || '',
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-cover"></div>
          <div className="profile-info">
            <div className="profile-avatar-section">
              <img src={user.avatar} alt="Avatar" className="profile-avatar" />
              <button className="change-avatar-btn">Change Photo</button>
            </div>
            <div className="profile-details">
              {isEditing ? (
                <div className="edit-form">
                  <div className="edit-row">
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      placeholder="Last Name"
                    />
                  </div>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                  <div className="edit-actions">
                    <button onClick={handleSave} className="save-btn">Save Changes</button>
                    <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
                  <p className="profile-email">{user.email}</p>
                  <p className="profile-bio">{user.bio || 'No bio added yet.'}</p>
                  <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <div className="stat-info">
              <span className="stat-value">{enrolledCourses.length}</span>
              <span className="stat-label">Enrolled Courses</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-value">{user.completedLessons.length}</span>
              <span className="stat-label">Completed Lessons</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div className="stat-info">
              <span className="stat-value">{new Date(user.createdAt).toLocaleDateString()}</span>
              <span className="stat-label">Member Since</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔥</span>
            <div className="stat-info">
              <span className="stat-value">7</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>My Courses</h2>
          {isLoading ? (
            <div className="loading-courses">Loading courses...</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="no-courses">
              <p>You haven't enrolled in any courses yet.</p>
              <button onClick={() => navigate('/courses')} className="browse-courses-btn">
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="enrolled-courses-grid">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="enrolled-course-card" onClick={() => navigate(`/course/${course.id}`)}>
                  <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p className="course-instructor">{course.instructor}</p>
                    <div className="course-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">In Progress</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Learning Activity</h2>
          <div className="activity-chart">
            <div className="chart-header">
              <span>This Week</span>
            </div>
            <div className="chart-bars">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{ height: `${[60, 80, 45, 90, 70, 30, 50][index]}%` }}
                  ></div>
                  <span className="chart-label">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Achievements</h2>
          <div className="achievements-grid">
            <div className="achievement-card earned">
              <span className="achievement-icon">🎯</span>
              <span className="achievement-name">First Steps</span>
              <span className="achievement-desc">Completed first lesson</span>
            </div>
            <div className="achievement-card earned">
              <span className="achievement-icon">📖</span>
              <span className="achievement-name">Bookworm</span>
              <span className="achievement-desc">Enrolled in 3 courses</span>
            </div>
            <div className="achievement-card">
              <span className="achievement-icon">🏆</span>
              <span className="achievement-name">Champion</span>
              <span className="achievement-desc">Complete 10 courses</span>
            </div>
            <div className="achievement-card">
              <span className="achievement-icon">⚡</span>
              <span className="achievement-name">Speed Learner</span>
              <span className="achievement-desc">Finish course in 1 week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
