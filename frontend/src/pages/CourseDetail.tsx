import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowForward as ArrowIcon,
  Videocam as VideoIcon,
  MenuBook as ModuleIcon,
  PhoneAndroid as MobileIcon,
  EmojiEvents as CertificateIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { courseApi, enrollmentApi } from '../services/api';
import type { Course, EnrollmentProgress } from '../types';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<EnrollmentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCourse();
    if (isAuthenticated && courseId) {
      checkEnrollmentStatus();
    } else {
      setEnrollmentChecked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, isAuthenticated]);

  // Handle auto-enroll when returning from login with action=enroll
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'enroll' && isAuthenticated && enrollmentChecked && courseId) {
      // Clear the action param from URL
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
      // Trigger enrollment only if not already enrolled
      if (!isEnrolled && !isEnrolling) {
        handleEnrollAfterLogin();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isEnrolled, enrollmentChecked, searchParams]);

  const handleEnrollAfterLogin = async () => {
    if (!courseId) return;
    setIsEnrolling(true);
    try {
      const success = await enrollmentApi.enrollInCourse(courseId);
      if (success) {
        setIsEnrolled(true);
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  useEffect(() => {
    if (isEnrolled && courseId) {
      loadProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnrolled, courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const courseData = await courseApi.getCourseById(courseId);
      setCourse(courseData);
      if (courseData?.modules?.length) {
        setExpandedModules(new Set([courseData.modules[0].id]));
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!courseId) return;
    try {
      const enrolled = await enrollmentApi.isEnrolled(courseId);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    } finally {
      setEnrollmentChecked(true);
    }
  };

  const loadProgress = async () => {
    if (!courseId) return;
    try {
      const progressData = await enrollmentApi.getCourseProgress(courseId);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/course/${courseId}`)}&action=enroll`);
      return;
    }
    if (!courseId) return;
    setIsEnrolling(true);
    try {
      const success = await enrollmentApi.enrollInCourse(courseId);
      if (success) {
        setIsEnrolled(true);
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!isAuthenticated || !courseId) return;
    setIsEnrolling(true);
    try {
      const success = await enrollmentApi.unenrollFromCourse(courseId);
      if (success) {
        setIsEnrolled(false);
        setProgress(null);
      }
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
    return progress?.completedLessons?.includes(lessonId) || false;
  };

  const getTotalLessons = () => {
    return course?.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon sx={{ fontSize: 20 }} />;
      case 'text': return <ArticleIcon sx={{ fontSize: 20 }} />;
      case 'document': return <DocumentIcon sx={{ fontSize: 20 }} />;
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
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor_name}`}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Instructor</Typography>
                  <Typography variant="body1" fontWeight={500}>{course.instructor_name}</Typography>
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
                  <Typography variant="body1" fontWeight={500}>{course.students_count.toLocaleString()}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>Students</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon />
                  <Typography variant="body1" fontWeight={500}>{Math.floor(course.est_duration / 60)}h {course.est_duration % 60}m</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>Duration</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LevelIcon />
                  <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{course.difficulty_level}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>Level</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ overflow: 'visible' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={course.cover_image || 'https://via.placeholder.com/400x180?text=No+Image'}
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
                              {Math.round(progress.progress)}% ({progress.completedLessons?.length || 0}/{getTotalLessons()} lessons)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.round(progress.progress)}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Box>
                      )}
                      <Button
                        component={RouterLink}
                        to={`/course/${courseId}/lesson/${course.modules?.[0]?.lessons?.[0]?.id || ''}`}
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
            {course.modules?.length || 0} modules • {getTotalLessons()} lessons • {Math.floor(course.est_duration / 60)}h {course.est_duration % 60}m
          </Typography>
        </Box>

        <Paper variant="outlined">
          <List disablePadding>
            {(course.modules || []).map((module, moduleIndex) => (
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
                  <Chip label={`${module.lessons?.length || 0} lessons`} size="small" sx={{ mr: 2 }} />
                  {expandedModules.has(module.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>

                <Collapse in={expandedModules.has(module.id)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ bgcolor: 'background.default' }}>
                    {(module.lessons || []).map((lesson, lessonIndex) => (
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
                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  {getLessonIcon(lesson.content_type)}
                                  <Typography variant="caption" component="span">{lesson.estimated_duration} min</Typography>
                                  {lesson.topics?.map((topic) => (
                                    <Chip key={topic.id} label={topic.name} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                  ))}
                                </Box>
                              }
                            />
                            <ArrowIcon sx={{ color: 'text.secondary' }} />
                          </ListItemButton>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', pl: 9, py: 1, opacity: 0.6, width: '100%' }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <LockIcon color="disabled" />
                            </ListItemIcon>
                            <ListItemText
                              primary={lesson.title}
                              secondary={
                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  {getLessonIcon(lesson.content_type)}
                                  <Typography variant="caption" component="span">{lesson.estimated_duration} min</Typography>
                                  {lesson.topics?.map((topic) => (
                                    <Chip key={topic.id} label={topic.name} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                  ))}
                                </Box>
                              }
                            />
                          </Box>
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
