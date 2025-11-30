import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  TrackChanges as TrackIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const action = searchParams.get('action');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // If there's a redirect URL, navigate there
        if (redirectUrl) {
          navigate(redirectUrl + (action ? `?action=${action}` : ''));
        } else {
          // Check user role and redirect accordingly
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser.role === 'instructor') {
            navigate('/instructor');
          } else {
            navigate('/');
          }
        }
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <TrackIcon />, text: 'Track your progress' },
    { icon: <TrendingIcon />, text: 'Personalized learning' },
    { icon: <TrophyIcon />, text: 'Earn certificates' },
  ];

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        bgcolor: 'background.default',
      }}
    >
      {/* Left Side - Branding */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          color: 'white',
        }}
      >
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Welcome Back!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, textAlign: 'center' }}>
          Continue your learning journey with LearnHub
        </Typography>
        <Stack spacing={2}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {feature.icon}
              </Box>
              <Typography variant="body1" fontWeight={500}>
                {feature.text}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Right Side - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your credentials to access your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link href="#" variant="body2" underline="hover">
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{ mb: 3 }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                sx={{ color: 'text.primary', borderColor: 'divider' }}
              >
                Continue with Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GitHubIcon />}
                sx={{ color: 'text.primary', borderColor: 'divider' }}
              >
                Continue with GitHub
              </Button>
            </Stack>

            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}${action ? `&action=${action}` : ''}` : ''}`}
                underline="hover"
                fontWeight={500}
              >
                Sign up as Student
              </Link>
              {' or '}
              <Link component={RouterLink} to="/instructor/register" underline="hover" fontWeight={500}>
                Sign up as Instructor
              </Link>
            </Typography>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Demo:</strong> student1@example.com / Student123!
              </Typography>
            </Alert>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
