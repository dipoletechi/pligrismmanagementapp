import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Map as MapIcon
} from '@mui/icons-material';
import OSMMap from '../Map/OSMMap';
// No API calls yet

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    latitude: '',
    longitude: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mapLoading, setMapLoading] = useState(false);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/destinations?page=1&limit=100');
      setDestinations(res.data.data.items);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setSnackbar({ open: true, message: 'Error fetching destinations', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleOpen = (destination = null) => {
    if (destination) {
      setEditingDestination(destination);
      setFormData({
        title: destination.title,
        address: destination.address,
        latitude: destination.latitude,
        longitude: destination.longitude,
        description: destination.description
      });
    } else {
      setEditingDestination(null);
      setFormData({
        title: '',
        address: '',
        latitude: '',
        longitude: '',
        description: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDestination(null);
    setFormData({
      title: '',
      address: '',
      latitude: '',
      longitude: '',
      description: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMapLocationSelect = (lat, lng, title = null, address = null) => {
    setMapLoading(true);
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
      ...(title && { title: title }),
      ...(address && { address: address })
    }));
    // Reset loading after a short delay
    setTimeout(() => setMapLoading(false), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDestination) {
        await axios.put(`/api/destinations/${editingDestination.id}`, formData);
      } else {
        await axios.post('/api/destinations', formData);
      }
      await fetchDestinations();
      setSnackbar({ open: true, message: 'Saved successfully', severity: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error saving destination:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving destination', severity: 'error' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      axios.delete(`/api/destinations/${id}`).then(() => {
        fetchDestinations();
        setSnackbar({ open: true, message: 'Destination deleted successfully', severity: 'success' });
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Destinations Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage pilgrimage destinations and their details
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            size="large"
          >
            Add Destination
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{destinations.length}</Typography>
                  <Typography color="text.secondary">Total Destinations</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MapIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{destinations.length}</Typography>
                  <Typography color="text.secondary">Active Destinations</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Destinations Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Coordinates</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {destinations.map((destination) => (
                <TableRow key={destination.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {destination.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{destination.address}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {destination.latitude}, {destination.longitude}
                    </Typography>
                  </TableCell>
                  <TableCell>{destination.description}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(destination)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(destination.id)}
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

      {/* Destination Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
        <DialogTitle>
          {editingDestination ? 'Edit Destination' : 'Add New Destination'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              {/* Left Side - Form Fields */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Destination Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    autoFocus
                    name="title"
                    label="Title"
                    fullWidth
                    variant="outlined"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    name="address"
                    label="Address"
                    fullWidth
                    variant="outlined"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      name="latitude"
                      label="Latitude"
                      fullWidth
                      variant="outlined"
                      value={formData.latitude}
                      onChange={handleChange}
                      required
                      type="number"
                      inputProps={{ step: "any" }}
                    />
                    <TextField
                      name="longitude"
                      label="Longitude"
                      fullWidth
                      variant="outlined"
                      value={formData.longitude}
                      onChange={handleChange}
                      required
                      type="number"
                      inputProps={{ step: "any" }}
                    />
                  </Box>
                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Box>
              </Box>
              
              {/* Right Side - Map */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Select Location on Map
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click on the map to select a location. Title, address, and coordinates will be automatically updated.
                </Typography>
                {mapLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Getting location details...
                    </Typography>
                  </Box>
                )}
                <OSMMap
                  latitude={parseFloat(formData.latitude) || 28.6139}
                  longitude={parseFloat(formData.longitude) || 77.2090}
                  onLocationSelect={handleMapLocationSelect}
                  height="400px"
                  zoom={12}
                />
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Selected Coordinates:</strong><br />
                    Latitude: {formData.latitude || 'Not selected'}<br />
                    Longitude: {formData.longitude || 'Not selected'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingDestination ? 'Update' : 'Create'}
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

export default Destinations;
