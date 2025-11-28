import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Star as StarIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { instructorCoursesApi } from '../../services/api';
import type { Course } from '../../types';

export default function InstructorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, [location.key]); // Reload when navigation happens

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorCoursesApi.getAll();
      console.log('Loaded courses:', data);
      console.log('First course ID:', data[0]?.id);
      console.log('First course:', JSON.stringify(data[0], null, 2));
      setCourses(data);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to load courses. Please try again.';
      setError(errorMessage);
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (e: React.ChangeEvent<HTMLInputElement>, courseId: string) => {
    e.stopPropagation(); // Prevent card click when toggling
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    try {
      const updated = await instructorCoursesApi.togglePublish(
        courseId,
        !course.is_published
      );
      setCourses(courses.map(c => c.id === courseId ? updated : c));
    } catch (err) {
      alert('Failed to update course');
      console.error('Error toggling publish:', err);
    }
  };

  const handleCardClick = (courseId: string) => {
    console.log('Navigating to edit course with ID:', courseId);
    navigate(`/instructor/courses/${courseId}/edit`);
  };

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.is_published).length,
    totalStudents: courses.reduce((sum, c) => sum + c.students_count, 0),
    avgRating: courses.length > 0
      ? (courses.reduce((sum, c) => sum + Number(c.rating), 0) / courses.length).toFixed(1)
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
        {[
          {
            icon: <SchoolIcon color="primary" sx={{ mr: 1 }} />,
            label: 'Total Courses',
            value: stats.totalCourses,
            subtext: `${stats.publishedCourses} published`,
          },
          {
            icon: <PeopleIcon color="primary" sx={{ mr: 1 }} />,
            label: 'Total Students',
            value: stats.totalStudents,
          },
          {
            icon: <StarIcon color="primary" sx={{ mr: 1 }} />,
            label: 'Average Rating',
            value: stats.avgRating,
          },
          {
            icon: <SchoolIcon color="primary" sx={{ mr: 1 }} />,
            label: 'Total Lessons',
            value: courses.reduce((sum, c) => sum + c.total_lessons, 0),
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {stat.icon}
                  <Typography color="textSecondary" variant="body2">
                    {stat.label}
                  </Typography>
                </Box>
                <Typography variant="h4">{stat.value}</Typography>
                {stat.subtext && (
                  <Typography variant="body2" color="textSecondary">
                    {stat.subtext}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
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
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleCardClick(course.id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={course.cover_image || 'https://via.placeholder.com/400x200?text=No+Image'}
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
                      label={course.difficulty_level}
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
                      {Number(course.rating).toFixed(1)}
                    </Typography>
                    <Typography variant="body2">
                      <PeopleIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {course.students_count} students
                    </Typography>
                    <Typography variant="body2">
                      {course.total_lessons} lessons
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={course.is_published}
                        onChange={(e) => handleTogglePublish(e, course.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={course.is_published ? 'Published' : 'Draft'}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ minWidth: 130 }}
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
