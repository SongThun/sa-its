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
} from '@mui/material';
import {
  School as SchoolIcon,
  Psychology as LearnIcon,
  EmojiEvents as AchieveIcon,
  Groups as CommunityIcon,
  Laptop as TechIcon,
  WorkspacePremium as CertificateIcon,
  ArrowForward as ArrowIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

export default function LandingPage() {
  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with years of experience',
    },
    {
      icon: <LearnIcon sx={{ fontSize: 40 }} />,
      title: 'Interactive Learning',
      description: 'Hands-on projects and real-world applications',
    },
    {
      icon: <AchieveIcon sx={{ fontSize: 40 }} />,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics',
    },
    {
      icon: <CommunityIcon sx={{ fontSize: 40 }} />,
      title: 'Join Community',
      description: 'Connect with learners worldwide and grow together',
    },
    {
      icon: <TechIcon sx={{ fontSize: 40 }} />,
      title: 'Modern Platform',
      description: 'Learn anytime, anywhere on any device',
    },
    {
      icon: <CertificateIcon sx={{ fontSize: 40 }} />,
      title: 'Get Certified',
      description: 'Earn certificates to showcase your achievements',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Active Students' },
    { value: '500+', label: 'Quality Courses' },
    { value: '100+', label: 'Expert Instructors' },
    { value: '95%', label: 'Success Rate' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
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
                Learn Skills That Matter
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, mb: 4, lineHeight: 1.6 }}>
                Unlock your potential with our comprehensive online courses. Learn at your own pace, earn certificates, and advance your career.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink}
                  to="/courses"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  Browse Courses
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  startIcon={<PersonIcon />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Sign Up Free
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
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                  alt="Students learning"
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
                <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Why Choose Our Platform?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to succeed in your learning journey
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
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
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Instructor CTA Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Paper
            elevation={4}
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              color: 'white',
              borderRadius: 4,
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
              }}
            >
              <BusinessIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Become an Instructor
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
              Share your knowledge and inspire learners around the world. Join our community of expert instructors.
            </Typography>
            <Button
              component={RouterLink}
              to="/instructor"
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
              Learn More
            </Button>
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
            Ready to Start Learning?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Join thousands of students already learning on our platform
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              Get Started Free
            </Button>
            <Button
              component={RouterLink}
              to="/courses"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Explore Courses
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
