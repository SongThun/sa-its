import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  LinearProgress,
  CircularProgress,
  Stack,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Star as StarIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  BarChart as LevelIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  PlayCircle as PlayIcon,
  Article as ArticleIcon,
  Quiz as QuizIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowForward as ArrowIcon,
  Videocam as VideoIcon,
  MenuBook as ModuleIcon,
  PhoneAndroid as MobileIcon,
  EmojiEvents as CertificateIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { courseApi, enrollmentApi } from '../services/api';
import type { Course, EnrollmentProgress } from '../types';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (isEnrolled && user && courseId) {
      loadProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnrolled, user, courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const courseData = await courseApi.getCourseById(courseId);
      setCourse(courseData);
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

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon sx={{ fontSize: 20 }} />;
      case 'text': return <ArticleIcon sx={{ fontSize: 20 }} />;
      case 'quiz': return <QuizIcon sx={{ fontSize: 20 }} />;
      default: return <PlayIcon sx={{ fontSize: 20 }} />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading course...</Typography>
      </Box>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Course not found</Typography>
        <Button component={RouterLink} to="/courses" variant="contained">
          Browse all courses
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          py: 6,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Chip label={course.category} color="primary" sx={{ mb: 2 }} />
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                {course.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Instructor</Typography>
                  <Typography variant="body1" fontWeight={500}>{course.instructor}</Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: 'warning.main' }} />
                  <Typography variant="body1" fontWeight={500}>{course.rating}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>Rating</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon />
                  <Typography variant="body1" fontWeight={500}>{course.studentsCount.toLocaleString()}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>Students</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon />
                  <Typography variant="body1" fontWeight={500}>{course.duration}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>Duration</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LevelIcon />
                  <Typography variant="body1" fontWeight={500}>{course.level}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>Level</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ overflow: 'visible' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={course.thumbnail}
                  alt={course.title}
                />
                <CardContent>
                  {isEnrolled ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'success.main' }}>
                        <CheckIcon />
                        <Typography fontWeight={600}>You're enrolled!</Typography>
                      </Box>
                      {progress && (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Progress</Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {progress.progress}% ({progress.completedLessons.length}/{getTotalLessons()} lessons)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress.progress}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Box>
                      )}
                      <Button
                        component={RouterLink}
                        to={`/course/${courseId}/lesson/${course.modules[0]?.lessons[0]?.id}`}
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ mb: 2 }}
                      >
                        {progress && progress.progress > 0 ? 'Continue Learning' : 'Start Course'}
                      </Button>
                      <Button
                        onClick={handleUnenroll}
                        variant="outlined"
                        color="error"
                        fullWidth
                        disabled={isEnrolling}
                      >
                        {isEnrolling ? 'Processing...' : 'Unenroll'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" fontWeight={700} color="primary">Free</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Full access to all content
                        </Typography>
                      </Box>
                      <Button
                        onClick={handleEnroll}
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={isEnrolling}
                        sx={{ mb: 3 }}
                      >
                        {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <VideoIcon color="action" />
                          <Typography variant="body2">{getTotalLessons()} lessons</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <ModuleIcon color="action" />
                          <Typography variant="body2">{course.modules.length} modules</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <MobileIcon color="action" />
                          <Typography variant="body2">Mobile access</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <CertificateIcon color="action" />
                          <Typography variant="body2">Certificate of completion</Typography>
                        </Box>
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Course Content Section */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Course Content
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {course.modules.length} modules • {getTotalLessons()} lessons • {course.duration}
          </Typography>
        </Box>

        <Paper variant="outlined">
          <List disablePadding>
            {course.modules.map((module, moduleIndex) => (
              <Box key={module.id}>
                {moduleIndex > 0 && <Divider />}
                <ListItemButton onClick={() => toggleModule(module.id)} sx={{ py: 2 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
                      {moduleIndex + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography fontWeight={600}>{module.title}</Typography>}
                    secondary={module.description}
                  />
                  <Chip label={`${module.lessons.length} lessons`} size="small" sx={{ mr: 2 }} />
                  {expandedModules.has(module.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>

                <Collapse in={expandedModules.has(module.id)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ bgcolor: 'background.default' }}>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <ListItem
                        key={lesson.id}
                        disablePadding
                        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                      >
                        {isEnrolled ? (
                          <ListItemButton
                            component={RouterLink}
                            to={`/course/${courseId}/lesson/${lesson.id}`}
                            sx={{ pl: 9 }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {isLessonCompleted(lesson.id) ? (
                                <CheckIcon color="success" />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {lessonIndex + 1}
                                </Typography>
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={lesson.title}
                              secondary={
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {getLessonIcon(lesson.type)}
                                  <Typography variant="caption">{lesson.duration}</Typography>
                                </Stack>
                              }
                            />
                            <ArrowIcon sx={{ color: 'text.secondary' }} />
                          </ListItemButton>
                        ) : (
                          <ListItem sx={{ pl: 9, opacity: 0.6 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <LockIcon color="disabled" />
                            </ListItemIcon>
                            <ListItemText
                              primary={lesson.title}
                              secondary={
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {getLessonIcon(lesson.type)}
                                  <Typography variant="caption">{lesson.duration}</Typography>
                                </Stack>
                              }
                            />
                          </ListItem>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </List>
        </Paper>
      </Container>
    </Box>
  );
}
