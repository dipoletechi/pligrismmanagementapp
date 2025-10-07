import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsBus as TripIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import axios from 'axios';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    status: 'planned'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const statusColors = {
    planned: 'default',
    active: 'info',
    completed: 'success',
    cancelled: 'error'
  };

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

  const handleOpen = (trip = null) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        title: trip.title,
        description: trip.description || '',
        destination: trip.destination || '',
        start_date: trip.start_date ? trip.start_date.split('T')[0] : '',
        end_date: trip.end_date ? trip.end_date.split('T')[0] : '',
        budget: trip.budget || '',
        status: trip.status
      });
    } else {
      setEditingTrip(null);
      setFormData({
        title: '',
        description: '',
        destination: '',
        start_date: '',
        end_date: '',
        budget: '',
        status: 'planned'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTrip(null);
    setFormData({
      title: '',
      description: '',
      destination: '',
      start_date: '',
      end_date: '',
      budget: '',
      status: 'planned'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrip) {
        await axios.put(`/api/trips/${editingTrip.id}`, formData);
      } else {
        await axios.post('/api/trips', formData);
      }
      await fetchTrips();
      setSnackbar({ open: true, message: 'Trip saved successfully', severity: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error saving trip:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving trip', severity: 'error' });
    }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              Trip Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage pilgrimage trips and their details
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              size="large"
            >
              Create Trip
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TripIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{trips.length}</Typography>
                  <Typography color="text.secondary">Total Trips</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{trips.filter(t => t.status === 'active').length}</Typography>
                  <Typography color="text.secondary">Active Trips</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    ₹{trips.reduce((sum, trip) => sum + (parseFloat(trip.budget) || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">Total Budget</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trips Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
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
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {trip.title}
                    </Typography>
                    {trip.description && (
                      <Typography variant="caption" color="text.secondary">
                        {trip.description.substring(0, 50)}...
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{trip.destination || '-'}</TableCell>
                  <TableCell>{new Date(trip.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(trip.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{trip.budget ? `₹${parseFloat(trip.budget).toLocaleString()}` : '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={trip.status} 
                      color={statusColors[trip.status]} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(trip)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(trip.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Trip Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTrip ? 'Edit Trip' : 'Create New Trip'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  name="title"
                  label="Trip Title"
                  fullWidth
                  variant="outlined"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="destination"
                  label="Destination"
                  fullWidth
                  variant="outlined"
                  value={formData.destination}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="start_date"
                  label="Start Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.start_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="end_date"
                  label="End Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.end_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="budget"
                  label="Budget (₹)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="planned">Planned</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTrip ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
  );
};

export default TripList;
