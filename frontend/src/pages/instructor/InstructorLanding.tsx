import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  School as TeachIcon,
  TrendingUp as GrowthIcon,
  AttachMoney as EarningsIcon,
  Support as SupportIcon,
  VideoLibrary as ContentIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  People as StudentsIcon,
  Star as StarIcon,
} from '@mui/icons-material';

export default function InstructorLanding() {
  const benefits = [
    {
      icon: <TeachIcon sx={{ fontSize: 40 }} />,
      title: 'Share Your Expertise',
      description: 'Transform your knowledge into engaging courses that inspire and educate',
    },
    {
      icon: <StudentsIcon sx={{ fontSize: 40 }} />,
      title: 'Reach Global Audience',
      description: 'Connect with thousands of eager learners from around the world',
    },
    {
      icon: <EarningsIcon sx={{ fontSize: 40 }} />,
      title: 'Earn Revenue',
      description: 'Generate income by sharing your passion and expertise',
    },
    {
      icon: <ContentIcon sx={{ fontSize: 40 }} />,
      title: 'Easy Course Creation',
      description: 'Intuitive tools to create, manage, and publish your courses',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Track Performance',
      description: 'Monitor student engagement and course analytics in real-time',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      title: 'Dedicated Support',
      description: '24/7 support to help you succeed as an instructor',
    },
  ];

  const steps = [
    'Sign up as an instructor',
    'Create your first course',
    'Upload engaging content',
    'Publish and reach students',
  ];

  const stats = [
    { icon: <StudentsIcon sx={{ fontSize: 32 }} />, value: '50,000+', label: 'Students Taught' },
    { icon: <TeachIcon sx={{ fontSize: 32 }} />, value: '500+', label: 'Active Instructors' },
    { icon: <StarIcon sx={{ fontSize: 32 }} />, value: '4.8/5', label: 'Average Rating' },
    { icon: <GrowthIcon sx={{ fontSize: 32 }} />, value: '95%', label: 'Satisfaction Rate' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Teach What You Love
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, mb: 4, lineHeight: 1.6 }}>
                Join our community of expert instructors and make a difference. Create courses, inspire students, and earn revenue doing what you're passionate about.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink}
                  to="/instructor/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowIcon />}
                  sx={{
                    bgcolor: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  component={RouterLink}
                  to="/instructor/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop"
                  alt="Instructor teaching"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Why Teach With Us?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to create and grow your teaching business
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {benefit.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Start teaching in just 4 simple steps
          </Typography>
        </Box>
        <Grid container spacing={4} justifyContent="center">
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      mb: 2,
                      fontSize: '1.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {step}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              What You Get
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Powerful tools and resources to help you succeed
            </Typography>
          </Box>
          <Paper sx={{ p: 4 }}>
            <List>
              {[
                'Easy-to-use course builder with drag-and-drop interface',
                'Video hosting and streaming capabilities',
                'Student progress tracking and analytics',
                'Automated certificate generation',
                'Marketing and promotional tools',
                'Secure payment processing',
                'Mobile-responsive course player',
                'Community discussion forums',
                'Email notifications and reminders',
                '24/7 technical support',
              ].map((feature, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Ready to Start Teaching?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Join our community of instructors and make an impact today
          </Typography>
          <Button
            component={RouterLink}
            to="/instructor/register"
            variant="contained"
            size="large"
            endIcon={<ArrowIcon />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Become an Instructor
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
