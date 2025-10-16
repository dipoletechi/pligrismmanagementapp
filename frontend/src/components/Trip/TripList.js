import React, { useState, useEffect } from 'react';
import { keyframes } from '@mui/system';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  DirectionsBus as TripIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  GpsFixed as TrackIcon,
  QrCodeScanner as ScannerIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OSMMap from '../Map/OSMMap';

// Animation keyframes
const pulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// Ensure axios base URL is set
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TripList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [tripStatuses, setTripStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tripModal, setTripModal] = useState({ open: false, trip: null });
  const [trackingModal, setTrackingModal] = useState({ open: false, trip: null });
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 28.6139, lng: 77.2090 });
  const [statusChangeModal, setStatusChangeModal] = useState({ open: false, trip: null, newStatus: '' });

  const statusColors = {
    'Draft': 'default',
    'Published': 'info',
    'Completed': 'success',
    'Cancelled': 'error'
  };

  const fetchTripStatuses = async () => {
    try {
      const response = await axios.get('/api/trip-status');
      setTripStatuses(response.data.data.items || []);
    } catch (error) {
      console.error('Error fetching trip statuses:', error);
    }
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
    const initializeData = async () => {
      console.log('TripList useEffect - isAuthenticated:', isAuthenticated);
      console.log('TripList useEffect - user:', user);
      console.log('TripList useEffect - token:', localStorage.getItem('token'));
      
      // Reset loading state first
      setLoading(false);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (token && user) {
        console.log('User authenticated, fetching data...');
        await Promise.all([fetchTrips(), fetchTripStatuses()]);
      } else {
        console.log('User not authenticated, stopping loading');
        setLoading(false);
      }
    };

    initializeData();
  }, [user, isAuthenticated]); // Run when user or authentication status changes

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

  const handleTrackTrip = (trip) => {
    console.log('Track button clicked for trip:', trip);
    
    // Only open modal if trip data is available
    if (trip && trip.title) {
      setTrackingModal({ open: true, trip: trip });
      
      // Get coordinates for the destination
      if (trip.destinationInfo?.latitude && trip.destinationInfo?.longitude) {
        // Use coordinates from destinationInfo if available
        setMapCoordinates({ 
          lat: parseFloat(trip.destinationInfo.latitude), 
          lng: parseFloat(trip.destinationInfo.longitude) 
        });
      } else if (trip.destination) {
        // Use geocoding if destinationInfo is not available
        getDestinationCoordinates(trip.destination);
      }
    } else {
      console.error('Invalid trip data:', trip);
    }
  };

  const handleScannerAction = (trip) => {
    console.log('Scanner action clicked for trip:', trip);
    // Navigate to scanner page with trip data
    navigate(`/scanner/${trip.id}`, { 
      state: { 
        trip: trip,
        tripTitle: trip.title,
        tripDestination: trip.destination 
      } 
    });
  };

  const handleApplicants = (trip) => {
    console.log('Applicants button clicked for trip:', trip);
    // Navigate to trip applicants page
    navigate(`/trip-applicants/${trip.id}`, { 
      state: { 
        tripTitle: trip.title
      } 
    });
  };

  const handleCloseTrackingModal = () => {
    setTrackingModal({ open: false, trip: null });
  };

  const getDestinationCoordinates = async (destination) => {
    try {
      // Use geocoding to get coordinates for the destination
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
        console.log('Geocoded coordinates:', lat, lon);
      }
    } catch (error) {
      console.error('Error getting destination coordinates:', error);
      // Keep default coordinates if geocoding fails
    }
  };


  const handleStatusChange = (trip) => {
    setStatusChangeModal({ 
      open: true, 
      trip: trip, 
      newStatus: trip.tripStatus?.id || '' 
    });
  };

  const handleCloseStatusModal = () => {
    setStatusChangeModal({ open: false, trip: null, newStatus: '' });
  };

  const handleConfirmStatusChange = async () => {
    try {
      const { trip, newStatus } = statusChangeModal;
      if (!trip || !newStatus) return;

      const response = await axios.patch(`/api/trips/${trip.id}/status`, {
        trip_status_id: parseInt(newStatus)
      });

      // Update the trip in the local state
      setTrips(prevTrips => 
        prevTrips.map(t => 
          t.id === trip.id 
            ? { ...t, tripStatus: tripStatuses.find(s => s.id === parseInt(newStatus)) }
            : t
        )
      );

      setSnackbar({
        open: true,
        message: 'Trip status updated successfully',
        severity: 'success'
      });

      handleCloseStatusModal();
    } catch (error) {
      console.error('Error updating trip status:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating trip status',
        severity: 'error'
      });
    }
  };

  const handleTripIconClick = (trip) => {
    console.log('Trip icon clicked for trip:', trip);
    setTripModal({ open: true, trip: trip });
  };

  const handleCloseTripModal = () => {
    setTripModal({ open: false, trip: null });
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
                    {trips.filter(t => t.tripStatus?.name === 'Published' && new Date(t.start_date) <= new Date() && new Date(t.end_date) >= new Date()).length}
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
                    {trips.filter(t => t.tripStatus?.name === 'Completed').length}
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
                        <IconButton
                          onClick={() => handleTripIconClick(trip)}
                          sx={{
                            color: '#1976d2',
                            mr: 2,
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="View Trip Details"
                        >
                          <TripIcon sx={{ fontSize: 24 }} />
                        </IconButton>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={trip.tripStatus?.name || 'Draft'} 
                          color={statusColors[trip.tripStatus?.name] || 'default'} 
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 2
                          }}
                        />
                        {(user?.role === 'superadmin' || user?.role === 'admin') && (
                          <IconButton
                            size="small"
                            onClick={() => handleStatusChange(trip)}
                            sx={{
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.1)'
                              }
                            }}
                            title="Change Status"
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
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
                          onClick={() => handleTrackTrip(trip)}
                          sx={{
                            color: '#ff9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 152, 0, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="Track Trip"
                        >
                          <TrackIcon />
                        </IconButton>
                        {user?.role !== 'finance' && user?.role !== 'user' && (
                          <IconButton
                            onClick={() => handleScannerAction(trip)}
                            sx={{
                              color: '#9c27b0',
                              backgroundColor: 'rgba(156, 39, 176, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            title="Scanner Action"
                          >
                            <ScannerIcon />
                          </IconButton>
                        )}
                        <IconButton
                          onClick={() => handleApplicants(trip)}
                          sx={{
                            color: '#ff5722',
                            backgroundColor: 'rgba(255, 87, 34, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 87, 34, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="View Applicants"
                        >
                          <PeopleIcon />
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

        {/* Trip Details Modal */}
        <Dialog
          open={tripModal.open}
          onClose={handleCloseTripModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.5rem',
            textAlign: 'center',
            py: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TripIcon sx={{ mr: 2, fontSize: 32 }} />
              Trip Details
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {tripModal.trip && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" fontWeight="600" color="text.primary" gutterBottom>
                    {tripModal.trip.title}
                  </Typography>
                  {tripModal.trip.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {tripModal.trip.description}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                    <Typography variant="h6" fontWeight="600" color="primary" gutterBottom>
                      Trip Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Destination:</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {tripModal.trip.destination || 'No destination'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Start Date:</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {new Date(tripModal.trip.start_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">End Date:</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {new Date(tripModal.trip.end_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
                    <Typography variant="h6" fontWeight="600" color="success.main" gutterBottom>
                      Financial Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Budget:</Typography>
                        <Typography variant="h6" fontWeight="600" color="success.main">
                          {tripModal.trip.budget ? `₹${parseFloat(tripModal.trip.budget).toLocaleString()}` : 'No budget'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Status:</Typography>
                        <Chip 
                          label={tripModal.trip.status} 
                          color={statusColors[tripModal.trip.status]} 
                          sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                            mt: 0.5
                          }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                {tripModal.trip.created_at && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                      <Typography variant="h6" fontWeight="600" color="text.secondary" gutterBottom>
                        Additional Information
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Created:</Typography>
                          <Typography variant="body1" fontWeight="500">
                            {new Date(tripModal.trip.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                        {tripModal.trip.updated_at && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                            <Typography variant="body1" fontWeight="500">
                              {new Date(tripModal.trip.updated_at).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseTripModal}
              variant="outlined"
              sx={{ minWidth: 100 }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleCloseTripModal();
                handleViewTrip(tripModal.trip);
              }}
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              View Full Details
            </Button>
          </DialogActions>
        </Dialog>

        {/* Trip Tracking Modal */}
        <Dialog
          open={trackingModal.open}
          onClose={handleCloseTrackingModal}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{
            background: 'linear-gradient(45deg, #ff9800 30%, #ffc107 90%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.5rem',
            textAlign: 'center',
            py: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrackIcon sx={{ mr: 2, fontSize: 32 }} />
              Trip Tracking{trackingModal.trip ? ` : ${trackingModal.trip.title}` : ''}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {trackingModal.trip && (
              <Box>
                {/* Debug: Log trip data */}
                {console.log('Complete Trip Data:', trackingModal.trip)}
                {console.log('Destination Info:', trackingModal.trip?.destinationInfo)}
                {/* Trip Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  
                  
                </Box>

                {/* Camera Buttons Row */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {[1, 2, 3, 4].map((cameraNum) => (
                    <Box
                      key={cameraNum}
                      sx={{
                        width: 200,
                        height: 120,
                        border: '2px solid #2c2c2c',
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #424242 0%, #2c2c2c 50%, #1a1a1a 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                          borderColor: '#555'
                        }
                      }}
                    >
                      {/* Camera Label - Top Left */}
                      <Typography 
                        variant="caption" 
                        fontWeight="600" 
                        color="#ffffff"
                        sx={{ 
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          fontSize: '0.8rem',
                          letterSpacing: '0.5px',
                          textShadow: '0 0 4px rgba(0,0,0,0.8)',
                          zIndex: 2
                        }}
                      >
                        CAM{cameraNum}
                      </Typography>
                      
                      {/* Play Button - Center */}
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#000',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#333',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {/* Play Triangle */}
                        <Box
                          sx={{
                            width: 0,
                            height: 0,
                            borderLeft: '12px solid #fff',
                            borderTop: '8px solid transparent',
                            borderBottom: '8px solid transparent',
                            marginLeft: '2px'
                          }}
                        />
                      </Box>
                      
                      {/* No Preview Text - Bottom */}
                      <Typography 
                        variant="body2" 
                        fontWeight="500" 
                        color="#b0b0b0"
                        sx={{ 
                          position: 'absolute',
                          bottom: 8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '0.7rem',
                          textAlign: 'center',
                          textShadow: '0 0 4px rgba(0,0,0,0.8)',
                          opacity: 0.9
                        }}
                      >
                        No Preview
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Main Content Layout - Left: Details, Right: Map */}
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                  {/* Left Side - Trip Details */}
                  <Box sx={{ width: '25%', minWidth: '300px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Trip Timeline */}
                      <Card sx={{ p: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)', border: '1px solid rgba(25, 118, 210, 0.2)' }}>
                        <Typography variant="h6" fontWeight="600" color="primary.main" gutterBottom>
                          <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Trip Timeline
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Start Date:</Typography>
                            <Typography variant="body1" fontWeight="500">
                              {new Date(trackingModal.trip.start_date).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">End Date:</Typography>
                            <Typography variant="body1" fontWeight="500">
                              {new Date(trackingModal.trip.end_date).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Duration:</Typography>
                            <Typography variant="body1" fontWeight="500">
                              {Math.ceil((new Date(trackingModal.trip.end_date) - new Date(trackingModal.trip.start_date)) / (1000 * 60 * 60 * 24))} days
                            </Typography>
                          </Box>
                        </Box>
                      </Card>

                      {/* Financial Overview */}
                      <Card sx={{ p: 3, backgroundColor: 'rgba(76, 175, 80, 0.05)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                        <Typography variant="h6" fontWeight="600" color="success.main" gutterBottom>
                          <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Financial Overview
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Total Budget:</Typography>
                            <Typography variant="h5" fontWeight="600" color="success.main">
                              {trackingModal.trip.budget ? `₹${parseFloat(trackingModal.trip.budget).toLocaleString()}` : 'No budget set'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Status:</Typography>
                            <Typography variant="body1" fontWeight="500" color="success.main">
                              {trackingModal.trip.budget ? 'Budget Allocated' : 'Pending Budget'}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>

                      {/* Trip Description */}
                      {trackingModal.trip.description && (
                        <Card sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                          <Typography variant="h6" fontWeight="600" color="text.secondary" gutterBottom>
                            Trip Description
                          </Typography>
                          <Typography variant="body1" color="text.primary">
                            {trackingModal.trip.description}
                          </Typography>
                        </Card>
                      )}
                    </Box>
                  </Box>

                  {/* Right Side - Map */}
                  <Box sx={{ width: '75%', flex: 1 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ 
                        height: 500,
                        width: '100%',
                        minWidth: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <OSMMap
                          latitude={mapCoordinates.lat}
                          longitude={mapCoordinates.lng}
                          height="500px"
                          zoom={12}
                        />
                      </Box>
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Showing location for: {trackingModal.trip.destinationInfo?.title || trackingModal.trip.destination || 'Default location'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Database Coordinates: {trackingModal.trip.destinationInfo?.latitude || 'N/A'}, {trackingModal.trip.destinationInfo?.longitude || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Map Using: {mapCoordinates.lat.toFixed(6)}, {mapCoordinates.lng.toFixed(6)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseTrackingModal}
              variant="outlined"
              sx={{ minWidth: 100 }}
            >
              Close
            </Button>
            
          </DialogActions>
        </Dialog>

      {/* Snackbar */}
      {/* Status Change Modal */}
      <Dialog
        open={statusChangeModal.open}
        onClose={handleCloseStatusModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Change Trip Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Trip: <strong>{statusChangeModal.trip?.title}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Status: <strong>{statusChangeModal.trip?.tripStatus?.name || 'Draft'}</strong>
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={statusChangeModal.newStatus}
                onChange={(e) => setStatusChangeModal(prev => ({ ...prev, newStatus: e.target.value }))}
                label="New Status"
              >
                {tripStatuses.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      Loading statuses...
                    </Typography>
                  </MenuItem>
                ) : (
                  tripStatuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={status.name} 
                          color={statusColors[status.name] || 'default'} 
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {status.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusModal}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStatusChange}
            variant="contained"
            disabled={!statusChangeModal.newStatus || statusChangeModal.newStatus === statusChangeModal.trip?.tripStatus?.id}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

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
