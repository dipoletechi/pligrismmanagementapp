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
  StepContent,
  OutlinedInput,
  InputAdornment
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
  CheckCircle as CheckIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
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
    selectedBuses: [],
    driversByDay: {}, // { '2025-10-11': [driverIds], '2025-10-12': [driverIds] }
    conductorsByDay: {}, // { '2025-10-11': [conductorIds], '2025-10-12': [conductorIds] }
    busesByDay: {}, // { '2025-10-11': [busIds], '2025-10-12': [busIds] }
    timeByDay: {}, // { '2025-10-11': { startTime: '08:00', endTime: '18:00' } }
    accommodations: [],
    accommodationsByDay: {}, // { '2025-10-11': [accommodations], '2025-10-12': [accommodations] }
    selectedAccommodationVendor: '',
    selectedAccommodationStartTime: '',
    selectedAccommodationEndTime: '',
    events: [],
    eventsByDay: {}, // { '2025-10-11': [events], '2025-10-12': [events] }
    selectedEventTitle: '',
    selectedEventDescription: '',
    selectedEventStartTime: '',
    selectedEventEndTime: '',
    finance: {
      vendors: [],
      totalAmount: 0
    }
  });
  
  // Collapse states for sections
  const [allDaysExpanded, setAllDaysExpanded] = useState(false);
  const [dayWiseExpanded, setDayWiseExpanded] = useState(false);
  const [appliedToAllDays, setAppliedToAllDays] = useState({
    drivers: false,
    conductors: false,
    buses: false,
    accommodations: false,
    events: false
  });
  
  // Apply button states
  const [applyButtonState, setApplyButtonState] = useState('default'); // 'default', 'applied', 'changed'

  // Dialog states
  const [accommodationDialog, setAccommodationDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventDialog, setEventDialog] = useState(false);
  const [financeDialog, setFinanceDialog] = useState(false);

  // New accommodation/event data
  const [newAccommodation, setNewAccommodation] = useState({
    vendor: '',
    startTime: null,
    endTime: null
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: null,
    endTime: null
  });

  const [newFinance, setNewFinance] = useState({
    vendor: '',
    amount: '',
    description: ''
  });

  const steps = [
    'Basic Information',
    'Transportation',
    'Accommodation',
    'Events',
    'Finance & Review'
  ];

  // Calculate trip days
  const getTripDays = () => {
    if (!formData.startDate || !formData.endDate) return [];
    
    const days = [];
    
    // Simple approach: get date strings and parse them
    const startDateStr = formData.startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDateStr = formData.endDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('Start Date String:', startDateStr);
    console.log('End Date String:', endDateStr);
    
    // Parse dates
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');
    
    console.log('Parsed Start:', start);
    console.log('Parsed End:', end);
    
    // Generate days from start to end (inclusive)
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      days.push(`${year}-${month}-${day}`);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log('Generated days:', days);
    return days;
  };

  const tripDays = getTripDays();

  // Dropdown checklist component
  const DropdownChecklist = ({ 
    label, 
    options, 
    selectedValues, 
    onChange, 
    placeholder = "Select items...",
    disabled = false 
  }) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggle = (value) => {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter(item => item !== value)
        : [...selectedValues, value];
      onChange(newSelectedValues);
    };

    const handleSelectAll = () => {
      if (selectedValues.length === filteredOptions.length) {
        onChange([]);
      } else {
        onChange(filteredOptions.map(option => option.value));
      }
    };

    const selectedLabels = selectedValues.map(value => 
      options.find(option => option.value === value)?.label
    ).filter(Boolean);

    return (
      <FormControl fullWidth>
        <InputLabel shrink={true}>{label}</InputLabel>
        <Select
          multiple
          value={selectedValues}
          onChange={() => {}} // Controlled by custom logic
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          open={open}
          disabled={disabled}
          IconComponent={() => null} // Disable default Material-UI icon
          input={
            <OutlinedInput
              readOnly
              onClick={() => setOpen(!open)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #e0e0e0',
                  borderTop: 'none'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #e0e0e0',
                  borderTop: 'none'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #e0e0e0',
                  borderTop: 'none'
                }
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setOpen(!open)}
                    edge="end"
                    size="small"
                  >
                    {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
          }
          renderValue={() => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedLabels.map((label, index) => (
                <Chip
                  key={index}
                  label={label}
                  size="small"
                  onDelete={() => handleToggle(options.find(opt => opt.label === label)?.value)}
                />
              ))}
            </Box>
          )}
        >
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <Box sx={{ mt: 1, mb: 1 }}>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll();
                }}
                fullWidth
                variant="outlined"
              >
                {selectedValues.length === filteredOptions.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            <Divider />
          </Box>
          {filteredOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(option.value);
              }}
            >
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
              />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

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
      
      // Debug bus data
      console.log('Bus data:', busRes.data.data.items || busRes.data.data);
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

  const handleDriverSelectionChange = (values) => {
    setFormData(prev => ({ ...prev, selectedDrivers: values }));
    checkForChanges();
  };

  const handleConductorSelectionChange = (values) => {
    setFormData(prev => ({ ...prev, selectedConductors: values }));
    checkForChanges();
  };

  const handleBusSelectionChange = (values) => {
    setFormData(prev => ({ ...prev, selectedBuses: values }));
    checkForChanges();
  };

  const handleDriverChange = (driverId) => {
    setFormData(prev => ({
      ...prev,
      selectedDrivers: prev.selectedDrivers.includes(driverId)
        ? prev.selectedDrivers.filter(id => id !== driverId)
        : [...prev.selectedDrivers, driverId]
    }));
    checkForChanges();
  };

  const handleConductorChange = (conductorId) => {
    setFormData(prev => ({
      ...prev,
      selectedConductors: prev.selectedConductors.includes(conductorId)
        ? prev.selectedConductors.filter(id => id !== conductorId)
        : [...prev.selectedConductors, conductorId]
    }));
    checkForChanges();
  };

  const applyDriversToAllDays = () => {
    const allDays = getTripDays();
    const driversByDay = {};
    allDays.forEach(day => {
      driversByDay[day] = formData.selectedDrivers;
    });
    setFormData(prev => ({
      ...prev,
      driversByDay
    }));
    setAppliedToAllDays(prev => ({ ...prev, drivers: true }));
  };

  const applyConductorsToAllDays = () => {
    const allDays = getTripDays();
    const conductorsByDay = {};
    allDays.forEach(day => {
      conductorsByDay[day] = formData.selectedConductors;
    });
    setFormData(prev => ({
      ...prev,
      conductorsByDay
    }));
    setAppliedToAllDays(prev => ({ ...prev, conductors: true }));
  };

  const applyAccommodationsToAllDays = () => {
    const allDays = getTripDays();
    const accommodationsByDay = {};
    const accommodation = {
      id: Date.now(),
      vendor: formData.selectedAccommodationVendor,
      startTime: new Date(`2000-01-01T${formData.selectedAccommodationStartTime}`),
      endTime: new Date(`2000-01-01T${formData.selectedAccommodationEndTime}`)
    };
    
    allDays.forEach(day => {
      accommodationsByDay[day] = [accommodation];
    });
    
    setFormData(prev => ({
      ...prev,
      accommodationsByDay
    }));
    setAppliedToAllDays(prev => ({ ...prev, accommodations: true }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };


  // Handle driver selection for specific day
  const handleDriverDayChange = (day, driverIds) => {
    setFormData(prev => ({
      ...prev,
      driversByDay: {
        ...prev.driversByDay,
        [day]: driverIds
      }
    }));
  };

  // Handle conductor selection for specific day
  const handleConductorDayChange = (day, conductorIds) => {
    setFormData(prev => ({
      ...prev,
      conductorsByDay: {
        ...prev.conductorsByDay,
        [day]: conductorIds
      }
    }));
  };

  // Apply all selections to all days
  const applyAllToAllDays = () => {
    const allDays = tripDays;
    const selectedDrivers = formData.selectedDrivers;
    const selectedConductors = formData.selectedConductors;
    const selectedBuses = formData.selectedBuses;
    
    const driversByDay = {};
    const conductorsByDay = {};
    const busesByDay = {};
    
    allDays.forEach(day => {
      driversByDay[day] = [...selectedDrivers];
      conductorsByDay[day] = [...selectedConductors];
      busesByDay[day] = [...selectedBuses];
    });
    
    setFormData(prev => ({
      ...prev,
      driversByDay,
      conductorsByDay,
      busesByDay
    }));
    
    setApplyButtonState('applied');
  };

  // Check if any selection has changed
  const checkForChanges = () => {
    const hasDrivers = formData.selectedDrivers.length > 0;
    const hasConductors = formData.selectedConductors.length > 0;
    const hasBuses = formData.selectedBuses.length > 0;
    
    if (hasDrivers || hasConductors || hasBuses) {
      setApplyButtonState('changed');
    } else {
      setApplyButtonState('default');
    }
  };

  const handleBusDayChange = (day, values) => {
    setFormData(prev => ({
      ...prev,
      busesByDay: {
        ...prev.busesByDay,
        [day]: values
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      timeByDay: {
        ...prev.timeByDay,
        [day]: {
          ...prev.timeByDay[day],
          [field]: value
        }
      }
    }));
  };

  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Convert 12-hour time to 24-hour format
  const formatTime24Hour = (time12) => {
    if (!time12) return '';
    const [time, ampm] = time12.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  // Generate time options for dropdown
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) { // 5-minute intervals
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = formatTime12Hour(time24);
        options.push({ value: time24, label: time12 });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Custom Time Picker Component
  const TimePicker = ({ label, value, onChange, disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [tempTime, setTempTime] = useState(value || '00:00');
    
    const [hours, minutes] = tempTime.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    
    const handleHourChange = (newHour) => {
      const hour24 = ampm === 'PM' && newHour !== 12 ? newHour + 12 : 
                    ampm === 'AM' && newHour === 12 ? 0 : newHour;
      setTempTime(`${hour24.toString().padStart(2, '0')}:${minutes}`);
    };
    
    const handleMinuteChange = (newMinute) => {
      setTempTime(`${hours}:${newMinute.toString().padStart(2, '0')}`);
    };
    
    const handleAmPmChange = (newAmPm) => {
      const hour24 = newAmPm === 'PM' && hour12 !== 12 ? hour12 + 12 : 
                    newAmPm === 'AM' && hour12 === 12 ? 0 : hour12;
      setTempTime(`${hour24.toString().padStart(2, '0')}:${minutes}`);
    };
    
    const handleOk = () => {
      onChange(tempTime);
      setOpen(false);
    };
    
    const handleCancel = () => {
      setTempTime(value || '00:00');
      setOpen(false);
    };

    return (
      <>
        <TextField
          label={label}
          value={formatTime12Hour(value || '')}
          onClick={() => !disabled && setOpen(true)}
          disabled={disabled}
          InputProps={{
            readOnly: true,
            endAdornment: <InputAdornment position="end">🕐</InputAdornment>
          }}
          sx={{ flex: 1 }}
        />
        
        <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth={false}>
          <DialogTitle sx={{ pb: 1 }}>Select {label}</DialogTitle>
          <DialogContent sx={{ px: 2, py: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
              {/* Hours Column */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" gutterBottom sx={{ fontSize: '0.75rem' }}>Hour</Typography>
                <Box sx={{ 
                  height: 150, 
                  overflow: 'auto', 
                  border: '1px solid #ccc', 
                  borderRadius: 1,
                  minWidth: 50
                }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                    <Box
                      key={hour}
                      onClick={() => handleHourChange(hour)}
                      sx={{
                        p: 0.5,
                        cursor: 'pointer',
                        backgroundColor: hour12 === hour ? 'primary.main' : 'transparent',
                        color: hour12 === hour ? 'white' : 'text.primary',
                        '&:hover': { backgroundColor: 'primary.light' },
                        fontSize: '0.875rem'
                      }}
                    >
                      {hour.toString().padStart(2, '0')}
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {/* Minutes Column */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" gutterBottom sx={{ fontSize: '0.75rem' }}>Minute</Typography>
                <Box sx={{ 
                  height: 150, 
                  overflow: 'auto', 
                  border: '1px solid #ccc', 
                  borderRadius: 1,
                  minWidth: 50
                }}>
                  {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                    <Box
                      key={minute}
                      onClick={() => handleMinuteChange(minute)}
                      sx={{
                        p: 0.5,
                        cursor: 'pointer',
                        backgroundColor: parseInt(minutes) === minute ? 'primary.main' : 'transparent',
                        color: parseInt(minutes) === minute ? 'white' : 'text.primary',
                        '&:hover': { backgroundColor: 'primary.light' },
                        fontSize: '0.875rem'
                      }}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {/* AM/PM Column */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" gutterBottom sx={{ fontSize: '0.75rem' }}>Period</Typography>
                <Box sx={{ 
                  height: 150, 
                  border: '1px solid #ccc', 
                  borderRadius: 1,
                  minWidth: 50
                }}>
                  {['AM', 'PM'].map(period => (
                    <Box
                      key={period}
                      onClick={() => handleAmPmChange(period)}
                      sx={{
                        p: 0.5,
                        cursor: 'pointer',
                        backgroundColor: ampm === period ? 'primary.main' : 'transparent',
                        color: ampm === period ? 'white' : 'text.primary',
                        '&:hover': { backgroundColor: 'primary.light' },
                        height: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem'
                      }}
                    >
                      {period}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 2, py: 1 }}>
            <Button onClick={handleCancel} size="small">Cancel</Button>
            <Button onClick={handleOk} variant="contained" size="small">OK</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const addAccommodation = () => {
    if (newAccommodation.vendor && newAccommodation.startTime && newAccommodation.endTime && selectedDay) {
      const accommodation = { ...newAccommodation, id: Date.now() };
      setFormData(prev => ({
        ...prev,
        accommodationsByDay: {
          ...prev.accommodationsByDay,
          [selectedDay]: [...(prev.accommodationsByDay[selectedDay] || []), accommodation]
        }
      }));
      setNewAccommodation({ vendor: '', startTime: null, endTime: null });
      setAccommodationDialog(false);
      setSelectedDay(null);
    }
  };

  const removeAccommodation = (id) => {
    setFormData(prev => ({
      ...prev,
      accommodations: prev.accommodations.filter(acc => acc.id !== id)
    }));
  };



  const handleAccommodationVendorsChange = (day, vendorIds) => {
    const startTime = formData.accommodationsByDay?.[day]?.[0]?.startTime || null;
    const endTime = formData.accommodationsByDay?.[day]?.[0]?.endTime || null;
    
    const accommodations = vendorIds.map((vendorId, index) => ({
      id: Date.now() + index,
      vendor: vendorId,
      startTime: startTime,
      endTime: endTime
    }));
    
    setFormData(prev => ({
      ...prev,
      accommodationsByDay: {
        ...prev.accommodationsByDay,
        [day]: accommodations
      }
    }));
  };

  const handleAccommodationTimeChange = (day, timeType, timeValue) => {
    setFormData(prev => {
      const currentAccommodations = prev.accommodationsByDay[day] || [];
      const updatedAccommodations = currentAccommodations.map(acc => ({
        ...acc,
        startTime: timeType === 'startTime' ? new Date(`2000-01-01T${timeValue}`) : acc.startTime,
        endTime: timeType === 'endTime' ? new Date(`2000-01-01T${timeValue}`) : acc.endTime
      }));
      
      return {
        ...prev,
        accommodationsByDay: {
          ...prev.accommodationsByDay,
          [day]: updatedAccommodations
        }
      };
    });
  };


  const addEvent = () => {
    if (newEvent.title && newEvent.startTime && newEvent.endTime) {
      setFormData(prev => ({
        ...prev,
        events: [...prev.events, { ...newEvent, id: Date.now() }]
      }));
      setNewEvent({ title: '', description: '', startTime: null, endTime: null });
      setEventDialog(false);
    }
  };

  // Apply events to all days
  const applyEventsToAllDays = () => {
    if (formData.selectedEventTitle && formData.selectedEventStartTime && formData.selectedEventEndTime) {
      const event = {
        id: Date.now(),
        title: formData.selectedEventTitle,
        description: formData.selectedEventDescription,
        startTime: formData.selectedEventStartTime,
        endTime: formData.selectedEventEndTime
      };

      const eventsByDay = {};
      tripDays.forEach(day => {
        eventsByDay[day] = [event];
      });

      setFormData(prev => ({
        ...prev,
        eventsByDay
      }));

      setAppliedToAllDays(prev => ({
        ...prev,
        events: true
      }));

      // Reset form
      setFormData(prev => ({
        ...prev,
        selectedEventTitle: '',
        selectedEventDescription: '',
        selectedEventStartTime: '',
        selectedEventEndTime: ''
      }));
    }
  };

  // Handle event field changes for day-wise selection
  const handleEventFieldChange = (day, field, value) => {
    setFormData(prev => {
      const currentEvents = prev.eventsByDay[day] || [];
      const updatedEvent = {
        ...currentEvents[0],
        id: currentEvents[0]?.id || Date.now(),
        [field]: value
      };

      return {
        ...prev,
        eventsByDay: {
          ...prev.eventsByDay,
          [day]: [updatedEvent]
        }
      };
    });
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
      
      // Check if all days are applied (green state)
      const isAllDaysApplied = appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses && appliedToAllDays.events;
      
      let tripData;
      
      if (isAllDaysApplied) {
        // If all days applied, use all days selection data
        tripData = {
          ...formData,
          startDate: formData.startDate?.toISOString(),
          endDate: formData.endDate?.toISOString(),
          // Use all days selection data
          drivers: formData.selectedDrivers,
          conductors: formData.selectedConductors,
          buses: formData.selectedBuses,
          // Clear day-wise data as it's not needed
          driversByDay: {},
          conductorsByDay: {},
          busesByDay: {},
          timeByDay: {},
          useAllDaysSelection: true
        };
      } else {
        // If not all days applied, use day-wise selection data
        tripData = {
          ...formData,
          startDate: formData.startDate?.toISOString(),
          endDate: formData.endDate?.toISOString(),
          // Use day-wise selection data
          driversByDay: formData.driversByDay,
          conductorsByDay: formData.conductorsByDay,
          busesByDay: formData.busesByDay,
          timeByDay: formData.timeByDay,
          // Clear all days selection data as it's not needed
          selectedDrivers: [],
          selectedConductors: [],
          selectedBuses: [],
          useAllDaysSelection: false
        };
      }
      
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
        selectedBuses: [],
        driversByDay: {},
        conductorsByDay: {},
        busesByDay: {},
        timeByDay: {},
        accommodations: [],
        accommodationsByDay: {},
        selectedAccommodationVendor: '',
        selectedAccommodationStartTime: '',
        selectedAccommodationEndTime: '',
        events: [],
        finance: { vendors: [], totalAmount: 0 }
      });
      setAppliedToAllDays({ drivers: false, conductors: false, buses: false, accommodations: false });
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
          <Box>
            {/* All Days Selection */}
            <Box sx={{ mb: 3 }}>
              <Box 
                sx={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: allDaysExpanded ? 2 : 0,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: '#fafafa'
                }}
                onClick={() => setAllDaysExpanded(!allDaysExpanded)}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TripIcon color="primary" />
                  All Days Selection
                </Typography>
                <IconButton size="small">
                  {allDaysExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              {allDaysExpanded && (
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: '0 0 4px 4px', backgroundColor: 'white' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select drivers, conductors, and buses for all {tripDays.length} days
                  </Typography>
              
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: 300 }}>
                        <DropdownChecklist
                          label="Drivers"
                          options={drivers.map(driver => ({
                            value: driver.id,
                            label: `${driver.first_name || driver.firstName || driver.name || 'Driver'} ${driver.last_name || driver.lastName || ''}`
                          }))}
                          selectedValues={formData.selectedDrivers}
                          onChange={handleDriverSelectionChange}
                        />
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 300 }}>
                        <DropdownChecklist
                          label="Conductors"
                          options={conductors.map(conductor => ({
                            value: conductor.id,
                            label: `${conductor.first_name || conductor.firstName || conductor.name || 'Conductor'} ${conductor.last_name || conductor.lastName || ''}`
                          }))}
                          selectedValues={formData.selectedConductors}
                          onChange={handleConductorSelectionChange}
                        />
                      </Box>
                    </Box>

          <Box sx={{ width: '100%' }}>
                      <DropdownChecklist
                        label="Buses"
                        options={buses.map(bus => ({
                          value: bus.id,
                          label: `${bus.title || bus.bus_number || bus.busNumber || bus.name || `Bus ${bus.id}`}${bus.no_of_sittings ? ` - ${bus.no_of_sittings} seats` : ''}`
                        }))}
                        selectedValues={formData.selectedBuses}
                        onChange={handleBusSelectionChange}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={applyAllToAllDays}
                      disabled={formData.selectedDrivers.length === 0 && formData.selectedConductors.length === 0 && formData.selectedBuses.length === 0}
                      sx={{ 
                        py: 1.5, 
                        px: 6,
                        backgroundColor: applyButtonState === 'applied' ? '#4caf50' : 
                                       applyButtonState === 'changed' ? '#2196f3' : 'primary.main',
                        '&:hover': {
                          backgroundColor: applyButtonState === 'applied' ? '#45a049' : 
                                         applyButtonState === 'changed' ? '#1976d2' : 'primary.dark',
                        }
                      }}
                    >
                      {applyButtonState === 'applied' ? 'Applied to All Days' : 'Apply to All Days'}
                    </Button>
                  </Box>
                  
                </Box>
              )}
            </Box>

            {/* Day-wise Selection */}
            <Box sx={{ mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: dayWiseExpanded ? 2 : 0,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses ? '#e8f5e8' : '#fafafa'
                }}
                onClick={() => setDayWiseExpanded(!dayWiseExpanded)}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddIcon color={appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses ? 'success' : 'primary'} />
                  Day-wise Selection
                  {appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses && (
                    <Chip 
                      label="View Mode" 
                      size="small" 
                      sx={{ ml: 2, backgroundColor: '#4caf50', color: 'white' }}
                    />
                  )}
                </Typography>
                <IconButton size="small">
                  {dayWiseExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              {dayWiseExpanded && (
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: '0 0 4px 4px', backgroundColor: 'white' }}>
                  {appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        All days have been configured from "All Days Selection". This is view mode.
                      </Typography>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        To modify individual days, first clear the "All Days Selection" or use the "Apply to All Days" button to update all days.
                      </Alert>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Select different drivers, conductors, buses, and timings for specific days
                    </Typography>
                  )}
              
                  <Grid container spacing={1.5}>
                    {tripDays.map((day, index) => (
                      <Grid item xs={12} sm={6} md={4} key={day}>
                        <Card variant="outlined" sx={{ 
                          p: 1.5, 
                          height: '100%', 
                          minHeight: 150, 
                          maxWidth: 300,
                          opacity: appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses ? 0.6 : 1,
                          pointerEvents: appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses ? 'none' : 'auto'
                        }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1.5, fontSize: '0.9rem' }}>
                            Day {index + 1} - {new Date(day).toLocaleDateString('en-IN', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <DropdownChecklist
                              label="Drivers"
                              options={drivers.map(driver => ({
                                value: driver.id,
                                label: `${driver.first_name || driver.firstName || driver.name || 'Driver'} ${driver.last_name || driver.lastName || ''}`
                              }))}
                              selectedValues={formData.driversByDay[day] || []}
                              onChange={(values) => handleDriverDayChange(day, values)}
                              disabled={appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses}
                            />
                            
                            <DropdownChecklist
                              label="Conductors"
                              options={conductors.map(conductor => ({
                                value: conductor.id,
                                label: `${conductor.first_name || conductor.firstName || conductor.name || 'Conductor'} ${conductor.last_name || conductor.lastName || ''}`
                              }))}
                              selectedValues={formData.conductorsByDay[day] || []}
                              onChange={(values) => handleConductorDayChange(day, values)}
                              disabled={appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses}
                            />
                            
                            <DropdownChecklist
                              label="Buses"
                              options={buses.map(bus => ({
                                value: bus.id,
                                label: `${bus.title || bus.bus_number || bus.busNumber || bus.name || `Bus ${bus.id}`}${bus.no_of_sittings ? ` - ${bus.no_of_sittings} seats` : ''}`
                              }))}
                              selectedValues={formData.busesByDay[day] || []}
                              onChange={(values) => handleBusDayChange(day, values)}
                              disabled={appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses}
                            />

                            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                              <TimePicker
                                label="Start Time"
                                value={formData.timeByDay[day]?.startTime || ''}
                                onChange={(time) => handleTimeChange(day, 'startTime', time)}
                                disabled={appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses}
                              />
                              
                              <TimePicker
                                label="End Time"
                                value={formData.timeByDay[day]?.endTime || ''}
                                onChange={(time) => handleTimeChange(day, 'endTime', time)}
                                disabled={appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses}
                              />
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              Accommodation Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Select accommodations for all days or individual days with start and end times
            </Typography>

            {/* All Days Selection */}
            <Box sx={{ mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: allDaysExpanded ? 2 : 0,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: appliedToAllDays.accommodations ? '#e8f5e8' : '#fafafa'
                }}
                onClick={() => setAllDaysExpanded(!allDaysExpanded)}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddIcon color={appliedToAllDays.accommodations ? 'success' : 'primary'} />
                  All Days Selection
                  {appliedToAllDays.accommodations && (
                    <Chip 
                      label="Applied" 
                      size="small" 
                      sx={{ ml: 2, backgroundColor: '#4caf50', color: 'white' }}
                    />
                  )}
                </Typography>
                <IconButton size="small">
                  {allDaysExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              {allDaysExpanded && (
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: '0 0 4px 4px', backgroundColor: 'white' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select accommodations for all {tripDays.length} days
                  </Typography>
              
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: 300 }}>
                        <FormControl fullWidth>
                <InputLabel>Accommodation Vendor</InputLabel>
                <Select
                            value={formData.selectedAccommodationVendor || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, selectedAccommodationVendor: e.target.value }))}
                  label="Accommodation Vendor"
                >
                  {accommodationVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <TextField
                          label="Start Time"
                          type="time"
                          value={formData.selectedAccommodationStartTime || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, selectedAccommodationStartTime: e.target.value }))}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <TextField
                          label="End Time"
                          type="time"
                          value={formData.selectedAccommodationEndTime || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, selectedAccommodationEndTime: e.target.value }))}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={applyAccommodationsToAllDays}
                      disabled={!formData.selectedAccommodationVendor || !formData.selectedAccommodationStartTime || !formData.selectedAccommodationEndTime}
                      sx={{ 
                        py: 1.5, 
                        px: 6,
                        backgroundColor: appliedToAllDays.accommodations ? '#4caf50' : 'primary.main',
                        '&:hover': {
                          backgroundColor: appliedToAllDays.accommodations ? '#45a049' : 'primary.dark',
                        }
                      }}
                    >
                      {appliedToAllDays.accommodations ? 'Applied to All Days' : 'Apply to All Days'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Day-wise Selection */}
            <Box sx={{ mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: dayWiseExpanded ? 2 : 0,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: appliedToAllDays.accommodations ? '#e8f5e8' : '#fafafa'
                }}
                onClick={() => setDayWiseExpanded(!dayWiseExpanded)}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddIcon color={appliedToAllDays.accommodations ? 'success' : 'primary'} />
                  Day-wise Selection
                  {appliedToAllDays.accommodations && (
                    <Chip 
                      label="View Mode" 
                      size="small" 
                      sx={{ ml: 2, backgroundColor: '#4caf50', color: 'white' }}
                    />
                  )}
                </Typography>
                <IconButton size="small">
                  {dayWiseExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              {dayWiseExpanded && (
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: '0 0 4px 4px', backgroundColor: 'white' }}>
                  {appliedToAllDays.accommodations ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        All days have been configured from "All Days Selection". This is view mode.
                      </Typography>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        To modify individual days, first clear the "All Days Selection" or use the "Apply to All Days" button to update all days.
                      </Alert>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Select different accommodations for specific days
                    </Typography>
                  )}
              
                  <Grid container spacing={1.5}>
                    {tripDays.map((day, index) => (
                      <Grid item xs={12} sm={6} md={4} key={day}>
                        <Card variant="outlined" sx={{ 
                          p: 1.5, 
                          height: '100%', 
                          minHeight: 200, 
                          maxWidth: 300,
                          opacity: appliedToAllDays.accommodations ? 0.6 : 1,
                          pointerEvents: appliedToAllDays.accommodations ? 'none' : 'auto'
                        }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1.5, fontSize: '0.9rem' }}>
                            Day {index + 1} - {new Date(day).toLocaleDateString('en-IN', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {/* Vendor Multi-Selection */}
                            <FormControl fullWidth size="small" disabled={appliedToAllDays.accommodations}>
                              <InputLabel>Vendors</InputLabel>
                <Select
                                multiple
                                value={formData.accommodationsByDay?.[day]?.map(acc => acc.vendor) || []}
                                onChange={(e) => handleAccommodationVendorsChange(day, e.target.value)}
                                label="Vendors"
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((vendorId) => (
                                      <Chip
                                        key={vendorId}
                                        label={accommodationVendors.find(v => v.id === vendorId)?.title || 'Unknown'}
                                        size="small"
                                      />
                                    ))}
                                  </Box>
                                )}
                              >
                                {accommodationVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                                    <Checkbox checked={(formData.accommodationsByDay?.[day]?.map(acc => acc.vendor) || []).includes(vendor.id)} />
                                    <ListItemText primary={vendor.title} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

                            {/* Time Fields */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                label="Start Time"
                                type="time"
                                size="small"
                                value={formData.accommodationsByDay?.[day]?.[0]?.startTime ? 
                                  new Date(formData.accommodationsByDay[day][0].startTime).toTimeString().slice(0, 5) : ''}
                                onChange={(e) => handleAccommodationTimeChange(day, 'startTime', e.target.value)}
                                disabled={appliedToAllDays.accommodations}
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1 }}
                              />
                              
                              <TextField
                                label="End Time"
                                type="time"
                                size="small"
                                value={formData.accommodationsByDay?.[day]?.[0]?.endTime ? 
                                  new Date(formData.accommodationsByDay[day][0].endTime).toTimeString().slice(0, 5) : ''}
                                onChange={(e) => handleAccommodationTimeChange(day, 'endTime', e.target.value)}
                                disabled={appliedToAllDays.accommodations}
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1 }}
                              />
                            </Box>
                            
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              Event Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Add events and activities for your trip - All Days or Day-wise selection
            </Typography>

            {/* All Days Selection */}
            <Box sx={{ mb: 4 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  mb: allDaysExpanded ? 2 : 0
                }}
                onClick={() => setAllDaysExpanded(!allDaysExpanded)}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  All Days Selection
                </Typography>
                <IconButton size="small">
                  {allDaysExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {allDaysExpanded && (
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #e0e0e0', 
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  backgroundColor: 'white'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Apply the same event to all days of your trip
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                      <TextField
                        label="Event Title"
                        value={formData.selectedEventTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectedEventTitle: e.target.value }))}
                        size="small"
                        sx={{ minWidth: 200, flex: 1 }}
                      />
                      <TextField
                        label="Description"
                        value={formData.selectedEventDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectedEventDescription: e.target.value }))}
                        size="small"
                        sx={{ minWidth: 200, flex: 1 }}
                      />
                      <TextField
                        label="Start Time"
                        type="time"
                        value={formData.selectedEventStartTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectedEventStartTime: e.target.value }))}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 120 }}
                      />
                      <TextField
                        label="End Time"
                        type="time"
                        value={formData.selectedEventEndTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectedEventEndTime: e.target.value }))}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 120 }}
                      />
                    </Box>
                    
                    <Button
                      variant="contained"
                      onClick={applyEventsToAllDays}
                      sx={{
                        backgroundColor: appliedToAllDays.events ? '#4caf50' : '#2196f3',
                        '&:hover': {
                          backgroundColor: appliedToAllDays.events ? '#45a049' : '#1976d2'
                        },
                        px: 4,
                        py: 1
                      }}
                    >
                      APPLY TO ALL DAYS
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Day-wise Selection */}
            <Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: appliedToAllDays.events ? '#e8f5e8' : 'rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  mb: dayWiseExpanded ? 2 : 0
                }}
                onClick={() => setDayWiseExpanded(!dayWiseExpanded)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Day-wise Selection
                  </Typography>
                  {appliedToAllDays.events && (
                    <Chip 
                      label="Applied" 
                      size="small" 
                      sx={{ backgroundColor: '#4caf50', color: 'white' }}
                    />
                  )}
                </Box>
                <IconButton size="small">
                  {dayWiseExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {dayWiseExpanded && (
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #e0e0e0', 
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  backgroundColor: 'white'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select different events for each day of your trip
                  </Typography>
                  
                  {tripDays.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Please select start and end dates first
                    </Typography>
                  ) : (
                    <Grid container spacing={1.5}>
                      {tripDays.map((day, index) => (
                        <Grid item xs={12} sm={6} md={4} key={day}>
                          <Card variant="outlined" sx={{ 
                            p: 1.5, 
                            height: '100%', 
                            minHeight: 200, 
                            maxWidth: 300,
                            opacity: appliedToAllDays.events ? 0.6 : 1,
                            pointerEvents: appliedToAllDays.events ? 'none' : 'auto'
                          }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1.5, fontSize: '0.9rem' }}>
                              Day {index + 1} - {new Date(day).toLocaleDateString('en-IN', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            
                            {appliedToAllDays.events ? (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                All Days Selection Applied
                              </Typography>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                                  label="Event Title"
                fullWidth
                                  size="small"
                                  value={formData.eventsByDay?.[day]?.[0]?.title || ''}
                                  onChange={(e) => handleEventFieldChange(day, 'title', e.target.value)}
                                />
                                
                                <TextField
                                  label="Description"
                                  fullWidth
                                  size="small"
                                  value={formData.eventsByDay?.[day]?.[0]?.description || ''}
                                  onChange={(e) => handleEventFieldChange(day, 'description', e.target.value)}
                                />
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <TextField
                                    label="Start Time"
                                    type="time"
                                    size="small"
                                    value={formData.eventsByDay?.[day]?.[0]?.startTime || ''}
                                    onChange={(e) => handleEventFieldChange(day, 'startTime', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ flex: 1 }}
                                  />
                                  
                                  <TextField
                                    label="End Time"
                                    type="time"
                                    size="small"
                                    value={formData.eventsByDay?.[day]?.[0]?.endTime || ''}
                                    onChange={(e) => handleEventFieldChange(day, 'endTime', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ flex: 1 }}
                                  />
                                </Box>
                              </Box>
                            )}
                          </Card>
            </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 4:
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
        <Dialog open={accommodationDialog} onClose={() => {
          setAccommodationDialog(false);
          setSelectedDay(null);
        }} maxWidth="sm" fullWidth>
          <DialogTitle>
            Add Accommodation for {selectedDay ? new Date(selectedDay).toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Selected Day'}
          </DialogTitle>
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