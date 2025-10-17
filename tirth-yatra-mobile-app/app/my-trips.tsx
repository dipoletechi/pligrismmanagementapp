import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';

// API endpoint
const API_BASE_URL = 'http://192.168.1.15:5000/api/mobile';

// Trip application interface
interface TripApplication {
  id: number;
  tripid: number;
  userid: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Review';
  created_at: string;
  updated_at: string;
  trip_title: string;
  start_date: string;
  end_date: string;
  trip_status_id: number;
  trip_status_name: string;
  trip_status_description: string;
  application_status: string;
}

export default function MyTripsScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  
  // UI states
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripApplications, setTripApplications] = useState<TripApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<TripApplication[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [isAccountApproved, setIsAccountApproved] = useState(false);

  // Check account status from params
  useEffect(() => {
    if (params.accountApproved === 'true') {
      setIsAccountApproved(true);
    } else {
      setIsAccountApproved(false);
    }
  }, [params]);

  // Fetch user trip applications
  const fetchMyTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user credentials from AsyncStorage
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userPassword = await AsyncStorage.getItem('userPassword');
      
      if (!userEmail || !userPassword) {
        setError('Please login to view your trips');
        return;
      }

      // First, get user ID by calling login API
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword
        }),
      });

      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok || !loginData.success) {
        setError('Unable to verify user. Please login again.');
        return;
      }

      const userId = loginData.data.userId;
      console.log('Fetching trips for user ID:', userId);
      
      const response = await fetch(`${API_BASE_URL}/user-trips-comprehensive?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setTripApplications(data.data.myTrips.applications || []);
        setFilteredApplications(data.data.myTrips.applications || []);
      } else {
        setError(data.message || 'Failed to fetch trip applications');
      }
    } catch (err) {
      console.error('Error fetching my trips:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Load data when account is approved
  useEffect(() => {
    if (isAccountApproved) {
      fetchMyTrips();
    }
  }, [isAccountApproved]);

  // Filter applications based on active filter
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredApplications(tripApplications);
    } else {
      const filtered = tripApplications.filter(app => 
        app.application_status === activeFilter
      );
      setFilteredApplications(filtered);
    }
  }, [activeFilter, tripApplications]);

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => router.replace('/login')
        }
      ]
    );
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#34C759';
      case 'Pending':
        return '#FF9500';
      case 'Rejected':
        return '#FF3B30';
      case 'Review':
        return '#007AFF';
      default:
        return '#666';
    }
  };

  const renderTripApplication = (application: TripApplication) => (
    <TouchableOpacity 
      key={application.id} 
      style={styles.tripCard}
      onPress={() => {
        router.push({
          pathname: '/trip-details',
          params: { 
            id: application.tripid.toString(),
            fromMyTrips: 'true'
          }
        } as any);
      }}
    >
      <View style={styles.tripHeader}>
        <Text style={styles.tripTitle}>{application.trip_title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.application_status) }]}>
          <Text style={styles.statusText}>{application.application_status}</Text>
        </View>
      </View>
      
      <View style={styles.tripDetails}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateText}>
            {formatDate(application.start_date)} - {formatDate(application.end_date)}
          </Text>
        </View>
        
        <View style={styles.tripStatusRow}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.tripStatusText}>
            Trip Status: {application.trip_status_name}
          </Text>
        </View>
      </View>
      
      <View style={styles.applicationFooter}>
        <Text style={styles.appliedDate}>
          Applied: {formatDate(application.created_at)}
        </Text>
        {application.updated_at !== application.created_at && (
          <Text style={styles.updatedDate}>
            Updated: {formatDate(application.updated_at)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <View>
            <Text style={styles.headerTitle}>My Trips</Text>
            <Text style={styles.headerSubtitle}>Your pilgrimage applications</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.sidebarButton}
              onPress={() => setSidebarVisible(!sidebarVisible)}
            >
              <Ionicons name="menu" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sidebar Menu */}
        {sidebarVisible && (
          <View style={styles.sidebarOverlay}>
            <View style={styles.sidebar}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Menu</Text>
                <TouchableOpacity 
                  style={styles.sidebarCloseButton}
                  onPress={() => setSidebarVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.sidebarContent}>
                <TouchableOpacity 
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push({
                      pathname: '/dashboard',
                      params: { fromMyTrips: 'true' }
                    } as any);
                  }}
                >
                  <Ionicons name="grid-outline" size={24} color="#007AFF" />
                  <Text style={styles.sidebarItemText}>Dashboard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push('/');
                  }}
                >
                  <Ionicons name="globe-outline" size={24} color="#007AFF" />
                  <Text style={styles.sidebarItemText}>All Trips</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.sidebarItem, { backgroundColor: '#f0f0f0' }]}
                  onPress={() => {
                    setSidebarVisible(false);
                    // Stay on My Trips
                  }}
                >
                  <Ionicons name="airplane-outline" size={24} color="#007AFF" />
                  <Text style={styles.sidebarItemText}>My Trips</Text>
                </TouchableOpacity>

                {/* Language Selection */}
                <View style={styles.dropdownItem}>
                  <Ionicons name="language-outline" size={20} color="#000" />
                  <View style={styles.languageContainer}>
                    <LanguageDropdown />
                  </View>
                </View>
              </View>

              {/* Sign Out - Fixed at bottom */}
              <View style={styles.sidebarFooter}>
                <TouchableOpacity 
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    handleLogout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                  <Text style={[styles.sidebarItemText, { color: '#FF3B30' }]}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Main Content */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!isAccountApproved ? (
            /* Account not approved message */
            <View style={styles.errorContainer}>
              <View style={styles.errorCard}>
                <Ionicons name="time-outline" size={48} color="#FF9500" />
                <Text style={styles.errorTitle}>Account Under Review</Text>
                <Text style={styles.errorMessage}>
                  Your account is in review, you will receive notification as soon as your account is approved
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Filter Tabs */}
              <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterTabs}>
                    {['All', 'Pending', 'Approved', 'Rejected'].map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        style={[
                          styles.filterTab,
                          activeFilter === filter && styles.activeFilterTab
                        ]}
                        onPress={() => setActiveFilter(filter as any)}
                      >
                        <Text style={[
                          styles.filterTabText,
                          activeFilter === filter && styles.activeFilterTabText
                        ]}>
                          {filter}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Content */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>Loading your trips...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchMyTrips}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : filteredApplications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="airplane-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    {activeFilter === 'All' 
                      ? 'No trip applications found' 
                      : `No ${activeFilter.toLowerCase()} applications found`
                    }
                  </Text>
                </View>
              ) : (
                <View style={styles.tripsList}>
                  {filteredApplications.map(renderTripApplication)}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarButton: {
    padding: 5,
    marginTop: -5,
  },
  scrollContent: { 
    padding: 20,
    paddingBottom: 40,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  tripsList: {
    gap: 16,
  },
  tripCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  tripDetails: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  tripStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripStatusText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  applicationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  appliedDate: {
    fontSize: 12,
    color: '#999',
  },
  updatedDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingVertical: 40,
  },
  errorCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9500',
    marginTop: 15,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  // Sidebar styles
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sidebarCloseButton: {
    padding: 5,
  },
  sidebarContent: {
    paddingVertical: 20,
    flex: 1,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 5,
    alignItems: 'center',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  languageContainer: {
    flex: 1,
    marginLeft: 15,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
