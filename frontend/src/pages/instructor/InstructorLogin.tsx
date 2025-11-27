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

interface LoginFormData {
  email: string;
  password: string;
}

const InstructorLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
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
    setLoading(true);

    try {
      const response = await authApi.login(formData);

      // Check if user is an instructor
      if (response.user.role !== 'instructor') {
        setError('This login page is for instructors only. Please use the student login page.');
        setLoading(false);
        return;
      }

      // Store tokens and user info using apiClient methods
      if (response.tokens) {
        apiClient.saveTokens(response.tokens);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }

      // Redirect to instructor dashboard
      navigate('/instructor/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(
        error.message ||
          'Login failed. Please check your credentials.'
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
            Instructor Login
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to access your instructor dashboard
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              type="email"
              value={formData.email}
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
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <MuiLink component={Link} to="/instructor/register" variant="body2">
                  Register as instructor
                </MuiLink>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Are you a student?{' '}
                <MuiLink component={Link} to="/login" variant="body2">
                  Student login
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default InstructorLogin;
