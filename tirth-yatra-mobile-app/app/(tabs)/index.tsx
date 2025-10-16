import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

// API endpoint - Using your computer's IP address
const API_BASE_URL = 'http://192.168.1.15:5000/api/mobile/trips';

// Trip data interface based on API response
interface Trip {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  trip_status_id: number;
  created_at: string;
  updated_at: string;
  destinationInfo: any;
  tripStatus: {
    id: number;
    name: string;
  };
  trip_role: 'Upcoming' | 'Current' | null;
}

// Sample carousel data - using colored backgrounds instead of images
const carouselData = [
  { id: 1, color: '#4A90E2', title: 'Kashi Vishwanath' },
  { id: 2, color: '#7ED321', title: 'Char Dham' },
  { id: 3, color: '#F5A623', title: 'Amarnath' },
];

export default function HomeScreen() {
  const { t } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Fetch trips data from API
  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(API_BASE_URL, {
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
      setTrips(data.data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch trips';
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection.';
        } else if (err.message.includes('Network request failed')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running and try using your computer\'s IP address.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };


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
          onPress: () => {
            // Handle logout logic here
            console.log('User logged out');
          }
        }
      ]
    );
  };

  // Check login status and navigate to dashboard
  const navigateToDashboard = async () => {
    try {
      setSidebarVisible(false);
      console.log('navigateToDashboard');
      // Get stored login credentials from AsyncStorage
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPassword = await AsyncStorage.getItem('userPassword');
      
      console.log('Using stored credentials:', { email: storedEmail, password: storedPassword ? '***' : 'null' });
      
      if (!storedEmail || !storedPassword) {
        console.log('No stored credentials found, using default');
        // If no stored credentials, use default ones
        const response = await fetch('http://192.168.1.15:5000/api/mobile/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: storedEmail,
            password: storedPassword
          }),
        });
        
        const data = await response.json();
        console.log('Login API Response: banty', data);
        console.log('Response OK banty:', response.ok);
        console.log('Data Success:', data.success);
        
        if (response.ok && data.success === true) {
          console.log('Login successful - navigating to dashboard with success');
          router.push({
            pathname: '/dashboard',
            params: { loginSuccess: 'true' }
          });
        } else {
          console.log('Login failed - navigating to dashboard with error:', data.message);
          router.push({
            pathname: '/dashboard',
            params: { 
              error: data.message || 'Login failed. Please try again.',
              loginError: 'true'
            }
          });
        }
        return;
      }
      
      // Call login API with stored credentials
      const response = await fetch('http://192.168.1.15:5000/api/mobile/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: storedEmail,
          password: storedPassword
        }),
      });

      const data = await response.json();
      
      console.log('Login API Response:', data);
      console.log('Response OK:', response.ok);
      console.log('Data Success:', data.success);
      
      // Check both response.ok AND data.success
      if (response.ok && data.success === true) {
        console.log('Login successful - navigating to dashboard with success');
        // Login successful - navigate to dashboard with success parameter
        router.push({
          pathname: '/dashboard',
          params: { loginSuccess: 'true' }
        });
      } else {
        console.log('Login failed - navigating to dashboard with error:', data.message);
        // Login failed or account in review - navigate to dashboard with error
        router.push({
          pathname: '/dashboard',
          params: { 
            error: data.message || 'Login failed. Please try again.',
            loginError: 'true'
          }
        });
      }
    } catch (error) {
      console.error('Login check error:', error);
      // Navigate to dashboard with error
      router.push({
        pathname: '/dashboard',
        params: { 
          error: 'Network error. Please check your connection.',
          loginError: 'true'
        }
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTrips();
  }, []);




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

  const renderEventCard = (trip: Trip) => (
    <View key={trip.id} style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{trip.title}</Text>
        <TouchableOpacity style={styles.eventAction}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.eventDescription}>
        {trip.destinationInfo?.description || 'A sacred pilgrimage journey. Experience the spiritual significance and cultural heritage of this holy destination.'}
      </Text>
      <View style={styles.eventFooter}>
        <View style={styles.eventDates}>
          <Text style={styles.eventDateLabel}>Start Date</Text>
          <Text style={styles.eventDateValue}>{formatDate(trip.start_date)}</Text>
          <Text style={styles.eventLastUpdated}>Last updated: {formatDate(trip.updated_at)}</Text>
        </View>
        <View style={styles.eventEndDate}>
          <Text style={styles.eventDateLabel}>End Datetime</Text>
          <Text style={styles.eventDateValue}>{formatDateTime(trip.end_date)}</Text>
        </View>
      </View>
      <View style={styles.tripStatus}>
        <Text style={styles.tripStatusText}>Status: {trip.tripStatus?.name || 'Unknown'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.mainHeader}>
        <View>
          <Text style={styles.headerTitle}>Tirth Yatra</Text>
          <Text style={styles.headerSubtitle}>Pilgrimage Trips</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.sidebarButton}
            onPress={() => {
              console.log('Menu button pressed, sidebarVisible:', sidebarVisible);
              setSidebarVisible(!sidebarVisible);
            }}
          >
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Your Pilgrimage Trips</Text>
          <Text style={styles.welcomeSubtitle}>Discover and manage your spiritual journeys</Text>
        </View>

        {/* Trips Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading trips...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTrips}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No trips found</Text>
          </View>
        ) : (
          <View style={styles.tripsGrid}>
            {trips.map(renderEventCard)}
          </View>
        )}
      </ScrollView>

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
                  // Stay on trips page
                }}
              >
                <Ionicons name="airplane-outline" size={24} color="#007AFF" />
                <Text style={styles.sidebarItemText}>Trips</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sidebarItem, { backgroundColor: '#f0f0f0' }]}
                onPress={() => {
                  console.log('Dashboard button pressed');
                  navigateToDashboard();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="grid-outline" size={24} color="#007AFF" />
                <Text style={styles.sidebarItemText}>sdfsdfds</Text>
              </TouchableOpacity>
              
              {/* Test Button */}
              <TouchableOpacity 
                style={[styles.sidebarItem, { backgroundColor: '#ff0000' }]}
                onPress={() => {
                  console.log('TEST BUTTON PRESSED');
                  Alert.alert('Test', 'Test button works!');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={[styles.sidebarItemText, { color: '#fff' }]}>TEST BUTTON</Text>
              </TouchableOpacity>

              {/* Language Selection */}
              <View style={styles.sidebarItem}>
                <Ionicons name="language-outline" size={24} color="#007AFF" />
                <View style={styles.languageContainer}>
                  <Text style={styles.sidebarItemText}>Language</Text>
                  <LanguageDropdown />
                </View>
              </View>

              {/* Sign Out */}
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => {
                  setSidebarVisible(false);
                  handleLogout();
                }}
              >
                <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                <Text style={[styles.sidebarItemText, { color: '#FF3B30' }]}>sdfdsfsdf Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
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
    gap: 8,
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
  carouselContainer: {
    height: 200,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  carouselImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  carouselOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  carouselText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselButtonLeft: {
    left: 16,
  },
  carouselButtonRight: {
    right: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  scrollableContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  eventAction: {
    padding: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  eventDates: {
    flex: 1,
  },
  eventDateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  eventDateValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  eventLastUpdated: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  eventEndDate: {
    alignItems: 'flex-end',
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
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
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
  tripStatus: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tripStatusText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  // Sidebar button styles
  sidebarButton: {
    padding: 8,
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
    width: 280,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
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
  // Dashboard-style content
  scrollContent: { 
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  tripsGrid: {
    gap: 16,
  },
});