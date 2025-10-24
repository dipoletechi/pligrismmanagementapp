import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';
import { API_ENDPOINTS } from '@/constants/config';

// Trip details interface based on API response
interface TripDetails {
  id: number;
  title: string;
  description: string | null;
  destination: string;
  start_date: string;
  end_date: string;
  budget: string | null;
  created_by: number;
  destination_id: number | null;
  bus_id: number | null;
  driver_id: number | null;
  boarding_details: string | null;
  checklist_items: string | null;
  accommodation_vendor_id: number | null;
  food_vendor_id: number | null;
  transport_vendor_id: number | null;
  transport_vendor_name?: string;
  accommodationVendor?: { title: string; address?: string; phone?: string };
  foodVendor?: { title: string; address?: string; phone?: string };
  transportVendor?: { title: string; address?: string; phone?: string };
  allFoodVendors?: Array<{ id: number; title: string; address?: string; phone?: string }>;
  allFoodCategories?: Array<{ id: number; title: string }>;
  allFoodItems?: Array<{ id: number; title: string }>;
  allAccommodationVendors?: Array<{ id: number; title: string }>;
  selected_drivers: string;
  selected_conductors: string;
  selected_buses: string;
  selected_drivers_details?: any[];
  selected_conductors_details?: any[];
  selected_buses_details?: any[];
  drivers_by_day: string | any;
  conductors_by_day: string | any;
  buses_by_day: string | any;
  vendors_by_day: string;
  time_by_day: string;
  accommodations_by_day: string;
  selected_accommodation_vendor: string;
  selected_accommodation_start_time: string;
  selected_accommodation_end_time: string;
  selected_food_vendors: string;
  food_vendors_by_day: string;
  selected_food_schedules: string;
  selected_food_categories: string;
  selected_food_items: string;
  food_schedules_by_day: string;
  food_categories_by_day: string;
  food_items_by_day: string;
  all_days_food_entries: string;
  events_by_day: string;
  all_days_events: string;
  selected_event_title: string;
  selected_event_description: string;
  selected_event_start_time: string;
  selected_event_end_time: string;
  finance_data: string;
  use_all_days_selection: boolean;
  createdAt: string;
  updatedAt: string;
  trip_status_id: number;
  destinationInfo: any;
  bus: any;
  driver: any;
  tripStatus: {
    id: number;
    name: string;
    description: string;
  };
}

interface AccommodationEntry {
  id: number;
  vendor: number | string;
  vendorName?: string;
  startTime: string | null;
  endTime: string | null;
}

export default function TripDetailsScreen() {
  const { t } = useLanguage();
  const { id, fromMyTrips, applicationStatus, tripEndDate, tripStatusName, tripTitle } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('Details');
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<any>(null);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success'
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState(false);

  // Check if trip is eligible for feedback
  const isTripEligibleForFeedback = () => {
    // Must come from My Trips
    if (fromMyTrips !== 'true') return false;
    
    // Check if application is approved
    const isApproved = applicationStatus === 'Approved';
    
    // Check if trip is past (end date is before or equal to today OR status is Completed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripEnd = new Date(tripEndDate as string);
    tripEnd.setHours(0, 0, 0, 0);
    const isPast = tripEnd <= today || tripStatusName === 'Completed';
    
    // Debug log
    console.log('Trip Details - Feedback eligibility check:', {
      fromMyTrips,
      isApproved,
      applicationStatus,
      isPast,
      tripEndDate,
      tripEnd: tripEnd.toDateString(),
      today: today.toDateString(),
      tripStatusName,
      eligible: isApproved && isPast
    });
    
    return isApproved && isPast;
  };

  // Check login status
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Check if user came from redirect (dashboard) - means they are logged in
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userPassword = await AsyncStorage.getItem('userPassword');
        
        // If user has credentials in AsyncStorage, they are logged in
        // OR if they came from dashboard redirect, they are logged in
        const hasCredentials = !!(userEmail && userPassword);
        
        setIsLoggedIn(hasCredentials);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  // Check if user has already applied for this trip
  const checkExistingApplication = async () => {
    // Note: The actual check is now done when submitting application
    // Backend will return error if application already exists
  };

  // Fetch trip details from API
  const fetchTripDetails = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_ENDPOINTS.MOBILE}/trips/${id}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTripDetails(data.data);
    } catch (err) {
      clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trip details';
      setError(errorMessage);
      
      // Show error toast
      setToast({
        visible: true,
        message: errorMessage,
        type: 'error'
      });
      
      // Hide toast after 5 seconds
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTripDetails();
      checkExistingApplication();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
  } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const parseAccommodationsByDay = () => {
    if (!tripDetails?.accommodations_by_day) return {};
    try {
      // If it's already an object, return it directly
      if (typeof tripDetails.accommodations_by_day === 'object') {
        return tripDetails.accommodations_by_day;
      }
      // If it's a string, parse it
      return JSON.parse(tripDetails.accommodations_by_day);
    } catch (error) {
      return {};
    }
  };

  const parseFoodVendorsByDay = () => {
    if (!tripDetails?.food_vendors_by_day) return {};
    try {
      // If it's already an object, return it directly
      if (typeof tripDetails.food_vendors_by_day === 'object') {
        return tripDetails.food_vendors_by_day;
      }
      // If it's a string, parse it
      return JSON.parse(tripDetails.food_vendors_by_day);
    } catch (error) {
      console.error('Error parsing food_vendors_by_day:', error)
      return {};
    }
  };

  const parseEventsByDay = () => {
    if (!tripDetails?.events_by_day) return {};
    try {
      return JSON.parse(tripDetails.events_by_day);
    } catch (error) {
      console.error('Error parsing events_by_day:', error);
      return {};
    }
  };

  const translateEventTitle = (title: string) => {
    const titleMap: { [key: string]: string } = {
      'Onboarding Bus': t('onboardingBus'),
      'Hotel Checkin': t('hotelCheckin'),
      'Ganga Visit': t('gangaVisit'),
      'Temple Visit': t('templeVisit'),
    };
    return titleMap[title] || title;
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    
    try {
      // Check if it's already in 12-hour format (contains AM/PM)
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
      }
      
      // Parse 24-hour format and convert to 12-hour
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours, 10);
      const mins = minutes || '00';
      
      if (hour24 === 0) {
        return `12:${mins} AM`;
      } else if (hour24 < 12) {
        return `${hour24}:${mins} AM`;
      } else if (hour24 === 12) {
        return `12:${mins} PM`;
      } else {
        return `${hour24 - 12}:${mins} PM`;
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString; // Return original if parsing fails
    }
  };


  const renderDetailsTab = () => {
    if (!tripDetails) return null;

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('tripTitle')}</Text>
            <Text style={styles.detailValue}>{tripDetails.title}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('description')}</Text>
            <Text style={styles.detailValue}>
              {tripDetails.description || 'No description available'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('startDate')}</Text>
            <Text style={styles.detailValue}>{formatDateTime(tripDetails.start_date)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('endDate')}</Text>
            <Text style={styles.detailValue}>{formatDateTime(tripDetails.end_date)}</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderAccommodationTab = () => {
    const accommodationsByDay = parseAccommodationsByDay();
    const days = Object.keys(accommodationsByDay).sort();

    // Check for all-days accommodation data
    const hasAllDaysAccommodation = tripDetails?.selected_accommodation_vendor || 
                                    tripDetails?.accommodation_vendor_id;
    
    // Smart fallback: if no day-wise data but has all-days data, show all-days
    const hasDayWiseAccommodation = days.length > 0;
    const showAllDays = !hasDayWiseAccommodation && hasAllDaysAccommodation;

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.accommodationContainer}>
          {showAllDays ? (
            <>
              <Text style={styles.instructionText}>
                {t('allDaysTransport').replace('transport', 'accommodation')}
              </Text>
              
              <View style={styles.transportSection}>
                <Text style={styles.sectionTitle}>{t('accommodation')}</Text>
                <View style={styles.accommodationBox}>
                  <View style={styles.tagsContainer}>
                    <View style={[styles.tag, styles.vendorTag]}>
                      <Text style={styles.tagText}>
                        {(() => {
                          // Try to get vendor name from accommodationVendor object first
                          if (tripDetails?.accommodationVendor?.title) {
                            return tripDetails.accommodationVendor.title;
                          }
                          // If selected_accommodation_vendor is an ID, convert to name
                          if (tripDetails?.selected_accommodation_vendor) {
                            const vendorId = parseInt(tripDetails.selected_accommodation_vendor);
                            if (!isNaN(vendorId)) {
                              const vendor = tripDetails?.allAccommodationVendors?.find((v: any) => v.id === vendorId);
                              return vendor?.title || tripDetails.selected_accommodation_vendor;
                            }
                            return tripDetails.selected_accommodation_vendor;
                          }
                          return 'N/A';
                        })()}
                      </Text>
                    </View>
                    {tripDetails?.selected_accommodation_start_time && (
                      <View style={[styles.tag, styles.timeTag]}>
                        <Text style={styles.tagText}>
                          {tripDetails.selected_accommodation_start_time}
                        </Text>
                      </View>
                    )}
                    {tripDetails?.selected_accommodation_end_time && (
                      <View style={[styles.tag, styles.timeTag]}>
                        <Text style={styles.tagText}>
                          {tripDetails.selected_accommodation_end_time}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.instructionText}>
                {t('selectAccommodation')}
              </Text>
              
              {days.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="bed-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>{t('noAccommodationData')}</Text>
                </View>
              ) : (
            <View style={styles.daysContainer}>
              {days.map((day, index) => {
                const dayNumber = index + 1;
                const dayName = new Date(day).toLocaleDateString('en-IN', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
                const accommodations = accommodationsByDay[day] as AccommodationEntry[];
                
                return (
                  <View key={day} style={styles.daySection}>
                    <Text style={styles.dayTitle}>
                      Day{dayNumber} - {dayName}
                    </Text>
                    
                    <View style={styles.accommodationBoxesContainer}>
                      {accommodations.map((accommodation) => (
                        <View key={accommodation.id} style={styles.accommodationBox}>
                          <View style={styles.tagsContainer}>
                            <View style={[styles.tag, styles.vendorTag]}>
                              <Text style={styles.tagText}>{t('vendor')} {accommodation.vendorName || accommodation.vendor}</Text>
                            </View>
                            <View style={[styles.tag, styles.timeTag]}>
                              <Text style={styles.tagText}>
                                {accommodation.startTime ? 
                                  new Date(accommodation.startTime).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  }) : t('noStartTime')
                                }
                              </Text>
                            </View>
                            <View style={[styles.tag, styles.timeTag]}>
                              <Text style={styles.tagText}>
                                {accommodation.endTime ? 
                                  new Date(accommodation.endTime).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  }) : t('noEndTime')
                                }
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderFoodTab = () => {
    const foodVendorsByDay = parseFoodVendorsByDay();
    const days = Object.keys(foodVendorsByDay).sort();

    // Check for all-days food data
    const hasAllDaysFood = tripDetails?.selected_food_vendors || 
                          tripDetails?.food_vendor_id ||
                          (tripDetails?.all_days_food_entries && 
                           tripDetails.all_days_food_entries !== '[]' &&
                           tripDetails.all_days_food_entries !== '');
    
    // Smart fallback: if no day-wise data but has all-days data, show all-days
    const hasDayWiseFood = days.length > 0;
    const showAllDays = !hasDayWiseFood && hasAllDaysFood;

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.foodContainer}>
          {showAllDays ? (
            <>
              <Text style={styles.instructionText}>
                {t('allDaysTransport').replace('transport', 'food')}
              </Text>
              
              <View style={styles.transportSection}>
                <Text style={styles.sectionTitle}>{t('food')}</Text>
                
                {/* Parse and display all_days_food_entries */}
                {(() => {
                  try {
                    let allDaysFoodEntries = [];
                    if (tripDetails?.all_days_food_entries) {
                      allDaysFoodEntries = typeof tripDetails.all_days_food_entries === 'string' 
                        ? JSON.parse(tripDetails.all_days_food_entries)
                        : tripDetails.all_days_food_entries;
                    }
                    
                    if (Array.isArray(allDaysFoodEntries) && allDaysFoodEntries.length > 0) {
                      return allDaysFoodEntries.map((entry: any, index: number) => {
                        // Get vendor names from IDs
                        const vendorNames = entry.vendors?.map((vendorId: number) => {
                          const vendor = tripDetails?.allFoodVendors?.find((v: any) => v.id === vendorId);
                          return vendor?.title || `Vendor ${vendorId}`;
                        }) || [];
                        
                        // Get schedule names
                        const scheduleNames = entry.schedules?.map((scheduleId: number) => {
                          const scheduleMap: any = { 1: t('breakfast'), 2: t('lunch'), 3: t('dinner') };
                          return scheduleMap[scheduleId] || `Schedule ${scheduleId}`;
                        }) || [];
                        
                        // Get category names from IDs
                        const categoryNames = entry.categories?.map((categoryId: number) => {
                          const category = tripDetails?.allFoodCategories?.find((c: any) => c.id === categoryId);
                          return category?.title || `Category ${categoryId}`;
                        }) || [];
                        
                        // Get item names from IDs
                        const itemNames = entry.items?.map((itemId: number) => {
                          const item = tripDetails?.allFoodItems?.find((i: any) => i.id === itemId);
                          return item?.title || `Item ${itemId}`;
                        }) || [];
                        
                        return (
                          <TouchableOpacity 
                            key={index}
                            style={styles.foodButton}
                            onPress={() => {
                              const foodData = {
                                ...entry,
                                vendorNames,
                                scheduleNames,
                                categoryNames,
                                itemNames
                              };
                              console.log('Selected Food Item:', foodData);
                              setSelectedFoodItem(foodData);
                              setFoodModalVisible(true);
                            }}
                          >
                            <Text style={styles.foodButtonText}>
                              {scheduleNames.join(', ') || t('food')}
                            </Text>
                            <Text style={styles.foodButtonSubtext}>
                              {t('vendor')} {vendorNames.join(', ')}
                            </Text>
                          </TouchableOpacity>
                        );
                      });
                    }
                    
                    // Fallback to simple vendor display
                    if (tripDetails?.foodVendor?.title) {
                      return (
                        <View style={styles.infoCard}>
                          <Text style={styles.infoValue}>
                            {t('vendor')}: {tripDetails.foodVendor.title}
                          </Text>
                        </View>
                      );
                    }
                    
                    return (
                      <View style={styles.infoCard}>
                        <Text style={styles.infoValue}>
                          {t('food')} configured for all days
                        </Text>
                      </View>
                    );
                  } catch (e) {
                    console.error('Error parsing all_days_food_entries:', e);
                    return (
                      <View style={styles.infoCard}>
                        <Text style={styles.infoValue}>
                          {t('food')} data available
                        </Text>
                      </View>
                    );
                  }
                })()}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.instructionText}>
                {t('selectFood')}
              </Text>
              
              {days.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="restaurant-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>{t('noFoodData')}</Text>
                </View>
              ) : (
            <View style={styles.daysContainer}>
              {days.map((day, index) => {
                const dayNumber = index + 1;
                const dayName = new Date(day).toLocaleDateString('en-IN', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
                const foodEntries = foodVendorsByDay[day];
                
                return (
                  <View key={day} style={styles.dayColumn}>
                    <Text style={styles.dayTitle}>{t('day')} {dayNumber} - {dayName}</Text>
                    
                    {foodEntries.map((entry: any, entryIndex: number) => {
                      const mealType = entry.scheduleNames?.[0] || 
                                     (entry.schedules?.includes(1) ? t('breakfast') : 
                                      entry.schedules?.includes(2) ? t('lunch') : 
                                      entry.schedules?.includes(3) ? t('dinner') : 'Food');
                      
                      return (
                        <TouchableOpacity 
                          key={entryIndex} 
                          style={styles.foodButton}
                          onPress={() => {
                            setSelectedFoodItem(entry);
                            setFoodModalVisible(true);
                          }}
                        >
                          <Text style={styles.foodButtonText}>{mealType}</Text>
                          <Text style={styles.foodButtonSubtext}>
                            {t('vendor')} {entry.vendorNames?.[0] || entry.vendors?.[0] || 'N/A'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderEventsTab = () => {
    const eventsByDay = parseEventsByDay();
    const days = Object.keys(eventsByDay).sort();

    // Check for all-days events data
    const hasAllDaysEvents = tripDetails?.selected_event_title || 
                            (tripDetails?.all_days_events && 
                             tripDetails.all_days_events !== '[]' &&
                             tripDetails.all_days_events !== '');
    
    // Smart fallback: if no day-wise data but has all-days data, show all-days
    const hasDayWiseEvents = days.length > 0;
    const showAllDays = !hasDayWiseEvents && hasAllDaysEvents;

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.eventsContainer}>
          {showAllDays ? (
            <>
              <Text style={styles.instructionText}>
                {t('allDaysTransport').replace('transport', 'events')}
              </Text>
              
              <View style={styles.transportSection}>
                <Text style={styles.sectionTitle}>{t('events')}</Text>
                
                {/* Parse and display all_days_events */}
                {(() => {
                  try {
                    let allDaysEvents = [];
                    if (tripDetails?.all_days_events) {
                      allDaysEvents = typeof tripDetails.all_days_events === 'string' 
                        ? JSON.parse(tripDetails.all_days_events)
                        : tripDetails.all_days_events;
                    }
                    
                    if (Array.isArray(allDaysEvents) && allDaysEvents.length > 0) {
                      return allDaysEvents.map((event: any, index: number) => (
                        <View key={index} style={styles.eventCard}>
                          <View style={styles.eventHeader}>
                            <Text style={styles.eventTitle}>
                              {translateEventTitle(event.title)}
                            </Text>
                          </View>
                          
                          {event.description && (
                            <Text style={styles.eventDescription}>
                              {event.description}
                            </Text>
                          )}
                          
                          <View style={styles.eventTimes}>
                            {event.startTime && (
                              <View style={styles.timeItem}>
                                <Text style={styles.timeLabel}>{t('startTime')}</Text>
                                <Text style={styles.timeValue}>
                                  {formatTime(event.startTime)}
                                </Text>
                              </View>
                            )}
                            {event.endTime && (
                              <View style={styles.timeItem}>
                                <Text style={styles.timeLabel}>{t('endTime')}</Text>
                                <Text style={styles.timeValue}>
                                  {formatTime(event.endTime)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      ));
                    }
                    
                    // Fallback to single event display
                    if (tripDetails?.selected_event_title) {
                      return (
                        <View style={styles.eventCard}>
                          <View style={styles.eventHeader}>
                            <Text style={styles.eventTitle}>
                              {translateEventTitle(tripDetails.selected_event_title)}
                            </Text>
                          </View>
                          
                          {tripDetails.selected_event_description && (
                            <Text style={styles.eventDescription}>
                              {tripDetails.selected_event_description}
                            </Text>
                          )}
                          
                          <View style={styles.eventTimes}>
                            {tripDetails.selected_event_start_time && (
                              <View style={styles.timeItem}>
                                <Text style={styles.timeLabel}>{t('startTime')}</Text>
                                <Text style={styles.timeValue}>
                                  {formatTime(tripDetails.selected_event_start_time)}
                                </Text>
                              </View>
                            )}
                            {tripDetails.selected_event_end_time && (
                              <View style={styles.timeItem}>
                                <Text style={styles.timeLabel}>{t('endTime')}</Text>
                                <Text style={styles.timeValue}>
                                  {formatTime(tripDetails.selected_event_end_time)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    }
                    
                    return null;
                  } catch (e) {
                    console.error('Error parsing all_days_events:', e);
                    return null;
                  }
                })()}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.instructionText}>
                {t('selectEvents')}
              </Text>
              
              {days.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>{t('noEventsData')}</Text>
                </View>
              ) : (
            <View style={styles.daysContainer}>
              {days.map((day, index) => {
                const dayNumber = index + 1;
                const dayName = new Date(day).toLocaleDateString('en-IN', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
                const events = eventsByDay[day];
                
                return (
                  <View key={day} style={styles.dayColumn}>
                    <Text style={styles.dayTitle}>{t('day')} {dayNumber} - {dayName}</Text>
                    
                    {events.map((event: any) => (
                      <View key={event.id} style={styles.eventCard}>
                        <View style={styles.eventHeader}>
                          <Text style={styles.eventTitle}>{translateEventTitle(event.title)}</Text>
                        </View>
                        
                        {event.description && (
                          <Text style={styles.eventDescription}>
                            {event.description}
                          </Text>
                        )}
                        
                        <View style={styles.eventTimes}>
                          <View style={styles.timeItem}>
                            <Text style={styles.timeLabel}>{t('startTime')}</Text>
                            <Text style={styles.timeValue}>{formatTime(event.startTime || 'N/A')}</Text>
                          </View>
                          <View style={styles.timeItem}>
                            <Text style={styles.timeLabel}>{t('endTime')}</Text>
                            <Text style={styles.timeValue}>{formatTime(event.endTime || 'N/A')}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderTransportTab = () => {
    if (!tripDetails) return null;

    // Parse transport data
    let driversByDay: any = {};
    let conductorsByDay: any = {};
    let busesByDay: any = {};
    let vendorsByDay: any = {};
    let timeByDay: any = {};
    let selectedDrivers: any[] = [];
    let selectedConductors: any[] = [];
    let selectedBuses: any[] = [];

    try {
      // Always parse all-days data
      selectedDrivers = tripDetails.selected_drivers_details || [];
      selectedConductors = tripDetails.selected_conductors_details || [];
      selectedBuses = tripDetails.selected_buses_details || [];
      
      // Always parse day-wise data
      driversByDay = tripDetails.drivers_by_day || {};
      conductorsByDay = tripDetails.conductors_by_day || {};
      busesByDay = tripDetails.buses_by_day || {};
      
      if (typeof tripDetails.vendors_by_day === 'string') {
        vendorsByDay = JSON.parse(tripDetails.vendors_by_day);
      } else {
        vendorsByDay = tripDetails.vendors_by_day || {};
      }
      
      if (typeof tripDetails.time_by_day === 'string') {
        timeByDay = JSON.parse(tripDetails.time_by_day);
      } else {
        timeByDay = tripDetails.time_by_day || {};
      }
    } catch (e) {
      console.error('Error parsing transport data:', e);
    }

    // Smart detection: If use_all_days_selection is false but day-wise data is empty
    // and all-days data exists, then show all-days data (fallback)
    const hasDayWiseData = Object.keys(driversByDay).length > 0 || 
                           Object.keys(conductorsByDay).length > 0 || 
                           Object.keys(busesByDay).length > 0 ||
                           Object.keys(vendorsByDay).length > 0;
    
    const hasAllDaysData = selectedDrivers.length > 0 || 
                           selectedConductors.length > 0 || 
                           selectedBuses.length > 0 ||
                           tripDetails.transport_vendor_name;
    
    // Use all days display if:
    // 1. Explicitly set to use_all_days_selection, OR
    // 2. No day-wise data but has all-days data (fallback)
    const useAllDays = tripDetails.use_all_days_selection || (!hasDayWiseData && hasAllDaysData);

    // Generate days array based on actual day-wise data
    const days: string[] = [];
    if (!useAllDays && hasDayWiseData && Object.keys(driversByDay).length > 0) {
      const dayKeys = Object.keys(driversByDay);
      dayKeys.forEach(key => days.push(key));
    } else if (tripDetails.start_date && tripDetails.end_date) {
      const start = new Date(tripDetails.start_date);
      const end = new Date(tripDetails.end_date);
      let current = new Date(start);
      let dayNum = 1;
      
      while (current <= end) {
        days.push(`Day ${dayNum}`);
        current.setDate(current.getDate() + 1);
        dayNum++;
      }
    }

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.transportContainer}>
          {useAllDays ? (
            <>
              <Text style={styles.instructionText}>
                {t('allDaysTransport')}
              </Text>
              
              {/* Transport Vendor */}
              {tripDetails.transport_vendor_name && (
                <View style={styles.transportSection}>
                  <Text style={styles.sectionTitle}>{t('transportVendor')}</Text>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoValue}>{tripDetails.transport_vendor_name}</Text>
                  </View>
                </View>
              )}

              {/* All Days Drivers */}
              {selectedDrivers && selectedDrivers.length > 0 && (
                <View style={styles.transportSection}>
                  <Text style={styles.sectionTitle}>{t('driver')}</Text>
                  {selectedDrivers.map((driver: any, index: number) => (
                    <View key={index} style={styles.transportCard}>
                      <View style={styles.transportHeader}>
                        <Ionicons name="person" size={20} color="#2196F3" />
                        <Text style={styles.transportName}>{driver.name}</Text>
                      </View>
                      <View style={styles.transportDetails}>
                        <Text style={styles.transportDetailText}>
                          {t('phone')}: {driver.phone || 'N/A'}
                        </Text>
                        <Text style={styles.transportDetailText}>
                          {t('license')}: {driver.license || 'N/A'}
                        </Text>
                        {driver.vendor && (
                          <Text style={styles.transportDetailText}>
                            {t('vendor')}: {driver.vendor}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* All Days Conductors */}
              {selectedConductors && selectedConductors.length > 0 && (
                <View style={styles.transportSection}>
                  <Text style={styles.sectionTitle}>{t('conductor')}</Text>
                  {selectedConductors.map((conductor: any, index: number) => (
                    <View key={index} style={styles.transportCard}>
                      <View style={styles.transportHeader}>
                        <Ionicons name="person-outline" size={20} color="#4CAF50" />
                        <Text style={styles.transportName}>{conductor.name}</Text>
                      </View>
                      <View style={styles.transportDetails}>
                        <Text style={styles.transportDetailText}>
                          {t('phone')}: {conductor.phone || 'N/A'}
                        </Text>
                        {conductor.vendor && (
                          <Text style={styles.transportDetailText}>
                            {t('vendor')}: {conductor.vendor}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* All Days Buses */}
              {selectedBuses && selectedBuses.length > 0 && (
                <View style={styles.transportSection}>
                  <Text style={styles.sectionTitle}>{t('bus')}</Text>
                  {selectedBuses.map((bus: any, index: number) => (
                    <View key={index} style={styles.transportCard}>
                      <View style={styles.transportHeader}>
                        <Ionicons name="bus" size={20} color="#FF9800" />
                        <Text style={styles.transportName}>{bus.title || `Vehicle ${bus.id}`}</Text>
                      </View>
                      <View style={styles.transportDetails}>
                        {bus.model && (
                          <Text style={styles.transportDetailText}>
                            {t('model')}: {bus.model} {bus.make || ''}
                          </Text>
                        )}
                        {bus.seats && (
                          <Text style={styles.transportDetailText}>
                            {t('seats')}: {bus.seats}
                          </Text>
                        )}
                        {bus.rcNumber && (
                          <Text style={styles.transportDetailText}>
                            {t('rcNumber')}: {bus.rcNumber}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Empty state for all days */}
              {!tripDetails.transport_vendor_name && 
               selectedDrivers.length === 0 && 
               selectedConductors.length === 0 && 
               selectedBuses.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="bus-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>{t('noTransportData')}</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.instructionText}>
                {t('selectTransport')}
              </Text>
              
              {days.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="bus-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>{t('noTransportData')}</Text>
                </View>
              ) : (
                <View style={styles.daysContainer}>
                  {days.map((day, index) => {
                    const drivers = driversByDay[day] || [];
                    const conductors = conductorsByDay[day] || [];
                    const buses = busesByDay[day] || [];
                    const vendor = vendorsByDay[day];
                    const timing = timeByDay[day];

                    return (
                      <View key={day} style={styles.daySection}>
                        <Text style={styles.dayTitle}>{day}</Text>
                        
                        {/* Vendor */}
                        {vendor && (
                          <View style={styles.dayInfoRow}>
                            <Text style={styles.dayInfoLabel}>{t('transportVendor')}:</Text>
                            <Text style={styles.dayInfoValue}>{vendor}</Text>
                          </View>
                        )}

                        {/* Timing */}
                        {timing && (
                          <View style={styles.timingRow}>
                            <View style={styles.timeItem}>
                              <Text style={styles.timeLabel}>{t('startTime')}</Text>
                              <Text style={styles.timeValue}>{timing.startTime || 'N/A'}</Text>
                            </View>
                            <View style={styles.timeItem}>
                              <Text style={styles.timeLabel}>{t('endTime')}</Text>
                              <Text style={styles.timeValue}>{timing.endTime || 'N/A'}</Text>
                            </View>
                          </View>
                        )}

                        {/* Drivers */}
                        {drivers.length > 0 && (
                          <View style={styles.transportSubSection}>
                            <Text style={styles.subSectionTitle}>{t('driver')}</Text>
                            {drivers.map((driver: any, idx: number) => (
                              <View key={idx} style={styles.transportCard}>
                                <View style={styles.transportHeader}>
                                  <Ionicons name="person" size={20} color="#2196F3" />
                                  <Text style={styles.transportName}>{driver.name}</Text>
                                </View>
                                <View style={styles.transportDetails}>
                                  <Text style={styles.transportDetailText}>
                                    {t('phone')}: {driver.phone || 'N/A'}
                                  </Text>
                                  {driver.license && (
                                    <Text style={styles.transportDetailText}>
                                      {t('license')}: {driver.license}
                                    </Text>
                                  )}
                                  {driver.vendor && (
                                    <Text style={styles.transportDetailText}>
                                      {t('vendor')}: {driver.vendor}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Conductors */}
                        {conductors.length > 0 && (
                          <View style={styles.transportSubSection}>
                            <Text style={styles.subSectionTitle}>{t('conductor')}</Text>
                            {conductors.map((conductor: any, idx: number) => (
                              <View key={idx} style={styles.transportCard}>
                                <View style={styles.transportHeader}>
                                  <Ionicons name="person-outline" size={20} color="#4CAF50" />
                                  <Text style={styles.transportName}>{conductor.name}</Text>
                                </View>
                                <View style={styles.transportDetails}>
                                  <Text style={styles.transportDetailText}>
                                    {t('phone')}: {conductor.phone || 'N/A'}
                                  </Text>
                                  {conductor.vendor && (
                                    <Text style={styles.transportDetailText}>
                                      {t('vendor')}: {conductor.vendor}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Buses */}
                        {buses.length > 0 && (
                          <View style={styles.transportSubSection}>
                            <Text style={styles.subSectionTitle}>{t('bus')}</Text>
                            {buses.map((bus: any, idx: number) => (
                              <View key={idx} style={styles.transportCard}>
                                <View style={styles.transportHeader}>
                                  <Ionicons name="bus" size={20} color="#FF9800" />
                                  <Text style={styles.transportName}>{bus.title || `Vehicle ${bus.id}`}</Text>
                                </View>
                                <View style={styles.transportDetails}>
                                  {bus.model && (
                                    <Text style={styles.transportDetailText}>
                                      {t('model')}: {bus.model} {bus.make || ''}
                                    </Text>
                                  )}
                                  {bus.seats && (
                                    <Text style={styles.transportDetailText}>
                                      {t('seats')}: {bus.seats}
                                    </Text>
                                  )}
                                  {bus.rcNumber && (
                                    <Text style={styles.transportDetailText}>
                                      {t('rcNumber')}: {bus.rcNumber}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Empty state for day */}
                        {drivers.length === 0 && conductors.length === 0 && buses.length === 0 && !vendor && (
                          <View style={styles.emptyDayState}>
                            <Text style={styles.emptyDayText}>{t('noTransportData')}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading trip details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Failed to load trip details</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTripDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderFoodModal = () => {
    if (!selectedFoodItem) return null;
    
    // Use scheduleNames if available, otherwise fall back to schedule IDs
    const modalTitle = selectedFoodItem.scheduleNames?.[0] || 
                      (selectedFoodItem.schedules?.includes(1) ? t('breakfast') : 
                       selectedFoodItem.schedules?.includes(2) ? t('lunch') : 
                       selectedFoodItem.schedules?.includes(3) ? t('dinner') : 'Food');

    return (
      <Modal
        visible={foodModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFoodModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setFoodModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Display categories as tags */}
              {selectedFoodItem.categoryNames && selectedFoodItem.categoryNames.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>{t('categories')}</Text>
                  <View style={styles.tagsContainer}>
                    {selectedFoodItem.categoryNames.map((category: string, index: number) => (
                      <View key={index} style={[styles.tag, styles.categoryTag]}>
                        <Text style={styles.tagText}>{category}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Display all items in one list */}
              {selectedFoodItem.itemNames && selectedFoodItem.itemNames.length > 0 && (
                <View style={styles.categoryGroup}>
                  <View style={styles.categoryHeader}>
                    <Ionicons name="restaurant" size={20} color="#fff" />
                    <Text style={styles.categoryTitle}>{t('items')}</Text>
                  </View>
                  <View style={styles.subMenuContainer}>
                    {selectedFoodItem.itemNames.map((item: string, itemIndex: number) => (
                      <View key={itemIndex} style={styles.subMenuItem}>
                        <Ionicons name="ellipse" size={8} color="#28a745" />
                        <Text style={styles.subMenuText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {(!selectedFoodItem.categoryNames || selectedFoodItem.categoryNames.length === 0) && 
               (!selectedFoodItem.itemNames || selectedFoodItem.itemNames.length === 0) && (
                <Text style={styles.noDataText}>No food data available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Handle Apply for Trip
  const handleApplyForTrip = async () => {
    try {
      console.log('Apply button clicked for trip:', id);
      
      // Get JWT token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', t('pleaseLoginToApply'));
        return;
      }

      // Create trip application with JWT token
      const applicationResponse = await fetch(`${API_ENDPOINTS.TRIP_PLIGRIM}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tripid: id,
          status: 'Pending'
        }),
      });

      const applicationData = await applicationResponse.json();
      
      console.log('Trip application response:', applicationData);

      if (applicationResponse.ok && applicationData.success) {
        Alert.alert(
          t('applicationSubmitted'), 
          t('applicationSubmittedSuccess'),
          [{ 
            text: 'OK',
            onPress: () => {
              // Navigate to My Trips page - it will auto-refresh on focus
              router.push({
                pathname: '/my-trips',
                params: { accountApproved: 'true' }
              } as any);
            }
          }]
        );
      } else {
        // Show API error message
        // Check if it's a "already exists" error
        const errorMessage = applicationData.message || '';
        const displayMessage = errorMessage.toLowerCase().includes('already exists') 
          ? t('applicationAlreadyExists')
          : (applicationData.message || t('failedToSubmitApplication'));
          
        Alert.alert(
          t('applicationFailed') || 'Application Failed', 
          displayMessage
        );
      }

    } catch (error) {
      console.error('Error applying for trip:', error);
      Alert.alert(t('networkError') || 'Network Error', t('pleaseCheckConnection') || 'Please check your internet connection');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.mainHeader}>
        <Text style={styles.headerTitle}>{t('tirthYatra')}</Text>
        <TouchableOpacity 
          style={styles.headerMenuButton}
          onPress={() => setHeaderMenuVisible(!headerMenuVisible)}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Header Dropdown Menu - Outside header for full screen overlay */}
      {headerMenuVisible && (
        <TouchableOpacity
          style={styles.headerDropdownOverlay}
          activeOpacity={1}
          onPress={() => setHeaderMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.headerDropdown}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.dropdownItem}>
              <Ionicons name="language-outline" size={20} color="#000" />
              <View style={styles.languageDropdownContainer}>
                <LanguageDropdown />
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Details' && styles.activeTab]}
          onPress={() => setActiveTab('Details')}
        >
          <Text style={[styles.tabText, activeTab === 'Details' && styles.activeTabText]}>
            {t('details')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Accommodation' && styles.activeTab]}
          onPress={() => setActiveTab('Accommodation')}
        >
          <Text style={[styles.tabText, activeTab === 'Accommodation' && styles.activeTabText]}>
            {t('accommodation')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Food' && styles.activeTab]}
          onPress={() => setActiveTab('Food')}
        >
          <Text style={[styles.tabText, activeTab === 'Food' && styles.activeTabText]}>
            {t('food')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Transport' && styles.activeTab]}
          onPress={() => setActiveTab('Transport')}
        >
          <Text style={[styles.tabText, activeTab === 'Transport' && styles.activeTabText]}>
            {t('transport')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Events' && styles.activeTab]}
          onPress={() => setActiveTab('Events')}
        >
          <Text style={[styles.tabText, activeTab === 'Events' && styles.activeTabText]}>
            {t('events')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'Details' && renderDetailsTab()}
      {activeTab === 'Accommodation' && renderAccommodationTab()}
      {activeTab === 'Food' && renderFoodTab()}
      {activeTab === 'Transport' && renderTransportTab()}
      {activeTab === 'Events' && renderEventsTab()}

      {/* Back and Apply/Feedback Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
        
        {/* Show Apply button when NOT from My Trips */}
        {isLoggedIn && fromMyTrips !== 'true' && (
          <>
            {console.log('Showing Apply button - user is logged in and not from My Trips')}
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApplyForTrip}
            >
              <Text style={styles.applyButtonText}>{t('apply')}</Text>
            </TouchableOpacity>
          </>
        )}
        
        {/* Show Feedback button when from My Trips AND trip is eligible */}
        {fromMyTrips === 'true' && isTripEligibleForFeedback() && (
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={() => {
              console.log('Opening feedback page...');
              console.log('Trip ID:', id);
              console.log('Trip Title:', tripTitle);
              
              if (!id) {
                Alert.alert('Error', 'Trip details not available');
                return;
              }
              
              router.push({
                pathname: '/feedback',
                params: {
                  tripId: id.toString(),
                  tripTitle: tripTitle || 'Trip'
                }
              } as any);
            }}
          >
            <Text style={styles.feedbackButtonText}>{t('feedback')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Fixed Footer */}
      <View style={styles.mainFooter}>
        <Text style={styles.footerText}></Text>
        <Ionicons name="help-circle-outline" size={24} color="#666" />
      </View>

      {/* Food Modal */}
      {renderFoodModal()}

      {/* Toast Notification */}
      {toast.visible && (
        <View style={[
          styles.toast,
          toast.type === 'success' ? styles.toastSuccess : styles.toastError
        ]}>
          <Ionicons 
            name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerMenuButton: {
    padding: 8,
  },
  headerDropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    backgroundColor: 'transparent',
  },
  headerDropdown: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 12,
  },
  languageDropdownContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  headerButtonText: {
    fontSize: 14,
    color: '#000',
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 0,
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    flexShrink: 1,
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff6b6b',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 16,
  },
  detailItem: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  accommodationContainer: {
    padding: 16,
  },
  foodContainer: {
    padding: 16,
  },
  eventsContainer: {
    padding: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ccc',
  },
  daysContainer: {
    gap: 20,
  },
  daySection: {
    marginBottom: 20,
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  accommodationBoxesContainer: {
    marginTop: 8,
    gap: 8,
  },
  accommodationBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'left',
  },
  accommodationCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  foodCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  foodButton: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    alignItems: 'center',
  },
  foodButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  foodButtonSubtext: {
    fontSize: 12,
    color: '#666',
  },
  eventCard: {
    backgroundColor: '#d1ecf1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  accommodationHeader: {
    marginBottom: 8,
  },
  accommodationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  foodHeader: {
    marginBottom: 8,
  },
  foodTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0c5460',
  },
  eventDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  eventTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0c5460',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  vendorTag: {
    backgroundColor: '#e3f2fd',
  },
  timeTag: {
    backgroundColor: '#e8f5e8',
  },
  categoryTag: {
    backgroundColor: '#fff3e0',
    borderColor: '#ffcc02',
  },
  itemTag: {
    backgroundColor: '#f3e5f5',
    borderColor: '#ce93d8',
  },
  tagText: {
    fontSize: 12,
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  modalSectionValue: {
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  categoryGroup: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  subMenuContainer: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  subMenuItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subMenuText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  categoryIcon: {
    marginRight: 8,
  },
  itemIcon: {
    marginRight: 8,
  },
  mainFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  // Toast styles
  toast: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  toastSuccess: {
    backgroundColor: '#28a745',
  },
  toastError: {
    backgroundColor: '#dc3545',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  // Feedback Button
  feedbackButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Feedback Modal
  feedbackModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    height: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  feedbackModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  feedbackModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  feedbackScrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  feedbackSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  feedbackSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  feedbackContent: {
    padding: 8,
    marginBottom: 16,
  },
  vendorFeedbackItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  starRatingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'center',
  },
  starIcon: {
    marginHorizontal: 4,
  },
  feedbackDescriptionBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f8f9fa',
  },
  submitFeedbackButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  submitFeedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Transport Tab Styles
  transportContainer: {
    padding: 16,
  },
  transportSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  infoValue: {
    fontSize: 14,
    color: '#495057',
  },
  transportCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 8,
  },
  transportDetails: {
    marginLeft: 28,
  },
  transportDetailText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  transportSubSection: {
    marginTop: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  dayInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
  },
  dayInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginRight: 8,
  },
  dayInfoValue: {
    fontSize: 14,
    color: '#212529',
    flex: 1,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  emptyDayState: {
    padding: 12,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
