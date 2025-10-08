import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
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
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  DirectionsBus as BusIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  DateRange as DateIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import axios from 'axios';

const CreateTrip = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Data for dropdowns
  const [destinations, setDestinations] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [accommodationVendors, setAccommodationVendors] = useState([]);
  const [foodVendors, setFoodVendors] = useState([]);
  const [transportVendors, setTransportVendors] = useState([]);

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    
    // Transportation
    destination_id: '',
    bus_id: '',
    driver_id: '',
    transport_vendor_id: '',
    
    // Vendors
    accommodation_vendor_id: '',
    food_vendor_id: '',
    
    // Additional
    boarding_details: '',
    checklist_items: ''
  });

  const steps = [
    'Basic Information',
    'Transportation',
    'Vendors & Services',
    'Additional Details'
  ];

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [destRes, busRes, driverRes, accRes, foodRes, transRes] = await Promise.all([
        axios.get('/api/destinations'),
        axios.get('/api/buses'),
        axios.get('/api/drivers'),
        axios.get('/api/accommodation-vendors'),
        axios.get('/api/food-vendors'),
        axios.get('/api/transport-vendors')
      ]);

      setDestinations(destRes.data.data.items);
      setBuses(busRes.data.data.items);
      setDrivers(driverRes.data.data.items);
      setAccommodationVendors(accRes.data.data.items);
      setFoodVendors(foodRes.data.data.items);
      setTransportVendors(transRes.data.data.items);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setSnackbar({ open: true, message: 'Error loading data', severity: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post('/api/trips', formData);
      setSnackbar({ open: true, message: 'Trip created successfully!', severity: 'success' });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        destination: '',
        start_date: '',
        end_date: '',
        budget: '',
        destination_id: '',
        bus_id: '',
        driver_id: '',
        transport_vendor_id: '',
        accommodation_vendor_id: '',
        food_vendor_id: '',
        boarding_details: '',
        checklist_items: ''
      });
      setActiveStep(0);
    } catch (error) {
      console.error('Error creating trip:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error creating trip', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            {/* First Row: Trip Title, Destination, Start Date, End Date */}
            <Grid item xs={3}>
              <TextField
                name="title"
                label="Trip Title"
                fullWidth
                value={formData.title}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <InfoIcon sx={{ mr: 1, color: '#1976d2' }} />
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                name="destination"
                label="Destination"
                fullWidth
                value={formData.destination}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: '#1976d2' }} />
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                name="start_date"
                label="Start Date"
                type="date"
                fullWidth
                value={formData.start_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <DateIcon sx={{ mr: 1, color: '#1976d2' }} />
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                name="end_date"
                label="End Date"
                type="date"
                fullWidth
                value={formData.end_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <DateIcon sx={{ mr: 1, color: '#1976d2' }} />
                }}
              />
            </Grid>
            
            {/* Second Row: Budget */}
            <Grid item xs={3}>
              <TextField
                name="budget"
                label="Budget (₹)"
                type="number"
                fullWidth
                value={formData.budget}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1, color: '#1976d2' }} />
                }}
              />
            </Grid>
            <Grid item xs={9}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                value={formData.description}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2,
                      width: '66%'
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
              <FormControl fullWidth sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  width: '100%',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: 2
                  }
                }
              }}>
                <InputLabel>Destination</InputLabel>
                <Select
                  name="destination_id"
                  value={formData.destination_id}
                  onChange={handleChange}
                  label="Destination"
                  startAdornment={<LocationIcon sx={{ mr: 1, color: '#1976d2' }} />}
                >
                  {destinations.map((dest) => (
                    <MenuItem key={dest.id} value={dest.id}>
                      {dest.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  width: '100%',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: 2
                  }
                }
              }}>
                <InputLabel>Bus</InputLabel>
                <Select
                  name="bus_id"
                  value={formData.bus_id}
                  onChange={handleChange}
                  label="Bus"
                  startAdornment={<BusIcon sx={{ mr: 1, color: '#1976d2' }} />}
                >
                  {buses.map((bus) => (
                    <MenuItem key={bus.id} value={bus.id}>
                      {bus.title} - {bus.rcNo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  width: '100%',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: 2
                  }
                }
              }}>
                <InputLabel>Driver</InputLabel>
                <Select
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleChange}
                  label="Driver"
                  startAdornment={<PersonIcon sx={{ mr: 1, color: '#1976d2' }} />}
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  width: '100%',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: 2
                  }
                }
              }}>
                <InputLabel>Transport Vendor</InputLabel>
                <Select
                  name="transport_vendor_id"
                  value={formData.transport_vendor_id}
                  onChange={handleChange}
                  label="Transport Vendor"
                  startAdornment={<BusinessIcon sx={{ mr: 1, color: '#1976d2' }} />}
                >
                  {transportVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
              <FormControl fullWidth sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  width: '100%',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: 2
                  }
                }
              }}>
                <InputLabel>Accommodation Vendor</InputLabel>
                <Select
                  name="accommodation_vendor_id"
                  value={formData.accommodation_vendor_id}
                  onChange={handleChange}
                  label="Accommodation Vendor"
                >
                  {accommodationVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  width: '100%',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: 2
                  }
                }
              }}>
                <InputLabel>Food Vendor</InputLabel>
                <Select
                  name="food_vendor_id"
                  value={formData.food_vendor_id}
                  onChange={handleChange}
                  label="Food Vendor"
                >
                  {foodVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="boarding_details"
                label="Boarding Details"
                fullWidth
                multiline
                rows={4}
                value={formData.boarding_details}
                onChange={handleChange}
                placeholder="Enter boarding location, time, and instructions..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="checklist_items"
                label="Checklist Items"
                fullWidth
                multiline
                rows={4}
                value={formData.checklist_items}
                onChange={handleChange}
                placeholder="Enter checklist items separated by commas..."
              />
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Create New Trip
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Create a new pilgrimage trip with all necessary details
        </Typography>
        <Box sx={{ 
          width: 100, 
          height: 4, 
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          borderRadius: 2,
          mx: 'auto'
        }} />
      </Box>

      <Paper sx={{ 
        p: 4, 
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
      }}>
        {/* Progress Stepper */}
        <Stepper 
          activeStep={activeStep} 
          orientation="horizontal"
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-label': {
              fontWeight: 600,
              fontSize: '0.9rem'
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: '#1976d2'
            },
            '& .MuiStepLabel-root .Mui-completed': {
              color: '#4caf50'
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                StepIconComponent={({ active, completed }) => (
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: completed ? '#4caf50' : active ? '#1976d2' : '#e0e0e0',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    boxShadow: active ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none'
                  }}>
                    {completed ? '✓' : index + 1}
                  </Box>
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row', 
          pt: 3,
          mt: 3,
          borderTop: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <Button
            variant={activeStep === 0 ? "outlined" : "contained"}
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ 
              mr: 1,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              ...(activeStep > 0 && {
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                }
              }),
              ...(activeStep === 0 && {
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              })
            }}
            startIcon={<BackIcon />}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #43a047 30%, #5cb85c 90%)',
                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                }
              }}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              variant="contained" 
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                }
              }}
              endIcon={<NextIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

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

export default CreateTrip;
