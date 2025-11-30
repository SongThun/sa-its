import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  LinearProgress,
  CircularProgress,
  Stack,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayCircle as PlayIcon,
  AccessTime as TimeIcon,
  BarChart as LevelIcon,
  Star as StarIcon,
  School as SchoolIcon,
  CheckCircle as LessonIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { courseApi, enrollmentApi } from '../services/api';
import type { Course, EnrolledCourse } from '../types';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [ongoingCourses, setOngoingCourses] = useState<EnrolledCourse[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
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
      const [courses, cats, ongoing] = await Promise.all([
        courseApi.getAllCourses(),
        courseApi.getCategories(),
        enrollmentApi.getOngoingCourses(),
      ]);
      setAllCourses(courses);
      setCategories(['All', ...cats]);
      setOngoingCourses(ongoing);
      // Build set of enrolled course IDs for quick lookup
      setEnrolledCourseIds(new Set(ongoing.map(c => c.id)));
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

  const isEnrolled = (courseId: string) => enrolledCourseIds.has(courseId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading your dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Welcome back, {user?.first_name}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Continue your learning journey where you left off.
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <SchoolIcon />
                  <Typography variant="h4" fontWeight={700}>
                    {ongoingCourses.length}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Enrolled</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LessonIcon />
                  <Typography variant="h4" fontWeight={700}>
                    {ongoingCourses.filter(c => c.enrollment_status === 'completed').length}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Completed</Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* Continue Learning Section */}
        {ongoingCourses.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={600}>Continue Learning</Typography>
              <Typography variant="body2" color="text.secondary">
                Pick up where you left off
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {ongoingCourses.map((course) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={course.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                    }}
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={course.cover_image || 'https://via.placeholder.com/400x160?text=No+Image'}
                        alt={course.title}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': { opacity: 1 },
                        }}
                      >
                        <PlayIcon sx={{ fontSize: 64, color: 'white' }} />
                      </Box>
                    </Box>
                    <CardContent>
                      <Chip label={course.category} size="small" color="primary" sx={{ mb: 1 }} />
                      <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {course.instructor_name}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Progress</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {Math.round(course.progress)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={course.progress}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Last accessed: {course.last_accessed_at ? new Date(course.last_accessed_at).toLocaleDateString() : 'Never'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Browse Courses Section */}
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>Browse Courses</Typography>
            <Typography variant="body2" color="text.secondary">
              Explore our course catalog
            </Typography>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 280 }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setSelectedCategory(category)}
                  color={selectedCategory === category ? 'primary' : 'default'}
                  variant={selectedCategory === category ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>

          {/* Course Grid */}
          <Grid container spacing={3}>
            {filteredCourses.map((course) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={course.id}>
                <Card
                  component={RouterLink}
                  to={`/course/${course.id}`}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  }}
                >
                  <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.cover_image || 'https://via.placeholder.com/400x140?text=No+Image'}
                        alt={course.title}
                      />
                      {isEnrolled(course.id) && (
                        <Chip
                          label="Enrolled"
                          size="small"
                          color="success"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Chip label={course.category} size="small" sx={{ mb: 1 }} />
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {course.instructor_name}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {Math.floor(course.est_duration / 60)}h {course.est_duration % 60}m
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LevelIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {course.difficulty_level}
                          </Typography>
                        </Box>
                      </Stack>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="body2" fontWeight={500}>{course.rating}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({course.students_count.toLocaleString()} students)
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredCourses.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                No courses found matching your criteria.
              </Typography>
              <Chip
                label="Clear filters"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                color="primary"
                sx={{ mt: 1 }}
              />
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
}
