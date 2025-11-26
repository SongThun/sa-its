import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  People as PeopleIcon,
  Star as StarIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { instructorCoursesApi } from '../../services/api';
import type { Course } from '../../types';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorCoursesApi.getAll();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses. Please try again.');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await instructorCoursesApi.delete(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      alert('Failed to delete course');
      console.error('Error deleting course:', err);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const updated = await instructorCoursesApi.togglePublish(
        course.id,
        !course.is_published
      );
      setCourses(courses.map(c => c.id === course.id ? updated : c));
    } catch (err) {
      alert('Failed to update course');
      console.error('Error toggling publish:', err);
    }
  };

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.is_published).length,
    totalStudents: courses.reduce((sum, c) => sum + c.students_count, 0),
    avgRating: courses.length > 0
      ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
      : '0.0',
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Instructor Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/instructor/courses/create"
        >
          Create New Course
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Courses
                </Typography>
              </Box>
              <Typography variant="h4">{stats.totalCourses}</Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.publishedCourses} published
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Students
                </Typography>
              </Box>
              <Typography variant="h4">{stats.totalStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Average Rating
                </Typography>
              </Box>
              <Typography variant="h4">{stats.avgRating}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Lessons
                </Typography>
              </Box>
              <Typography variant="h4">
                {courses.reduce((sum, c) => sum + c.total_lessons, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Course List */}
      <Typography variant="h5" sx={{ mb: 3 }}>
        My Courses
      </Typography>

      {courses.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No courses yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Create your first course to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={Link}
              to="/instructor/courses/create"
            >
              Create Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={course.thumbnail || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={course.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={course.is_published ? 'Published' : 'Draft'}
                      color={course.is_published ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={course.level}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                    }}
                  >
                    {course.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2">
                      <StarIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {course.rating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2">
                      <PeopleIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {course.students_count} students
                    </Typography>
                    <Typography variant="body2">
                      {course.total_lessons} lessons
                    </Typography>
                  </Box>

                  {Array.isArray(course.topics) && course.topics.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {course.topics.map((topic, index) => (
                        <Chip
                          key={index}
                          label={typeof topic === 'string' ? topic : topic.name}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mt: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`/instructor/courses/${course.id}/edit`}
                  >
                    Edit
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleTogglePublish(course)}
                    title={course.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {course.is_published ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
