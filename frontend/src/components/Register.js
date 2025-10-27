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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import PasswordPolicy from './PasswordPolicy';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [passwordStrength, setPasswordStrength] = useState({});
  const [errors, setErrors] = useState({});

  const { register, isAuthenticated, error, clearError } = useAuth();
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
  }, [clearError]);

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

    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.strength === 'Very Weak' || passwordStrength.strength === 'Weak') {
      newErrors.password = 'Password is too weak. Please choose a stronger password.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
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
            <PersonAddIcon sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main', mb: 2 }} />
            <Typography 
              component="h1" 
              gutterBottom
              sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
            >
              Tirth Yatra Registration
            </Typography>
            <Typography 
              color="text.secondary" 
              align="center" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              Create your account to get started
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="first_name"
                    label="First Name"
                    name="first_name"
                    autoComplete="given-name"
                    autoFocus
                    value={formData.first_name}
                    onChange={handleChange}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="last_name"
                    label="Last Name"
                    name="last_name"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                  />
                </Grid>
              </Grid>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
              
              {/* Password Policy Component */}
              <PasswordPolicy 
                password={formData.password}
                onStrengthChange={setPasswordStrength}
                showPolicy={true}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="trip_manager">Trip Manager</MenuItem>
                  <MenuItem value="financial_manager">Financial Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="superadmin">Super Admin</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                startIcon={<PersonAddIcon />}
              >
                Sign Up
              </Button>
              
              <Box textAlign="center" mt={2}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
