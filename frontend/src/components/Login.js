import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Login as LoginIcon, GetApp as GetAppIcon } from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'superadmin@tirthyatra.com',
    password: 'Dipole@1'
  });
  const [errors, setErrors] = useState({});

  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, []); // Remove clearError dependency to prevent infinite loop

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          marginTop: { xs: 4, sm: 6, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <LoginIcon sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main', mb: 2 }} />
            <Typography 
              component="h1" 
              gutterBottom
              sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
            >
              Tirth Yatra Login
            </Typography>
            <Typography 
              color="text.secondary" 
              align="center" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              Sign in to access your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
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
                error={!!errors.password}
                helperText={errors.password}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                startIcon={<LoginIcon />}
              >
                Sign In
              </Button>
              
              <Box textAlign="center" mt={2}>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    Sign up here
                  </Link>
                </Typography>
              </Box>
              
              <Box textAlign="center" mt={2}>
                <Typography 
                  variant="body2" 
                  component="a"
                  href="http://app.dipoletechi.com/trip.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    textDecoration: 'none',
                    color: 'primary.main',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  <GetAppIcon sx={{ fontSize: 18 }} />
                  Download Mobile App
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        <Paper 
          elevation={3} 
          sx={{ 
            padding: { xs: 2, sm: 3 }, 
            width: '100%', 
            mt: 3,
            border: '2px solid',
            borderColor: 'text.primary'
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Login Credential
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              email- superadmin@tirthyatra.com
            </Typography>
            <Typography variant="body2">
              password- Dipole@1
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
