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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsBus as BusIcon,
  LocalShipping as TransportIcon
} from '@mui/icons-material';
import axios from 'axios';

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    rc_no: '',
    rc_date: '',
    expiry_date: '',
    puc_no: '',
    insurance_no: '',
    model: '',
    make_year: '',
    make: '',
    type: 'bus',
    no_of_sittings: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/buses');
      setBuses(res.data.data.items);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setSnackbar({ open: true, message: 'Error fetching buses', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleOpen = (bus = null) => {
    if (bus) {
      setEditingBus(bus);
      setFormData({
        title: bus.title,
        rc_no: bus.rc_no,
        rc_date: bus.rc_date ? bus.rc_date.split('T')[0] : '',
        expiry_date: bus.expiry_date ? bus.expiry_date.split('T')[0] : '',
        puc_no: bus.puc_no || '',
        insurance_no: bus.insurance_no || '',
        model: bus.model || '',
        make_year: bus.make_year || '',
        make: bus.make || '',
        type: bus.type || 'bus',
        no_of_sittings: bus.no_of_sittings || ''
      });
    } else {
      setEditingBus(null);
      setFormData({
        title: '',
        rc_no: '',
        rc_date: '',
        expiry_date: '',
        puc_no: '',
        insurance_no: '',
        model: '',
        make_year: '',
        make: '',
        type: 'bus',
        no_of_sittings: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBus(null);
    setFormData({
      title: '',
      rc_no: '',
      rc_date: '',
      expiry_date: '',
      puc_no: '',
      insurance_no: '',
      model: '',
      make_year: '',
      make: '',
      type: 'bus',
      no_of_sittings: ''
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
      if (editingBus) {
        await axios.put(`/api/buses/${editingBus.id}`, formData);
      } else {
        await axios.post('/api/buses', formData);
      }
      await fetchBuses();
      setSnackbar({ open: true, message: 'Saved successfully', severity: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error saving bus:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving bus', severity: 'error' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      axios.delete(`/api/buses/${id}`).then(() => {
        fetchBuses();
        setSnackbar({ open: true, message: 'Bus deleted successfully', severity: 'success' });
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
              Bus Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage buses and transport vehicles
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            size="large"
          >
            Add Bus
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{buses.length}</Typography>
                  <Typography color="text.secondary">Total Buses</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TransportIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{buses.length}</Typography>
                  <Typography color="text.secondary">Active Vehicles</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Buses Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>RC No</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Seats</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {bus.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{bus.rc_no}</TableCell>
                  <TableCell>{bus.model || '-'}</TableCell>
                  <TableCell>{bus.type || '-'}</TableCell>
                  <TableCell>{bus.no_of_sittings || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(bus)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(bus.id)}
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

      {/* Bus Form Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: 'auto',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          {editingBus ? 'Edit Bus' : 'Add New Bus'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
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
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="rc_no"
                  label="RC No"
                  fullWidth
                  variant="outlined"
                  value={formData.rc_no}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="rc_date"
                  label="RC Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.rc_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="expiry_date"
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="puc_no"
                  label="PUC No"
                  fullWidth
                  variant="outlined"
                  value={formData.puc_no}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="insurance_no"
                  label="Insurance No"
                  fullWidth
                  variant="outlined"
                  value={formData.insurance_no}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="model"
                  label="Model"
                  fullWidth
                  variant="outlined"
                  value={formData.model}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="make_year"
                  label="Make Year"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.make_year}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="make"
                  label="Make"
                  fullWidth
                  variant="outlined"
                  value={formData.make}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    label="Type"
                    onChange={handleChange}
                  >
                    <MenuItem value="bus">Bus</MenuItem>
                    <MenuItem value="traveller">Traveller</MenuItem>
                    <MenuItem value="car">Car</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="no_of_sittings"
                  label="No of Seats"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.no_of_sittings}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingBus ? 'Update' : 'Create'}
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

export default Buses;
