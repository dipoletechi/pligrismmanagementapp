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
      <Typography variant="h4" component="h1" gutterBottom>
        Trip Tracking
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Track and monitor active pilgrimage trips
      </Typography>

      <Grid container spacing={3}>
        {/* Trip Selection */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Trip
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
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
              <Alert severity="info">
                No trips available for tracking
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Trip Details */}
        <Grid item xs={12} md={8}>
          {selectedTrip ? (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  {selectedTrip.title}
                </Typography>
                <Chip 
                  label={selectedTrip.status} 
                  color={getStatusColor(selectedTrip.status)} 
                />
              </Box>

              <Grid container spacing={3}>
                {/* Basic Info */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Destination
                      </Typography>
                      <Typography variant="body1">
                        {selectedTrip.destination || 'Not specified'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Duration
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedTrip.start_date)} - {formatDate(selectedTrip.end_date)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Transportation */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <BusIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Transportation
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bus ID: {selectedTrip.bus_id || 'Not assigned'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Driver ID: {selectedTrip.driver_id || 'Not assigned'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Vendors
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accommodation: {selectedTrip.accommodation_vendor_id || 'Not assigned'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Food: {selectedTrip.food_vendor_id || 'Not assigned'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* GPS Tracking Placeholder */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <GpsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Real-time GPS Tracking
                      </Typography>
                      <Box sx={{ 
                        height: 200, 
                        backgroundColor: 'grey.100', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          GPS tracking map will be integrated here
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
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Select a trip to view tracking details
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
