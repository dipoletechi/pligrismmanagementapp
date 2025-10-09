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
  Restaurant as RestaurantIcon,
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
  const [foodSchedules, setFoodSchedules] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [transportVendors, setTransportVendors] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: null,
    endDate: null,
    selectedTransportVendor: '',
    selectedDrivers: [],
    selectedConductors: [],
    selectedBuses: [],
    driversByDay: {}, // { '2025-10-11': [driverIds], '2025-10-12': [driverIds] }
    conductorsByDay: {}, // { '2025-10-11': [conductorIds], '2025-10-12': [conductorIds] }
    busesByDay: {}, // { '2025-10-11': [busIds], '2025-10-12': [busIds] }
    vendorsByDay: {}, // { '2025-10-11': vendorId, '2025-10-12': vendorId }
    timeByDay: {}, // { '2025-10-11': { startTime: '08:00', endTime: '18:00' } }
    accommodations: [],
    accommodationsByDay: {}, // { '2025-10-11': [accommodations], '2025-10-12': [accommodations] }
    selectedAccommodationVendor: '',
    selectedAccommodationStartTime: '',
    selectedAccommodationEndTime: '',
    selectedFoodVendors: [], // Array of selected food vendor IDs for All Days
    foodVendorsByDay: {}, // { '2025-10-11': [vendorIds], '2025-10-12': [vendorIds] }
    selectedFoodSchedules: [], // Selected food schedules for All Days (multi-select)
    selectedFoodCategories: [], // Selected food categories for All Days
    selectedFoodItems: [], // Selected food items for All Days
    foodSchedulesByDay: {}, // { '2025-10-11': [scheduleIds], '2025-10-12': [scheduleIds] }
    foodCategoriesByDay: {}, // { '2025-10-11': [categoryIds], '2025-10-12': [categoryIds] }
    foodItemsByDay: {}, // { '2025-10-11': [itemIds], '2025-10-12': [itemIds] }
    allDaysFoodEntries: [], // Array of food entries for all days
    events: [],
    eventsByDay: {}, // { '2025-10-11': [events], '2025-10-12': [events] }
    allDaysEvents: [], // Events applied to all days
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
  const [foodAllDaysExpanded, setFoodAllDaysExpanded] = useState(false);
  const [foodDayWiseExpanded, setFoodDayWiseExpanded] = useState(false);
  const [appliedToAllDays, setAppliedToAllDays] = useState({
    drivers: false,
    conductors: false,
    buses: false,
    accommodations: false,
    food: false,
    events: false
  });
  
  // Apply button states
  const [applyButtonState, setApplyButtonState] = useState('default'); // 'default', 'applied', 'changed'

  // Dialog states
  const [accommodationDialog, setAccommodationDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventDialog, setEventDialog] = useState(false);
  const [dayEventDialog, setDayEventDialog] = useState(false);
  const [allDaysEventDialog, setAllDaysEventDialog] = useState(false);
  const [financeDialog, setFinanceDialog] = useState(false);
  const [foodAllDaysDialog, setFoodAllDaysDialog] = useState(false);
  const [newFoodAllDays, setNewFoodAllDays] = useState({
    vendors: [],
    schedules: [],
    categories: [],
    items: []
  });
  const [newFoodEntry, setNewFoodEntry] = useState({
    vendors: [],
    schedules: [],
    categories: [],
    items: []
  });
  const [dayFoodDialog, setDayFoodDialog] = useState(false);
  const [selectedDayForFood, setSelectedDayForFood] = useState(null);
  const [newDayFoodEntry, setNewDayFoodEntry] = useState({
    vendors: [],
    schedules: [],
    categories: [],
    items: []
  });
  const [selectedDayForEvent, setSelectedDayForEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(false);
  const [editingEventIndex, setEditingEventIndex] = useState(0);
  const [editingAllDaysEvent, setEditingAllDaysEvent] = useState(false);
  const [editingAllDaysEventIndex, setEditingAllDaysEventIndex] = useState(0);

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

  const [dayEvent, setDayEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });

  const [allDaysEvent, setAllDaysEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
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
    'Food Management',
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

  // Filter drivers, conductors, and buses based on selected transport vendor
  const filteredDrivers = formData.selectedTransportVendor 
    ? drivers.filter(driver => driver.transport_vendor_id === parseInt(formData.selectedTransportVendor))
    : [];
  
  const filteredConductors = formData.selectedTransportVendor 
    ? conductors.filter(conductor => conductor.transport_vendor_id === parseInt(formData.selectedTransportVendor))
    : [];
  
  const filteredBuses = formData.selectedTransportVendor 
    ? buses.filter(bus => bus.transport_vendor_id === parseInt(formData.selectedTransportVendor))
    : [];

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
      const [destRes, busRes, driverRes, conductorRes, accRes, foodRes, foodSchedRes, foodCatRes, foodItemRes, transRes] = await Promise.all([
        axios.get('/api/destinations'),
        axios.get('/api/buses'),
        axios.get('/api/drivers'),
        axios.get('/api/conductors'),
        axios.get('/api/accommodation-vendors'),
        axios.get('/api/food-vendors'),
        axios.get('/api/food-schedules'),
        axios.get('/api/food-categories'),
        axios.get('/api/food-items'),
        axios.get('/api/transport-vendors')
      ]);

      setDestinations(destRes.data.data.items || destRes.data.data);
      setBuses(busRes.data.data.items || busRes.data.data);
      setDrivers(driverRes.data.data.items || driverRes.data.data);
      setConductors(conductorRes.data.data.items || conductorRes.data.data);
      setAccommodationVendors(accRes.data.data.items || accRes.data.data);
      setFoodVendors(foodRes.data.data.items || foodRes.data.data);
      setFoodSchedules(foodSchedRes.data.data.items || foodSchedRes.data.data);
      setFoodCategories(foodCatRes.data.data.items || foodCatRes.data.data);
      setFoodItems(foodItemRes.data.data.items || foodItemRes.data.data);
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

  const applyFoodToAllDays = () => {
    const allDays = getTripDays();
    const foodVendorsByDay = {};
    const foodSchedulesByDay = {};
    const foodCategoriesByDay = {};
    const foodItemsByDay = {};
    
    allDays.forEach(day => {
      foodVendorsByDay[day] = [...formData.selectedFoodVendors];
      foodSchedulesByDay[day] = [...formData.selectedFoodSchedules];
      foodCategoriesByDay[day] = [...formData.selectedFoodCategories];
      foodItemsByDay[day] = [...formData.selectedFoodItems];
    });
    
    setFormData(prev => ({
      ...prev,
      foodVendorsByDay,
      foodSchedulesByDay,
      foodCategoriesByDay,
      foodItemsByDay
    }));
    setAppliedToAllDays(prev => ({ ...prev, food: true }));
  };

  const handleNext = () => {
    // Validate current step before moving to next
    if (activeStep === 0) {
      // Basic Information validation
      if (!formData.title.trim()) {
        setSnackbar({ open: true, message: 'Trip title is required', severity: 'error' });
        return;
      }
      if (!formData.destination) {
        setSnackbar({ open: true, message: 'Destination is required', severity: 'error' });
        return;
      }
      if (!formData.startDate) {
        setSnackbar({ open: true, message: 'Start date is required', severity: 'error' });
        return;
      }
      if (!formData.endDate) {
        setSnackbar({ open: true, message: 'End date is required', severity: 'error' });
        return;
      }
      if (formData.startDate >= formData.endDate) {
        setSnackbar({ open: true, message: 'End date must be after start date', severity: 'error' });
        return;
      }
    }
    
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
    const vendorsByDay = {};
    
    allDays.forEach(day => {
      driversByDay[day] = [...selectedDrivers];
      conductorsByDay[day] = [...selectedConductors];
      busesByDay[day] = [...selectedBuses];
      vendorsByDay[day] = formData.selectedTransportVendor;
    });
    
    setFormData(prev => ({
      ...prev,
      driversByDay,
      conductorsByDay,
      busesByDay,
      vendorsByDay
    }));
    
    setAppliedToAllDays(prev => ({
      ...prev,
      drivers: true,
      conductors: true,
      buses: true
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

  // Handle vendor day change
  const handleVendorDayChange = (day, vendorId) => {
    setFormData(prev => ({
      ...prev,
      vendorsByDay: {
        ...prev.vendorsByDay,
        [day]: vendorId
      },
      // Clear drivers, conductors, buses for this day when vendor changes
      driversByDay: {
        ...prev.driversByDay,
        [day]: []
      },
      conductorsByDay: {
        ...prev.conductorsByDay,
        [day]: []
      },
      busesByDay: {
        ...prev.busesByDay,
        [day]: []
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

  const handleFoodVendorsDayChange = (day, vendorIds) => {
    setFormData(prev => ({
      ...prev,
      foodVendorsByDay: {
        ...prev.foodVendorsByDay,
        [day]: vendorIds
      }
    }));
  };

  const handleFoodSchedulesDayChange = (day, scheduleIds) => {
    setFormData(prev => ({
      ...prev,
      foodSchedulesByDay: {
        ...prev.foodSchedulesByDay,
        [day]: scheduleIds
      }
    }));
  };

  const handleFoodCategoriesDayChange = (day, categoryIds) => {
    setFormData(prev => ({
      ...prev,
      foodCategoriesByDay: {
        ...prev.foodCategoriesByDay,
        [day]: categoryIds
      }
    }));
  };

  const handleFoodItemsDayChange = (day, itemIds) => {
    setFormData(prev => ({
      ...prev,
      foodItemsByDay: {
        ...prev.foodItemsByDay,
        [day]: itemIds
      }
    }));
  };

  const handleAddFoodAllDays = () => {
    setNewFoodAllDays({
      vendors: [...formData.selectedFoodVendors],
      schedules: [...formData.selectedFoodSchedules],
      categories: [...formData.selectedFoodCategories],
      items: [...formData.selectedFoodItems]
    });
    setFoodAllDaysDialog(true);
  };

  const handleQuickAddFoodEntry = () => {
    // Reset form first
    setNewFoodEntry({
      vendors: [],
      schedules: [],
      categories: [],
      items: []
    });
    setFoodAllDaysDialog(true);
  };

  const handleSaveFoodAllDays = () => {
    setFormData(prev => ({
      ...prev,
      selectedFoodVendors: newFoodAllDays.vendors,
      selectedFoodSchedules: newFoodAllDays.schedules,
      selectedFoodCategories: newFoodAllDays.categories,
      selectedFoodItems: newFoodAllDays.items
    }));
    setFoodAllDaysDialog(false);
  };

  const handleAddFoodEntry = () => {
    const newEntry = {
      id: Date.now(),
      vendors: [...newFoodEntry.vendors],
      schedules: [...newFoodEntry.schedules],
      categories: [...newFoodEntry.categories],
      items: [...newFoodEntry.items]
    };
    
    setFormData(prev => ({
      ...prev,
      allDaysFoodEntries: [...prev.allDaysFoodEntries, newEntry]
    }));
    
    // Reset form and close modal
    setNewFoodEntry({
      vendors: [],
      schedules: [],
      categories: [],
      items: []
    });
    setFoodAllDaysDialog(false);
  };

  const handleDeleteFoodEntry = (entryId) => {
    setFormData(prev => ({
      ...prev,
      allDaysFoodEntries: prev.allDaysFoodEntries.filter(entry => entry.id !== entryId)
    }));
  };

  const handleAddDayFood = (day) => {
    setSelectedDayForFood(day);
    setNewDayFoodEntry({
      vendors: [],
      schedules: [],
      categories: [],
      items: []
    });
    setDayFoodDialog(true);
  };

  const handleSaveDayFood = () => {
    if (!selectedDayForFood) return;
    
    const newEntry = {
      id: Date.now(),
      vendors: [...newDayFoodEntry.vendors],
      schedules: [...newDayFoodEntry.schedules],
      categories: [...newDayFoodEntry.categories],
      items: [...newDayFoodEntry.items]
    };
    
    setFormData(prev => ({
      ...prev,
      foodVendorsByDay: {
        ...prev.foodVendorsByDay,
        [selectedDayForFood]: [...(prev.foodVendorsByDay[selectedDayForFood] || []), newEntry]
      }
    }));
    
    // Reset form and close modal
    setNewDayFoodEntry({
      vendors: [],
      schedules: [],
      categories: [],
      items: []
    });
    setDayFoodDialog(false);
    setSelectedDayForFood(null);
  };

  const handleDeleteDayFood = (day, entryId) => {
    setFormData(prev => ({
      ...prev,
      foodVendorsByDay: {
        ...prev.foodVendorsByDay,
        [day]: (prev.foodVendorsByDay[day] || []).filter(entry => entry.id !== entryId)
      }
    }));
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

  // Handle add all days event
  const handleAddAllDaysEvent = () => {
    setEditingAllDaysEvent(false);
    setEditingAllDaysEventIndex(0);
    setAllDaysEvent({ title: '', description: '', startTime: '', endTime: '' });
    setAllDaysEventDialog(true);
  };

  // Handle edit all days event
  const handleEditAllDaysEvent = (index) => {
    const existingEvent = formData.allDaysEvents[index];
    if (existingEvent) {
      setEditingAllDaysEvent(true);
      setEditingAllDaysEventIndex(index);
      setAllDaysEvent({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        startTime: existingEvent.startTime || '',
        endTime: existingEvent.endTime || ''
      });
      setAllDaysEventDialog(true);
    }
  };

  // Handle delete all days event
  const handleDeleteAllDaysEvent = (index) => {
    setFormData(prev => {
      const newAllDaysEvents = prev.allDaysEvents.filter((_, i) => i !== index);
      return {
        ...prev,
        allDaysEvents: newAllDaysEvents
      };
    });
  };

  // Save all days event
  const saveAllDaysEvent = () => {
    if (allDaysEvent.title) {
      const event = {
        id: Date.now(),
        title: allDaysEvent.title,
        description: allDaysEvent.description,
        startTime: allDaysEvent.startTime,
        endTime: allDaysEvent.endTime
      };

      setFormData(prev => {
        if (editingAllDaysEvent) {
          // Update existing event
          const updatedEvents = [...prev.allDaysEvents];
          updatedEvents[editingAllDaysEventIndex] = event;
          return {
            ...prev,
            allDaysEvents: updatedEvents
          };
        } else {
          // Add new event
          return {
            ...prev,
            allDaysEvents: [...prev.allDaysEvents, event]
          };
        }
      });

      setAllDaysEvent({ title: '', description: '', startTime: '', endTime: '' });
      setAllDaysEventDialog(false);
      setEditingAllDaysEvent(false);
      setEditingAllDaysEventIndex(0);
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

  // Handle add event for specific day
  const handleAddEvent = (day) => {
    setSelectedDayForEvent(day);
    setEditingEvent(false);
    setEditingEventIndex(0);
    setDayEvent({ title: '', description: '', startTime: '', endTime: '' });
    setDayEventDialog(true);
  };

  // Handle edit event for specific day
  const handleEditEvent = (day, eventIndex = 0) => {
    const existingEvent = formData.eventsByDay[day]?.[eventIndex];
    if (existingEvent) {
      setSelectedDayForEvent(day);
      setEditingEvent(true);
      setEditingEventIndex(eventIndex);
      setDayEvent({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        startTime: existingEvent.startTime || '',
        endTime: existingEvent.endTime || ''
      });
      setDayEventDialog(true);
    }
  };

  // Handle delete event for specific day
  const handleDeleteEvent = (day, eventIndex = 0) => {
    setFormData(prev => {
      const newEventsByDay = { ...prev.eventsByDay };
      if (newEventsByDay[day]) {
        if (newEventsByDay[day].length === 1) {
          // If only one event, remove the entire day
          delete newEventsByDay[day];
        } else {
          // If multiple events, remove the specific event
          newEventsByDay[day] = newEventsByDay[day].filter((_, index) => index !== eventIndex);
        }
      }
      return {
        ...prev,
        eventsByDay: newEventsByDay
      };
    });
  };

  // Save day event
  const saveDayEvent = () => {
    if (dayEvent.title && selectedDayForEvent) {
      const event = {
        id: Date.now(),
        title: dayEvent.title,
        description: dayEvent.description,
        startTime: dayEvent.startTime,
        endTime: dayEvent.endTime
      };

      setFormData(prev => {
        const currentEvents = prev.eventsByDay[selectedDayForEvent] || [];
        
        if (editingEvent) {
          // Update existing event
          const updatedEvents = [...currentEvents];
          updatedEvents[editingEventIndex] = event;
          return {
            ...prev,
            eventsByDay: {
              ...prev.eventsByDay,
              [selectedDayForEvent]: updatedEvents
            }
          };
        } else {
          // Add new event
          return {
            ...prev,
            eventsByDay: {
              ...prev.eventsByDay,
              [selectedDayForEvent]: [...currentEvents, event]
            }
          };
        }
      });

      setDayEvent({ title: '', description: '', startTime: '', endTime: '' });
      setDayEventDialog(false);
      setSelectedDayForEvent(null);
      setEditingEvent(false);
      setEditingEventIndex(0);
    }
  };

  const removeEvent = (id) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== id)
    }));
  };

  // Handle finance change for vendors
  const handleFinanceChange = (vendorId, type, field, value) => {
    setFormData(prev => {
      const existingVendor = prev.finance.vendors.find(f => f.vendorId === vendorId && f.type === type);
      
      if (existingVendor) {
        // Update existing vendor
        const updatedVendors = prev.finance.vendors.map(f => 
          f.vendorId === vendorId && f.type === type 
            ? { ...f, [field]: value }
            : f
        );
        return {
          ...prev,
          finance: {
            ...prev.finance,
            vendors: updatedVendors
          }
        };
      } else {
        // Add new vendor
        const newVendor = {
          id: Date.now(),
          vendorId,
          type,
          amount: field === 'amount' ? value : '',
          description: field === 'description' ? value : ''
        };
        return {
          ...prev,
          finance: {
            ...prev.finance,
            vendors: [...prev.finance.vendors, newVendor]
          }
        };
      }
    });
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    const total = formData.finance.vendors.reduce((sum, vendor) => {
      const amount = parseFloat(vendor.amount) || 0;
      return sum + amount;
    }, 0);
    return total.toLocaleString('en-IN');
  };

  // Get selected vendors from transportation and accommodation
  const getSelectedVendors = () => {
    const selectedVendors = new Map();
    
    // Add transport vendor if selected
    if (formData.selectedTransportVendor) {
      const vendorId = formData.selectedTransportVendor;
      const vendor = transportVendors.find(v => v.id === parseInt(vendorId));
      if (vendor) {
        selectedVendors.set(`${vendorId}-transport`, {
          id: vendorId,
          type: 'transport',
          name: vendor.title
        });
      }
    }
    
    // Add accommodation vendor if selected (All Days Selection)
    if (formData.selectedAccommodationVendor) {
      const vendorId = formData.selectedAccommodationVendor;
      const vendor = accommodationVendors.find(v => v.id === parseInt(vendorId));
      if (vendor) {
        selectedVendors.set(`${vendorId}-accommodation`, {
          id: vendorId,
          type: 'accommodation',
          name: vendor.title
        });
      }
    }
    
    // Add day-wise transport vendors (only if different from all days selection)
    Object.values(formData.vendorsByDay).forEach(vendorId => {
      if (vendorId && vendorId !== formData.selectedTransportVendor) {
        const vendor = transportVendors.find(v => v.id === parseInt(vendorId));
        if (vendor) {
          selectedVendors.set(`${vendorId}-transport`, {
            id: vendorId,
            type: 'transport',
            name: vendor.title
          });
        }
      }
    });
    
    // Add accommodation vendors from day-wise selection (only if different from all days selection)
    Object.values(formData.accommodationsByDay).forEach(accommodations => {
      if (Array.isArray(accommodations)) {
        accommodations.forEach(accommodation => {
          if (accommodation.vendor && accommodation.vendor !== formData.selectedAccommodationVendor) {
            const vendor = accommodationVendors.find(v => v.id === accommodation.vendor);
            if (vendor) {
              selectedVendors.set(`${accommodation.vendor}-accommodation`, {
                id: accommodation.vendor,
                type: 'accommodation',
                name: vendor.title
              });
            }
          }
        });
      }
    });
    
    // Add food vendors from All Days Selection (new structure)
    if (formData.allDaysFoodEntries && formData.allDaysFoodEntries.length > 0) {
      formData.allDaysFoodEntries.forEach(entry => {
        entry.vendors.forEach(vendorId => {
          const vendor = foodVendors.find(v => v.id === vendorId);
          if (vendor) {
            selectedVendors.set(`${vendorId}-food`, {
              id: vendorId,
              type: 'food',
              name: vendor.title,
              typeColor: 'success'
            });
          }
        });
      });
    }
    
    // Add food vendors from day-wise selection (new structure)
    Object.values(formData.foodVendorsByDay).forEach(dayEntries => {
      if (Array.isArray(dayEntries)) {
        dayEntries.forEach(entry => {
          if (entry.vendors && Array.isArray(entry.vendors)) {
            entry.vendors.forEach(vendorId => {
              const vendor = foodVendors.find(v => v.id === vendorId);
              if (vendor) {
                selectedVendors.set(`${vendorId}-food`, {
                  id: vendorId,
                  type: 'food',
                  name: vendor.title,
                  typeColor: 'success'
                });
              }
            });
          }
        });
      }
    });
    
    return Array.from(selectedVendors.values());
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
      // Only mandatory validations
      if (!formData.title.trim()) {
        setSnackbar({ open: true, message: 'Trip title is required', severity: 'error' });
        return;
      }
      if (!formData.destination) {
        setSnackbar({ open: true, message: 'Destination is required', severity: 'error' });
        return;
      }
      if (!formData.startDate) {
        setSnackbar({ open: true, message: 'Start date is required', severity: 'error' });
        return;
      }
      if (!formData.endDate) {
        setSnackbar({ open: true, message: 'End date is required', severity: 'error' });
        return;
      }
      if (formData.startDate >= formData.endDate) {
        setSnackbar({ open: true, message: 'End date must be after start date', severity: 'error' });
        return;
      }

      setLoading(true);
      
      // Check if all days are applied (green state)
      const isAllDaysApplied = appliedToAllDays.drivers && appliedToAllDays.conductors && appliedToAllDays.buses && appliedToAllDays.events;
      
      let tripData;
      
      if (isAllDaysApplied) {
        // If all days applied, use all days selection data
        tripData = {
          ...formData,
          start_date: formData.startDate?.toISOString(),
          end_date: formData.endDate?.toISOString(),
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
          start_date: formData.startDate?.toISOString(),
          end_date: formData.endDate?.toISOString(),
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
      
      const response = await axios.post('/api/trips', tripData);
      console.log('Trip created successfully:', response.data);
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
        selectedFoodVendors: [],
        foodVendorsByDay: {},
        selectedFoodSchedules: [],
        selectedFoodCategories: [],
        selectedFoodItems: [],
        foodSchedulesByDay: {},
        foodCategoriesByDay: {},
        foodItemsByDay: {},
        allDaysFoodEntries: [],
        foodVendorsByDay: {},
        events: [],
        finance: { vendors: [], totalAmount: 0 }
      });
      setAppliedToAllDays({ drivers: false, conductors: false, buses: false, accommodations: false, food: false, events: false });
      setActiveStep(0);
    } catch (error) {
      console.error('Error creating trip:', error);
      console.log('Error response:', error.response?.data);
      
      let errorMessage = 'Error creating trip';
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        errorMessage = `Validation failed: ${validationErrors}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
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
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              Transportation
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Select transport vendor and manage drivers, conductors, and buses for your trip
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
                    Select transport vendor, drivers, conductors, and buses for all {tripDays.length} days
                  </Typography>

                  {/* Transport Vendor Selection */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Transport Vendor
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Select Transport Vendor</InputLabel>
                <Select
                        value={formData.selectedTransportVendor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          selectedTransportVendor: e.target.value,
                          selectedDrivers: [],
                          selectedConductors: [],
                          selectedBuses: []
                        }))}
                        label="Select Transport Vendor"
                      >
                        {transportVendors.map((vendor) => (
                          <MenuItem key={vendor.id} value={vendor.id}>
                            {vendor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
                  </Box>
              
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: 300 }}>
                        <DropdownChecklist
                          label="Drivers"
                          options={filteredDrivers.map(driver => ({
                            value: driver.id,
                            label: `${driver.first_name || driver.firstName || driver.name || 'Driver'} ${driver.last_name || driver.lastName || ''}`
                          }))}
                          selectedValues={formData.selectedDrivers}
                          onChange={handleDriverSelectionChange}
                          disabled={!formData.selectedTransportVendor}
                        />
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 300 }}>
                        <DropdownChecklist
                          label="Conductors"
                          options={filteredConductors.map(conductor => ({
                            value: conductor.id,
                            label: `${conductor.first_name || conductor.firstName || conductor.name || 'Conductor'} ${conductor.last_name || conductor.lastName || ''}`
                          }))}
                          selectedValues={formData.selectedConductors}
                          onChange={handleConductorSelectionChange}
                          disabled={!formData.selectedTransportVendor}
                        />
                      </Box>
                    </Box>

          <Box sx={{ width: '100%' }}>
                      <DropdownChecklist
                        label="Buses"
                        options={filteredBuses.map(bus => ({
                          value: bus.id,
                          label: `${bus.title || bus.bus_number || bus.busNumber || bus.name || `Bus ${bus.id}`}${bus.no_of_sittings ? ` - ${bus.no_of_sittings} seats` : ''}`
                        }))}
                        selectedValues={formData.selectedBuses}
                        onChange={handleBusSelectionChange}
                        disabled={!formData.selectedTransportVendor}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          selectedTransportVendor: '',
                          selectedDrivers: [],
                          selectedConductors: [],
                          selectedBuses: [],
                          driversByDay: {},
                          conductorsByDay: {},
                          busesByDay: {},
                          vendorsByDay: {},
                          timeByDay: {}
                        }));
                        setAppliedToAllDays(prev => ({
                          ...prev,
                          drivers: false,
                          conductors: false,
                          buses: false
                        }));
                        setApplyButtonState('default');
                      }}
                      sx={{
                        py: 1.5, 
                        px: 4,
                        borderColor: '#f44336',
                        color: '#f44336',
                        '&:hover': {
                          borderColor: '#d32f2f',
                          backgroundColor: 'rgba(244, 67, 54, 0.04)'
                        }
                      }}
                    >
                      CLEAR ALL DAYS
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={applyAllToAllDays}
                      disabled={!formData.selectedTransportVendor || (formData.selectedDrivers.length === 0 && formData.selectedConductors.length === 0 && formData.selectedBuses.length === 0)}
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
                      
                      {/* View Mode - Show applied data */}
                      <Grid container spacing={1.5}>
                        {tripDays.map((day, index) => (
                          <Grid item xs={12} sm={6} md={4} key={day}>
                            <Card variant="outlined" sx={{ 
                              p: 1.5, 
                              height: '100%', 
                              minHeight: 150, 
                              maxWidth: 300,
                              backgroundColor: '#f8f9fa'
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
                                {/* Show applied vendor */}
                                <Box sx={{ p: 1, backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                                    Vendor: {transportVendors.find(v => v.id === parseInt(formData.selectedTransportVendor))?.title || 'Not selected'}
                                  </Typography>
                                </Box>
                                
                                {/* Show applied drivers */}
                                <Box sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    Drivers:
                                  </Typography>
                                  {formData.selectedDrivers.length > 0 ? (
                                    formData.selectedDrivers.map(driverId => {
                                      const driver = drivers.find(d => d.id === driverId);
                                      return (
                                        <Typography key={driverId} variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                          • {driver ? `${driver.first_name || driver.firstName || driver.name || 'Driver'} ${driver.last_name || driver.lastName || ''}` : `Driver ${driverId}`}
                                        </Typography>
                                      );
                                    })
                                  ) : (
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                      No drivers selected
                                    </Typography>
                                  )}
                                </Box>
                                
                                {/* Show applied conductors */}
                                <Box sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    Conductors:
                                  </Typography>
                                  {formData.selectedConductors.length > 0 ? (
                                    formData.selectedConductors.map(conductorId => {
                                      const conductor = conductors.find(c => c.id === conductorId);
                                      return (
                                        <Typography key={conductorId} variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                          • {conductor ? `${conductor.first_name || conductor.firstName || conductor.name || 'Conductor'} ${conductor.last_name || conductor.lastName || ''}` : `Conductor ${conductorId}`}
                                        </Typography>
                                      );
                                    })
                                  ) : (
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                      No conductors selected
                                    </Typography>
                                  )}
                                </Box>
                                
                                {/* Show applied buses */}
                                <Box sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    Buses:
                                  </Typography>
                                  {formData.selectedBuses.length > 0 ? (
                                    formData.selectedBuses.map(busId => {
                                      const bus = buses.find(b => b.id === busId);
                                      return (
                                        <Typography key={busId} variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                          • {bus ? `${bus.title || bus.bus_number || bus.busNumber || bus.name || `Bus ${bus.id}`}${bus.no_of_sittings ? ` - ${bus.no_of_sittings} seats` : ''}` : `Bus ${busId}`}
                                        </Typography>
                                      );
                                    })
                                  ) : (
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                      No buses selected
                                    </Typography>
                                  )}
                                </Box>
                                
                                {/* Show applied timings */}
                                <Box sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    Timings:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                    Start: {formData.timeByDay[day]?.startTime || 'Not set'}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                    End: {formData.timeByDay[day]?.endTime || 'Not set'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Card>
            </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Select different drivers, conductors, buses, and timings for specific days
                      </Typography>
                      
                      <Grid container spacing={1.5}>
                        {tripDays.map((day, index) => (
                          <Grid item xs={12} sm={6} md={4} key={day}>
                            <Card variant="outlined" sx={{ 
                              p: 1.5, 
                              height: '100%', 
                              minHeight: 150, 
                              maxWidth: 300
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
                                {/* Vendor Selection for this day */}
                                <FormControl fullWidth size="small">
                <InputLabel>Transport Vendor</InputLabel>
                <Select
                                    value={formData.vendorsByDay[day] || ''}
                                    onChange={(e) => handleVendorDayChange(day, e.target.value)}
                  label="Transport Vendor"
                >
                  {transportVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

                                <DropdownChecklist
                                  label="Drivers"
                                  options={formData.vendorsByDay[day] 
                                    ? drivers.filter(driver => driver.transport_vendor_id === parseInt(formData.vendorsByDay[day])).map(driver => ({
                                        value: driver.id,
                                        label: `${driver.first_name || driver.firstName || driver.name || 'Driver'} ${driver.last_name || driver.lastName || ''}`
                                      }))
                                    : []
                                  }
                                  selectedValues={formData.driversByDay[day] || []}
                                  onChange={(values) => handleDriverDayChange(day, values)}
                                  disabled={!formData.vendorsByDay[day]}
                                />
                                
                                <DropdownChecklist
                                  label="Conductors"
                                  options={formData.vendorsByDay[day] 
                                    ? conductors.filter(conductor => conductor.transport_vendor_id === parseInt(formData.vendorsByDay[day])).map(conductor => ({
                                        value: conductor.id,
                                        label: `${conductor.first_name || conductor.firstName || conductor.name || 'Conductor'} ${conductor.last_name || conductor.lastName || ''}`
                                      }))
                                    : []
                                  }
                                  selectedValues={formData.conductorsByDay[day] || []}
                                  onChange={(values) => handleConductorDayChange(day, values)}
                                  disabled={!formData.vendorsByDay[day]}
                                />
                                
                                <DropdownChecklist
                                  label="Buses"
                                  options={formData.vendorsByDay[day] 
                                    ? buses.filter(bus => bus.transport_vendor_id === parseInt(formData.vendorsByDay[day])).map(bus => ({
                                        value: bus.id,
                                        label: `${bus.title || bus.bus_number || bus.busNumber || bus.name || `Bus ${bus.id}`}${bus.no_of_sittings ? ` - ${bus.no_of_sittings} seats` : ''}`
                                      }))
                                    : []
                                  }
                                  selectedValues={formData.busesByDay[day] || []}
                                  onChange={(values) => handleBusDayChange(day, values)}
                                  disabled={!formData.vendorsByDay[day]}
                                />

                                <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                                  <TimePicker
                                    label="Start Time"
                                    value={formData.timeByDay[day]?.startTime || ''}
                                    onChange={(time) => handleTimeChange(day, 'startTime', time)}
                                    disabled={false}
                                  />
                                  
                                  <TimePicker
                                    label="End Time"
                                    value={formData.timeByDay[day]?.endTime || ''}
                                    onChange={(time) => handleTimeChange(day, 'endTime', time)}
                                    disabled={false}
                                  />
                                </Box>
                              </Box>
                            </Card>
            </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
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
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          selectedAccommodationVendor: '',
                          selectedAccommodationStartTime: '',
                          selectedAccommodationEndTime: '',
                          accommodationsByDay: {}
                        }));
                        setAppliedToAllDays(prev => ({
                          ...prev,
                          accommodations: false
                        }));
                      }}
                sx={{
                        py: 1.5, 
                        px: 4,
                        borderColor: '#f44336',
                        color: '#f44336',
                        '&:hover': {
                          borderColor: '#d32f2f',
                          backgroundColor: 'rgba(244, 67, 54, 0.04)'
                        }
                      }}
                    >
                      CLEAR ALL DAYS
                    </Button>
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
              Food Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Select food vendors for your trip - All Days or Day-wise selection
            </Typography>

            {/* All Days Selection */}
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: 'white', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RestaurantIcon color="primary" />
                  All Days Selection
                  {appliedToAllDays.food && (
                    <Chip 
                      label="Applied" 
                      size="small" 
                      color="success" 
                      sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {appliedToAllDays.food && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          selectedFoodVendors: [],
                          foodVendorsByDay: {},
                          selectedFoodSchedules: [],
                          selectedFoodCategories: [],
                          selectedFoodItems: [],
                          foodSchedulesByDay: {},
                          foodCategoriesByDay: {},
                          foodItemsByDay: {},
                          allDaysFoodEntries: []
                        }));
                        setAppliedToAllDays(prev => ({
                          ...prev,
                          food: false
                        }));
                      }}
                    >
                      Clear
                    </Button>
                  )}
                  <IconButton
                    color="primary"
                    onClick={handleQuickAddFoodEntry}
                    sx={{ 
                      border: '2px dashed #2196f3',
                      borderRadius: 2,
                      width: 48,
                      height: 48,
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.08)',
                        borderColor: '#1976d2'
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click the + icon to add food entries for all days. Each entry can have different vendors, schedules, categories, and items.
              </Typography>

              {/* Show added food entries */}
              {formData.allDaysFoodEntries.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Added Food Entries:
                  </Typography>
                  {formData.allDaysFoodEntries.map((entry, index) => (
                    <Card key={entry.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {entry.schedules.length > 0 ? 
                            entry.schedules.map(scheduleId => {
                              const schedule = foodSchedules.find(s => s.id === scheduleId);
                              return schedule ? (schedule.title || schedule.name) : `Schedule ${scheduleId}`;
                            }).join(', ') : 
                            `Entry ${index + 1}`
                          }
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteFoodEntry(entry.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Grid container spacing={1}>
                        {entry.vendors.length > 0 && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem', mb: 0.5 }}>Vendors:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {entry.vendors.map(vendorId => {
                                const vendor = foodVendors.find(v => v.id === vendorId);
                                return (
                                  <Chip
                                    key={vendorId}
                                    label={vendor ? vendor.title : `Vendor ${vendorId}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                );
                              })}
                            </Box>
                          </Grid>
                        )}
                        
                        {entry.schedules.length > 0 && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem', mb: 0.5 }}>Schedules:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {entry.schedules.map(scheduleId => {
                                const schedule = foodSchedules.find(s => s.id === scheduleId);
                                return (
                                  <Chip
                                    key={scheduleId}
                                    label={schedule ? (schedule.title || schedule.name) : `Schedule ${scheduleId}`}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                );
                              })}
                            </Box>
                          </Grid>
                        )}
                        
                        {entry.categories.length > 0 && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem', mb: 0.5 }}>Categories:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {entry.categories.map(categoryId => {
                                const category = foodCategories.find(c => c.id === categoryId);
                                return (
                                  <Chip
                                    key={categoryId}
                                    label={category ? (category.title || category.name) : `Category ${categoryId}`}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
                                );
                              })}
                            </Box>
                          </Grid>
                        )}
                        
                        {entry.items.length > 0 && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem', mb: 0.5 }}>Items:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {entry.items.map(itemId => {
                                const item = foodItems.find(i => i.id === itemId);
                                return (
                                  <Chip
                                    key={itemId}
                                    label={item ? (item.title || item.name) : `Item ${itemId}`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                );
                              })}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Card>
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={applyFoodToAllDays}
                  disabled={formData.allDaysFoodEntries.length === 0}
                  sx={{ px: 4 }}
                >
                  APPLY TO ALL DAYS
                </Button>
              </Box>
            </Box>

            {/* Day-wise Selection */}
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: 'white', mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: 2, 
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
                onClick={() => setFoodDayWiseExpanded(!foodDayWiseExpanded)}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  + Day-wise Selection
                  {appliedToAllDays.food && (
                    <Chip 
                      label="View Mode" 
                      size="small" 
                      color="info" 
                      sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Typography>
                <IconButton size="small">
                  {foodDayWiseExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              {foodDayWiseExpanded && (
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: '0 0 4px 4px', backgroundColor: 'white' }}>
                  {appliedToAllDays.food ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        All days have been configured from "All Days Selection". This is view mode.
                      </Typography>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        To modify individual days, first clear the "All Days Selection" or use the "Apply to All Days" button to update all days.
                      </Alert>
                      
                      {/* View Mode - Show applied data */}
                      <Grid container spacing={1.5}>
                        {getTripDays().map((day, index) => (
                          <Grid item xs={12} sm={6} md={4} key={day}>
                            <Card variant="outlined" sx={{ 
                              p: 1.5, 
                              height: '100%', 
                              minHeight: 120, 
                              maxWidth: 300,
                              backgroundColor: '#f8f9fa'
                            }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1.5, fontSize: '0.9rem' }}>
                                Day {index + 1} - {new Date(day).toLocaleDateString('en-IN', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </Typography>
                              
                              <Box sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1, mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                  Food Vendors:
                                </Typography>
                                {formData.selectedFoodVendors.length > 0 ? (
                                  formData.selectedFoodVendors.map(vendorId => {
                                    const vendor = foodVendors.find(v => v.id === vendorId);
                                    return (
                                      <Typography key={vendorId} variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                        • {vendor ? vendor.title : `Vendor ${vendorId}`}
                                      </Typography>
                                    );
                                  })
                                ) : (
                                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                    No food vendors selected
                                  </Typography>
                                )}
                              </Box>

                              <Box sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1, mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                  Food Schedules:
                                </Typography>
                                {formData.selectedFoodSchedules.length > 0 ? (
                                  formData.selectedFoodSchedules.map(scheduleId => {
                                    const schedule = foodSchedules.find(s => s.id === scheduleId);
                                    return (
                                      <Typography key={scheduleId} variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                        • {schedule ? (schedule.title || schedule.name) : `Schedule ${scheduleId}`}
                                      </Typography>
                                    );
                                  })
                                ) : (
                                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                    No schedules selected
                                  </Typography>
                                )}
                              </Box>

                              <Box sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1, mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                  Food Categories:
                                </Typography>
                                {formData.selectedFoodCategories.length > 0 ? (
                                  formData.selectedFoodCategories.map(categoryId => {
                                    const category = foodCategories.find(c => c.id === categoryId);
                                    return (
                                      <Typography key={categoryId} variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                        • {category ? (category.title || category.name) : `Category ${categoryId}`}
                                      </Typography>
                                    );
                                  })
                                ) : (
                                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                    No categories selected
                                  </Typography>
                                )}
                              </Box>

                              <Box sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                  Food Items:
                                </Typography>
                                {formData.selectedFoodItems.length > 0 ? (
                                  formData.selectedFoodItems.map(itemId => {
                                    const item = foodItems.find(i => i.id === itemId);
                                    return (
                                      <Typography key={itemId} variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                        • {item ? (item.title || item.name) : `Item ${itemId}`}
                                      </Typography>
                                    );
                                  })
                                ) : (
                                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                    No items selected
                                  </Typography>
                                )}
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Select different food vendors for specific days
                      </Typography>
                      
                      <Grid container spacing={1.5}>
                        {getTripDays().map((day, index) => (
                          <Grid item xs={12} sm={6} md={4} key={day}>
                            <Card variant="outlined" sx={{ 
                              p: 1.5, 
                              height: '100%', 
                              minHeight: 120, 
                              maxWidth: 300
                            }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1.5, fontSize: '0.9rem' }}>
                                Day {index + 1} - {new Date(day).toLocaleDateString('en-IN', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </Typography>
                              
                              {/* Show existing food entries for this day */}
                              {(formData.foodVendorsByDay[day] || []).length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                  {(formData.foodVendorsByDay[day] || []).map((entry, entryIndex) => (
                                    <Card key={entry.id} variant="outlined" sx={{ mb: 1, p: 1, backgroundColor: '#f8f9fa' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                          {entry.schedules.length > 0 ? 
                                            entry.schedules.map(scheduleId => {
                                              const schedule = foodSchedules.find(s => s.id === scheduleId);
                                              return schedule ? (schedule.title || schedule.name) : `Schedule ${scheduleId}`;
                                            }).join(', ') : 
                                            `Entry ${entryIndex + 1}`
                                          }
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleDeleteDayFood(day, entry.id)}
                                          sx={{ p: 0.5 }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {entry.vendors.map(vendorId => {
                                          const vendor = foodVendors.find(v => v.id === vendorId);
                                          return (
                                            <Chip
                                              key={vendorId}
                                              label={vendor ? vendor.title : `Vendor ${vendorId}`}
                                              size="small"
                                              color="primary"
                                              variant="outlined"
                                            />
                                          );
                                        })}
                                        {entry.schedules.map(scheduleId => {
                                          const schedule = foodSchedules.find(s => s.id === scheduleId);
                                          return (
                                            <Chip
                                              key={scheduleId}
                                              label={schedule ? (schedule.title || schedule.name) : `Schedule ${scheduleId}`}
                                              size="small"
                                              color="secondary"
                                              variant="outlined"
                                            />
                                          );
                                        })}
                                        {entry.categories.map(categoryId => {
                                          const category = foodCategories.find(c => c.id === categoryId);
                                          return (
                                            <Chip
                                              key={categoryId}
                                              label={category ? (category.title || category.name) : `Category ${categoryId}`}
                                              size="small"
                                              color="info"
                                              variant="outlined"
                                            />
                                          );
                                        })}
                                        {entry.items.map(itemId => {
                                          const item = foodItems.find(i => i.id === itemId);
                                          return (
                                            <Chip
                                              key={itemId}
                                              label={item ? (item.title || item.name) : `Item ${itemId}`}
                                              size="small"
                                              color="success"
                                              variant="outlined"
                                            />
                                          );
                                        })}
                                      </Box>
                                    </Card>
                                  ))}
                                </Box>
                              )}
                              
                              {/* Add button */}
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleAddDayFood(day)}
                                  sx={{ 
                                    border: '2px dashed #2196f3',
                                    borderRadius: 2,
                                    width: 40,
                                    height: 40,
                                    '&:hover': {
                                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                      borderColor: '#1976d2'
                                    }
                                  }}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              Events
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
                  mb: allDaysExpanded ? 2 : 0,
                  opacity: !formData.selectedTransportVendor ? 0.5 : 1,
                  pointerEvents: !formData.selectedTransportVendor ? 'none' : 'auto'
                }}
                onClick={() => formData.selectedTransportVendor && setAllDaysExpanded(!allDaysExpanded)}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  All Days Selection
                </Typography>
                <IconButton size="small" disabled={!formData.selectedTransportVendor}>
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
                    {/* Add Event Button */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                      <IconButton
                        size="large"
                        onClick={() => setAllDaysEventDialog(true)}
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark'
                          },
                          mb: 1
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Add Event for All Days
                      </Typography>
                    </Box>
                    
                    {/* Show Applied Events */}
                    {formData.allDaysEvents && formData.allDaysEvents.length > 0 && (
          <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            Applied Events:
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                allDaysEvents: [],
                                eventsByDay: {}
                              }));
                              setAppliedToAllDays(prev => ({
                                ...prev,
                                events: false
                              }));
                            }}
                            sx={{
                              borderColor: '#f44336',
                              color: '#f44336',
                              '&:hover': {
                                borderColor: '#d32f2f',
                                backgroundColor: 'rgba(244, 67, 54, 0.04)'
                              }
                            }}
                          >
                            CLEAR ALL
                          </Button>
                        </Box>
                        {formData.allDaysEvents.map((event, index) => (
                          <Card key={event.id} variant="outlined" sx={{ p: 1.5, mb: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                              {event.title}
                            </Typography>
                            {event.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                                {event.description}
                              </Typography>
                            )}
                            {(event.startTime || event.endTime) && (
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
                                ⏰ {event.startTime || '--:--'} - {event.endTime || '--:--'}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditAllDaysEvent(index)}
                                sx={{ p: 0.5 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteAllDaysEvent(index)}
                                color="error"
                                sx={{ p: 0.5 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    )}
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
                            ) : formData.eventsByDay?.[day] && formData.eventsByDay[day].length > 0 ? (
                              // Show multiple events if exist
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {formData.eventsByDay[day].map((event, eventIndex) => (
                                  <Card key={event.id} variant="outlined" sx={{ p: 1.5, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                                      {event.title}
                                    </Typography>
                                    {event.description && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                                        {event.description}
                                      </Typography>
                                    )}
                                    {(event.startTime || event.endTime) && (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
                                        ⏰ {event.startTime || '--:--'} - {event.endTime || '--:--'}
                                      </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEditEvent(day, eventIndex)}
                                        sx={{ p: 0.5 }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteEvent(day, eventIndex)}
                                        color="error"
                                        sx={{ p: 0.5 }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Card>
                                ))}
                                
                                {/* Add More Event Button with Icon */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                                  <IconButton
                                    size="medium"
                                    onClick={() => handleAddEvent(day)}
                                    sx={{
                                      backgroundColor: 'primary.main',
                                      color: 'white',
                                      '&:hover': {
                                        backgroundColor: 'primary.dark'
                                      },
                                      mb: 0.5
                                    }}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                    Add More Event
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              // Show add button if no event
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                                <IconButton
                                  size="large"
                                  onClick={() => handleAddEvent(day)}
                                  sx={{
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'primary.dark'
                                    },
                                    mb: 1
                                  }}
                                >
                                  <AddIcon />
                                </IconButton>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                  Add Event
                                </Typography>
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

      case 5:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              Finance & Review
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Manage finance information for all vendors and review your trip details
            </Typography>

            {/* Finance Section */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                  Finance Management
                </Typography>
                
                {/* Selected Vendors Finance */}
                {(() => {
                  const selectedVendors = getSelectedVendors();
                  
                  if (selectedVendors.length === 0) {
                    return (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No vendors selected yet. Please select transport and accommodation vendors in previous steps.
                        </Typography>
                      </Box>
                    );
                  }
                  
        return (
          <Grid container spacing={3}>
                      {selectedVendors.map((vendor) => (
                        <Grid item xs={12} md={6} key={`${vendor.type}-${vendor.id}`}>
                          <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>
                                {vendor.name}
                              </Typography>
                              <Chip 
                                label={vendor.type === 'transport' ? 'Transport' : vendor.type === 'accommodation' ? 'Accommodation' : 'Food'} 
                                size="small" 
                                color={vendor.typeColor || (vendor.type === 'transport' ? 'primary' : vendor.type === 'accommodation' ? 'secondary' : 'success')}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                                label="Amount (₹)"
                                type="number"
                                size="small"
                                value={formData.finance.vendors.find(f => f.vendorId === vendor.id && f.type === vendor.type)?.amount || ''}
                                onChange={(e) => handleFinanceChange(vendor.id, vendor.type, 'amount', e.target.value)}
                                sx={{ flex: 1 }}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                              />
                              <TextField
                                label="Description"
                                size="small"
                                value={formData.finance.vendors.find(f => f.vendorId === vendor.id && f.type === vendor.type)?.description || ''}
                                onChange={(e) => handleFinanceChange(vendor.id, vendor.type, 'description', e.target.value)}
                                sx={{ flex: 1 }}
                              />
                            </Box>
                          </Card>
            </Grid>
                      ))}
                      
                      {/* Other Expenses */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Miscellaneous Expenses
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                              label="Amount (₹)"
                              type="number"
                              size="small"
                              value={formData.finance.vendors.find(f => f.vendorId === 'misc' && f.type === 'other')?.amount || ''}
                              onChange={(e) => handleFinanceChange('misc', 'other', 'amount', e.target.value)}
                              sx={{ flex: 1 }}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                            />
                            <TextField
                              label="Description"
                              size="small"
                              value={formData.finance.vendors.find(f => f.vendorId === 'misc' && f.type === 'other')?.description || ''}
                              onChange={(e) => handleFinanceChange('misc', 'other', 'description', e.target.value)}
                              sx={{ flex: 1 }}
                            />
                          </Box>
                        </Card>
            </Grid>
          </Grid>
                  );
                })()}

                {/* Total Amount */}
                <Card sx={{ mt: 3, backgroundColor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Total Amount
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        ₹{calculateTotalAmount()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Trip Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                  Trip Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Trip Title</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formData.title || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Destination</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formData.destination || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Start Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formData.startDate ? formData.startDate.toLocaleDateString('en-IN') : 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">End Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formData.endDate ? formData.endDate.toLocaleDateString('en-IN') : 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
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
              disabled={
                activeStep === 0 && (
                  !formData.title.trim() || 
                  !formData.destination || 
                  !formData.startDate || 
                  !formData.endDate ||
                  (formData.startDate && formData.endDate && formData.startDate >= formData.endDate)
                )
              }
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
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e',
                  boxShadow: 'none'
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

        {/* Day Event Dialog */}
        <Dialog open={dayEventDialog} onClose={() => setDayEventDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingEvent ? 'Edit Event' : 'Add Event'} - {selectedDayForEvent && new Date(selectedDayForEvent).toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Event Title"
                  fullWidth
                  value={dayEvent.title}
                  onChange={(e) => setDayEvent(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description (Optional)"
                  fullWidth
                  multiline
                  rows={3}
                  value={dayEvent.description}
                  onChange={(e) => setDayEvent(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Time (Optional)"
                  type="time"
                  fullWidth
                  value={dayEvent.startTime}
                  onChange={(e) => setDayEvent(prev => ({ ...prev, startTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Time (Optional)"
                  type="time"
                  fullWidth
                  value={dayEvent.endTime}
                  onChange={(e) => setDayEvent(prev => ({ ...prev, endTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDayEventDialog(false)}>Cancel</Button>
            <Button onClick={saveDayEvent} variant="contained">
              {editingEvent ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* All Days Event Dialog */}
        <Dialog open={allDaysEventDialog} onClose={() => setAllDaysEventDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAllDaysEvent ? 'Edit Event' : 'Add Event'} - All Days
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Event Title"
                  fullWidth
                  value={allDaysEvent.title}
                  onChange={(e) => setAllDaysEvent(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description (Optional)"
                  fullWidth
                  multiline
                  rows={3}
                  value={allDaysEvent.description}
                  onChange={(e) => setAllDaysEvent(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Time (Optional)"
                  type="time"
                  fullWidth
                  value={allDaysEvent.startTime}
                  onChange={(e) => setAllDaysEvent(prev => ({ ...prev, startTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Time (Optional)"
                  type="time"
                  fullWidth
                  value={allDaysEvent.endTime}
                  onChange={(e) => setAllDaysEvent(prev => ({ ...prev, endTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAllDaysEventDialog(false)}>Cancel</Button>
            <Button onClick={saveAllDaysEvent} variant="contained">
              {editingAllDaysEvent ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Day Food Dialog */}
        <Dialog open={dayFoodDialog} onClose={() => setDayFoodDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add Food Entry for {selectedDayForFood ? new Date(selectedDayForFood).toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 'Selected Day'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="day-food-vendors-label">Food Vendors</InputLabel>
                <Select
                  labelId="day-food-vendors-label"
                  value={newDayFoodEntry.vendors.length > 0 ? newDayFoodEntry.vendors[0] : ''}
                  onChange={(e) => setNewDayFoodEntry(prev => ({ ...prev, vendors: e.target.value ? [e.target.value] : [] }))}
                  label="Food Vendors"
                >
                  {foodVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="day-food-schedules-label">Food Schedules</InputLabel>
                <Select
                  labelId="day-food-schedules-label"
                  value={newDayFoodEntry.schedules.length > 0 ? newDayFoodEntry.schedules[0] : ''}
                  onChange={(e) => setNewDayFoodEntry(prev => ({ ...prev, schedules: e.target.value ? [e.target.value] : [] }))}
                  label="Food Schedules"
                >
                  {foodSchedules.map((schedule) => (
                    <MenuItem key={schedule.id} value={schedule.id}>
                      {schedule.title || schedule.name || `Schedule ${schedule.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="day-food-categories-label">Food Categories</InputLabel>
                <Select
                  labelId="day-food-categories-label"
                  multiple
                  value={newDayFoodEntry.categories}
                  onChange={(e) => setNewDayFoodEntry(prev => ({ ...prev, categories: e.target.value }))}
                  label="Food Categories"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((categoryId) => {
                        const category = foodCategories.find(c => c.id === categoryId);
                        return (
                          <Chip
                            key={categoryId}
                            label={category ? (category.title || category.name) : `Category ${categoryId}`}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {foodCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox checked={newDayFoodEntry.categories.includes(category.id)} />
                      <ListItemText primary={category.title || category.name || `Category ${category.id}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="day-food-items-label">Food Items</InputLabel>
                <Select
                  labelId="day-food-items-label"
                  multiple
                  value={newDayFoodEntry.items}
                  onChange={(e) => setNewDayFoodEntry(prev => ({ ...prev, items: e.target.value }))}
                  label="Food Items"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((itemId) => {
                        const item = foodItems.find(i => i.id === itemId);
                        return (
                          <Chip
                            key={itemId}
                            label={item ? (item.title || item.name) : `Item ${itemId}`}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {foodItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      <Checkbox checked={newDayFoodEntry.items.includes(item.id)} />
                      <ListItemText primary={item.title || item.name || `Item ${item.id}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDayFoodDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveDayFood} 
              variant="contained"
              disabled={newDayFoodEntry.vendors.length === 0 || newDayFoodEntry.schedules.length === 0 || newDayFoodEntry.categories.length === 0 || newDayFoodEntry.items.length === 0}
            >
              Add Entry
            </Button>
          </DialogActions>
        </Dialog>

        {/* Food All Days Dialog */}
        <Dialog open={foodAllDaysDialog} onClose={() => setFoodAllDaysDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add Food Entry for All Days</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="food-vendors-label">Food Vendors</InputLabel>
                <Select
                  labelId="food-vendors-label"
                  value={newFoodEntry.vendors.length > 0 ? newFoodEntry.vendors[0] : ''}
                  onChange={(e) => setNewFoodEntry(prev => ({ ...prev, vendors: e.target.value ? [e.target.value] : [] }))}
                  label="Food Vendors"
                >
                  {foodVendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="food-schedules-label">Food Schedules</InputLabel>
                <Select
                  labelId="food-schedules-label"
                  value={newFoodEntry.schedules.length > 0 ? newFoodEntry.schedules[0] : ''}
                  onChange={(e) => setNewFoodEntry(prev => ({ ...prev, schedules: e.target.value ? [e.target.value] : [] }))}
                  label="Food Schedules"
                >
                  {foodSchedules.map((schedule) => (
                    <MenuItem key={schedule.id} value={schedule.id}>
                      {schedule.title || schedule.name || `Schedule ${schedule.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="food-categories-label">Food Categories</InputLabel>
                <Select
                  labelId="food-categories-label"
                  multiple
                  value={newFoodEntry.categories}
                  onChange={(e) => setNewFoodEntry(prev => ({ ...prev, categories: e.target.value }))}
                  label="Food Categories"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((categoryId) => {
                        const category = foodCategories.find(c => c.id === categoryId);
                        return (
                          <Chip
                            key={categoryId}
                            label={category ? (category.title || category.name) : `Category ${categoryId}`}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {foodCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox checked={newFoodEntry.categories.includes(category.id)} />
                      <ListItemText primary={category.title || category.name || `Category ${category.id}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="food-items-label">Food Items</InputLabel>
                <Select
                  labelId="food-items-label"
                  multiple
                  value={newFoodEntry.items}
                  onChange={(e) => setNewFoodEntry(prev => ({ ...prev, items: e.target.value }))}
                  label="Food Items"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((itemId) => {
                        const item = foodItems.find(i => i.id === itemId);
                        return (
                          <Chip
                            key={itemId}
                            label={item ? (item.title || item.name) : `Item ${itemId}`}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {foodItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      <Checkbox checked={newFoodEntry.items.includes(item.id)} />
                      <ListItemText primary={item.title || item.name || `Item ${item.id}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFoodAllDaysDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddFoodEntry} 
              variant="contained"
              disabled={newFoodEntry.vendors.length === 0 || newFoodEntry.schedules.length === 0 || newFoodEntry.categories.length === 0 || newFoodEntry.items.length === 0}
            >
              Add Entry
            </Button>
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