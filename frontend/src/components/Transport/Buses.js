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
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
          gap: { xs: 2, sm: 0 },
          mb: 2 
        }}>
          <Box>
            <Typography 
              component="h1" 
              gutterBottom
              sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' } }}
            >
              Bus Management
            </Typography>
            <Typography 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Manage buses and transport vehicles
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            fullWidth={{ xs: true, sm: false }}
            sx={{
              fontSize: { xs: '0.875rem', md: '1rem' },
              py: { xs: 1, md: 1.5 }
            }}
          >
            Add Bus
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusIcon color="primary" sx={{ fontSize: { xs: 32, md: 40 }, mr: { xs: 1.5, md: 2 } }} />
                <Box>
                  <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' }, fontWeight: 600 }}>{buses.length}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Total Buses</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TransportIcon color="success" sx={{ fontSize: { xs: 32, md: 40 }, mr: { xs: 1.5, md: 2 } }} />
                <Box>
                  <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' }, fontWeight: 600 }}>{buses.length}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Active Vehicles</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Buses Table */}
      <Paper>
        <TableContainer sx={{ 
          maxHeight: { xs: 500, md: 400 },
          overflowX: 'auto'
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  minWidth: { xs: 150, md: 'auto' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  py: { xs: 1.5, md: 2 }
                }}>Title</TableCell>
                <TableCell sx={{ 
                  minWidth: { xs: 120, md: 'auto' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  py: { xs: 1.5, md: 2 }
                }}>RC No</TableCell>
                <TableCell sx={{ 
                  minWidth: { xs: 100, md: 'auto' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  py: { xs: 1.5, md: 2 }
                }}>Model</TableCell>
                <TableCell sx={{ 
                  minWidth: { xs: 100, md: 'auto' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  py: { xs: 1.5, md: 2 }
                }}>Type</TableCell>
                <TableCell sx={{ 
                  minWidth: { xs: 80, md: 'auto' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  py: { xs: 1.5, md: 2 }
                }}>Seats</TableCell>
                <TableCell align="center" sx={{ 
                  minWidth: { xs: 100, md: 'auto' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  py: { xs: 1.5, md: 2 }
                }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell sx={{ py: { xs: 1, md: 2 } }}>
                    <Typography sx={{ fontSize: { xs: '0.875rem', md: '0.9375rem' }, fontWeight: 'bold' }}>
                      {bus.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' }, py: { xs: 1, md: 2 } }}>{bus.rc_no}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' }, py: { xs: 1, md: 2 } }}>{bus.model || '-'}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' }, py: { xs: 1, md: 2 } }}>{bus.type || '-'}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' }, py: { xs: 1, md: 2 } }}>{bus.no_of_sittings || '-'}</TableCell>
                  <TableCell align="center" sx={{ py: { xs: 1, md: 2 } }}>
                    <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, justifyContent: 'center' }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpen(bus)}
                        size="small"
                        sx={{ p: { xs: 0.5, md: 1 } }}
                      >
                        <EditIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(bus.id)}
                        size="small"
                        sx={{ p: { xs: 0.5, md: 1 } }}
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

      {/* Bus Form Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={{ xs: true, sm: false }}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            margin: 'auto',
            maxHeight: { xs: '100vh', sm: '90vh' }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            textAlign: 'center',
            py: { xs: 2, md: 3 }
          }}
        >
          {editingBus ? 'Edit Bus' : 'Add New Bus'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
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
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="puc_no"
                  label="PUC No"
                  fullWidth
                  variant="outlined"
                  value={formData.puc_no}
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
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="insurance_no"
                  label="Insurance No"
                  fullWidth
                  variant="outlined"
                  value={formData.insurance_no}
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
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="model"
                  label="Model"
                  fullWidth
                  variant="outlined"
                  value={formData.model}
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
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="make"
                  label="Make"
                  fullWidth
                  variant="outlined"
                  value={formData.make}
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
              </Grid>
              <Grid item xs={4}>
                <FormControl 
                  fullWidth
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
                >
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
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: 2, md: 3 }, 
            gap: { xs: 1, md: 2 },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              fullWidth={{ xs: true, sm: false }}
              sx={{
                borderRadius: 2,
                px: { xs: 2, md: 3 },
                py: { xs: 1.25, md: 1.5 },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
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
                px: { xs: 2, md: 4 },
                py: { xs: 1.25, md: 1.5 },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
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
