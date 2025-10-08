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
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  DirectionsBusOutlined as BusAddIcon,
  SupervisorAccount as ConductorIcon
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
                Transport Vendors
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Manage transport vendors and their details
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              size="large"
              sx={{
                borderRadius: 3,
                px: 4,
                py: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
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
              Add Vendor
            </Button>
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
              border: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    mr: 2
                  }}>
                    <BusIcon sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {vendors.length}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Total Vendors
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
              border: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(240, 147, 251, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    mr: 2
                  }}>
                    <BusinessIcon sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {vendors.length}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Active Vendors
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
              border: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    mr: 2
                  }}>
                    <PersonIcon sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {vendors.length * 2}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Total Drivers
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
              border: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(67, 233, 123, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    mr: 2
                  }}>
                    <BusIcon sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {vendors.length * 3}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Total Buses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Vendors Table */}
        <Paper sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          overflow: 'hidden'
        }}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderBottom: 'none'
                  }
                }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.map((vendor, index) => (
                  <TableRow 
                    key={vendor.id}
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
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {vendor.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {vendor.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {vendor.address || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {vendor.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#1976d2' }}>
                        {vendor.email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton 
                          onClick={() => handleViewVendor(vendor)} 
                          sx={{ 
                            color: '#1976d2',
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(25, 118, 210, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleOpen(vendor)} 
                          sx={{ 
                            color: '#ff9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(255, 152, 0, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(vendor.id)} 
                          sx={{ 
                            color: '#d32f2f',
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(211, 47, 47, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          title="Delete"
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

        {/* Vendor Form Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.5rem',
            textAlign: 'center',
            py: 3
          }}
        >
          {editingVendor ? 'Edit Transport Vendor' : 'Add New Transport Vendor'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {/* Left Section - 2 rows */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Row 1: Title and Address */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      autoFocus
                      name="title"
                      label="Title *"
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
                  </Box>
                  
                  {/* Row 2: Phone and Email */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      name="phone"
                      label="Phone"
                      fullWidth
                      variant="outlined"
                      value={formData.phone}
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
                    <TextField
                      name="email"
                      label="Email"
                      type="email"
                      fullWidth
                      variant="outlined"
                      value={formData.email}
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
              </Box>
              
              {/* Right Section - Description only */}
              <Box sx={{ flex: 1 }}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
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
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
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
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
              {editingVendor ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Vendor Details Dialog with Tabs */}
      <Dialog
        open={viewDialog.open}
        onClose={handleCloseViewDialog}
        maxWidth="xl" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.5rem',
            textAlign: 'center',
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <BusinessIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="div">
            {viewDialog.vendor?.title} - Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {viewDialog.details && (
            <Box sx={{ mt: 2 }}>
              {/* Vendor Info */}
              <Card 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(25, 118, 210, 0.1)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{
                      color: '#1976d2',
                      fontWeight: 600,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <BusinessIcon />
                    Vendor Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          Description:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {viewDialog.details.description || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          Address:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {viewDialog.details.address || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          Phone:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {viewDialog.details.phone || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          Email:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {viewDialog.details.email || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tabs for Bus, Driver, Conductor */}
              <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 3,
                '& .MuiTabs-root': {
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minHeight: 48,
                    '&.Mui-selected': {
                      color: '#1976d2',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderRadius: '8px 8px 0 0'
                    }
                  }
                }
              }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#1976d2',
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    }
                  }}
                >
                  <Tab 
                    label={`Buses (${viewDialog.details.buses?.length || 0})`} 
                    icon={<BusIcon />} 
                    iconPosition="start"
                    sx={{ gap: 1 }}
                  />
                  <Tab 
                    label={`Drivers (${viewDialog.details.drivers?.length || 0})`} 
                    icon={<PersonIcon />} 
                    iconPosition="start"
                    sx={{ gap: 1 }}
                  />
                  <Tab 
                    label={`Conductors (${viewDialog.details.drivers?.length || 0})`} 
                    icon={<ConductorIcon />} 
                    iconPosition="start"
                    sx={{ gap: 1 }}
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ mt: 2 }}>
                {/* Buses Tab */}
                {activeTab === 0 && (
                  <Box>
                    {/* Add Bus Button */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        startIcon={<BusAddIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                          }
                        }}
                      >
                        Add Bus
                      </Button>
                    </Box>

                    {viewDialog.details.buses && viewDialog.details.buses.length > 0 ? (
                      <TableContainer 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Title</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>RC No</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Model</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Seats</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Make Year</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {viewDialog.details.buses.map((bus) => (
                              <TableRow 
                                key={bus.id}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)' 
                                  } 
                                }}
                              >
                                <TableCell sx={{ fontWeight: 500 }}>{bus.title}</TableCell>
                                <TableCell>{bus.rc_no}</TableCell>
                                <TableCell>{bus.model}</TableCell>
                                <TableCell>
                                  <Box sx={{ 
                                    display: 'inline-block',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    color: '#1976d2',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                  }}>
                                    {bus.type}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>{bus.no_of_sittings}</TableCell>
                                <TableCell>{bus.make_year}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton 
                                      size="small" 
                                      sx={{ 
                                        color: '#1976d2',
                                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                                      }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      sx={{ 
                                        color: '#d32f2f',
                                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                                      }}
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
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        backgroundColor: 'rgba(25, 118, 210, 0.02)',
                        borderRadius: 3,
                        border: '2px dashed rgba(25, 118, 210, 0.2)'
                      }}>
                        <BusIcon sx={{ fontSize: 64, color: 'rgba(25, 118, 210, 0.3)', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          No buses assigned to this vendor
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Bus" to assign buses to this vendor
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Drivers Tab */}
                {activeTab === 1 && (
                  <Box>
                    {/* Add Driver Button */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                          }
                        }}
                      >
                        Add Driver
                      </Button>
                    </Box>

                    {viewDialog.details.drivers && viewDialog.details.drivers.length > 0 ? (
                      <TableContainer 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Name</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Phone</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>License No</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Aadhar No</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {viewDialog.details.drivers.map((driver) => (
                              <TableRow 
                                key={driver.id}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)' 
                                  } 
                                }}
                              >
                                <TableCell sx={{ fontWeight: 500 }}>
                                  {driver.first_name} {driver.last_name}
                                </TableCell>
                                <TableCell>{driver.phone_number}</TableCell>
                                <TableCell>
                                  <Box sx={{ 
                                    display: 'inline-block',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    color: '#1976d2',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                  }}>
                                    {driver.driving_license_no}
                                  </Box>
                                </TableCell>
                                <TableCell>{driver.aadhar_no}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton 
                                      size="small" 
                                      sx={{ 
                                        color: '#1976d2',
                                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                                      }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      sx={{ 
                                        color: '#d32f2f',
                                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                                      }}
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
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        backgroundColor: 'rgba(25, 118, 210, 0.02)',
                        borderRadius: 3,
                        border: '2px dashed rgba(25, 118, 210, 0.2)'
                      }}>
                        <PersonIcon sx={{ fontSize: 64, color: 'rgba(25, 118, 210, 0.3)', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          No drivers assigned to this vendor
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Driver" to assign drivers to this vendor
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Conductors Tab */}
                {activeTab === 2 && (
                  <Box>
                    {/* Add Conductor Button */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        startIcon={<ConductorIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                          }
                        }}
                      >
                        Add Conductor
                      </Button>
                    </Box>

                    {viewDialog.details.drivers && viewDialog.details.drivers.length > 0 ? (
                      <TableContainer 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Name</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Phone</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Employee ID</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Aadhar No</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {viewDialog.details.drivers.map((driver) => (
                              <TableRow 
                                key={driver.id}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)' 
                                  } 
                                }}
                              >
                                <TableCell sx={{ fontWeight: 500 }}>
                                  {driver.first_name} {driver.last_name}
                                </TableCell>
                                <TableCell>{driver.phone_number}</TableCell>
                                <TableCell>
                                  <Box sx={{ 
                                    display: 'inline-block',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    color: '#1976d2',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                  }}>
                                    {driver.driving_license_no}
                                  </Box>
                                </TableCell>
                                <TableCell>{driver.aadhar_no}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton 
                                      size="small" 
                                      sx={{ 
                                        color: '#1976d2',
                                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                                      }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      sx={{ 
                                        color: '#d32f2f',
                                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                                      }}
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
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        backgroundColor: 'rgba(25, 118, 210, 0.02)',
                        borderRadius: 3,
                        border: '2px dashed rgba(25, 118, 210, 0.2)'
                      }}>
                        <ConductorIcon sx={{ fontSize: 64, color: 'rgba(25, 118, 210, 0.3)', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          No conductors assigned to this vendor
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Conductor" to assign conductors to this vendor
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: 'rgba(25, 118, 210, 0.02)' }}>
          <Button 
            onClick={handleCloseViewDialog}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
              }
            }}
          >
            Close
          </Button>
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
    </Box>
  );
};

export default TransportVendors;
