import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Grid,
} from '@mui/material';
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  MenuBook as BookIcon,
  School as SchoolIcon,
  Computer as ComputerIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, password, firstName, lastName);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <BookIcon />, text: 'Access 1000+ courses' },
    { icon: <SchoolIcon />, text: 'Expert instructors' },
    { icon: <ComputerIcon />, text: 'Learn at your pace' },
    { icon: <StarIcon />, text: 'Free to get started' },
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
          Start Learning Today!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, textAlign: 'center' }}>
          Join thousands of learners on LearnHub
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
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Fill in your details to get started
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the Terms of Service and Privacy Policy
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{ mb: 3 }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
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
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover" fontWeight={500}>
                Sign in
              </Link>
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
