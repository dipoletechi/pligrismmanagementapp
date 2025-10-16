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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';

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
  selected_drivers: string;
  selected_conductors: string;
  selected_buses: string;
  drivers_by_day: string;
  conductors_by_day: string;
  buses_by_day: string;
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
  const { id } = useLocalSearchParams();
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

  // Fetch trip details from API
  const fetchTripDetails = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://192.168.1.15:5000/api/mobile/trips/${id}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      console.log('Fetch response status:', response.status);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTripDetails(data.data);
      
      // Show success toast
      setToast({
        visible: true,
        message: data.message || 'Trip details loaded successfully!',
        type: 'success'
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Error fetching trip details:', err);
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
      console.error('Error parsing accommodations_by_day:', error);
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
      console.error('Error parsing food_vendors_by_day:', error);
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

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.accommodationContainer}>
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
        </View>
      </ScrollView>
    );
  };

  const renderFoodTab = () => {
    const foodVendorsByDay = parseFoodVendorsByDay();
    const days = Object.keys(foodVendorsByDay).sort();

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.foodContainer}>
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
        </View>
      </ScrollView>
    );
  };

  const renderEventsTab = () => {
    const eventsByDay = parseEventsByDay();
    const days = Object.keys(eventsByDay).sort();

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.eventsContainer}>
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
              <Text style={styles.modalTitle}>
                {selectedFoodItem.schedules?.includes(1) ? t('breakfast') : 
                 selectedFoodItem.schedules?.includes(2) ? t('lunch') : 
                 selectedFoodItem.schedules?.includes(3) ? t('dinner') : 'Food'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setFoodModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                {selectedFoodItem.categoryNames?.map((category: string, categoryIndex: number) => (
                    <View key={categoryIndex} style={styles.categoryGroup}>
                      <View style={styles.categoryHeader}>
                        <Ionicons name="restaurant" size={20} color="#fff" style={styles.categoryIcon} />
                        <Text style={styles.categoryTitle}>{category}</Text>
                      </View>
                      <View style={styles.subMenuContainer}>
                        {selectedFoodItem.itemNames?.map((item: string, itemIndex: number) => (
                          <View key={itemIndex} style={styles.subMenuItem}>
                            <Ionicons name="ellipse" size={8} color="#28a745" style={styles.itemIcon} />
                            <Text style={styles.subMenuText}>{item}</Text>
                          </View>
                        )) || <Text style={styles.noDataText}>No items</Text>}
                      </View>
                    </View>
                )) || selectedFoodItem.categories?.map((category: any, categoryIndex: number) => (
                    <View key={categoryIndex} style={styles.categoryGroup}>
                      <View style={styles.categoryHeader}>
                        <Ionicons name="restaurant" size={20} color="#fff" style={styles.categoryIcon} />
                        <Text style={styles.categoryTitle}>{category}</Text>
                      </View>
                      <View style={styles.subMenuContainer}>
                        {selectedFoodItem.items?.map((item: any, itemIndex: number) => (
                          <View key={itemIndex} style={styles.subMenuItem}>
                            <Ionicons name="ellipse" size={8} color="#28a745" style={styles.itemIcon} />
                            <Text style={styles.subMenuText}>{item}</Text>
                          </View>
                        )) || <Text style={styles.noDataText}>No items</Text>}
                      </View>
                    </View>
                )) || <Text style={styles.noDataText}>No categories</Text>}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.mainHeader}>
        <Text style={styles.headerTitle}>Tirth Yatra</Text>
        <TouchableOpacity 
          style={styles.headerMenuButton}
          onPress={() => setHeaderMenuVisible(!headerMenuVisible)}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
        
        {/* Header Dropdown Menu */}
        {headerMenuVisible && (
          <View style={styles.headerDropdown}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                setHeaderMenuVisible(false);
                router.push('/login')
              }}
            >
              <Ionicons name="log-in-outline" size={20} color="#000" />
              <Text style={styles.dropdownItemText}>{t('signIn')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                setHeaderMenuVisible(false);
                // Handle Sign Up
              }}
            >
              <Ionicons name="person-add-outline" size={20} color="#000" />
              <Text style={styles.dropdownItemText}>{t('signUp')}</Text>
            </TouchableOpacity>
            
            <View style={styles.dropdownItem}>
              <Ionicons name="language-outline" size={20} color="#000" />
              <View style={styles.languageDropdownContainer}>
                <LanguageDropdown />
              </View>
            </View>
          </View>
        )}
      </View>

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
      {activeTab === 'Events' && renderEventsTab()}

      {/* Back and Apply Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.applyButtonText}>{t('apply')}</Text>
        </TouchableOpacity>
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
});
