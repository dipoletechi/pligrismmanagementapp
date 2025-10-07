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
  ArrowBack as BackIcon
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Trip Title"
                fullWidth
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
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="start_date"
                label="Start Date"
                type="date"
                fullWidth
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
                value={formData.end_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="budget"
                label="Budget (₹)"
                type="number"
                fullWidth
                value={formData.budget}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Destination</InputLabel>
                <Select
                  name="destination_id"
                  value={formData.destination_id}
                  onChange={handleChange}
                  label="Destination"
                >
                  {destinations.map((dest) => (
                    <MenuItem key={dest.id} value={dest.id}>
                      {dest.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Bus</InputLabel>
                <Select
                  name="bus_id"
                  value={formData.bus_id}
                  onChange={handleChange}
                  label="Bus"
                >
                  {buses.map((bus) => (
                    <MenuItem key={bus.id} value={bus.id}>
                      {bus.title} - {bus.rcNo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Driver</InputLabel>
                <Select
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleChange}
                  label="Driver"
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Transport Vendor</InputLabel>
                <Select
                  name="transport_vendor_id"
                  value={formData.transport_vendor_id}
                  onChange={handleChange}
                  label="Transport Vendor"
                >
                  {transportVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <FormControl fullWidth>
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
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
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
            </Grid>
          </Grid>
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
                rows={3}
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
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Trip
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Create a new pilgrimage trip with all necessary details
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="horizontal">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
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
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained" endIcon={<NextIcon />}>
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
