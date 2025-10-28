import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  AlertTitle,
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
  InputAdornment,
  Radio,
  RadioGroup
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
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const CreateTrip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Helper function to safely parse JSON
  const safeJSONParse = (data, defaultValue = null) => {
    if (!data) return defaultValue;
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return defaultValue;
    }
  };
  
  // Check if we're in edit mode or view mode
  const [isEditMode, setIsEditMode] = useState(location.state?.isEditMode || false);
  const isViewMode = location.state?.isViewMode || false;
  const [editingTrip, setEditingTrip] = useState(location.state?.editingTrip || null);
  
  
  
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

  // Form data - Initialize with editing trip data if available
  const [formData, setFormData] = useState(() => {
    if (editingTrip && (isEditMode || isViewMode)) {
      console.log('Initializing formData with editingTrip:', editingTrip);
      return {
        title: editingTrip.title || '',
        destination: editingTrip.destination || '',
        startDate: editingTrip.start_date ? new Date(editingTrip.start_date) : null,
        endDate: editingTrip.end_date ? new Date(editingTrip.end_date) : null,
        // Get transport vendor from transport_vendor_id or vendorsByDay
        selectedTransportVendor: editingTrip.transport_vendor_id || (editingTrip.vendors_by_day ? (() => {
          try {
            const vendorsByDay = JSON.parse(editingTrip.vendors_by_day);
            const firstDay = Object.keys(vendorsByDay)[0];
            return vendorsByDay[firstDay] || '';
          } catch {
            return '';
          }
        })() : ''),
        // Parse JSON fields if they exist (using underscore field names from database)
        selectedDrivers: safeJSONParse(editingTrip.selected_drivers, []),
        selectedConductors: safeJSONParse(editingTrip.selected_conductors, []),
        selectedBuses: safeJSONParse(editingTrip.selected_buses, []),
        driversByDay: safeJSONParse(editingTrip.drivers_by_day, {}),
        conductorsByDay: safeJSONParse(editingTrip.conductors_by_day, {}),
        busesByDay: safeJSONParse(editingTrip.buses_by_day, {}),
        vendorsByDay: safeJSONParse(editingTrip.vendors_by_day, {}),
        timeByDay: safeJSONParse(editingTrip.time_by_day, {}),
        accommodationsByDay: safeJSONParse(editingTrip.accommodations_by_day, {}),
        selectedAccommodationVendor: editingTrip.selected_accommodation_vendor || '',
        selectedAccommodationStartTime: editingTrip.selected_accommodation_start_time || '',
        selectedAccommodationEndTime: editingTrip.selected_accommodation_end_time || '',
        selectedFoodVendors: safeJSONParse(editingTrip.selected_food_vendors, []),
        foodVendorsByDay: safeJSONParse(editingTrip.food_vendors_by_day, {}),
        selectedFoodSchedules: safeJSONParse(editingTrip.selected_food_schedules, []),
        selectedFoodCategories: safeJSONParse(editingTrip.selected_food_categories, []),
        selectedFoodItems: safeJSONParse(editingTrip.selected_food_items, []),
        foodSchedulesByDay: safeJSONParse(editingTrip.food_schedules_by_day, {}),
        foodCategoriesByDay: safeJSONParse(editingTrip.food_categories_by_day, {}),
        foodItemsByDay: safeJSONParse(editingTrip.food_items_by_day, {}),
        allDaysFoodEntries: safeJSONParse(editingTrip.all_days_food_entries, []),
        eventsByDay: safeJSONParse(editingTrip.events_by_day, {}),
        allDaysEvents: safeJSONParse(editingTrip.all_days_events, []),
        selectedEventTitle: editingTrip.selected_event_title || '',
        selectedEventDescription: editingTrip.selected_event_description || '',
        selectedEventStartTime: editingTrip.selected_event_start_time || '',
        selectedEventEndTime: editingTrip.selected_event_end_time || '',
        finance: (() => {
          console.log('=== LOADING FINANCE DATA (EDIT MODE) ===');
          console.log('Editing Trip ID:', editingTrip.id);
          console.log('Editing Trip Title:', editingTrip.title);
          console.log('Raw finance_data:', editingTrip.finance_data);
          
          const parsed = safeJSONParse(editingTrip.finance_data, { vendors: [] });
          console.log('Parsed finance data:', parsed);
          console.log('Vendors array:', parsed.vendors);
          
          // Keep only vendors array, remove old expense arrays
          const result = {
            vendors: parsed.vendors || [],
            transportExpenses: [],
            accommodationExpenses: [],
            foodExpenses: []
          };
          
          console.log('Final finance object:', result);
          return result;
        })()
      };
    } else {
      return {
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
      };
    }
  });
  

  // Expand sections when data is loaded in edit mode
  useEffect(() => {
    if (isEditMode && editingTrip) {
      // Expand transport section if we have data
      if ((formData.selectedDrivers?.length || 0) > 0 || (formData.selectedConductors?.length || 0) > 0 || (formData.selectedBuses?.length || 0) > 0) {
        setAllDaysExpanded(true);
      }
      
      // Expand day-wise section if we have day-wise data
      if (Object.keys(formData.driversByDay || {}).length > 0) {
        setDayWiseExpanded(true);
      }
      
      // Expand accommodation section if we have data
      if (formData.selectedAccommodationVendor || Object.keys(formData.accommodationsByDay || {}).length > 0) {
        setAccommodationAllDaysExpanded(true);
      }
      
      // Expand food section if we have data
      if ((formData.selectedFoodVendors?.length || 0) > 0 || (formData.selectedFoodSchedules?.length || 0) > 0 || 
          (formData.selectedFoodCategories?.length || 0) > 0 || (formData.selectedFoodItems?.length || 0) > 0 ||
          Object.keys(formData.foodVendorsByDay || {}).length > 0) {
        setFoodAllDaysExpanded(true);
      }
      
      // Expand events section if we have data
      if (formData.selectedEventTitle || (formData.allDaysEvents?.length || 0) > 0 || Object.keys(formData.eventsByDay || {}).length > 0) {
        setEventsAllDaysExpanded(true);
      }
    }
  }, [isEditMode, editingTrip, formData.selectedDrivers, formData.selectedConductors, formData.selectedBuses, formData.driversByDay, formData.selectedAccommodationVendor, formData.accommodationsByDay, formData.selectedFoodVendors, formData.selectedFoodSchedules, formData.selectedFoodCategories, formData.selectedFoodItems, formData.foodVendorsByDay, formData.selectedEventTitle, formData.allDaysEvents, formData.eventsByDay]);
  
  // Collapse states for sections - expand if we have data in edit mode
  const [allDaysExpanded, setAllDaysExpanded] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      // Check if we have any transport data (drivers, conductors, or buses)
      const hasDrivers = editingTrip.selected_drivers && editingTrip.selected_drivers !== '[]' && editingTrip.selected_drivers !== '[]';
      const hasConductors = editingTrip.selected_conductors && editingTrip.selected_conductors !== '[]' && editingTrip.selected_conductors !== '[]';
      const hasBuses = editingTrip.selected_buses && editingTrip.selected_buses !== '[]' && editingTrip.selected_buses !== '[]';
      
      // Also check if we have any day-wise data
      const hasDayWiseDrivers = editingTrip.drivers_by_day && editingTrip.drivers_by_day !== '{}' && editingTrip.drivers_by_day !== '{}';
      
      return hasDrivers || hasConductors || hasBuses || hasDayWiseDrivers;
    }
    return false;
  });
  const [dayWiseExpanded, setDayWiseExpanded] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      // Check if we have day-wise transport data
      const hasDayWiseDrivers = editingTrip.drivers_by_day && editingTrip.drivers_by_day !== '{}' && editingTrip.drivers_by_day !== '{}';
      const hasDayWiseConductors = editingTrip.conductors_by_day && editingTrip.conductors_by_day !== '{}' && editingTrip.conductors_by_day !== '{}';
      const hasDayWiseBuses = editingTrip.buses_by_day && editingTrip.buses_by_day !== '{}' && editingTrip.buses_by_day !== '{}';
      return hasDayWiseDrivers || hasDayWiseConductors || hasDayWiseBuses;
    }
    return false;
  });
  const [accommodationAllDaysExpanded, setAccommodationAllDaysExpanded] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      // Check if we have accommodation data
      const hasAccommodation = editingTrip.accommodation_vendor_id || editingTrip.accommodation_start_time || editingTrip.accommodation_end_time;
      return hasAccommodation;
    }
    return false;
  });
  const [accommodationDayWiseExpanded, setAccommodationDayWiseExpanded] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      // Check if we have day-wise accommodation data
      const hasDayWiseAccommodation = editingTrip.accommodations_by_day && editingTrip.accommodations_by_day !== '{}' && editingTrip.accommodations_by_day !== '{}';
      return hasDayWiseAccommodation;
    }
    return false;
  });
  const [foodAllDaysExpanded, setFoodAllDaysExpanded] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      // Check if we have food data
      const hasFood = editingTrip.food_vendors || editingTrip.food_schedules || editingTrip.food_categories || editingTrip.food_items;
      return hasFood;
    }
    return false;
  });
  const [foodDayWiseExpanded, setFoodDayWiseExpanded] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      // Check if we have day-wise food data
      const hasDayWiseFood = editingTrip.food_vendors_by_day && editingTrip.food_vendors_by_day !== '{}' && editingTrip.food_vendors_by_day !== '{}';
      return hasDayWiseFood;
    }
    return false;
  });
  const [eventsAllDaysExpanded, setEventsAllDaysExpanded] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      // Check if we have events data
      const hasEvents = editingTrip.all_days_events && editingTrip.all_days_events !== '[]' && editingTrip.all_days_events !== '[]';
      return hasEvents;
    }
    return false;
  });
  const [eventsDayWiseExpanded, setEventsDayWiseExpanded] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      // Check if we have day-wise events data
      const hasDayWiseEvents = editingTrip.events_by_day && editingTrip.events_by_day !== '{}' && editingTrip.events_by_day !== '{}';
      return hasDayWiseEvents;
    }
    return false;
  });
  // Initialize selection types based on existing data in edit/view mode
  const [selectionType, setSelectionType] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      const hasAllDaysData = !!(editingTrip.selected_drivers && editingTrip.selected_drivers !== '[]');
      const hasDayWiseData = !!(editingTrip.drivers_by_day && editingTrip.drivers_by_day !== '{}');
      if (hasAllDaysData && !hasDayWiseData) return 'allDays';
      if (hasDayWiseData && !hasAllDaysData) return 'dayWise';
    }
    return 'allDays';
  });
  
  const [accommodationSelectionType, setAccommodationSelectionType] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      const hasAllDaysData = !!(editingTrip.selected_accommodation_vendor && editingTrip.selected_accommodation_vendor !== '');
      const hasDayWiseData = !!(editingTrip.accommodations_by_day && editingTrip.accommodations_by_day !== '{}');
      if (hasAllDaysData && !hasDayWiseData) return 'allDays';
      if (hasDayWiseData && !hasAllDaysData) return 'dayWise';
    }
    return 'allDays';
  });
  
  const [foodSelectionType, setFoodSelectionType] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      const hasAllDaysData = !!(editingTrip.all_days_food_entries && editingTrip.all_days_food_entries !== '[]');
      const hasDayWiseData = !!(editingTrip.food_vendors_by_day && editingTrip.food_vendors_by_day !== '{}');
      if (hasAllDaysData && !hasDayWiseData) return 'allDays';
      if (hasDayWiseData && !hasAllDaysData) return 'dayWise';
    }
    return 'allDays';
  });
  
  const [eventsSelectionType, setEventsSelectionType] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      const hasAllDaysData = !!(editingTrip.all_days_events && editingTrip.all_days_events !== '[]');
      const hasDayWiseData = !!(editingTrip.events_by_day && editingTrip.events_by_day !== '{}');
      if (hasAllDaysData && !hasDayWiseData) return 'allDays';
      if (hasDayWiseData && !hasAllDaysData) return 'dayWise';
    }
    return 'allDays';
  });
  const [appliedToAllDays, setAppliedToAllDays] = useState(() => {
    if ((isEditMode || isViewMode) && editingTrip) {
      // Check if all days data exists for each section
      return {
        drivers: !!(editingTrip.selected_drivers && editingTrip.selected_drivers !== '[]'),
        conductors: !!(editingTrip.selected_conductors && editingTrip.selected_conductors !== '[]'),
        buses: !!(editingTrip.selected_buses && editingTrip.selected_buses !== '[]'),
        accommodations: !!(editingTrip.selected_accommodation_vendor),
        food: !!(editingTrip.all_days_food_entries && editingTrip.all_days_food_entries !== '[]'),
        events: !!(editingTrip.all_days_events && editingTrip.all_days_events !== '[]')
      };
    } else {
      return {
        drivers: false,
        conductors: false,
        buses: false,
        accommodations: false,
        food: false,
        events: false
      };
    }
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
      if (disabled) return;
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter(item => item !== value)
        : [...selectedValues, value];
      onChange(newSelectedValues);
    };

    const handleSelectAll = () => {
      if (disabled) return;
      if ((selectedValues?.length || 0) === (filteredOptions?.length || 0)) {
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
          onOpen={() => !disabled && setOpen(true)}
          onClose={() => setOpen(false)}
          open={open}
          disabled={disabled}
          IconComponent={() => null} // Disable default Material-UI icon
          input={
            <OutlinedInput
              readOnly
              onClick={() => !disabled && setOpen(!open)}
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
                    onClick={() => !disabled && setOpen(!open)}
                    disabled={disabled}
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
                  onDelete={disabled ? undefined : () => handleToggle(options.find(opt => opt.label === label)?.value)}
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
              onChange={(e) => !disabled && setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              disabled={disabled}
            />
            <Box sx={{ mt: 1, mb: 1 }}>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll();
                }}
                disabled={disabled}
                fullWidth
                variant="outlined"
              >
                {(selectedValues?.length || 0) === (filteredOptions?.length || 0) ? 'Deselect All' : 'Select All'}
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
                if (!disabled) handleToggle(option.value);
              }}
              disabled={disabled}
            >
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onChange={() => !disabled && handleToggle(option.value)}
                disabled={disabled}
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
    if (!isEditMode && !isViewMode) {
      loadSavedTripData();
    }
  }, [isEditMode, isViewMode]);

  // Helper function to get filtered food items based on selected categories
  const getFilteredFoodItems = () => {
    if (newFoodEntry.categories.length === 0) {
      return foodItems;
    }
    return foodItems.filter(item => 
      newFoodEntry.categories.includes(item.food_category_id)
    );
  };

  // Reset food items when categories change
  useEffect(() => {
    if (newFoodEntry.categories.length > 0) {
      // Filter food items based on selected categories
      const filteredItems = getFilteredFoodItems();
      
      // Remove items that are not in the filtered list
      const validItems = newFoodEntry.items.filter(itemId => 
        filteredItems.some(item => item.id === itemId)
      );
      
      if (validItems.length !== newFoodEntry.items.length) {
        setNewFoodEntry(prev => ({ ...prev, items: validItems }));
      }
    }
  }, [newFoodEntry.categories, foodItems]);

  // Reset form for fresh component load
  useEffect(() => {
    if (!isEditMode && !isViewMode) {
      // Clear localStorage and reset form for fresh component
      localStorage.removeItem('currentTripId');
      setFormData({
        title: '',
        destination: '',
        startDate: null,
        endDate: null,
        selectedTransportVendor: '',
        selectedDrivers: [],
        selectedConductors: [],
        selectedBuses: [],
        driversByDay: {},
        conductorsByDay: {},
        busesByDay: {},
        vendorsByDay: {},
        timeByDay: {},
        accommodationsByDay: {},
        selectedAccommodationVendor: '',
        selectedAccommodationStartTime: '',
        selectedAccommodationEndTime: '',
        selectedFoodVendors: [],
        selectedFoodSchedules: [],
        selectedFoodCategories: [],
        selectedFoodItems: [],
        foodVendorsByDay: {},
        foodSchedulesByDay: {},
        foodCategoriesByDay: {},
        foodItemsByDay: {},
        allDaysFoodEntries: [],
        selectedEventTitle: '',
        selectedEventDescription: '',
        selectedEventStartTime: '',
        selectedEventEndTime: '',
        allDaysEvents: [],
        eventsByDay: {},
        finance: { 
          vendors: []
        }
      });
      setActiveStep(0);
    }
  }, [isEditMode, isViewMode]);

  // Fetch fresh trip data from backend when in edit/view mode
  useEffect(() => {
    const fetchFreshTripData = async () => {
      if ((isEditMode || isViewMode) && editingTrip && editingTrip.id) {
        try {
          console.log('🔄 Fetching fresh trip data for ID:', editingTrip.id);
          const response = await axios.get(`/api/trips/${editingTrip.id}`);
          const freshTripData = response.data.data;
          
          console.log('✅ Fresh trip data received:', freshTripData);
          console.log('✅ Fresh finance_data:', freshTripData.finance_data);
          
          // Update formData with fresh finance_data from backend
          setFormData(prev => ({
            ...prev,
            finance: (() => {
              console.log('=== LOADING FRESH FINANCE DATA ===');
              const parsed = safeJSONParse(freshTripData.finance_data, { vendors: [] });
              console.log('Parsed fresh finance data:', parsed);
              console.log('Fresh vendors array:', parsed.vendors);
              
              const result = {
                vendors: parsed.vendors || [],
                transportExpenses: [],
                accommodationExpenses: [],
                foodExpenses: []
              };
              
              console.log('Final fresh finance object:', result);
              return result;
            })()
          }));
        } catch (error) {
          console.error('❌ Error fetching fresh trip data:', error);
        }
      }
    };
    
    fetchFreshTripData();
  }, [isEditMode, isViewMode, editingTrip]);


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
    // Auto-save when drivers are selected
    setTimeout(() => {
      saveStepData(activeStep);
    }, 100);
  };

  const handleConductorSelectionChange = (values) => {
    setFormData(prev => ({ ...prev, selectedConductors: values }));
    checkForChanges();
    // Auto-save when conductors are selected
    setTimeout(() => {
      saveStepData(activeStep);
    }, 100);
  };

  const handleBusSelectionChange = (values) => {
    setFormData(prev => ({ ...prev, selectedBuses: values }));
    checkForChanges();
    // Auto-save when buses are selected
    setTimeout(() => {
      saveStepData(activeStep);
    }, 100);
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


  // Handle radio button changes and clear opposite data
  const handleSelectionTypeChange = (newType) => {
    setSelectionType(newType);
    
    // Clear opposite data immediately
    if (newType === 'allDays') {
      // Clear day-wise data
    setFormData(prev => ({
      ...prev,
        driversByDay: {},
        conductorsByDay: {},
        busesByDay: {},
        vendorsByDay: {},
        timeByDay: {}
      }));
    } else {
      // Clear all-days data
      setFormData(prev => ({
        ...prev,
        selectedDrivers: [],
        selectedConductors: [],
        selectedBuses: []
      }));
    }
    
    // Auto-save when radio button changes
    setTimeout(() => {
      saveStepData(activeStep);
    }, 100);
  };

  const handleAccommodationSelectionTypeChange = (newType) => {
    setAccommodationSelectionType(newType);
    
    // Clear opposite data immediately
    if (newType === 'allDays') {
      // Clear day-wise data
    setFormData(prev => ({
      ...prev,
        accommodationsByDay: {}
      }));
    } else {
      // Clear all-days data
      setFormData(prev => ({
        ...prev,
        selectedAccommodationVendor: '',
        selectedAccommodationStartTime: '',
        selectedAccommodationEndTime: ''
      }));
    }
    
    // Auto-save when radio button changes
    setTimeout(() => {
      saveStepData(activeStep);
    }, 100);
  };

  const handleFoodSelectionTypeChange = (newType) => {
    setFoodSelectionType(newType);
    
    // Clear opposite data immediately
    if (newType === 'allDays') {
      // Clear day-wise data
    setFormData(prev => ({
      ...prev,
        foodVendorsByDay: {},
        foodSchedulesByDay: {},
        foodCategoriesByDay: {},
        foodItemsByDay: {}
      }));
    } else {
      // Clear all-days data
      setFormData(prev => ({
        ...prev,
        selectedFoodVendors: [],
        selectedFoodSchedules: [],
        selectedFoodCategories: [],
        selectedFoodItems: [],
        allDaysFoodEntries: []
      }));
    }
    
    // Auto-save when radio button changes
    setTimeout(() => {
      saveStepData(activeStep);
    }, 100);
  };

  const handleEventsSelectionTypeChange = (newType) => {
    setEventsSelectionType(newType);
    
    // Clear opposite data immediately
    if (newType === 'allDays') {
      // Clear day-wise data
      setFormData(prev => ({
        ...prev,
        eventsByDay: {}
      }));
    } else {
      // Clear all-days data
      setFormData(prev => ({
        ...prev,
        allDaysEvents: [],
        selectedEventTitle: '',
        selectedEventDescription: '',
        selectedEventStartTime: '',
        selectedEventEndTime: ''
      }));
    }
    
    // Auto-save when radio button changes
    setTimeout(() => {
      saveStepData(activeStep);
    }, 100);
  };

  // Load saved trip data
  const loadSavedTripData = async () => {
    // Add timestamp to force refresh
    const timestamp = new Date().getTime();
    console.log('Loading trip data at:', timestamp);
    try {
      const currentTripId = localStorage.getItem('currentTripId');
      if (currentTripId && !isEditMode && !isViewMode) {
        const response = await axios.get(`/api/trips/${currentTripId}?t=${timestamp}`);
        const tripData = response.data.data;
        
        // Update form data with saved trip data
    setFormData(prev => ({
      ...prev,
          title: tripData.title || '',
          destination: tripData.destination || '',
          startDate: tripData.start_date ? new Date(tripData.start_date) : null,
          endDate: tripData.end_date ? new Date(tripData.end_date) : null,
          selectedTransportVendor: tripData.transport_vendor_id || '',
          selectedDrivers: tripData.selected_drivers ? JSON.parse(tripData.selected_drivers) : [],
          selectedConductors: tripData.selected_conductors ? JSON.parse(tripData.selected_conductors) : [],
          selectedBuses: tripData.selected_buses ? JSON.parse(tripData.selected_buses) : [],
          selectedAccommodationVendor: tripData.selected_accommodation_vendor || '',
          selectedAccommodationStartTime: tripData.selected_accommodation_start_time || '',
          selectedAccommodationEndTime: tripData.selected_accommodation_end_time || '',
          selectedFoodVendors: tripData.selected_food_vendors ? JSON.parse(tripData.selected_food_vendors) : [],
          selectedFoodSchedules: tripData.selected_food_schedules ? JSON.parse(tripData.selected_food_schedules) : [],
          selectedFoodCategories: tripData.selected_food_categories ? JSON.parse(tripData.selected_food_categories) : [],
          selectedFoodItems: tripData.selected_food_items ? JSON.parse(tripData.selected_food_items) : [],
          selectedEventTitle: tripData.selected_event_title || '',
          selectedEventDescription: tripData.selected_event_description || '',
          selectedEventStartTime: tripData.selected_event_start_time || '',
          selectedEventEndTime: tripData.selected_event_end_time || '',
          driversByDay: tripData.drivers_by_day ? JSON.parse(tripData.drivers_by_day) : {},
          conductorsByDay: tripData.conductors_by_day ? JSON.parse(tripData.conductors_by_day) : {},
          busesByDay: tripData.buses_by_day ? JSON.parse(tripData.buses_by_day) : {},
          vendorsByDay: tripData.vendors_by_day ? JSON.parse(tripData.vendors_by_day) : {},
          timeByDay: tripData.time_by_day ? JSON.parse(tripData.time_by_day) : {},
          accommodationsByDay: tripData.accommodations_by_day ? JSON.parse(tripData.accommodations_by_day) : {},
          selectedAccommodationVendor: tripData.selected_accommodation_vendor || '',
          selectedAccommodationStartTime: tripData.selected_accommodation_start_time || '',
          selectedAccommodationEndTime: tripData.selected_accommodation_end_time || '',
          selectedFoodVendors: tripData.selected_food_vendors ? JSON.parse(tripData.selected_food_vendors) : [],
          foodVendorsByDay: tripData.food_vendors_by_day ? JSON.parse(tripData.food_vendors_by_day) : {},
          selectedFoodSchedules: tripData.selected_food_schedules ? JSON.parse(tripData.selected_food_schedules) : [],
          selectedFoodCategories: tripData.selected_food_categories ? JSON.parse(tripData.selected_food_categories) : [],
          selectedFoodItems: tripData.selected_food_items ? JSON.parse(tripData.selected_food_items) : [],
          foodSchedulesByDay: tripData.food_schedules_by_day ? JSON.parse(tripData.food_schedules_by_day) : {},
          foodCategoriesByDay: tripData.food_categories_by_day ? JSON.parse(tripData.food_categories_by_day) : {},
          foodItemsByDay: tripData.food_items_by_day ? JSON.parse(tripData.food_items_by_day) : {},
          allDaysFoodEntries: tripData.all_days_food_entries ? JSON.parse(tripData.all_days_food_entries) : [],
          eventsByDay: tripData.events_by_day ? JSON.parse(tripData.events_by_day) : {},
          allDaysEvents: tripData.all_days_events ? JSON.parse(tripData.all_days_events) : [],
          selectedEventTitle: tripData.selected_event_title || '',
          selectedEventDescription: tripData.selected_event_description || '',
          selectedEventStartTime: tripData.selected_event_start_time || '',
          selectedEventEndTime: tripData.selected_event_end_time || '',
          finance: (() => {
            console.log('=== LOADING FINANCE DATA ===');
            console.log('Trip ID:', tripData.id);
            console.log('Trip Title:', tripData.title);
            console.log('Raw finance_data:', tripData.finance_data);
            
            if (tripData.finance_data) {
              const parsed = safeJSONParse(tripData.finance_data, { vendors: [] });
              console.log('Parsed finance data:', parsed);
              console.log('Vendors array:', parsed.vendors);
              
              // Keep only vendors array, remove old expense arrays
              const result = {
                vendors: parsed.vendors || [],
                transportExpenses: [],
                accommodationExpenses: [],
                foodExpenses: []
              };
              
              console.log('Final finance object:', result);
              return result;
            } else {
              console.log('No finance_data, using default');
              return { 
                vendors: [], 
                transportExpenses: [],
                accommodationExpenses: [],
                foodExpenses: []
              };
            }
          })()
        }));

        // Restore radio button selections
        if (tripData.selection_type) {
          setSelectionType(tripData.selection_type);
        }
        if (tripData.accommodation_selection_type) {
          setAccommodationSelectionType(tripData.accommodation_selection_type);
        }
        if (tripData.food_selection_type) {
          setFoodSelectionType(tripData.food_selection_type);
        }
        if (tripData.events_selection_type) {
          setEventsSelectionType(tripData.events_selection_type);
        }
        
        console.log('Loaded saved trip data');
      }
    } catch (error) {
      console.error('Error loading saved trip data:', error);
    }
  };

  // Save data for current step
  const saveStepData = async (step) => {
    try {
      // Don't save any data in view mode
      if (isViewMode) {
        return;
      }
      
      // Only save if we have basic information (step 0 data)
      if (!formData.title.trim() || !formData.destination || !formData.startDate || !formData.endDate) {
        return;
      }

      // Prepare trip data for current step based on radio button selections
      const tripData = {
        title: formData.title,
        destination: formData.destination,
        start_date: formData.startDate?.toISOString(),
        end_date: formData.endDate?.toISOString(),
        transport_vendor_id: formData.selectedTransportVendor || null,
        current_step: step, // Track current step
        
        // Transportation data based on selection type
        ...(selectionType === 'allDays' ? {
          selected_drivers: JSON.stringify(formData.selectedDrivers),
          selected_conductors: JSON.stringify(formData.selectedConductors),
          selected_buses: JSON.stringify(formData.selectedBuses),
          drivers_by_day: JSON.stringify({}),
          conductors_by_day: JSON.stringify({}),
          buses_by_day: JSON.stringify({}),
          vendors_by_day: JSON.stringify({}),
          time_by_day: JSON.stringify({})
        } : {
          selected_drivers: JSON.stringify([]),
          selected_conductors: JSON.stringify([]),
          selected_buses: JSON.stringify([]),
          drivers_by_day: JSON.stringify(formData.driversByDay),
          conductors_by_day: JSON.stringify(formData.conductorsByDay),
          buses_by_day: JSON.stringify(formData.busesByDay),
          vendors_by_day: JSON.stringify(formData.vendorsByDay),
          time_by_day: JSON.stringify(formData.timeByDay)
        }),
        
        // Accommodation data based on selection type
        ...(accommodationSelectionType === 'allDays' ? {
          selected_accommodation_vendor: formData.selectedAccommodationVendor,
          selected_accommodation_start_time: formData.selectedAccommodationStartTime,
          selected_accommodation_end_time: formData.selectedAccommodationEndTime,
          accommodations_by_day: JSON.stringify({})
        } : {
          selected_accommodation_vendor: '',
          selected_accommodation_start_time: '',
          selected_accommodation_end_time: '',
          accommodations_by_day: JSON.stringify(formData.accommodationsByDay)
        }),
        
        // Food data based on selection type
        ...(foodSelectionType === 'allDays' ? {
          selected_food_vendors: JSON.stringify(formData.selectedFoodVendors),
          selected_food_schedules: JSON.stringify(formData.selectedFoodSchedules),
          selected_food_categories: JSON.stringify(formData.selectedFoodCategories),
          selected_food_items: JSON.stringify(formData.selectedFoodItems),
          all_days_food_entries: JSON.stringify(formData.allDaysFoodEntries),
          food_vendors_by_day: JSON.stringify({}),
          food_schedules_by_day: JSON.stringify({}),
          food_categories_by_day: JSON.stringify({}),
          food_items_by_day: JSON.stringify({})
        } : {
          selected_food_vendors: JSON.stringify([]),
          selected_food_schedules: JSON.stringify([]),
          selected_food_categories: JSON.stringify([]),
          selected_food_items: JSON.stringify([]),
          all_days_food_entries: JSON.stringify([]),
          food_vendors_by_day: JSON.stringify(formData.foodVendorsByDay),
          food_schedules_by_day: JSON.stringify(formData.foodSchedulesByDay),
          food_categories_by_day: JSON.stringify(formData.foodCategoriesByDay),
          food_items_by_day: JSON.stringify(formData.foodItemsByDay)
        }),
        
        // Events data based on selection type
        ...(eventsSelectionType === 'allDays' ? {
          all_days_events: JSON.stringify(formData.allDaysEvents),
          selected_event_title: formData.selectedEventTitle,
          selected_event_description: formData.selectedEventDescription,
          selected_event_start_time: formData.selectedEventStartTime,
          selected_event_end_time: formData.selectedEventEndTime,
          events_by_day: JSON.stringify({})
        } : {
          all_days_events: JSON.stringify([]),
          selected_event_title: '',
          selected_event_description: '',
          selected_event_start_time: '',
          selected_event_end_time: '',
          events_by_day: JSON.stringify(formData.eventsByDay)
        }),
        
        // Save radio button selections
        selection_type: selectionType,
        accommodation_selection_type: accommodationSelectionType,
        food_selection_type: foodSelectionType,
        events_selection_type: eventsSelectionType,
        
        finance_data: JSON.stringify(formData.finance),
        use_all_days_selection: false
      };

      if (isEditMode && editingTrip) {
        // Update existing trip
        await axios.put(`/api/trips/${editingTrip.id}`, tripData);
        console.log(`Step ${step} data saved for existing trip`);
      } else {
        // Check if we have a trip ID from previous saves
        const currentTripId = localStorage.getItem('currentTripId');
        
        if (currentTripId) {
          // Update existing trip
          await axios.put(`/api/trips/${currentTripId}`, tripData);
          console.log(`Step ${step} data updated for trip ID: ${currentTripId}`);
        } else {
          // Create new trip
          const response = await axios.post('/api/trips', tripData);
          console.log(`Step ${step} data saved for new trip:`, response.data);
          
          // Store trip ID for future updates
          if (response.data && response.data.data && response.data.data.id) {
            localStorage.setItem('currentTripId', response.data.data.id);
          }
        }
      }
    } catch (error) {
      console.error(`Error saving step ${step} data:`, error);
      // Don't show error to user for auto-save, just log it
    }
  };

  const handleNext = () => {
    // In view mode, only navigate between steps without any validation or data saving
    if (isViewMode) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      return;
    }
    
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
      
      // If validation passes, create the trip immediately and then move to next step
      handleSubmit(true).then(async (tripId) => {
        // Store the trip ID for subsequent steps
        if (tripId) {
          localStorage.setItem('currentTripId', tripId);
          console.log('Trip ID stored for subsequent steps:', tripId);
          
          // Fetch the created trip data and set it as editingTrip
          try {
            const response = await axios.get(`/api/trips/${tripId}`);
            if (response.data && response.data.data) {
              setEditingTrip(response.data.data);
              setIsEditMode(true);
              console.log('Switched to edit mode with trip:', response.data.data);
            }
          } catch (error) {
            console.error('Error fetching created trip:', error);
          }
        }
        // Move to next step after successful trip creation
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }).catch((error) => {
        console.error('Error creating trip:', error);
        setSnackbar({ open: true, message: 'Error creating trip. Please try again.', severity: 'error' });
      });
      return;
    }
    
    // Save current step data before moving to next
    saveStepData(activeStep);
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    // In view mode, only navigate between steps without any data saving
    if (isViewMode) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
      return;
    }
    
    // Save current step data before moving back
    saveStepData(activeStep);
    
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

  // Check if any selection has changed
  const checkForChanges = () => {
    const hasDrivers = (formData.selectedDrivers?.length || 0) > 0;
    const hasConductors = (formData.selectedConductors?.length || 0) > 0;
    const hasBuses = (formData.selectedBuses?.length || 0) > 0;
    
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
        if ((newEventsByDay[day]?.length || 0) === 1) {
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
        // Add new vendor with all fields initialized
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


  // Add new transport expense
  const handleAddTransportExpense = () => {
    setFormData(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        transportExpenses: [...(prev.finance?.transportExpenses || []), { 
          id: Date.now(), 
          description: '', 
          amount: '' 
        }]
      }
    }));
  };

  // Add new accommodation expense
  const handleAddAccommodationExpense = () => {
    setFormData(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        accommodationExpenses: [...(prev.finance?.accommodationExpenses || []), { 
          id: Date.now(), 
          description: '', 
          amount: '' 
        }]
      }
    }));
  };

  // Add new food expense
  const handleAddFoodExpense = () => {
    setFormData(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        foodExpenses: [...(prev.finance?.foodExpenses || []), { 
          id: Date.now(), 
          description: '', 
          amount: '' 
        }]
      }
    }));
  };

  // Handle transport expense changes
  const handleTransportExpenseChange = (index, field, value) => {
    setFormData(prev => {
      const updatedExpenses = [...(prev.finance?.transportExpenses || [])];
      if (!updatedExpenses[index]) {
        updatedExpenses[index] = { id: Date.now(), description: '', amount: '' };
      }
      updatedExpenses[index][field] = value;
      
      return {
        ...prev,
        finance: {
          ...prev.finance,
          transportExpenses: updatedExpenses
        }
      };
    });
  };

  // Handle accommodation expense changes
  const handleAccommodationExpenseChange = (index, field, value) => {
    setFormData(prev => {
      const updatedExpenses = [...(prev.finance?.accommodationExpenses || [])];
      if (!updatedExpenses[index]) {
        updatedExpenses[index] = { id: Date.now(), description: '', amount: '' };
      }
      updatedExpenses[index][field] = value;
      
      return {
        ...prev,
        finance: {
          ...prev.finance,
          accommodationExpenses: updatedExpenses
        }
      };
    });
  };

  // Handle food expense changes
  const handleFoodExpenseChange = (index, field, value) => {
    setFormData(prev => {
      const updatedExpenses = [...(prev.finance?.foodExpenses || [])];
      if (!updatedExpenses[index]) {
        updatedExpenses[index] = { id: Date.now(), description: '', amount: '' };
      }
      updatedExpenses[index][field] = value;
      
      return {
        ...prev,
        finance: {
          ...prev.finance,
          foodExpenses: updatedExpenses
        }
      };
    });
  };

  // Remove transport expense
  const handleRemoveTransportExpense = (index) => {
    setFormData(prev => {
      const updatedExpenses = [...(prev.finance?.transportExpenses || [])];
      updatedExpenses.splice(index, 1);
      
      return {
        ...prev,
        finance: {
          ...prev.finance,
          transportExpenses: updatedExpenses
        }
      };
    });
  };

  // Remove accommodation expense
  const handleRemoveAccommodationExpense = (index) => {
    setFormData(prev => {
      const updatedExpenses = [...(prev.finance?.accommodationExpenses || [])];
      updatedExpenses.splice(index, 1);
      
      return {
        ...prev,
        finance: {
          ...prev.finance,
          accommodationExpenses: updatedExpenses
        }
      };
    });
  };

  // Remove food expense
  const handleRemoveFoodExpense = (index) => {
    setFormData(prev => {
      const updatedExpenses = [...(prev.finance?.foodExpenses || [])];
      updatedExpenses.splice(index, 1);
      
      return {
        ...prev,
        finance: {
          ...prev.finance,
          foodExpenses: updatedExpenses
        }
      };
    });
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    // Only calculate from vendors array (main budget allocations)
    const vendorTotal = (formData.finance?.vendors || []).reduce((sum, vendor) => {
      const amount = parseFloat(vendor.amount) || 0;
      return sum + amount;
    }, 0);
    
    return vendorTotal.toLocaleString('en-IN');
  };

  // Get selected vendors from transportation and accommodation
  const getSelectedVendors = () => {
    const selectedVendors = new Map();
    
    // Get from step selections (for new trips)
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
    if (formData.allDaysFoodEntries && (formData.allDaysFoodEntries?.length || 0) > 0) {
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
    
    // Finally, merge in finance data (takes priority for display)
    // This ensures manually entered finance data is shown
    if (formData.finance?.vendors && formData.finance.vendors.length > 0) {
      formData.finance.vendors.forEach(financeVendor => {
        let vendor = null;
        let vendorList = [];
        
        if (financeVendor.type === 'transport') {
          vendorList = transportVendors;
        } else if (financeVendor.type === 'accommodation') {
          vendorList = accommodationVendors;
        } else if (financeVendor.type === 'food') {
          vendorList = foodVendors;
        }
        
        vendor = vendorList.find(v => v.id === parseInt(financeVendor.vendorId));
        
        if (vendor) {
          // This will override any existing entry from step selections
          selectedVendors.set(`${financeVendor.vendorId}-${financeVendor.type}`, {
            id: financeVendor.vendorId,
            type: financeVendor.type,
            name: vendor.title
          });
        }
      });
    }
    
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

  const handleSubmit = async (isFromStep0 = false, statusId = 1) => {
    // Don't submit anything in view mode
    if (isViewMode) {
      return;
    }
    
    let tripId = null; // Declare tripId at function level
    
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
      
      // Data clearing is now handled immediately when radio buttons change
      
      let tripData;
      
      // Prepare trip data for database
      tripData = {
        title: formData.title,
        destination: formData.destination,
        start_date: formData.startDate?.toISOString(),
        end_date: formData.endDate?.toISOString(),
        transport_vendor_id: formData.selectedTransportVendor || null,
        // Convert complex data to JSON strings for database storage
        selected_drivers: JSON.stringify(formData.selectedDrivers),
        selected_conductors: JSON.stringify(formData.selectedConductors),
        selected_buses: JSON.stringify(formData.selectedBuses),
        drivers_by_day: JSON.stringify(formData.driversByDay),
        conductors_by_day: JSON.stringify(formData.conductorsByDay),
        buses_by_day: JSON.stringify(formData.busesByDay),
        vendors_by_day: JSON.stringify(formData.vendorsByDay),
        time_by_day: JSON.stringify(formData.timeByDay),
        accommodations_by_day: JSON.stringify(formData.accommodationsByDay),
        selected_accommodation_vendor: formData.selectedAccommodationVendor,
        selected_accommodation_start_time: formData.selectedAccommodationStartTime,
        selected_accommodation_end_time: formData.selectedAccommodationEndTime,
        selected_food_vendors: JSON.stringify(formData.selectedFoodVendors),
        food_vendors_by_day: JSON.stringify(formData.foodVendorsByDay),
        selected_food_schedules: JSON.stringify(formData.selectedFoodSchedules),
        selected_food_categories: JSON.stringify(formData.selectedFoodCategories),
        selected_food_items: JSON.stringify(formData.selectedFoodItems),
        food_schedules_by_day: JSON.stringify(formData.foodSchedulesByDay),
        food_categories_by_day: JSON.stringify(formData.foodCategoriesByDay),
        food_items_by_day: JSON.stringify(formData.foodItemsByDay),
        all_days_food_entries: JSON.stringify(formData.allDaysFoodEntries),
        events_by_day: JSON.stringify(formData.eventsByDay),
        all_days_events: JSON.stringify(formData.allDaysEvents),
        selected_event_title: formData.selectedEventTitle,
        selected_event_description: formData.selectedEventDescription,
        selected_event_start_time: formData.selectedEventStartTime,
        selected_event_end_time: formData.selectedEventEndTime,
        finance_data: JSON.stringify(formData.finance),
        use_all_days_selection: isAllDaysApplied,
        // Use the statusId parameter to set trip status
        trip_status_id: statusId
      };
      
      let response;
      
      if (isEditMode && editingTrip) {
        response = await axios.put(`/api/trips/${editingTrip.id}`, tripData);
        console.log('Trip updated successfully:', response.data);
        setSnackbar({ open: true, message: 'Trip updated successfully!', severity: 'success' });
        tripId = editingTrip.id;
        
        // Clean up localStorage if this is final submit
        if (!isFromStep0) {
          localStorage.removeItem('currentTripId');
          setTimeout(() => {
            navigate('/trips/list');
          }, 1500);
        }
      } else {
        response = await axios.post('/api/trips', tripData);
        console.log('Trip created successfully:', response.data);
      setSnackbar({ open: true, message: 'Trip created successfully!', severity: 'success' });
        
        // Extract trip ID from response
        if (response.data && response.data.data && response.data.data.id) {
          tripId = response.data.data.id;
        }
        
        // Only navigate to trip list if this is the final submit (not from step 0)
        if (!isFromStep0) {
          // Clean up localStorage and navigate to trip list after successful creation
          localStorage.removeItem('currentTripId');
          setTimeout(() => {
            navigate('/trips/list');
          }, 1500); // Wait 1.5 seconds to show success message
        }
      }
      
      // Only reset form if this is the final submit (not from step 0)
      if (!isFromStep0) {
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
        finance: { 
          vendors: []
        }
      });
      setAppliedToAllDays({ drivers: false, conductors: false, buses: false, accommodations: false, food: false, events: false });
      setActiveStep(0);
      }
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
    
    // Return trip ID for step 0 navigation
    return tripId;
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
                disabled={isViewMode}
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
                  disabled={isViewMode}
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
                renderInput={(params) => <TextField {...params} fullWidth disabled={isViewMode} />}
                disabled={isViewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="End Date & Time"
                value={formData.endDate}
                onChange={(newValue) => setFormData(prev => ({ ...prev, endDate: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth disabled={isViewMode} />}
                disabled={isViewMode}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>

            {/* Selection Type Radio Buttons */}
            <Card sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Choose Selection Type
            </Typography>
              <RadioGroup
                row
                value={selectionType}
                onChange={(e) => handleSelectionTypeChange(e.target.value)}
                sx={{ mt: 2 }}
                disabled={isViewMode}
              >
                <FormControlLabel
                  value="allDays"
                  control={<Radio color="primary" disabled={isViewMode} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TripIcon color="primary" />
                      <Typography variant="body1" fontWeight="500">
                        All Days Selection
            </Typography>
                    </Box>
                  }
                  disabled={isViewMode}
                />
                <FormControlLabel
                  value="dayWise"
                  control={<Radio color="primary" disabled={isViewMode} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="primary" />
                      <Typography variant="body1" fontWeight="500">
                        Day Wise Selection
                      </Typography>
                    </Box>
                  }
                  disabled={isViewMode}
                />
              </RadioGroup>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectionType === 'allDays' 
                  ? 'Apply the same transport configuration to all days of the trip'
                  : 'Configure different transport settings for each day of the trip'
                }
              </Typography>
            </Card>

            {/* All Days Selection - Only show when allDays is selected */}
            {selectionType === 'allDays' && (
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
                    Select transport vendor, drivers, conductors, and buses for all {tripDays?.length || 0} days
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
                        disabled={isViewMode}
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
                          disabled={!formData.selectedTransportVendor || isViewMode}
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
                          disabled={!formData.selectedTransportVendor || isViewMode}
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
                        disabled={!formData.selectedTransportVendor || isViewMode}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      disabled={isViewMode}
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
                      CLEAR
                    </Button>
                  </Box>
                  
                </Box>
              )}
            </Box>
            )}

            {/* Day-wise Selection - Only show when dayWise is selected */}
            {selectionType === 'dayWise' && (
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
                      label="Applied from All Days" 
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
                  
                  
                  {/* Always show editable mode in day-wise selection */}
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
                                  disabled={!formData.vendorsByDay[day] || isViewMode}
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
                                  disabled={!formData.vendorsByDay[day] || isViewMode}
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
                                  disabled={!formData.vendorsByDay[day] || isViewMode}
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
                </Box>
              )}
            </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            {/* Selection Type Radio Buttons for Accommodation */}
            <Card sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Choose Selection Type
            </Typography>
              <RadioGroup
                row
                value={accommodationSelectionType}
                onChange={(e) => handleAccommodationSelectionTypeChange(e.target.value)}
                disabled={isViewMode}
                sx={{ mt: 2 }}
              >
                <FormControlLabel
                  value="allDays"
                  control={<Radio color="primary" disabled={isViewMode} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HotelIcon color="primary" />
                      <Typography variant="body1" fontWeight="500">
                        All Days Selection
            </Typography>
                    </Box>
                  }
                  disabled={isViewMode}
                />
                <FormControlLabel
                  value="dayWise"
                  control={<Radio color="primary" disabled={isViewMode} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="primary" />
                      <Typography variant="body1" fontWeight="500">
                        Day Wise Selection
                      </Typography>
                    </Box>
                  }
                  disabled={isViewMode}
                />
              </RadioGroup>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {accommodationSelectionType === 'allDays' 
                  ? 'Apply the same accommodation configuration to all days of the trip'
                  : 'Configure different accommodation settings for each day of the trip'
                }
              </Typography>
            </Card>

            {/* All Days Selection - Only show when allDays is selected */}
            {accommodationSelectionType === 'allDays' && (
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
                    Select accommodations for all {tripDays?.length || 0} days
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
                  disabled={isViewMode}
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
                        <TimePicker
                          label="Start Time"
                          value={formData.selectedAccommodationStartTime || ''}
                          onChange={(time) => setFormData(prev => ({ ...prev, selectedAccommodationStartTime: time }))}
                          disabled={isViewMode}
                        />
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <TimePicker
                          label="End Time"
                          value={formData.selectedAccommodationEndTime || ''}
                          onChange={(time) => setFormData(prev => ({ ...prev, selectedAccommodationEndTime: time }))}
                          disabled={isViewMode}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      disabled={isViewMode}
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
                      CLEAR
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
            )}

            {/* Day-wise Selection - Only show when dayWise is selected */}
            {accommodationSelectionType === 'dayWise' && (
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
                            <FormControl fullWidth size="small" disabled={appliedToAllDays.accommodations || isViewMode}>
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
                              <TimePicker
                                label="Start Time"
                                value={formData.accommodationsByDay?.[day]?.[0]?.startTime ? 
                                  new Date(formData.accommodationsByDay[day][0].startTime).toTimeString().slice(0, 5) : ''}
                                onChange={(time) => handleAccommodationTimeChange(day, 'startTime', time)}
                                disabled={appliedToAllDays.accommodations || isViewMode}
                              />
                              
                              <TimePicker
                                label="End Time"
                                value={formData.accommodationsByDay?.[day]?.[0]?.endTime ? 
                                  new Date(formData.accommodationsByDay[day][0].endTime).toTimeString().slice(0, 5) : ''}
                                onChange={(time) => handleAccommodationTimeChange(day, 'endTime', time)}
                                disabled={appliedToAllDays.accommodations || isViewMode}
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
            )}
          </Box>
        );

      case 3:
        return (
          <Box>

            {/* Selection Type Radio Buttons for Food Management */}
            <Card sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Choose Selection Type
            </Typography>
              <RadioGroup
                row
                value={foodSelectionType}
                onChange={(e) => handleFoodSelectionTypeChange(e.target.value)}
                disabled={isViewMode}
                sx={{ mt: 2 }}
              >
                <FormControlLabel
                  value="allDays"
                  control={<Radio color="primary" disabled={isViewMode} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RestaurantIcon color="primary" />
                      <Typography variant="body1" fontWeight="500">
                        All Days Selection
            </Typography>
                    </Box>
                  }
                  disabled={isViewMode}
                />
                <FormControlLabel
                  value="dayWise"
                  control={<Radio color="primary" disabled={isViewMode} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="primary" />
                      <Typography variant="body1" fontWeight="500">
                        Day Wise Selection
                      </Typography>
                    </Box>
                  }
                  disabled={isViewMode}
                />
              </RadioGroup>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {foodSelectionType === 'allDays' 
                  ? 'Apply the same food configuration to all days of the trip'
                  : 'Configure different food settings for each day of the trip'
                }
              </Typography>
            </Card>

            {/* All Days Selection - Only show when allDays is selected */}
            {foodSelectionType === 'allDays' && (
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
                      disabled={isViewMode}
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
                    disabled={isViewMode}
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
              

              {/* Show added food entries */}
              {(formData.allDaysFoodEntries?.length || 0) > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Added Food Entries:
                  </Typography>
                  <Grid container spacing={1}>
                  {formData.allDaysFoodEntries.map((entry, index) => (
                      <Grid item xs={12} md={6} key={entry.id}>
                        <Card variant="outlined" sx={{ mb: 1, p: 1.5, height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {(entry.schedules?.length || 0) > 0 ? 
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
                          disabled={isViewMode}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Grid container spacing={1}>
                        {(entry.vendors?.length || 0) > 0 && (
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
                        
                        {(entry.schedules?.length || 0) > 0 && (
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
                        
                        {(entry.categories?.length || 0) > 0 && (
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
                        
                        {(entry.items?.length || 0) > 0 && (
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
                      </Grid>
                  ))}
                  </Grid>
                </Box>
              )}

              </Box>
            )}

            {/* Day-wise Selection - Only show when dayWise is selected */}
            {foodSelectionType === 'dayWise' && (
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
                                {(formData.selectedFoodVendors?.length || 0) > 0 ? (
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
                                {(formData.selectedFoodSchedules?.length || 0) > 0 ? (
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
                                {(formData.selectedFoodCategories?.length || 0) > 0 ? (
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
                                {(formData.selectedFoodItems?.length || 0) > 0 ? (
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
                              {((formData.foodVendorsByDay?.[day] || [])?.length || 0) > 0 && (
                                <Box sx={{ mb: 2 }}>
                                  {(formData.foodVendorsByDay[day] || []).map((entry, entryIndex) => (
                                    <Card key={entry.id} variant="outlined" sx={{ mb: 1, p: 1, backgroundColor: '#f8f9fa' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                          {(entry.schedules?.length || 0) > 0 ? 
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
                                          disabled={isViewMode}
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
                                  disabled={isViewMode}
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
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            {/* Selection Type Radio Buttons for Events */}
            <Card sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Choose Selection Type
            </Typography>
              <RadioGroup
                row
                value={eventsSelectionType}
                onChange={(e) => handleEventsSelectionTypeChange(e.target.value)}
                disabled={isViewMode}
                sx={{ mt: 2 }}
              >
                <FormControlLabel
                  value="allDays"
                  control={<Radio color="primary" disabled={isViewMode} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon color="primary" />
                      <Typography variant="body1" fontWeight="500">
                        All Days Selection
            </Typography>
                    </Box>
                  }
                  disabled={isViewMode}
                />
                <FormControlLabel
                  value="dayWise"
                  control={<Radio color="primary" disabled={isViewMode} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="primary" />
                      <Typography variant="body1" fontWeight="500">
                        Day Wise Selection
                      </Typography>
                    </Box>
                  }
                  disabled={isViewMode}
                />
              </RadioGroup>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {eventsSelectionType === 'allDays' 
                  ? 'Apply the same events to all days of the trip'
                  : 'Configure different events for each day of the trip'
                }
              </Typography>
            </Card>

            {/* All Days Selection - Only show when allDays is selected */}
            {eventsSelectionType === 'allDays' && (
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
                    {/* Add Event Button */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, position: 'relative' }}>
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <IconButton
                        size="large"
                        onClick={() => setAllDaysEventDialog(true)}
                          disabled={isViewMode}
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
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -8,
                            left: -8,
                            backgroundColor: '#ff9800',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          <EventIcon sx={{ fontSize: 14, color: 'white' }} />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Add Event for All Days
                      </Typography>
                    </Box>
                    
                    {/* Show Applied Events */}
                    {formData.allDaysEvents && (formData.allDaysEvents?.length || 0) > 0 && (
          <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            Applied Events:
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={isViewMode}
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
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {formData.allDaysEvents.map((event, index) => (
                            <Card key={event.id} variant="outlined" sx={{ 
                              p: 1.5, 
                              mb: 1, 
                              backgroundColor: 'white',
                              minWidth: '280px',
                              maxWidth: '320px',
                              flex: '1 1 280px',
                              border: '2px dashed #1976d2',
                              borderRadius: 2,
                              '&:hover': {
                                borderColor: '#1565c0',
                                boxShadow: '0 2px 8px rgba(25, 118, 211, 0.2)'
                              }
                            }}>
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
                                  ⏰ {formatTime12Hour(event.startTime) || '--:-- AM'} - {formatTime12Hour(event.endTime) || '--:-- AM'}
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
                                  disabled={isViewMode}
                                sx={{ p: 0.5 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Card>
                        ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            )}

            {/* Day-wise Selection - Only show when dayWise is selected */}
            {eventsSelectionType === 'dayWise' && (
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
                  
                  {(tripDays?.length || 0) === 0 ? (
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
                            ) : formData.eventsByDay?.[day] && (formData.eventsByDay[day]?.length || 0) > 0 ? (
                              // Show multiple events if exist
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                {formData.eventsByDay[day].map((event, eventIndex) => (
                                  <Card key={event.id} variant="outlined" sx={{ 
                                    p: 1.5, 
                                    backgroundColor: 'white',
                                    minWidth: '280px',
                                    maxWidth: '320px',
                                    flex: '1 1 280px',
                                    border: '2px dashed #1976d2',
                                    borderRadius: 2,
                                    '&:hover': {
                                      borderColor: '#1565c0',
                                      boxShadow: '0 2px 8px rgba(25, 118, 211, 0.2)'
                                    }
                                  }}>
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
                                        ⏰ {formatTime12Hour(event.startTime) || '--:-- AM'} - {formatTime12Hour(event.endTime) || '--:-- AM'}
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
                                        disabled={isViewMode}
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
                                    disabled={isViewMode}
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
                                  disabled={isViewMode}
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
            )}
          </Box>
        );

      case 5:
        return (
          <Box>
            {/* Finance Section - Table Format */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                {/* Finance Table */}
                <Box sx={{ border: '2px solid #000', borderRadius: 2, overflow: 'hidden' }}>
                  {/* Transport Section */}
                  <Box sx={{ borderBottom: '1px solid #000' }}>
                    <Box sx={{ 
                      backgroundColor: '#f5f5f5', 
                      p: 2, 
                      borderBottom: '1px solid #000',
                      borderRadius: '8px 8px 0 0',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Transport
                </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                {(() => {
                        const transportVendors = getSelectedVendors().filter(v => v.type === 'transport');
                        const hasTransportData = transportVendors.length > 0;
                  
                        if (!hasTransportData) {
                    return (
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                              <TextField
                                placeholder="Transport Item 1"
                                size="small"
                                sx={{ flex: 1 }}
                                disabled={isViewMode}
                              />
                              <TextField
                                placeholder="Note"
                                size="small"
                                sx={{ flex: 1 }}
                                disabled={isViewMode}
                              />
                              <TextField
                                placeholder="Amount"
                                type="number"
                                size="small"
                                sx={{ width: 120 }}
                                disabled={isViewMode}
                              />
                      </Box>
                    );
                  }
        return (
                          <>
                            {transportVendors.map((vendor, index) => {
                              const financeVendor = formData.finance?.vendors?.find(f => 
                                parseInt(f.vendorId) === parseInt(vendor.id) && f.type === vendor.type
                              );
                              
                              console.log(`Transport vendor ${vendor.id} (${vendor.name}):`, {
                                vendorId: vendor.id,
                                vendorType: vendor.type,
                                financeVendor: financeVendor,
                                allFinanceVendors: formData.finance?.vendors
                              });
                              
                              return (
                              <Box key={`transport-${vendor.id}`} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                  value={vendor.name}
                                size="small" 
                                  sx={{ flex: 1 }}
                                  disabled={isViewMode}
                                />
                                <TextField
                                  placeholder="Description"
                                  size="small"
                                  value={financeVendor?.description || ''}
                                  onChange={(e) => handleFinanceChange(vendor.id, vendor.type, 'description', e.target.value)}
                                  sx={{ flex: 1 }}
                                  disabled={isViewMode}
                                />
              <TextField
                                label="Amount (₹)"
                                type="number"
                                size="small"
                                  value={financeVendor?.amount || ''}
                                onChange={(e) => handleFinanceChange(vendor.id, vendor.type, 'amount', e.target.value)}
                                  sx={{ width: 120 }}
                                  disabled={isViewMode}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                              />
                            </Box>
                            );
                            })}
                          </>
                        );
                      })()}
                    </Box>
                  </Box>

                  {/* Accommodation Section */}
                  <Box sx={{ borderBottom: '1px solid #000' }}>
                    <Box sx={{ 
                      backgroundColor: '#f5f5f5', 
                      p: 2, 
                      borderBottom: '1px solid #000',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Accommodation
                          </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {(() => {
                        const accommodationVendors = getSelectedVendors().filter(v => v.type === 'accommodation');
                        const hasAccommodationData = accommodationVendors.length > 0;
                        
                        if (!hasAccommodationData) {
                          return (
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                              <TextField
                                placeholder="Accommodation Item 1"
                                size="small"
                                sx={{ flex: 1 }}
                                disabled={isViewMode}
                              />
                              <TextField
                                placeholder="Note"
                                size="small"
                                sx={{ flex: 1 }}
                                disabled={isViewMode}
                              />
                              <TextField
                                placeholder="Amount"
                                type="number"
                                size="small"
                                sx={{ width: 120 }}
                                disabled={isViewMode}
                              />
                            </Box>
                          );
                        }
                        return (
                          <>
                            {accommodationVendors.map((vendor, index) => {
                              const financeVendor = formData.finance?.vendors?.find(f => 
                                parseInt(f.vendorId) === parseInt(vendor.id) && f.type === vendor.type
                              );
                              
                              return (
                              <Box key={`accommodation-${vendor.id}`} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                  value={vendor.name}
                                  size="small"
                                  sx={{ flex: 1 }}
                                  disabled={isViewMode}
                                />
                                <TextField
                                  placeholder="Description"
                                  size="small"
                                  value={financeVendor?.description || ''}
                                onChange={(e) => handleFinanceChange(vendor.id, vendor.type, 'description', e.target.value)}
                                sx={{ flex: 1 }}
                                  disabled={isViewMode}
                                />
              <TextField
                              label="Amount (₹)"
                              type="number"
                              size="small"
                                  value={financeVendor?.amount || ''}
                                  onChange={(e) => handleFinanceChange(vendor.id, vendor.type, 'amount', e.target.value)}
                                  sx={{ width: 120 }}
                                  disabled={isViewMode}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                  }}
                              />
                            </Box>
                            );
                            })}
                          </>
                        );
                      })()}
                    </Box>
                  </Box>

                  {/* Food Management Section */}
                  <Box sx={{ borderBottom: '1px solid #000' }}>
                    <Box sx={{ 
                      backgroundColor: '#f5f5f5', 
                      p: 2, 
                      borderBottom: '1px solid #000',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Food Management
                          </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {(() => {
                        const foodVendors = getSelectedVendors().filter(v => v.type === 'food');
                        const hasFoodData = foodVendors.length > 0;
                        
                        if (!hasFoodData) {
                          return (
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                                placeholder="Food Item 1"
                              size="small"
                              sx={{ flex: 1 }}
                                disabled={isViewMode}
                              />
                              <TextField
                                placeholder="Note"
                                size="small"
                                sx={{ flex: 1 }}
                                disabled={isViewMode}
                              />
                              <TextField
                                placeholder="Amount"
                              type="number"
                              size="small"
                                sx={{ width: 120 }}
                                disabled={isViewMode}
                            />
                          </Box>
                          );
                        }
                        return (
                          <>
                            {foodVendors.map((vendor, index) => {
                              const financeVendor = formData.finance?.vendors?.find(f => 
                                parseInt(f.vendorId) === parseInt(vendor.id) && f.type === vendor.type
                              );
                              
                              return (
                          <Box key={`food-${vendor.id}`} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                              value={vendor.name}
                              size="small"
                              sx={{ flex: 1 }}
                              disabled={isViewMode}
                            />
                            <TextField
                              placeholder="Description"
                              size="small"
                              value={financeVendor?.description || ''}
                              onChange={(e) => handleFinanceChange(vendor.id, vendor.type, 'description', e.target.value)}
                              sx={{ flex: 1 }}
                              disabled={isViewMode}
                            />
                            <TextField
                              label="Amount (₹)"
                              type="number"
                              size="small"
                              value={financeVendor?.amount || ''}
                              onChange={(e) => handleFinanceChange(vendor.id, vendor.type, 'amount', e.target.value)}
                              sx={{ width: 120 }}
                              disabled={isViewMode}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                            />
                          </Box>
                            );
                            })}
                          </>
                  );
                })()}
                    </Box>
                  </Box>

                  {/* Total Section */}
                  <Box sx={{ 
                    backgroundColor: '#000', 
                    color: 'white', 
                    p: 2,
                    borderRadius: '0 0 8px 8px'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        TOTAL
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        ₹{calculateTotalAmount()}
                      </Typography>
                    </Box>
                  </Box>
                    </Box>
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
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, md: 4 }, textAlign: 'center', position: 'relative' }}>
        {(isViewMode || isEditMode) && (
          <IconButton
            onClick={() => navigate('/trips')}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.2)'
              },
              zIndex: 1
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography component="h1" gutterBottom sx={{ 
          fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
            {isViewMode ? 'View Trip' : isEditMode ? 'Edit Trip' : 'Trip Management'}
        </Typography>
        <Typography 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
            px: { xs: 2, md: 0 }
          }}
        >
          {isViewMode ? 'View trip details and configurations (Read-only)' : isEditMode ? 'Update trip details and configurations' : 'Create a new pilgrimage trip with all necessary details'}
        </Typography>
        <Box sx={{ 
          width: { xs: 60, md: 100 }, 
          height: { xs: 3, md: 4 }, 
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          borderRadius: 2,
          mx: 'auto'
        }} />
      </Box>

      <Paper sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
      }}>
        {/* Progress Stepper */}
        <Stepper 
          activeStep={activeStep} 
          orientation="horizontal"
          sx={{ 
            mb: { xs: 2, md: 4 },
            '& .MuiStepLabel-label': {
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: '#1976d2'
            },
            '& .MuiStepLabel-root .Mui-completed': {
              color: '#4caf50'
            },
            '& .MuiStepIcon-root': {
              fontSize: { xs: '1.5rem', md: '2rem' }
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
          pt: { xs: 2, md: 3 },
          mt: { xs: 2, md: 3 },
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          gap: { xs: 1, md: 0 }
        }}>
          <Button
            variant={activeStep === 0 ? "outlined" : "contained"}
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ 
              mr: { xs: 0, md: 1 },
              px: { xs: 2, md: 3 },
              py: { xs: 1, md: 1.5 },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.875rem', md: '1rem' },
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
          {activeStep === (steps?.length || 0) - 1 && isViewMode ? (
            <Button
              onClick={() => navigate('/trips/list')}
              variant="contained"
              sx={{
                px: { xs: 2, md: 4 },
                py: { xs: 1, md: 1.5 },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
                background: 'linear-gradient(45deg, #f44336 30%, #ef5350 90%)',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f 30%, #e53935 90%)',
                  boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)'
                }
              }}
            >
              Close
            </Button>
          ) : activeStep === (steps?.length || 0) - 1 && !isViewMode ? (
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, flexWrap: 'wrap' }}>
              <Button 
                onClick={() => handleSubmit(false, 1)} 
                variant="outlined"
                disabled={loading}
                sx={{
                  px: { xs: 2, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  '&:hover': {
                    borderColor: '#f57c00',
                    backgroundColor: 'rgba(255, 152, 0, 0.04)'
                  }
                }}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Saving...' : 'Save As Draft'}
              </Button>
              <Button 
                onClick={() => handleSubmit(false, 2)} 
              variant="contained"
              disabled={loading}
              sx={{
                px: { xs: 2, md: 4 },
                py: { xs: 1, md: 1.5 },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
                background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #43a047 30%, #5cb85c 90%)',
                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                }
              }}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
                {loading ? 'Publishing...' : 'Publish Trip'}
            </Button>
            </Box>
          ) : (
            <Button 
              onClick={handleNext} 
              variant="contained" 
              disabled={
                !isViewMode && activeStep === 0 && (
                  !formData.title.trim() || 
                  !formData.destination || 
                  !formData.startDate || 
                  !formData.endDate ||
                  (formData.startDate && formData.endDate && formData.startDate >= formData.endDate)
                )
              }
              sx={{
                px: { xs: 2, md: 4 },
                py: { xs: 1, md: 1.5 },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
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
        <Dialog 
          open={dayEventDialog} 
          onClose={() => setDayEventDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 3,
            px: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {editingEvent ? 'Edit Event' : 'Add Event'} - {selectedDayForEvent && new Date(selectedDayForEvent).toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3, backgroundColor: '#fafafa' }}>
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 2, 
              p: 3, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e8e8e8'
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* First Row: Title, Start Time, End Time */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <TextField
                      label="Event Title"
                      fullWidth
                      value={dayEvent.title}
                      onChange={(e) => setDayEvent(prev => ({ ...prev, title: e.target.value }))}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#667eea',
                        },
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                    <TimePicker
                      label="Start Time"
                      value={dayEvent.startTime}
                      onChange={(time) => setDayEvent(prev => ({ ...prev, startTime: time }))}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                    <TimePicker
                      label="End Time"
                      value={dayEvent.endTime}
                      onChange={(time) => setDayEvent(prev => ({ ...prev, endTime: time }))}
                    />
                  </Box>
                </Box>
                
                {/* Description spanning from Title to End Time */}
                <Box sx={{ width: '100%' }}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={dayEvent.description}
                    onChange={(e) => setDayEvent(prev => ({ ...prev, description: e.target.value }))}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 3, 
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e8e8e8',
            gap: 2
          }}>
            <Button 
              onClick={() => setDayEventDialog(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: '#d0d0d0',
                color: '#666',
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveDayEvent} 
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                }
              }}
            >
              {editingEvent ? 'Update Event' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* All Days Event Dialog */}
        <Dialog 
          open={allDaysEventDialog} 
          onClose={() => setAllDaysEventDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 3,
            px: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <EventIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {editingAllDaysEvent ? 'Edit Event' : 'Add Event'} - All Days
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3, backgroundColor: '#fafafa' }}>
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 2, 
              p: 3, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e8e8e8'
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* First Row: Title, Start Time, End Time */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <TextField
                      label="Event Title"
                      fullWidth
                      value={allDaysEvent.title}
                      onChange={(e) => setAllDaysEvent(prev => ({ ...prev, title: e.target.value }))}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#667eea',
                        },
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                    <TimePicker
                      label="Start Time"
                      value={allDaysEvent.startTime}
                      onChange={(time) => setAllDaysEvent(prev => ({ ...prev, startTime: time }))}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                    <TimePicker
                      label="End Time"
                      value={allDaysEvent.endTime}
                      onChange={(time) => setAllDaysEvent(prev => ({ ...prev, endTime: time }))}
                    />
                  </Box>
                </Box>
                
                {/* Description spanning from Title to End Time */}
                <Box sx={{ width: '100%' }}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={allDaysEvent.description}
                    onChange={(e) => setAllDaysEvent(prev => ({ ...prev, description: e.target.value }))}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 3, 
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e8e8e8',
            gap: 2
          }}>
            <Button 
              onClick={() => setAllDaysEventDialog(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: '#d0d0d0',
                color: '#666',
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveAllDaysEvent} 
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                }
              }}
            >
              {editingAllDaysEvent ? 'Update Event' : 'Save'}
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
                  value={(newDayFoodEntry.vendors?.length || 0) > 0 ? newDayFoodEntry.vendors[0] : ''}
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
                  value={(newDayFoodEntry.schedules?.length || 0) > 0 ? newDayFoodEntry.schedules[0] : ''}
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
              disabled={(newDayFoodEntry.vendors?.length || 0) === 0 || (newDayFoodEntry.schedules?.length || 0) === 0 || (newDayFoodEntry.categories?.length || 0) === 0 || (newDayFoodEntry.items?.length || 0) === 0}
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
                  value={(newFoodEntry.vendors?.length || 0) > 0 ? newFoodEntry.vendors[0] : ''}
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
                  value={(newFoodEntry.schedules?.length || 0) > 0 ? newFoodEntry.schedules[0] : ''}
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
                <InputLabel id="food-items-label">
                  Food Items {newFoodEntry.categories.length > 0 ? `(Filtered by ${newFoodEntry.categories.length} category${newFoodEntry.categories.length > 1 ? 'ies' : 'y'})` : ''}
                </InputLabel>
                <Select
                  labelId="food-items-label"
                  multiple
                  value={newFoodEntry.items}
                  onChange={(e) => setNewFoodEntry(prev => ({ ...prev, items: e.target.value }))}
                  label={`Food Items ${newFoodEntry.categories.length > 0 ? `(Filtered by ${newFoodEntry.categories.length} category${newFoodEntry.categories.length > 1 ? 'ies' : 'y'})` : ''}`}
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
                  {getFilteredFoodItems().map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      <Checkbox checked={newFoodEntry.items.includes(item.id)} />
                      <ListItemText 
                        primary={item.title || item.name || `Item ${item.id}`}
                        secondary={(() => {
                          const category = foodCategories.find(c => c.id === item.food_category_id);
                          return category ? (category.title || category.name) : '';
                        })()}
                      />
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
              disabled={(newFoodEntry.vendors?.length || 0) === 0 || (newFoodEntry.schedules?.length || 0) === 0 || (newFoodEntry.categories?.length || 0) === 0 || (newFoodEntry.items?.length || 0) === 0}
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