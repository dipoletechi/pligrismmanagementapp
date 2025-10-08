import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  DirectionsBus as BusIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  GpsFixed as GpsIcon
} from '@mui/icons-material';
import axios from 'axios';

const TripTracking = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/trips');
      setTrips(res.data.data.items);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setSnackbar({ open: true, message: 'Error fetching trips', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleTripSelect = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    setSelectedTrip(trip);
  };

  const getStatusColor = (status) => {
    const colors = {
      planned: 'default',
      active: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            textAlign: 'center'
          }}
        >
          Trip Tracking
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            fontSize: '1.1rem'
          }}
        >
          Track and monitor active pilgrimage trips
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Trip Selection */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(25, 118, 210, 0.1)'
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                color: '#1976d2',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <GpsIcon />
              Select Trip
            </Typography>
            <FormControl 
              fullWidth 
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: 2
                  }
                }
              }}
            >
              <InputLabel>Choose Trip</InputLabel>
              <Select
                value={selectedTrip?.id || ''}
                onChange={(e) => handleTripSelect(e.target.value)}
                label="Choose Trip"
              >
                {trips.map((trip) => (
                  <MenuItem key={trip.id} value={trip.id}>
                    {trip.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {trips.length === 0 && (
              <Alert 
                severity="info"
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: '#1976d2'
                  }
                }}
              >
                No trips available for tracking
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Trip Details */}
        <Grid item xs={12} md={8}>
          {selectedTrip ? (
            <Paper 
              sx={{ 
                p: 3,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(25, 118, 210, 0.1)'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                color: 'white'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {selectedTrip.title}
                </Typography>
                <Chip 
                  label={selectedTrip.status} 
                  color={getStatusColor(selectedTrip.status)}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                {/* Basic Info */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          color: '#1976d2',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <LocationIcon sx={{ mr: 1, color: '#1976d2' }} />
                        Destination
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedTrip.destination || 'Not specified'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          color: '#1976d2',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <ScheduleIcon sx={{ mr: 1, color: '#1976d2' }} />
                        Duration
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedTrip.start_date)} - {formatDate(selectedTrip.end_date)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Transportation */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          color: '#1976d2',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <BusIcon sx={{ mr: 1, color: '#1976d2' }} />
                        Transportation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Bus ID:</strong> {selectedTrip.bus_id || 'Not assigned'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Driver ID:</strong> {selectedTrip.driver_id || 'Not assigned'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          color: '#1976d2',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <PersonIcon sx={{ mr: 1, color: '#1976d2' }} />
                        Vendors
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Accommodation:</strong> {selectedTrip.accommodation_vendor_id || 'Not assigned'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Food:</strong> {selectedTrip.food_vendor_id || 'Not assigned'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* GPS Tracking Placeholder */}
                <Grid item xs={12}>
                  <Card sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          color: '#1976d2',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <GpsIcon sx={{ mr: 1, color: '#1976d2' }} />
                        Real-time GPS Tracking
                      </Typography>
                      <Box sx={{ 
                        height: 200, 
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: 2,
                        border: '2px dashed rgba(25, 118, 210, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 20%, rgba(25, 118, 210, 0.1) 0%, transparent 50%)',
                        }} />
                        <Typography 
                          variant="body1" 
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            textAlign: 'center',
                            zIndex: 1
                          }}
                        >
                          🗺️ GPS tracking map will be integrated here
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Additional Details */}
                {selectedTrip.description && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body2">
                          {selectedTrip.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {selectedTrip.boarding_details && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Boarding Details
                        </Typography>
                        <Typography variant="body2">
                          {selectedTrip.boarding_details}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Paper>
          ) : (
            <Paper 
              sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(25, 118, 210, 0.1)'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <GpsIcon sx={{ fontSize: 64, color: '#1976d2', opacity: 0.7 }} />
              </Box>
              <Typography 
                variant="h5" 
                color="text.secondary"
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  color: '#1976d2'
                }}
              >
                Select a Trip to Track
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ maxWidth: 400, mx: 'auto' }}
              >
                Choose a trip from the dropdown to view real-time tracking details, 
                transportation information, and vendor assignments.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

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
  );
};

export default TripTracking;
