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
  Chip,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControlLabel,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  DirectionsBus as BusIcon,
  DirectionsBus as TripIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  DateRange as DateIcon,
  AttachMoney as MoneyIcon,
  Hotel as HotelIcon,
  Restaurant as FoodIcon,
  Event as EventIcon,
  AccountBalance as FinanceIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const CreateTrip = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Data for dropdowns
  const [destinations, setDestinations] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [conductors, setConductors] = useState([]);
  const [accommodationVendors, setAccommodationVendors] = useState([]);
  const [foodVendors, setFoodVendors] = useState([]);
  const [transportVendors, setTransportVendors] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: null,
    endDate: null,
    selectedDrivers: [],
    selectedConductors: [],
    driversByDay: {}, // { '2025-10-11': [driverIds], '2025-10-12': [driverIds] }
    conductorsByDay: {}, // { '2025-10-11': [conductorIds], '2025-10-12': [conductorIds] }
    accommodations: [],
    events: [],
    finance: {
      vendors: [],
      totalAmount: 0
    }
  });

  // Dialog states
  const [accommodationDialog, setAccommodationDialog] = useState(false);
  const [eventDialog, setEventDialog] = useState(false);
  const [financeDialog, setFinanceDialog] = useState(false);

  // New accommodation/event data
  const [newAccommodation, setNewAccommodation] = useState({
    vendor: '',
    startTime: null,
    endTime: null,
    cost: ''
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: null,
    endTime: null,
    location: ''
  });

  const [newFinance, setNewFinance] = useState({
    vendor: '',
    amount: '',
    description: ''
  });

  const steps = [
    'Basic Information',
    'Transportation',
    'Accommodation & Events',
    'Finance & Review'
  ];

  // Calculate trip days
  const getTripDays = () => {
    if (!formData.startDate || !formData.endDate) return [];
    
    const days = [];
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().split('T')[0]);
    }
    
    return days;
  };

  const tripDays = getTripDays();

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [destRes, busRes, driverRes, conductorRes, accRes, foodRes, transRes] = await Promise.all([
        axios.get('/api/destinations'),
        axios.get('/api/buses'),
        axios.get('/api/drivers'),
        axios.get('/api/conductors'),
        axios.get('/api/accommodation-vendors'),
        axios.get('/api/food-vendors'),
        axios.get('/api/transport-vendors')
      ]);

      setDestinations(destRes.data.data.items || destRes.data.data);
      setBuses(busRes.data.data.items || busRes.data.data);
      setDrivers(driverRes.data.data.items || driverRes.data.data);
      setConductors(conductorRes.data.data.items || conductorRes.data.data);
      setAccommodationVendors(accRes.data.data.items || accRes.data.data);
      setFoodVendors(foodRes.data.data.items || foodRes.data.data);
      setTransportVendors(transRes.data.data.items || transRes.data.data);
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

  const handleDriverChange = (driverId) => {
    setFormData(prev => ({
      ...prev,
      selectedDrivers: prev.selectedDrivers.includes(driverId)
        ? prev.selectedDrivers.filter(id => id !== driverId)
        : [...prev.selectedDrivers, driverId]
    }));
  };

  const handleConductorChange = (conductorId) => {
    setFormData(prev => ({
      ...prev,
      selectedConductors: prev.selectedConductors.includes(conductorId)
        ? prev.selectedConductors.filter(id => id !== conductorId)
        : [...prev.selectedConductors, conductorId]
    }));
  };

  // Handle driver selection for specific day
  const handleDriverDayChange = (day, driverId) => {
    setFormData(prev => ({
      ...prev,
      driversByDay: {
        ...prev.driversByDay,
        [day]: prev.driversByDay[day]?.includes(driverId)
          ? prev.driversByDay[day].filter(id => id !== driverId)
          : [...(prev.driversByDay[day] || []), driverId]
      }
    }));
  };

  // Handle conductor selection for specific day
  const handleConductorDayChange = (day, conductorId) => {
    setFormData(prev => ({
      ...prev,
      conductorsByDay: {
        ...prev.conductorsByDay,
        [day]: prev.conductorsByDay[day]?.includes(conductorId)
          ? prev.conductorsByDay[day].filter(id => id !== conductorId)
          : [...(prev.conductorsByDay[day] || []), conductorId]
      }
    }));
  };

  // Apply same drivers to all days
  const applyDriversToAllDays = () => {
    const allDays = tripDays;
    const selectedDrivers = formData.selectedDrivers;
    
    const driversByDay = {};
    allDays.forEach(day => {
      driversByDay[day] = [...selectedDrivers];
    });
    
    setFormData(prev => ({
      ...prev,
      driversByDay
    }));
  };

  // Apply same conductors to all days
  const applyConductorsToAllDays = () => {
    const allDays = tripDays;
    const selectedConductors = formData.selectedConductors;
    
    const conductorsByDay = {};
    allDays.forEach(day => {
      conductorsByDay[day] = [...selectedConductors];
    });
    
    setFormData(prev => ({
      ...prev,
      conductorsByDay
    }));
  };

  const addAccommodation = () => {
    if (newAccommodation.vendor && newAccommodation.startTime && newAccommodation.endTime) {
      setFormData(prev => ({
        ...prev,
        accommodations: [...prev.accommodations, { ...newAccommodation, id: Date.now() }]
      }));
      setNewAccommodation({ vendor: '', startTime: null, endTime: null, cost: '' });
      setAccommodationDialog(false);
    }
  };

  const removeAccommodation = (id) => {
    setFormData(prev => ({
      ...prev,
      accommodations: prev.accommodations.filter(acc => acc.id !== id)
    }));
  };

  const addEvent = () => {
    if (newEvent.title && newEvent.startTime && newEvent.endTime) {
      setFormData(prev => ({
        ...prev,
        events: [...prev.events, { ...newEvent, id: Date.now() }]
      }));
      setNewEvent({ title: '', description: '', startTime: null, endTime: null, location: '' });
      setEventDialog(false);
    }
  };

  const removeEvent = (id) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== id)
    }));
  };

  const addFinance = () => {
    if (newFinance.vendor && newFinance.amount) {
      const financeEntry = { ...newFinance, id: Date.now() };
      setFormData(prev => ({
        ...prev,
        finance: {
          ...prev.finance,
          vendors: [...prev.finance.vendors, financeEntry],
          totalAmount: prev.finance.totalAmount + parseFloat(newFinance.amount || 0)
        }
      }));
      setNewFinance({ vendor: '', amount: '', description: '' });
      setFinanceDialog(false);
    }
  };

  const removeFinance = (id) => {
    setFormData(prev => {
      const financeToRemove = prev.finance.vendors.find(f => f.id === id);
      return {
        ...prev,
        finance: {
          ...prev.finance,
          vendors: prev.finance.vendors.filter(f => f.id !== id),
          totalAmount: prev.finance.totalAmount - parseFloat(financeToRemove?.amount || 0)
        }
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const tripData = {
        ...formData,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString()
      };
      
      await axios.post('/api/trips', tripData);
      setSnackbar({ open: true, message: 'Trip created successfully!', severity: 'success' });
      
      // Reset form
      setFormData({
        title: '',
        destination: '',
        startDate: null,
        endDate: null,
        selectedDrivers: [],
        selectedConductors: [],
        accommodations: [],
        events: [],
        finance: { vendors: [], totalAmount: 0 }
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Trip Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6} width={250}>
              <FormControl fullWidth>
                <InputLabel>Destination</InputLabel>
                <Select
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  label="Destination"
                >
                  {destinations.map((dest) => (
                    <MenuItem key={dest.id} value={dest.id}>
                      {dest.title || dest.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Start Date & Time"
                value={formData.startDate}
                onChange={(newValue) => setFormData(prev => ({ ...prev, startDate: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="End Date & Time"
                value={formData.endDate}
                onChange={(newValue) => setFormData(prev => ({ ...prev, endDate: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            {/* All Days Selection */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TripIcon color="primary" />
                  All Days Selection
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select drivers and conductors for all {tripDays.length} days
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Drivers</Typography>
                    <Box sx={{ maxHeight: 150, overflow: 'auto', mb: 2 }}>
                      {drivers.map((driver) => (
                        <FormControlLabel
                          key={driver.id}
                          control={
                            <Checkbox
                              checked={formData.selectedDrivers.includes(driver.id)}
                              onChange={() => handleDriverChange(driver.id)}
                            />
                          }
                          label={`${driver.first_name || driver.firstName || driver.name || 'Driver'} ${driver.last_name || driver.lastName || ''}`}
                        />
                      ))}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={applyDriversToAllDays}
                      disabled={formData.selectedDrivers.length === 0}
                    >
                      Apply to All Days
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Conductors</Typography>
                    <Box sx={{ maxHeight: 150, overflow: 'auto', mb: 2 }}>
                      {conductors.map((conductor) => (
                        <FormControlLabel
                          key={conductor.id}
                          control={
                            <Checkbox
                              checked={formData.selectedConductors.includes(conductor.id)}
                              onChange={() => handleConductorChange(conductor.id)}
                            />
                          }
                          label={`${conductor.first_name || conductor.firstName || conductor.name || 'Conductor'} ${conductor.last_name || conductor.lastName || ''}`}
                        />
                      ))}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={applyConductorsToAllDays}
                      disabled={formData.selectedConductors.length === 0}
                    >
                      Apply to All Days
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Day-wise Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddIcon color="primary" />
                Day-wise Selection
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select different drivers and conductors for specific days
              </Typography>
              
              {tripDays.map((day, index) => (
                <Card key={day} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Day {index + 1} - {new Date(day).toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>Drivers</Typography>
                      <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
                        {drivers.map((driver) => (
                          <FormControlLabel
                            key={driver.id}
                            control={
                              <Checkbox
                                checked={formData.driversByDay[day]?.includes(driver.id) || false}
                                onChange={() => handleDriverDayChange(day, driver.id)}
                                size="small"
                              />
                            }
                            label={`${driver.first_name || driver.firstName || driver.name || 'Driver'} ${driver.last_name || driver.lastName || ''}`}
                            sx={{ fontSize: '0.8rem' }}
                          />
                        ))}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>Conductors</Typography>
                      <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
                        {conductors.map((conductor) => (
                          <FormControlLabel
                            key={conductor.id}
                            control={
                              <Checkbox
                                checked={formData.conductorsByDay[day]?.includes(conductor.id) || false}
                                onChange={() => handleConductorDayChange(day, conductor.id)}
                                size="small"
                              />
                            }
                            label={`${conductor.first_name || conductor.firstName || conductor.name || 'Conductor'} ${conductor.last_name || conductor.lastName || ''}`}
                            sx={{ fontSize: '0.8rem' }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Accommodation</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setAccommodationDialog(true)}
                      size="small"
                    >
                      Add
                    </Button>
                  </Box>
                  
                  {formData.accommodations.map((acc) => (
                    <Card key={acc.id} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2">
                              {accommodationVendors.find(v => v.id === acc.vendor)?.title || 'Unknown Vendor'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {acc.startTime?.toLocaleString()} - {acc.endTime?.toLocaleString()}
                            </Typography>
                            {acc.cost && (
                              <Typography variant="body2" color="primary">
                                ₹{acc.cost}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeAccommodation(acc.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Events</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setEventDialog(true)}
                      size="small"
                    >
                      Add Event
                    </Button>
                  </Box>
                  
                  {formData.events.map((event) => (
                    <Card key={event.id} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2">{event.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {event.startTime?.toLocaleString()} - {event.endTime?.toLocaleString()}
                            </Typography>
                            {event.location && (
                              <Typography variant="body2" color="text.secondary">
                                📍 {event.location}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeEvent(event.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Finance Section</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setFinanceDialog(true)}
                      size="small"
                    >
                      Add Vendor
                    </Button>
                  </Box>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Vendor</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.finance.vendors.map((finance) => (
                          <TableRow key={finance.id}>
                            <TableCell>{finance.vendor}</TableCell>
                            <TableCell>₹{finance.amount}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => removeFinance(finance.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Total Amount:</Typography>
                    <Typography variant="h6" color="primary">
                      ₹{formData.finance.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            Trip Management
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
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

        {/* Accommodation Dialog */}
        <Dialog open={accommodationDialog} onClose={() => setAccommodationDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Accommodation</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Vendor</InputLabel>
                <Select
                    value={newAccommodation.vendor}
                    onChange={(e) => setNewAccommodation(prev => ({ ...prev, vendor: e.target.value }))}
                    label="Vendor"
                >
                  {accommodationVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.title || vendor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>
              <Grid item xs={6}>
                <DateTimePicker
                  label="Start Time"
                  value={newAccommodation.startTime}
                  onChange={(newValue) => setNewAccommodation(prev => ({ ...prev, startTime: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <DateTimePicker
                  label="End Time"
                  value={newAccommodation.endTime}
                  onChange={(newValue) => setNewAccommodation(prev => ({ ...prev, endTime: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cost (₹)"
                  type="number"
                  value={newAccommodation.cost}
                  onChange={(e) => setNewAccommodation(prev => ({ ...prev, cost: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAccommodationDialog(false)}>Cancel</Button>
            <Button onClick={addAccommodation} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>

        {/* Event Dialog */}
        <Dialog open={eventDialog} onClose={() => setEventDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Event</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                />
              </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                  label="Description"
                multiline
                  rows={2}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
              <Grid item xs={6}>
                <DateTimePicker
                  label="Start Time"
                  value={newEvent.startTime}
                  onChange={(newValue) => setNewEvent(prev => ({ ...prev, startTime: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <DateTimePicker
                  label="End Time"
                  value={newEvent.endTime}
                  onChange={(newValue) => setNewEvent(prev => ({ ...prev, endTime: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEventDialog(false)}>Cancel</Button>
            <Button onClick={addEvent} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>

        {/* Finance Dialog */}
        <Dialog open={financeDialog} onClose={() => setFinanceDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Finance Entry</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vendor Name"
                  value={newFinance.vendor}
                  onChange={(e) => setNewFinance(prev => ({ ...prev, vendor: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  type="number"
                  value={newFinance.amount}
                  onChange={(e) => setNewFinance(prev => ({ ...prev, amount: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                  label="Description"
                multiline
                  rows={2}
                  value={newFinance.description}
                  onChange={(e) => setNewFinance(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFinanceDialog(false)}>Cancel</Button>
            <Button onClick={addFinance} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>

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
    </LocalizationProvider>
  );
};

export default CreateTrip;