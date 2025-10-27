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
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  Star as StarIcon
} from '@mui/icons-material';

const Amenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/amenities');
      setAmenities(res.data.data.items);
    } catch (error) {
      console.error('Error fetching amenities:', error);
      setSnackbar({ open: true, message: 'Error fetching amenities', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleOpen = (amenity = null) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setFormData({
        title: amenity.title,
        description: amenity.description
      });
    } else {
      setEditingAmenity(null);
      setFormData({
        title: '',
        description: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAmenity(null);
    setFormData({
      title: '',
      description: ''
    });
  };

  const handleEdit = (amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      title: amenity.title,
      description: amenity.description || ''
    });
    setOpen(true);
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
      if (editingAmenity) {
        await axios.put(`/api/amenities/${editingAmenity.id}`, formData);
      } else {
        await axios.post('/api/amenities', formData);
      }
      await fetchAmenities();
      setSnackbar({ open: true, message: 'Saved successfully', severity: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error saving amenity:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving amenity', severity: 'error' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this amenity?')) {
      axios.delete(`/api/amenities/${id}`).then(() => {
        fetchAmenities();
        setSnackbar({ open: true, message: 'Amenity deleted successfully', severity: 'success' });
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
                Amenities Management
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Manage amenities available for trips
              </Typography>
            </Box>

            {/* Total Amenities Card and Add Button Row */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              gap: 3
            }}>
              {/* Total Amenities Card */}
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
                      <StarIcon sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Total Amenities
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, ml: 1 }}>
                    {amenities.length}
                  </Typography>
                </CardContent>
              </Card>

              {/* Add Button */}
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
                Add Amenity
              </Button>
            </Box>
          </Box>
        </Box>


        {/* Amenities Table */}
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
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {amenities.map((amenity, index) => (
                  <TableRow 
                    key={amenity.id}
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
                        <HotelIcon sx={{ color: '#1976d2', mr: 2, fontSize: 24 }} />
                        <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                          {amenity.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {amenity.description || 'No description provided'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          onClick={() => handleEdit(amenity)}
                          sx={{
                            color: '#1976d2',
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(amenity.id)}
                          sx={{
                            color: '#d32f2f',
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
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
        </Paper>

      {/* Amenity Form Dialog */}
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
          {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              {editingAmenity ? 'Update' : 'Create'}
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

export default Amenities;
