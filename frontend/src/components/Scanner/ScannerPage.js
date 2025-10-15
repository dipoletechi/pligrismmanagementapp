import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  DirectionsBus as TransportIcon,
  Hotel as AccommodationIcon,
  Event as EventIcon,
  Add as AddIcon,
  QrCodeScanner as ScannerIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';

const ScannerPage = () => {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { trip, tripTitle, tripDestination } = location.state || {};

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [checkInOutData, setCheckInOutData] = useState({});
  const [tripDays, setTripDays] = useState([]);
  const [descriptionModal, setDescriptionModal] = useState({ open: false, title: '', description: '' });

  // Fetch trip details with all related data
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/mobile/trips/${tripId}`);
        const trip = response.data.data;
        console.log('Trip data received:', trip);
        console.log('Bus data:', trip.bus);
        console.log('Transport vendor data:', trip.transportVendor);
        console.log('Accommodation vendor data:', trip.accommodationVendor);
        console.log('Accommodations by day:', trip.accommodations_by_day);
        console.log('All accommodation vendors:', trip.allAccommodationVendors);
        console.log('Accommodation vendors:', trip.accommodationVendors);
        console.log('Main accommodation vendor:', trip.accommodationVendor);
        console.log('Events data:', trip.all_days_events);
        console.log('Events by day:', trip.events_by_day);
        console.log('Selected event data:', {
          title: trip.selected_event_title,
          description: trip.selected_event_description,
          startTime: trip.selected_event_start_time,
          endTime: trip.selected_event_end_time
        });
        setTripData(trip);
        console.log('Trip data:', trip);
        console.log('Transport vendors by day:', trip.vendors_by_day);
        console.log('Drivers by day:', trip.drivers_by_day);
        console.log('Buses by day:', trip.buses_by_day);
        console.log('Conductors by day:', trip.conductors_by_day);
        console.log('Accommodation vendors by day:', trip.accommodations_by_day);
        console.log('All accommodation vendors:', trip.allAccommodationVendors);
        console.log('Events by day:', trip.events_by_day);
        console.log('All days events:', trip.all_days_events);
        
        // Generate trip days
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        const days = [];
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          days.push({
            date: new Date(d),
            dayNumber: days.length + 1,
            dateString: d.toLocaleDateString('en-IN')
          });
        }
        setTripDays(days);
        
        // Initialize check-in/out data
        const initialCheckData = {};
        days.forEach(day => {
          initialCheckData[day.dateString] = {
            transport: { checkedIn: false, checkedOut: false, time: null },
            accommodation: { checkedIn: false, checkedOut: false, time: null },
            events: { checkedIn: false, checkedOut: false, time: null }
          };
        });
        setCheckInOutData(initialCheckData);
        
      } catch (err) {
        console.error('Error fetching trip data:', err);
        setError('Failed to load trip data');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchTripData();
    }
  }, [tripId]);

  // Get vendors for selected category
  const getVendorsForCategory = (category) => {
    if (!tripData) return [];
    
    switch (category) {
      case 'transport':
        return tripData.bus ? [tripData.bus] : [];
      case 'accommodation':
        return tripData.accommodationVendor ? [tripData.accommodationVendor] : [];
      case 'events':
        // Parse events from all_days_events if available
        try {
          let events;
          if (typeof tripData.all_days_events === 'string') {
            events = JSON.parse(tripData.all_days_events || '[]');
          } else {
            events = tripData.all_days_events || [];
          }
          return events.map((event, index) => ({
            id: event.id || index,
            name: event.title || `Event ${index + 1}`,
            type: 'Event',
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime
          }));
        } catch (error) {
          console.error('Error parsing events:', error);
          return [];
        }
      default:
        return [];
    }
  };

  // Get accommodation for specific day
  const getTransportForDay = (dayNumber, dateString) => {
    if (!tripData) {
      console.log('No trip data available');
      return null;
    }
    console.log('Getting transport for day:', dayNumber, 'date:', dateString);
    console.log('Trip data vendors_by_day:', tripData.vendors_by_day);
    console.log('Trip data drivers_by_day:', tripData.drivers_by_day);
    console.log('Trip data buses_by_day:', tripData.buses_by_day);
    console.log('Trip data conductors_by_day:', tripData.conductors_by_day);
    
    try {
      // Parse vendors by day
      let vendorsByDay = {};
      if (tripData.vendors_by_day) {
        if (typeof tripData.vendors_by_day === 'string') {
          vendorsByDay = JSON.parse(tripData.vendors_by_day);
        } else {
          vendorsByDay = tripData.vendors_by_day;
        }
      }
      
      // Parse drivers by day
      let driversByDay = {};
      if (tripData.drivers_by_day) {
        if (typeof tripData.drivers_by_day === 'string') {
          driversByDay = JSON.parse(tripData.drivers_by_day);
        } else {
          driversByDay = tripData.drivers_by_day;
        }
      }
      
      // Parse buses by day
      let busesByDay = {};
      if (tripData.buses_by_day) {
        if (typeof tripData.buses_by_day === 'string') {
          busesByDay = JSON.parse(tripData.buses_by_day);
        } else {
          busesByDay = tripData.buses_by_day;
        }
      }
      
      // Parse conductors by day
      let conductorsByDay = {};
      if (tripData.conductors_by_day) {
        if (typeof tripData.conductors_by_day === 'string') {
          conductorsByDay = JSON.parse(tripData.conductors_by_day);
        } else {
          conductorsByDay = tripData.conductors_by_day;
        }
      }
      
      console.log('Parsed vendors_by_day:', vendorsByDay);
      console.log('Parsed drivers_by_day:', driversByDay);
      console.log('Parsed buses_by_day:', busesByDay);
      console.log('Parsed conductors_by_day:', conductorsByDay);
      
      // Get data for this specific day
      const dayKey = dateString.split('/').reverse().join('-');
      console.log('Looking for transport data for date:', dayKey);
      
      const dayVendor = vendorsByDay[dayKey];
      const dayDrivers = driversByDay[dayKey] || [];
      const dayBuses = busesByDay[dayKey] || [];
      const dayConductors = conductorsByDay[dayKey] || [];
      
      console.log('Found vendor for this date:', dayVendor);
      console.log('Found drivers for this date:', dayDrivers);
      console.log('Found buses for this date:', dayBuses);
      console.log('Found conductors for this date:', dayConductors);
      
      // Find vendor details
      let vendorDetails = null;
      if (dayVendor && tripData.allTransportVendors) {
        vendorDetails = tripData.allTransportVendors.find(v => v.id === dayVendor);
      }
      
      // Find driver details
      let driverDetails = [];
      if (dayDrivers.length > 0 && tripData.allDrivers) {
        driverDetails = dayDrivers.map(driverId => 
          tripData.allDrivers.find(d => d.id === driverId)
        ).filter(Boolean);
      }
      
      // Find bus details
      let busDetails = [];
      if (dayBuses.length > 0 && tripData.allBuses) {
        busDetails = dayBuses.map(busId => 
          tripData.allBuses.find(b => b.id === busId)
        ).filter(Boolean);
      }
      
      // Find conductor details
      let conductorDetails = [];
      if (dayConductors.length > 0 && tripData.allConductors) {
        conductorDetails = dayConductors.map(conductorId => 
          tripData.allConductors.find(c => c.id === conductorId)
        ).filter(Boolean);
      }
      
      console.log('Found vendor details:', vendorDetails);
      console.log('Found driver details:', driverDetails);
      console.log('Found bus details:', busDetails);
      console.log('Found conductor details:', conductorDetails);
      
      return {
        vendor: vendorDetails,
        drivers: driverDetails,
        buses: busDetails,
        conductors: conductorDetails
      };
      
    } catch (error) {
      console.error('Error parsing transport day-wise data:', error);
      return null;
    }
  };

  const getEventsForDay = (dayNumber, dateString) => {
    if (!tripData) {
      console.log('No trip data available');
      return null;
    }
    
    console.log('Getting events for day:', dayNumber, 'date:', dateString);
    console.log('Trip data all_days_events:', tripData.all_days_events);
    console.log('Trip data events_by_day:', tripData.events_by_day);
    
    try {
      // Check if events_by_day exists and has data for this day
      if (tripData.events_by_day) {
        // Check if it's already an object or needs to be parsed
        let eventsByDay;
        if (typeof tripData.events_by_day === 'string') {
          eventsByDay = JSON.parse(tripData.events_by_day);
        } else {
          eventsByDay = tripData.events_by_day;
        }
        console.log('Parsed events_by_day:', eventsByDay);
        
        // Try to find events by date (format: YYYY-MM-DD)
        const dateKey = dateString.split('/').reverse().join('-'); // Convert DD/MM/YYYY to YYYY-MM-DD
        console.log('Looking for events for date:', dateKey);
        console.log('Available dates in events_by_day:', Object.keys(eventsByDay));
        const dayEvents = eventsByDay[dateKey];
        console.log('Found events for this date:', dayEvents);
        
        if (dayEvents && dayEvents.length > 0) {
          return dayEvents;
        }
      }
      
      // Check if all_days_events exists
      if (tripData.all_days_events) {
        let allDaysEvents;
        if (typeof tripData.all_days_events === 'string') {
          allDaysEvents = JSON.parse(tripData.all_days_events);
        } else {
          allDaysEvents = tripData.all_days_events;
        }
        console.log('Parsed all_days_events:', allDaysEvents);
        
        if (allDaysEvents && allDaysEvents.length > 0) {
          return allDaysEvents;
        }
      }
      
      // Fallback to selected event data
      if (tripData.selected_event_title) {
        return [{
          title: tripData.selected_event_title,
          description: tripData.selected_event_description,
          startTime: tripData.selected_event_start_time,
          endTime: tripData.selected_event_end_time
        }];
      }
      
      // If no events found, return null
      console.log('No events found for day:', dayNumber);
      return null;
    } catch (error) {
      console.error('Error parsing events data:', error);
      return null;
    }
  };

  const getAccommodationForDay = (dayNumber, dateString) => {
    if (!tripData) {
      console.log('No trip data available');
      return null;
    }
    
    console.log('Getting accommodation for day:', dayNumber, 'date:', dateString);
    console.log('Trip data accommodations_by_day:', tripData.accommodations_by_day);
    
    try {
      // Check if accommodations_by_day exists and has data for this day
      if (tripData.accommodations_by_day) {
        // Check if it's already an object or needs to be parsed
        let accommodationsByDay;
        if (typeof tripData.accommodations_by_day === 'string') {
          accommodationsByDay = JSON.parse(tripData.accommodations_by_day);
        } else {
          accommodationsByDay = tripData.accommodations_by_day;
        }
        console.log('Parsed accommodations_by_day:', accommodationsByDay);
        
        // Try to find accommodation by date (format: YYYY-MM-DD)
        const dateKey = dateString.split('/').reverse().join('-'); // Convert DD/MM/YYYY to YYYY-MM-DD
        console.log('Looking for accommodation for date:', dateKey);
        console.log('Available dates in accommodations_by_day:', Object.keys(accommodationsByDay));
        const dayAccommodations = accommodationsByDay[dateKey];
        console.log('Found accommodations for this date:', dayAccommodations);
        
        if (dayAccommodations && dayAccommodations.length > 0) {
          const accommodation = dayAccommodations[0]; // Get first accommodation for the day
          const vendorId = accommodation.vendor;
          console.log('Looking for vendor ID:', vendorId);
          
          // Check if vendor is already enhanced (contains vendor name instead of ID)
          if (typeof vendorId === 'string' && vendorId !== 'Unknown Vendor') {
            // Vendor is already enhanced with name, find the full vendor details
            let vendor = null;
            
            if (tripData.allAccommodationVendors) {
              vendor = tripData.allAccommodationVendors.find(v => v.title === vendorId);
            }
            
            if (vendor) {
              console.log('Found vendor by name:', vendor);
              return {
                ...vendor,
                startTime: accommodation.startTime,
                endTime: accommodation.endTime
              };
            }
            
            // If vendor not found by name, return basic info
            return {
              id: 'unknown',
              title: vendorId,
              phone: 'N/A',
              address: 'Address not available',
              startTime: accommodation.startTime,
              endTime: accommodation.endTime
            };
          } else {
            // Vendor is still an ID, find vendor details by ID
            let vendor = null;
            
            // Try different possible vendor data structures
            if (tripData.allAccommodationVendors) {
              vendor = tripData.allAccommodationVendors.find(v => v.id === vendorId);
            }
            
            // If not found, try other possible structures
            if (!vendor && tripData.accommodationVendors) {
              vendor = tripData.accommodationVendors.find(v => v.id === vendorId);
            }
            
            // If still not found, try to get from the main accommodation vendor if it matches
            if (!vendor && tripData.accommodationVendor && tripData.accommodationVendor.id === vendorId) {
              vendor = tripData.accommodationVendor;
            }
            
            if (vendor) {
              console.log('Found vendor by ID:', vendor);
              return {
                ...vendor,
                startTime: accommodation.startTime,
                endTime: accommodation.endTime
              };
            }
            
            console.log('Vendor not found for ID:', vendorId);
            
            // If vendor not found, return basic info with vendor ID
            return {
              id: vendorId,
              title: `Vendor ${vendorId}`,
              phone: 'N/A',
              address: 'Address not available',
              startTime: accommodation.startTime,
              endTime: accommodation.endTime
            };
          }
        }
      }
      
      // Fallback to general accommodation vendor
      if (tripData.accommodationVendor) {
        return tripData.accommodationVendor;
      }
      
      // If no database data, return null
      console.log('No accommodation data found for day:', dayNumber);
      return null;
    } catch (error) {
      console.error('Error parsing accommodations_by_day:', error);
      return null;
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedVendor(null);
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    console.log('Selected vendor:', vendor);
  };

  const handleCheckInOut = (dayString, category, action) => {
    setCheckInOutData(prev => ({
      ...prev,
      [dayString]: {
        ...prev[dayString],
        [category]: {
          ...prev[dayString][category],
          [action === 'checkIn' ? 'checkedIn' : 'checkedOut']: true,
          time: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        }
      }
    }));
  };

  const handleEventCheckInOut = (eventKey, action) => {
    console.log('Event check-in/out:', eventKey, action);
    setCheckInOutData(prev => ({
      ...prev,
      [eventKey]: {
        ...prev[eventKey],
        [action === 'checkIn' ? 'checkedIn' : 'checkedOut']: true,
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      }
    }));
  };

  const formatTimeToAMPM = (timeString) => {
    if (!timeString || timeString === 'N/A' || timeString === 'null' || timeString === 'undefined') {
      return 'N/A';
    }
    
    try {
      // Clean the time string
      let cleanTime = timeString.toString().trim();
      
      // Handle different time formats
      let time;
      
      if (cleanTime.includes('T')) {
        // ISO format: "2000-01-01T09:30:00.000Z"
        time = new Date(cleanTime);
      } else if (cleanTime.includes(':')) {
        // Time format: "09:30" or "09:30:00"
        const timeParts = cleanTime.split(':');
        if (timeParts.length >= 2) {
          const hours = parseInt(timeParts[0]);
          const minutes = parseInt(timeParts[1]);
          
          // Validate hours and minutes
          if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            time = new Date();
            time.setHours(hours, minutes, 0, 0);
          } else {
            return 'N/A';
          }
        } else {
          return 'N/A';
        }
      } else if (cleanTime.match(/^\d{1,2}$/)) {
        // Just hours: "14" or "9"
        const hours = parseInt(cleanTime);
        if (hours >= 0 && hours <= 23) {
          time = new Date();
          time.setHours(hours, 0, 0, 0);
        } else {
          return 'N/A';
        }
      } else {
        return 'N/A';
      }
      
      // Check if time is valid
      if (isNaN(time.getTime())) {
        return 'N/A';
      }
      
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error, 'Input:', timeString);
      return 'N/A';
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleDescriptionClick = (title, description) => {
    setDescriptionModal({
      open: true,
      title: title,
      description: description
    });
  };

  const handleCloseDescriptionModal = () => {
    setDescriptionModal({
      open: false,
      title: '',
      description: ''
    });
  };

  const handleScan = () => {
    // Implement QR code scanning functionality
    console.log('Starting QR code scan...');
    // Add actual QR scanner implementation here
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading trip data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>Back to Dashboard</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="600" color="text.primary">
          {tripData?.title || tripTitle || `Trip ID: ${tripId}`}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Transport" />
          <Tab label="Accommodation" />
          <Tab label="Events" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Transport Details</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tripDays.map((day) => (
                  <TableRow key={day.dateString}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="600">
                        Day {day.dayNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {day.dateString}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const dayTransport = getTransportForDay(day.dayNumber, day.dateString);
                        console.log('Day transport data for', day.dateString, ':', dayTransport);
                        
                        if (dayTransport?.vendor) {
                          return (
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {dayTransport.vendor.title || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Phone: {dayTransport.vendor.phone || 'N/A'}
                              </Typography>
                              {dayTransport.buses && dayTransport.buses.length > 0 && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Bus: {dayTransport.buses.map(bus => bus.title || bus.bus_number || bus.name || `Bus ${bus.id}`).join(', ')}
                                </Typography>
                              )}
                            </Box>
                          );
                        } else if (tripData?.transportVendor) {
                          return (
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {tripData.transportVendor.title || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Phone: {tripData.transportVendor.phone || 'N/A'}
                              </Typography>
                            </Box>
                          );
                        } else {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              No transport assigned
                            </Typography>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const dayTransport = getTransportForDay(day.dayNumber, day.dateString);
                        
                        if (dayTransport?.drivers && dayTransport.drivers.length > 0) {
                          return (
                            <Box>
                              {dayTransport.drivers.map((driver, index) => (
                                <Typography key={index} variant="body2">
                                  {driver.first_name || driver.firstName || driver.name || 'Driver'} {driver.last_name || driver.lastName || ''}
                                </Typography>
                              ))}
                            </Box>
                          );
                        } else if (tripData?.driver) {
                          return (
                            <Typography variant="body2">
                              {tripData.driver.first_name} {tripData.driver.last_name}
                            </Typography>
                          );
                        } else {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              No driver assigned
                            </Typography>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={checkInOutData[day.dateString]?.transport?.checkedIn ? 'Checked In' : 'Available'} 
                        color={checkInOutData[day.dateString]?.transport?.checkedIn ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                          Trip Manager: {tripData?.tripManager?.name || 'Trip Manager'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant={checkInOutData[day.dateString]?.transport?.checkedIn ? 'contained' : 'outlined'}
                            color="success"
                            startIcon={<CheckInIcon />}
                            onClick={() => handleCheckInOut(day.dateString, 'transport', 'checkIn')}
                            disabled={checkInOutData[day.dateString]?.transport?.checkedIn}
                          >
                            Check In
                          </Button>
                          <Button
                            size="small"
                            variant={checkInOutData[day.dateString]?.transport?.checkedOut ? 'contained' : 'outlined'}
                            color="error"
                            startIcon={<CheckOutIcon />}
                            onClick={() => handleCheckInOut(day.dateString, 'transport', 'checkOut')}
                            disabled={checkInOutData[day.dateString]?.transport?.checkedOut}
                          >
                            Check Out
                          </Button>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Accommodation Details</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tripDays.map((day) => (
                  <TableRow key={day.dateString}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="600">
                        Day {day.dayNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {day.dateString}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const dayAccommodation = getAccommodationForDay(day.dayNumber, day.dateString);
                        if (dayAccommodation) {
                          return (
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {dayAccommodation.title}
                              </Typography>
                          <Typography variant="caption" color="text.secondary">
                                Phone: {dayAccommodation.phone || 'N/A'}
                          </Typography>
                      </Box>
                          );
                        } else {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              No accommodation assigned
                            </Typography>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const dayAccommodation = getAccommodationForDay(day.dayNumber, day.dateString);
                        if (dayAccommodation && dayAccommodation.address) {
                          return (
                            <Typography variant="body2">
                              {dayAccommodation.address}
                            </Typography>
                          );
                        } else {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              Address not available
                            </Typography>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={checkInOutData[day.dateString]?.accommodation?.checkedIn ? 'Checked In' : 'Available'} 
                        color={checkInOutData[day.dateString]?.accommodation?.checkedIn ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                          Trip Manager: {tripData?.tripManager?.name || 'Trip Manager'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant={checkInOutData[day.dateString]?.accommodation?.checkedIn ? 'contained' : 'outlined'}
                            color="success"
                            startIcon={<CheckInIcon />}
                            onClick={() => handleCheckInOut(day.dateString, 'accommodation', 'checkIn')}
                            disabled={checkInOutData[day.dateString]?.accommodation?.checkedIn}
                          >
                            Check In
                          </Button>
                          <Button
                            size="small"
                            variant={checkInOutData[day.dateString]?.accommodation?.checkedOut ? 'contained' : 'outlined'}
                            color="error"
                            startIcon={<CheckOutIcon />}
                            onClick={() => handleCheckInOut(day.dateString, 'accommodation', 'checkOut')}
                            disabled={checkInOutData[day.dateString]?.accommodation?.checkedOut}
                          >
                            Check Out
                          </Button>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Event Details & Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tripDays.map((day) => {
                  const dayEvents = getEventsForDay(day.dayNumber, day.dateString);
                  console.log('Day events for', day.dateString, ':', dayEvents);
                  
                  return (
                    <TableRow key={day.dateString}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="600">
                          Day {day.dayNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {day.dateString}
          </Typography>
                      </TableCell>
                      <TableCell>
                        {dayEvents && dayEvents.length > 0 ? (
                          <Box>
                            {dayEvents.map((event, index) => {
                              const eventKey = `${day.dateString}_event_${index}`;
                              const eventCheckData = checkInOutData[eventKey] || { checkedIn: false, checkedOut: false };
                              
                              return (
                                <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                  <Typography variant="body2" fontWeight="600">
                                    {event.title || event.name || 'Event'}
          </Typography>
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary" 
                                    display="block"
            sx={{
                                      cursor: (event.description && event.description.length > 50) ? 'pointer' : 'default',
                                      '&:hover': (event.description && event.description.length > 50) ? {
                                        color: 'primary.main',
                                        textDecoration: 'underline'
                                      } : {}
                                    }}
                                    onClick={() => {
                                      if (event.description && event.description.length > 50) {
                                        handleDescriptionClick(
                                          event.title || event.name || 'Event',
                                          event.description
                                        );
                                      }
                                    }}
                                  >
                                    {(() => {
                                      const description = event.description || 'No description';
                                      if (description.length > 50) {
                                        return description.substring(0, 50) + '...';
                                      }
                                      return description;
                                    })()}
            </Typography>
                                  
                                  {/* Time display within the event card */}
                                  <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
                                    gap: 1, 
                                    mt: 1,
                                    p: 1,
                                    border: '1px dashed #ccc',
                                    borderRadius: 1,
                                    backgroundColor: '#f9f9f9'
                                  }}>
                                    <Typography variant="body2" sx={{ 
                                      fontFamily: 'monospace',
                                      fontSize: '0.875rem',
                                      fontWeight: 500,
                                      color: 'primary.main'
                                    }}>
                                      {(() => {
                                        const startTime = formatTimeToAMPM(event.startTime || event.start_time);
                                        const endTime = formatTimeToAMPM(event.endTime || event.end_time);
                                        
                                        if (startTime !== 'N/A' && endTime !== 'N/A') {
                                          return `${startTime} - ${endTime}`;
                                        } else if (startTime !== 'N/A') {
                                          return `From ${startTime}`;
                                        } else if (endTime !== 'N/A') {
                                          return `Until ${endTime}`;
                                        } else {
                                          return 'Time TBD';
                                        }
                                      })()}
            </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Button
                                      size="small"
                                      variant={eventCheckData.checkedIn ? 'contained' : 'outlined'}
                                      color="success"
                                      startIcon={<CheckInIcon />}
                                      onClick={() => handleEventCheckInOut(eventKey, 'checkIn')}
                                      disabled={eventCheckData.checkedIn}
                                      sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
                                    >
                                      Check In
                                    </Button>
            <Button
                                      size="small"
                                      variant={eventCheckData.checkedOut ? 'contained' : 'outlined'}
                                      color="error"
                                      startIcon={<CheckOutIcon />}
                                      onClick={() => handleEventCheckInOut(eventKey, 'checkOut')}
                                      disabled={eventCheckData.checkedOut}
                                      sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
                                    >
                                      Check Out
            </Button>
          </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No events scheduled
                          </Typography>
                        )}
                      </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Description Modal */}
      <Dialog 
        open={descriptionModal.open} 
        onClose={handleCloseDescriptionModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {descriptionModal.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {descriptionModal.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDescriptionModal} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScannerPage;
