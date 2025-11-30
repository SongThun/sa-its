import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  CircularProgress,
  Stack,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { courseApi } from '../services/api';
import type { Course } from '../types';

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
      (course.instructor_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.difficulty_level === selectedLevel.toLowerCase();
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const isEnrolled = (courseId: string) => user?.enrolledCourses.includes(courseId) || false;

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      case 'expert': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading courses...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Explore Our Courses
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Discover thousands of courses to help you grow your skills
          </Typography>
          <TextField
            fullWidth
            placeholder="Search for courses, topics, or instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 600,
              bgcolor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { border: 'none' },
              },
            }}
          />
        </Container>
      </Box>

      {/* Filters & Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Filter Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Category
              </Typography>
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
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Level
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {levels.map((level) => (
                  <Chip
                    key={level}
                    label={level}
                    onClick={() => setSelectedLevel(level)}
                    color={selectedLevel === level ? 'primary' : 'default'}
                    variant={selectedLevel === level ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {filteredCourses.length} courses found
          </Typography>
          {(searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All') && (
            <Chip
              label="Clear filters"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLevel('All');
              }}
              onDelete={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLevel('All');
              }}
              color="primary"
              variant="outlined"
            />
          )}
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
                      height="160"
                      image={course.cover_image || 'https://via.placeholder.com/320x160?text=No+Image'}
                      alt={course.title}
                    />
                    {isEnrolled(course.id) && (
                      <Chip
                        label="Enrolled"
                        size="small"
                        color="success"
                        sx={{ position: 'absolute', top: 8, left: 8 }}
                      />
                    )}
                    <Chip
                      label={course.difficulty_level}
                      size="small"
                      color={getLevelColor(course.difficulty_level) as 'success' | 'warning' | 'error' | 'default'}
                      sx={{ position: 'absolute', top: 8, right: 8, textTransform: 'capitalize' }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip label={course.category} size="small" sx={{ mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                      {course.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor_name}`}
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {course.instructor_name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                        <Typography variant="body2" fontWeight={500}>{course.rating}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({course.students_count.toLocaleString()})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {Math.floor(course.est_duration / 60)}h {course.est_duration % 60}m
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: 64, mb: 2 }}>
              {"📚"}
            </Typography>
            <Typography variant="h6" gutterBottom>
              No courses found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Try adjusting your search or filters to find what you're looking for.
            </Typography>
            <Chip
              label="Clear all filters"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLevel('All');
              }}
              color="primary"
            />
          </Paper>
        )}
      </Container>
    </Box>
  );
}
