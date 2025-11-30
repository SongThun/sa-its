import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  CircularProgress,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Article as ArticleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Videocam as VideoIcon,
  AccessTime as TimeIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Celebration as CelebrationIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { courseApi, progressApi, enrollmentApi } from '../services/api';
import type {
  Course,
  Lesson as LessonType,
  EnrollmentProgress,
  VideoContent,
  TextContent,
  DocumentContent,
  LessonContentType,
} from '../types';

const DRAWER_WIDTH = 320;

// Helper function to get icon based on content type
const getContentTypeIcon = (contentType: LessonContentType, fontSize: 'small' | 'medium' = 'small') => {
  switch (contentType) {
    case 'video':
      return <VideoIcon fontSize={fontSize} />;
    case 'text':
      return <ArticleIcon fontSize={fontSize} />;
    case 'document':
      return <DocumentIcon fontSize={fontSize} />;
    default:
      return <ArticleIcon fontSize={fontSize} />;
  }
};

// Helper function to get label for content type
const getContentTypeLabel = (contentType: LessonContentType): string => {
  const labels: Record<LessonContentType, string> = {
    video: 'Video',
    text: 'Article',
    document: 'Document',
  };
  return labels[contentType] || 'Content';
};

export default function Lesson() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonType | null>(null);
  const [progress, setProgress] = useState<EnrollmentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId, isAuthenticated, navigate]);

  const loadData = async () => {
    if (!courseId || !lessonId || !user) return;
    setIsLoading(true);
    try {
      const [courseData, progressData] = await Promise.all([
        courseApi.getCourseById(courseId),
        enrollmentApi.getCourseProgress(courseId),
      ]);

      if (courseData) {
        setCourse(courseData);
        for (const module of courseData.modules || []) {
          const lesson = (module.lessons || []).find((l) => l.id === lessonId);
          if (lesson) {
            setCurrentLesson(lesson);
            break;
          }
        }
        await progressApi.updateLastAccessed();
      }
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!courseId || !lessonId) return;
    setIsCompleting(true);
    try {
      const isAlreadyCompleted = progress?.completedLessons?.includes(lessonId);
      let newProgress: EnrollmentProgress | null;
      if (isAlreadyCompleted) {
        newProgress = await progressApi.uncompleteLesson(courseId, lessonId);
      } else {
        newProgress = await progressApi.completeLesson(courseId, lessonId);
      }
      if (newProgress) {
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('Failed to update lesson completion:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const isLessonCompleted = (id: string) => {
    return progress?.completedLessons?.includes(id) || false;
  };

  const getCurrentLessonIndex = () => {
    if (!course?.modules?.length) return { moduleIndex: 0, lessonIndex: 0 };
    for (let mi = 0; mi < course.modules.length; mi++) {
      const lessons = course.modules[mi].lessons || [];
      for (let li = 0; li < lessons.length; li++) {
        if (lessons[li].id === lessonId) {
          return { moduleIndex: mi, lessonIndex: li };
        }
      }
    }
    return { moduleIndex: 0, lessonIndex: 0 };
  };

  const getAdjacentLessons = () => {
    if (!course?.modules?.length) return { prev: null, next: null };
    const allLessons: { lesson: LessonType; moduleTitle: string }[] = [];
    course.modules.forEach((module) => {
      (module.lessons || []).forEach((lesson) => {
        allLessons.push({ lesson, moduleTitle: module.title });
      });
    });

    const currentIndex = allLessons.findIndex((l) => l.lesson.id === lessonId);
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
    };
  };

  const { prev, next } = getAdjacentLessons();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading lesson...</Typography>
      </Box>
    );
  }

  if (!course || !currentLesson) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <Typography variant="h5">Lesson not found</Typography>
        <Button component={RouterLink} to={`/course/${courseId}`} variant="contained">
          Back to course
        </Button>
      </Box>
    );
  }

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Button
          component={RouterLink}
          to={`/course/${courseId}`}
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Course
        </Button>
        <Box>
          <Typography variant="caption" color="text.secondary">Course Progress</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.round(progress?.progress || 0)}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" fontWeight={600}>
              {Math.round(progress?.progress || 0)}%
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {(course.modules || []).map((module, moduleIndex) => (
          <Box key={module.id}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary">
                Module {moduleIndex + 1}
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {module.title}
              </Typography>
            </Box>
            <List dense disablePadding>
              {(module.lessons || []).map((lesson) => (
                <ListItemButton
                  key={lesson.id}
                  component={RouterLink}
                  to={`/course/${courseId}/lesson/${lesson.id}`}
                  selected={lesson.id === lessonId}
                  sx={{
                    py: 1.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.50',
                      borderLeft: 3,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {isLessonCompleted(lesson.id) ? (
                      <CheckIcon color="success" fontSize="small" />
                    ) : (
                      getContentTypeIcon(lesson.content_type)
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={lesson.title}
                    secondary={`${lesson.estimated_duration} min`}
                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={isSidebarOpen}
        sx={{
          width: isSidebarOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            position: 'relative',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Breadcrumbs separator="›">
            <Link
              component={RouterLink}
              to={`/course/${courseId}`}
              underline="hover"
              color="text.secondary"
              variant="body2"
            >
              {course.title}
            </Link>
            <Typography variant="body2" color="text.secondary">
              {course.modules?.[getCurrentLessonIndex().moduleIndex]?.title}
            </Typography>
          </Breadcrumbs>
        </Paper>

        {/* Lesson Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 4 }}>
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {currentLesson.title}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
              <Chip
                icon={getContentTypeIcon(currentLesson.content_type, 'small')}
                label={getContentTypeLabel(currentLesson.content_type)}
                size="small"
              />
              <Chip
                icon={<TimeIcon />}
                label={`${currentLesson.estimated_duration} min`}
                size="small"
                variant="outlined"
              />
              {currentLesson.topics?.map((topic) => (
                <Chip
                  key={topic.id}
                  label={topic.name}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Stack>

            {/* Video Content */}
            {currentLesson.content_type === 'video' && (currentLesson.content_data as VideoContent)?.video_url && (
              <Paper
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%',
                  mb: 4,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <iframe
                  src={(currentLesson.content_data as VideoContent)?.video_url}
                  title={currentLesson.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Paper>
            )}

            {/* Text Content */}
            {currentLesson.content_type === 'text' && (currentLesson.content_data as TextContent)?.main_content && (
              <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
                <Typography
                  component="div"
                  sx={{
                    '& p': { mb: 2 },
                    '& h1, & h2, & h3': { mt: 3, mb: 2 },
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: (currentLesson.content_data as TextContent)?.main_content || '' }}
                />
              </Paper>
            )}

            {/* Document Content */}
            {currentLesson.content_type === 'document' && (currentLesson.content_data as DocumentContent)?.document_url && (
              <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <DocumentIcon color="primary" />
                  <Typography variant="h6">Document</Typography>
                </Box>
                <Button
                  variant="contained"
                  component="a"
                  href={(currentLesson.content_data as DocumentContent)?.document_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Document
                </Button>
              </Paper>
            )}

            {/* Legacy/Fallback Content */}
            {currentLesson.content && !currentLesson.content_data && (
              <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'inherit',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    m: 0,
                  }}
                >
                  {currentLesson.content}
                </Typography>
              </Paper>
            )}

            {/* Complete Button */}
            <Box sx={{ mb: 4 }}>
              <Button
                variant={isLessonCompleted(lessonId || '') ? 'outlined' : 'contained'}
                color={isLessonCompleted(lessonId || '') ? 'success' : 'primary'}
                size="large"
                onClick={handleCompleteLesson}
                disabled={isCompleting}
                startIcon={isLessonCompleted(lessonId || '') ? <CheckIcon /> : <UncheckedIcon />}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {isCompleting
                  ? 'Updating...'
                  : isLessonCompleted(lessonId || '')
                  ? 'Completed - Click to Undo'
                  : 'Mark as Complete'}
              </Button>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Navigation */}
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              {prev ? (
                <Button
                  component={RouterLink}
                  to={`/course/${courseId}/lesson/${prev.lesson.id}`}
                  startIcon={<ChevronLeftIcon />}
                  sx={{ textAlign: 'left' }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Previous
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {prev.lesson.title}
                    </Typography>
                  </Box>
                </Button>
              ) : (
                <Box />
              )}
              {next ? (
                <Button
                  component={RouterLink}
                  to={`/course/${courseId}/lesson/${next.lesson.id}`}
                  endIcon={<ChevronRightIcon />}
                  sx={{ textAlign: 'right' }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Next
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {next.lesson.title}
                    </Typography>
                  </Box>
                </Button>
              ) : (
                <Button
                  component={RouterLink}
                  to={`/course/${courseId}`}
                  variant="contained"
                  color="success"
                  endIcon={<CelebrationIcon />}
                >
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption">Finish Course</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      Back to Overview
                    </Typography>
                  </Box>
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
