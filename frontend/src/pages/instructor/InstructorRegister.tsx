import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { apiClient } from '../../services/apiClient';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  fullname: string;
}

const InstructorRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    fullname: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        ...formData,
        role: 'instructor', // Set role as instructor
      });

      // Store tokens and user info using apiClient methods
      if (response.tokens) {
        apiClient.saveTokens(response.tokens);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }

      // Redirect to instructor dashboard
      navigate('/instructor/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: Record<string, string[]> };
      setError(
        error.message ||
          error.errors?.email?.[0] ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Instructor Registration
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Create an instructor account to start teaching
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="fullname"
              label="Full Name"
              name="fullname"
              autoComplete="name"
              value={formData.fullname}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password_confirm"
              label="Confirm Password"
              type="password"
              id="password_confirm"
              autoComplete="new-password"
              value={formData.password_confirm}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register as Instructor'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <MuiLink component={Link} to="/instructor/login" variant="body2">
                  Sign in here
                </MuiLink>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Want to join as a student?{' '}
                <MuiLink component={Link} to="/register" variant="body2">
                  Student registration
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default InstructorRegister;
