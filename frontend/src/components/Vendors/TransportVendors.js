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
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  DirectionsBus as BusIcon,
  Business as BusinessIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';

const TransportVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewDialog, setViewDialog] = useState({ open: false, vendor: null, details: null });
  const [activeTab, setActiveTab] = useState(0);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/transport-vendors');
      setVendors(res.data.data.items);
    } catch (error) {
      console.error('Error fetching transport vendors:', error);
      setSnackbar({ open: true, message: 'Error fetching vendors', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpen = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        title: vendor.title,
        description: vendor.description || '',
        address: vendor.address || '',
        phone: vendor.phone || '',
        email: vendor.email || ''
      });
    } else {
      setEditingVendor(null);
      setFormData({
        title: '',
        description: '',
        address: '',
        phone: '',
        email: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingVendor(null);
    setFormData({
      title: '',
      description: '',
      address: '',
      phone: '',
      email: ''
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
      if (editingVendor) {
        await axios.put(`/api/transport-vendors/${editingVendor.id}`, formData);
      } else {
        await axios.post('/api/transport-vendors', formData);
      }
      await fetchVendors();
      setSnackbar({ open: true, message: 'Saved successfully', severity: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error saving vendor:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving vendor', severity: 'error' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      axios.delete(`/api/transport-vendors/${id}`).then(() => {
        fetchVendors();
        setSnackbar({ open: true, message: 'Vendor deleted successfully', severity: 'success' });
      });
    }
  };

  const handleViewVendor = async (vendor) => {
    try {
      setLoading(true);
      setActiveTab(0); // Reset to first tab
      const response = await axios.get(`/api/transport-vendors/${vendor.id}/details`);
      setViewDialog({ open: true, vendor, details: response.data.data });
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      setSnackbar({ open: true, message: 'Error fetching vendor details', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialog({ open: false, vendor: null, details: null });
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
              Transport Vendors
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage transport vendors and their details
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            size="large"
          >
            Add Vendor
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
                  <Typography variant="h4">{vendors.length}</Typography>
                  <Typography color="text.secondary">Total Vendors</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{vendors.length}</Typography>
                  <Typography color="text.secondary">Active Vendors</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Vendors Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {vendor.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{vendor.description || '-'}</TableCell>
                  <TableCell>{vendor.address || '-'}</TableCell>
                  <TableCell>{vendor.phone || '-'}</TableCell>
                  <TableCell>{vendor.email || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="info"
                      onClick={() => handleViewVendor(vendor)}
                      size="small"
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(vendor)}
                      size="small"
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(vendor.id)}
                      size="small"
                      title="Delete"
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

      {/* Vendor Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVendor ? 'Edit Transport Vendor' : 'Add New Transport Vendor'}
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
                  name="address"
                  label="Address"
                  fullWidth
                  variant="outlined"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="phone"
                  label="Phone"
                  fullWidth
                  variant="outlined"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingVendor ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Vendor Details Dialog with Tabs */}
      <Dialog 
        open={viewDialog.open} 
        onClose={handleCloseViewDialog} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BusinessIcon color="primary" />
            <Typography variant="h6">
              {viewDialog.vendor?.title} - Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewDialog.details && (
            <Box sx={{ mt: 2 }}>
              {/* Vendor Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Vendor Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Description:</Typography>
                      <Typography variant="body1">{viewDialog.details.description || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Address:</Typography>
                      <Typography variant="body1">{viewDialog.details.address || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Phone:</Typography>
                      <Typography variant="body1">{viewDialog.details.phone || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Email:</Typography>
                      <Typography variant="body1">{viewDialog.details.email || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tabs for Bus, Driver, Conductor */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab 
                    label={`Buses (${viewDialog.details.buses?.length || 0})`} 
                    icon={<BusIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label={`Drivers (${viewDialog.details.drivers?.length || 0})`} 
                    icon={<PersonIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label={`Conductors (${viewDialog.details.drivers?.length || 0})`} 
                    icon={<PersonIcon />} 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ mt: 2 }}>
                {/* Buses Tab */}
                {activeTab === 0 && (
                  <Box>
                    {viewDialog.details.buses && viewDialog.details.buses.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>RC No</TableCell>
                              <TableCell>Model</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Seats</TableCell>
                              <TableCell>Make Year</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {viewDialog.details.buses.map((bus) => (
                              <TableRow key={bus.id}>
                                <TableCell>{bus.title}</TableCell>
                                <TableCell>{bus.rc_no}</TableCell>
                                <TableCell>{bus.model}</TableCell>
                                <TableCell>{bus.type}</TableCell>
                                <TableCell>{bus.no_of_sittings}</TableCell>
                                <TableCell>{bus.make_year}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <BusIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography color="text.secondary">No buses assigned to this vendor</Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Drivers Tab */}
                {activeTab === 1 && (
                  <Box>
                    {viewDialog.details.drivers && viewDialog.details.drivers.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>License No</TableCell>
                              <TableCell>Aadhar No</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {viewDialog.details.drivers.map((driver) => (
                              <TableRow key={driver.id}>
                                <TableCell>{driver.first_name} {driver.last_name}</TableCell>
                                <TableCell>{driver.phone_number}</TableCell>
                                <TableCell>{driver.driving_license_no}</TableCell>
                                <TableCell>{driver.aadhar_no}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography color="text.secondary">No drivers assigned to this vendor</Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Conductors Tab */}
                {activeTab === 2 && (
                  <Box>
                    {viewDialog.details.drivers && viewDialog.details.drivers.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Employee ID</TableCell>
                              <TableCell>Aadhar No</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {viewDialog.details.drivers.map((driver) => (
                              <TableRow key={driver.id}>
                                <TableCell>{driver.first_name} {driver.last_name}</TableCell>
                                <TableCell>{driver.phone_number}</TableCell>
                                <TableCell>{driver.driving_license_no}</TableCell>
                                <TableCell>{driver.aadhar_no}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography color="text.secondary">No conductors assigned to this vendor</Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
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

export default TransportVendors;
