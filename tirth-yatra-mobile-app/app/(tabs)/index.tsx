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
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// API endpoint - Using your computer's IP address
const API_BASE_URL = 'http://192.168.1.5:5000/api/mobile/trips';

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
  const [activeTab, setActiveTab] = useState('Current');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Load data on component mount
  useEffect(() => {
    fetchTrips();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselData.length
      );
    }, 3000); // Change carousel every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter trips based on active tab
  const filteredTrips = trips.filter(trip => 
    trip.trip_role && trip.trip_role.toLowerCase() === activeTab.toLowerCase()
  );

  const renderCarousel = () => (
    <View style={styles.carouselContainer}>
      <View style={[styles.carouselImageContainer, { backgroundColor: carouselData[currentImageIndex].color }]}>
        <View style={styles.carouselContent}>
          <Ionicons name="location-outline" size={48} color="#fff" />
          <Text style={styles.carouselTitle}>{carouselData[currentImageIndex].title}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.carouselButton, styles.carouselButtonLeft]}
        onPress={() => setCurrentImageIndex((prev) => 
          prev === 0 ? carouselData.length - 1 : prev - 1
        )}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.carouselButton, styles.carouselButtonRight]}
        onPress={() => setCurrentImageIndex((prev) => 
          (prev + 1) % carouselData.length
        )}
      >
        <Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

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
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Title</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>SignIn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>SignUp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fixed Image Carousel */}
      {renderCarousel()}

      {/* Fixed Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('Upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Current' && styles.activeTab]}
          onPress={() => setActiveTab('Current')}
        >
          <Text style={[styles.tabText, activeTab === 'Current' && styles.activeTabText]}>
            Current
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={true}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading trips...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>Failed to load trips</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTrips}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} trips found</Text>
          </View>
        ) : (
          filteredTrips.map(renderEventCard)
        )}
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}></Text>
        <Ionicons name="help-circle-outline" size={24} color="#666" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
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
  footer: {
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
});