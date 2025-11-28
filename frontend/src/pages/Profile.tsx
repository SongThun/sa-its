import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Avatar,
  Button,
  TextField,
  Paper,
  LinearProgress,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  CalendarMonth as CalendarIcon,
  LocalFireDepartment as StreakIcon,
  CameraAlt as CameraIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { enrollmentApi } from '../services/api';
import type { Course } from '../types';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, navigate]);

  const loadEnrolledCourses = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const courses = await enrollmentApi.getEnrolledCourses();
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

  const stats = [
    { icon: <SchoolIcon />, value: enrolledCourses.length, label: 'Enrolled Courses', color: 'primary.main' },
    { icon: <CheckIcon />, value: user?.completedLessons.length || 0, label: 'Completed Lessons', color: 'success.main' },
    { icon: <CalendarIcon />, value: user ? new Date(user.createdAt).toLocaleDateString() : '', label: 'Member Since', color: 'info.main' },
    { icon: <StreakIcon />, value: 7, label: 'Day Streak', color: 'warning.main' },
  ];

  const achievements = [
    { icon: '🎯', name: 'First Steps', desc: 'Completed first lesson', earned: true },
    { icon: '📖', name: 'Bookworm', desc: 'Enrolled in 3 courses', earned: true },
    { icon: '🏆', name: 'Champion', desc: 'Complete 10 courses', earned: false },
    { icon: '⚡', name: 'Speed Learner', desc: 'Finish course in 1 week', earned: false },
  ];

  const activityData = [60, 80, 45, 90, 70, 30, 50];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (!user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <Paper sx={{ mb: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              height: 150,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            }}
          />
          <Box sx={{ px: 4, pb: 4 }}>
            <Box sx={{ display: 'flex', gap: 3, mt: -8, flexWrap: 'wrap' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user.avatar}
                  sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: 3 }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <CameraIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ flex: 1, pt: 8 }}>
                {isEditing ? (
                  <Box sx={{ maxWidth: 500 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <TextField
                        size="small"
                        label="First Name"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        fullWidth
                      />
                      <TextField
                        size="small"
                        label="Last Name"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        fullWidth
                      />
                    </Stack>
                    <TextField
                      size="small"
                      label="Bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      multiline
                      rows={2}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloseIcon />}
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <IconButton size="small" onClick={() => setIsEditing(true)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {user.email}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user.bio || 'No bio added yet.'}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* My Courses */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            My Courses
          </Typography>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : enrolledCourses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>
                You haven't enrolled in any courses yet.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/courses')}>
                Browse Courses
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {enrolledCourses.map((course) => {
                const randomProgress = Math.floor(Math.random() * 60) + 20;
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                    <Card
                      sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={course.thumbnail}
                        alt={course.title}
                      />
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {course.instructor}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Progress</Typography>
                            <Typography variant="caption" fontWeight={500}>{randomProgress}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={randomProgress}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>

        {/* Learning Activity */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Learning Activity
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This Week
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 150, mt: 2 }}>
            {activityData.map((value, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 40,
                    height: `${value}%`,
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    mb: 1,
                    transition: 'height 0.3s',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {days[index]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Achievements */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <TrophyIcon color="warning" />
            <Typography variant="h6" fontWeight={600}>
              Achievements
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {achievements.map((achievement, index) => (
              <Grid size={{ xs: 6, sm: 3 }} key={index}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    opacity: achievement.earned ? 1 : 0.5,
                    bgcolor: achievement.earned ? 'primary.50' : 'background.default',
                    borderColor: achievement.earned ? 'primary.main' : 'divider',
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1 }}>{achievement.icon}</Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {achievement.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {achievement.desc}
                  </Typography>
                  {achievement.earned && (
                    <Chip label="Earned" size="small" color="success" sx={{ mt: 1 }} />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
