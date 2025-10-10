import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  DirectionsBus as TripIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Ensure axios base URL is set
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TripList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const statusColors = {
    planned: 'default',
    active: 'info',
    completed: 'success',
    cancelled: 'error'
  };

  const fetchTrips = async () => {
    console.log('fetchTrips called, current loading state:', loading);
    // Remove the loading check to allow the call
    
    try {
      setLoading(true);
      console.log('=== FETCHING TRIPS START ===');
      console.log('Fetching trips with token:', localStorage.getItem('token'));
      console.log('Axios headers:', axios.defaults.headers.common);
      console.log('Axios base URL:', axios.defaults.baseURL);
      
      const res = await axios.get('/api/trips');
      console.log('=== TRIPS RESPONSE ===');
      console.log('Trips response:', res.data);
      console.log('Trips count:', res.data.data.items?.length);
      setTrips(res.data.data.items);
      console.log('=== TRIPS SET SUCCESSFULLY ===');
    } catch (error) {
      console.error('=== TRIPS FETCH ERROR ===');
      console.error('Error fetching trips:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error fetching trips', 
        severity: 'error' 
      });
    } finally {
      console.log('=== SETTING LOADING FALSE ===');
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeTrips = async () => {
      console.log('TripList useEffect - isAuthenticated:', isAuthenticated);
      console.log('TripList useEffect - user:', user);
      console.log('TripList useEffect - token:', localStorage.getItem('token'));
      
      // Reset loading state first
      setLoading(false);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (token && user) {
        console.log('User authenticated, fetching trips...');
        await fetchTrips();
      } else {
        console.log('User not authenticated, stopping loading');
        setLoading(false);
      }
    };

    initializeTrips();
  }, []); // Run only once on mount

  const handleEditTrip = (trip) => {
    console.log('Edit button clicked for trip:', trip);
    // Navigate to CreateTrip page with trip data for editing
    navigate('/trips/create', { 
      state: { 
        editingTrip: trip,
        isEditMode: true 
      } 
    });
  };

  const handleViewTrip = (trip) => {
    console.log('View button clicked for trip:', trip);
    // Navigate to CreateTrip page with trip data for viewing (read-only)
    navigate('/trips/create', { 
      state: { 
        editingTrip: trip,
        isEditMode: false,
        isViewMode: true 
      } 
    });
  };


  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      axios.delete(`/api/trips/${id}`).then(() => {
        fetchTrips();
        setSnackbar({ open: true, message: 'Trip deleted successfully', severity: 'success' });
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Please log in to view trips
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 3,
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  mb: 1
                }}
              >
                Trip Management
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Manage pilgrimage trips and their details
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TripIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {trips.length}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Total Trips
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(240, 147, 251, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {trips.filter(t => t.status === 'active').length}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Active Trips
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ₹{trips.reduce((sum, trip) => sum + (parseFloat(trip.budget) || 0), 0).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Total Budget
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(67, 233, 123, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TripIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {trips.filter(t => t.status === 'completed').length}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Trips Table */}
        <Paper sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table>
              <TableHead>
                <TableRow sx={{
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    border: 'none'
                  }
                }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trips.map((trip, index) => (
                  <TableRow 
                    key={trip.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TripIcon sx={{ color: '#1976d2', mr: 2, fontSize: 24 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                            {trip.title}
                          </Typography>
                          {trip.description && (
                            <Typography variant="caption" color="text.secondary">
                              {trip.description.substring(0, 50)}...
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {trip.destination || 'No destination'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(trip.start_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(trip.end_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="text.primary">
                        {trip.budget ? `₹${parseFloat(trip.budget).toLocaleString()}` : 'No budget'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={trip.status} 
                        color={statusColors[trip.status]} 
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          onClick={() => handleViewTrip(trip)}
                          sx={{
                            color: '#4caf50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="View Trip"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditTrip(trip)}
                          sx={{
                            color: '#1976d2',
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="Edit Trip"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(trip.id)}
                          sx={{
                            color: '#d32f2f',
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="Delete Trip"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>


      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default TripList;
