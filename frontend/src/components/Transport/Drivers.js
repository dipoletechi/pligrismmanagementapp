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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';
import axios from 'axios';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    driving_license_no: '',
    aadhar_no: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/drivers');
      setDrivers(res.data.data.items);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setSnackbar({ open: true, message: 'Error fetching drivers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleOpen = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        first_name: driver.first_name,
        last_name: driver.last_name,
        phone_number: driver.phone_number || '',
        driving_license_no: driver.driving_license_no || '',
        aadhar_no: driver.aadhar_no || ''
      });
    } else {
      setEditingDriver(null);
      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        driving_license_no: '',
        aadhar_no: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDriver(null);
    setFormData({
      first_name: '',
      last_name: '',
      phone_number: '',
      driving_license_no: '',
      aadhar_no: ''
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
      if (editingDriver) {
        await axios.put(`/api/drivers/${editingDriver.id}`, formData);
      } else {
        await axios.post('/api/drivers', formData);
      }
      await fetchDrivers();
      setSnackbar({ open: true, message: 'Saved successfully', severity: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error saving driver:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving driver', severity: 'error' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      axios.delete(`/api/drivers/${id}`).then(() => {
        fetchDrivers();
        setSnackbar({ open: true, message: 'Driver deleted successfully', severity: 'success' });
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
              Drivers Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage drivers and their details
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              size="large"
            >
              Add Driver
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
                <PersonIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{drivers.length}</Typography>
                  <Typography color="text.secondary">Total Drivers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CarIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{drivers.length}</Typography>
                  <Typography color="text.secondary">Active Drivers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Drivers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>License No</TableCell>
                <TableCell>Aadhar No</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {driver.first_name} {driver.last_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{driver.phone_number || '-'}</TableCell>
                  <TableCell>{driver.driving_license_no || '-'}</TableCell>
                  <TableCell>{driver.aadhar_no || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(driver)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(driver.id)}
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

      {/* Driver Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDriver ? 'Edit Driver' : 'Add New Driver'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  name="first_name"
                  label="First Name"
                  fullWidth
                  variant="outlined"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="last_name"
                  label="Last Name"
                  fullWidth
                  variant="outlined"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="phone_number"
                  label="Phone Number"
                  fullWidth
                  variant="outlined"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="driving_license_no"
                  label="Driving License No"
                  fullWidth
                  variant="outlined"
                  value={formData.driving_license_no}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="aadhar_no"
                  label="Aadhar No"
                  fullWidth
                  variant="outlined"
                  value={formData.aadhar_no}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingDriver ? 'Update' : 'Create'}
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

export default Drivers;
