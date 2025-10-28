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
  Map as MapIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import SimpleMap from '../Map/SimpleMap';
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

  const [mapKey, setMapKey] = useState(0);

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
    // Force map re-render by updating key
    setMapKey(prev => prev + 1);
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
      console.log('Form data being sent:', JSON.stringify(formData, null, 2));
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
      console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message);
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: { xs: 2, md: 4 },
      px: { xs: 1, sm: 2, md: 0 }
    }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Box sx={{ 
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* Title and Description */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Typography 
                component="h1" 
                gutterBottom
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  mb: 1
                }}
              >
                Destinations Management
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                  fontWeight: 400 
                }} 
                color="text.secondary"
              >
                Manage pilgrimage destinations and their details
              </Typography>
            </Box>

            {/* Total Destinations Card and Add Button Row */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: { xs: 2, sm: 3 }
            }}>
              {/* Total Destinations Card */}
              <Card sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                border: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                },
                minWidth: 200,
                flexShrink: 0
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      mr: 1.5
                    }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Total Destinations
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, ml: 1 }}>
                    {destinations.length}
                  </Typography>
                </CardContent>
              </Card>

              {/* Add Button */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                size="large"
                fullWidth={{ xs: true, sm: false }}
                sx={{
                  borderRadius: 3,
                  px: { xs: 2, md: 4 },
                  py: { xs: 1.5, md: 2 },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Add Destination
              </Button>
            </Box>
          </Box>
        </Box>


        {/* Destinations Table */}
        <Paper sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          overflow: 'hidden'
        }}>
          <TableContainer sx={{ 
            maxHeight: { xs: 500, md: 400 },
            overflowX: 'auto'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    borderBottom: 'none',
                    py: { xs: 1.5, md: 2 }
                  }
                }}>
                  <TableCell sx={{ minWidth: { xs: 120, md: 'auto' } }}>Title</TableCell>
                  <TableCell sx={{ minWidth: { xs: 150, md: 'auto' } }}>Address</TableCell>
                  <TableCell sx={{ minWidth: { xs: 120, md: 'auto' } }}>Coordinates</TableCell>
                  <TableCell sx={{ minWidth: { xs: 150, md: 'auto' } }}>Description</TableCell>
                  <TableCell align="center" sx={{ minWidth: { xs: 100, md: 'auto' } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {destinations.map((destination, index) => (
                  <TableRow 
                    key={destination.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease'
                      },
                      '&:nth-of-type(even)': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2', py: { xs: 1, md: 2 } }}>
                      <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, fontWeight: 600 }}>
                        {destination.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250, py: { xs: 1, md: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: { xs: 14, md: 16 }, color: 'text.secondary' }} />
                        <Typography 
                          sx={{ 
                            fontSize: { xs: '0.8rem', md: '0.875rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {destination.address || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, md: 2 } }}>
                      <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' }, fontWeight: 500, color: '#1976d2' }}>
                        {destination.latitude}, {destination.longitude}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, py: { xs: 1, md: 2 } }}>
                      <Typography 
                        sx={{ 
                          fontSize: { xs: '0.8rem', md: '0.875rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {destination.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: { xs: 1, md: 2 } }}>
                      <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, justifyContent: 'center' }}>
                        <IconButton 
                          onClick={() => handleOpen(destination)}
                          size="small"
                          sx={{ 
                            color: '#ff9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            p: { xs: 0.5, md: 1 },
                            '&:hover': { 
                              backgroundColor: 'rgba(255, 152, 0, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="Edit"
                        >
                          <EditIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(destination.id)}
                          size="small"
                          sx={{ 
                            color: '#d32f2f',
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            p: { xs: 0.5, md: 1 },
                            '&:hover': { 
                              backgroundColor: 'rgba(211, 47, 47, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="Delete"
                        >
                          <DeleteIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Destination Form Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="xl" 
        fullWidth
        fullScreen={{ xs: true, sm: false }}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: { xs: 'none', sm: '0 16px 48px rgba(0, 0, 0, 0.2)' },
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            maxHeight: { xs: '100vh', sm: '90vh' }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            textAlign: 'center',
            py: { xs: 2, sm: 3 },
            position: 'relative'
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          {editingDestination ? 'Edit Destination' : 'Add New Destination'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 3 }, 
              mt: { xs: 1, sm: 2 }
            }}>
              {/* Left Side - Form Fields */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#1976d2'
                      }
                    }}
                  />
                  <TextField
                    name="address"
                    label="Address"
                    fullWidth
                    variant="outlined"
                    value={formData.address}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#1976d2'
                      }
                    }}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2 
                  }}>
                    <TextField
                      name="latitude"
                      label="Latitude"
                      fullWidth
                      variant="outlined"
                      value={formData.latitude}
                      onChange={handleChange}
                      type="number"
                      inputProps={{ step: "any" }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: 2
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2'
                        }
                      }}
                    />
                    <TextField
                      name="longitude"
                      label="Longitude"
                      fullWidth
                      variant="outlined"
                      value={formData.longitude}
                      onChange={handleChange}
                      type="number"
                      inputProps={{ step: "any" }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: 2
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2'
                        }
                      }}
                    />
                  </Box>
                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={{ xs: 4, sm: 6 }}
                    value={formData.description}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#1976d2'
                      }
                    }}
                  />
                </Box>
              </Box>
              
              {/* Right Side - Map */}
              <Box sx={{ 
                flex: 1, 
                minWidth: 0,
                order: { xs: -1, md: 0 } // Show map first on mobile
              }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
                  Select Location on Map
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}
                >
                  Click on the map to select a location. Title, address, and coordinates will be automatically updated.
                </Typography>
                {mapLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CircularProgress size={20} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      Getting location details...
                    </Typography>
                  </Box>
                )}
                <SimpleMap
                  key={mapKey}
                  latitude={parseFloat(formData.latitude) || 28.6139}
                  longitude={parseFloat(formData.longitude) || 77.2090}
                  onLocationSelect={handleMapLocationSelect}
                  height={{ xs: "250px", sm: "300px", md: "400px" }}
                  zoom={12}
                />
                <Box sx={{ 
                  mt: 2, 
                  p: { xs: 1.5, sm: 2 }, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1 
                }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    <strong>Selected Coordinates:</strong><br />
                    Latitude: {formData.latitude || 'Not selected'}<br />
                    Longitude: {formData.longitude || 'Not selected'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 }, 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center'
          }}>
            <Button 
              onClick={handleClose}
              variant="outlined"
              fullWidth={{ xs: true, sm: false }}
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 1.5 },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              fullWidth={{ xs: true, sm: false }}
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 4 },
                py: { xs: 1.5, sm: 1.5 },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
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
    </Box>
  );
};

export default Destinations;
