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
import { router, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';

const { width: screenWidth } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.1.5:5000/api/mobile/trips';

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

const carouselImages = [
  require('../image/political-1.png'),
  require('../image/political-2.png'),
];

export default function HomeScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (params.loginSuccess === 'true') {
      setIsLoggedIn(true);
      setLoginError(null);
    } else if (params.loginError) {
      setIsLoggedIn(false);
      setLoginError(params.loginError as string);
    } else if (params.fromDashboard === 'true') {
      setIsLoggedIn(true);
      setLoginError(null);
    }
  }, [params]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log('API Response:', data);
      console.log('Trips data:', data.data);
      setTrips(data.data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      let errorMessage = 'Failed to fetch trips';
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection.';
        } else if (err.message.includes('Network request failed')) {
          errorMessage = 'Cannot connect to server. Please check if backend is running.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check:\n\n1. Backend server is running\n2. Use your computer\'s IP\n3. Check your network',
        [
          { text: 'Retry', onPress: fetchTrips },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredTrips = trips.filter(
    (trip) => trip.trip_role && trip.trip_role.toLowerCase() === activeTab.toLowerCase()
  );

  const renderCarousel = () => (
    <View style={styles.carouselContainer}>
      <Image source={carouselImages[currentImageIndex]} style={styles.carouselImage} />
      <TouchableOpacity
        style={[styles.carouselButton, styles.carouselButtonLeft]}
        onPress={() =>
          setCurrentImageIndex((prev) =>
            prev === 0 ? carouselImages.length - 1 : prev - 1
          )
        }>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.carouselButton, styles.carouselButtonRight]}
        onPress={() => setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)}>
        <Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      console.log('Formatting date:', dateString);
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return 'Invalid Date';
      }
      const formatted = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.log('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid Date';
    }
  };

  const renderEventCard = (trip: Trip) => {
    console.log('Rendering trip:', trip);
    console.log('Trip fields:', {
      id: trip.id,
      title: trip.title,
      start_date: trip.start_date,
      end_date: trip.end_date,
      description: trip.destinationInfo?.description
    });
    
    return (
      <TouchableOpacity 
        key={trip.id} 
        style={styles.eventCard}
        onPress={() => {
          console.log('Event clicked:', trip.title);
          router.push(`/trip-details?id=${trip.id}`);
        }}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{trip.title}</Text>
        </View>
        <Text style={styles.eventDescription}>
          {trip.destinationInfo?.description ||
            'A sacred pilgrimage journey to this holy destination.'}
        </Text>
        <View style={styles.eventFooter}>
          <Text>{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container]}>
      {/* ✅ HEADER FIX */}
      <View style={styles.header}>
        {params.fromDashboard !== 'true' && (
          <Text style={styles.headerTitle}>Tirth Yatra</Text>
        )}
         <TouchableOpacity
           style={styles.headerMenuButton}
           onPress={() => {
             if (params.fromDashboard === 'true') {
               setSidebarVisible(!sidebarVisible);
               setHeaderMenuVisible(false); // Hide header menu when showing sidebar
             } else {
               setHeaderMenuVisible(!headerMenuVisible);
               setSidebarVisible(false); // Hide sidebar when showing header menu
             }
           }}>
           <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
         </TouchableOpacity>

        {headerMenuVisible && (
          <View style={styles.headerDropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setHeaderMenuVisible(false);
                router.push('/login');
              }}>
              <Ionicons name="log-in-outline" size={20} color="#000" />
              <Text style={styles.dropdownItemText}>{t('signIn')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setHeaderMenuVisible(false);
                router.push('/register');
              }}>
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
                     params: { loginSuccess: 'true' }
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
                   // Stay on current page (index)
                 }}
               >
                 <Ionicons name="airplane-outline" size={24} color="#007AFF" />
                 <Text style={styles.sidebarItemText}>Trips</Text>
               </TouchableOpacity>

               {/* Language Dropdown in Sidebar */}
               <View style={styles.sidebarItem}>
                 <Ionicons name="language-outline" size={24} color="#007AFF" />
                 <View style={styles.sidebarLanguageContainer}>
                   <LanguageDropdown />
                 </View>
               </View>

               {/* Sign Out in Sidebar */}
               <TouchableOpacity 
                 style={styles.sidebarItem}
                 onPress={() => {
                   setSidebarVisible(false);
                   Alert.alert(
                     'Sign Out',
                     'Are you sure you want to sign out?',
                     [
                       { text: 'Cancel', style: 'cancel' },
                       { 
                         text: 'Sign Out', 
                         style: 'destructive',
                         onPress: () => {
                           setIsLoggedIn(false);
                           setLoginError(null);
                           router.replace('/');
                         }
                       }
                     ]
                   );
                 }}
               >
                 <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                 <Text style={[styles.sidebarItemText, { color: '#FF3B30' }]}>Sign Out</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       )}

      {renderCarousel()}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('Upcoming')}>
          <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Current' && styles.activeTab]}
          onPress={() => setActiveTab('Current')}>
          <Text style={[styles.tabText, activeTab === 'Current' && styles.activeTabText]}>
            Current
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollableContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No trips found</Text>
          </View>
        ) : (
          filteredTrips.map(renderEventCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ STYLES FIXED BELOW
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'visible', // ✅ FIXED
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10, // ✅ FIXED
    elevation: 10, // ✅ FIXED (Android)
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerMenuButton: { padding: 8 },

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
    elevation: 15, // ✅ FIXED
    zIndex: 9999, // ✅ FIXED
    minWidth: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: { fontSize: 14, color: '#000', marginLeft: 12 },
  languageDropdownContainer: { marginLeft: 12, flex: 1 },

  carouselContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  carouselImage: { width: '100%', height: '100%', resizeMode: 'cover' },
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
  carouselButtonLeft: { left: 16 },
  carouselButtonRight: { right: 16 },

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
  activeTab: { borderBottomColor: '#000' },
  tabText: { fontSize: 16, color: '#666' },
  activeTabText: { color: '#000', fontWeight: 'bold' },

  scrollableContent: { flex: 1, paddingHorizontal: 16 },

  eventCard: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', flex: 1 },
  eventDescription: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between' },

  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#ccc' },

  // ✅ Sidebar Fix
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10000, // ✅ FIXED
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    elevation: 20, // ✅ FIXED
    zIndex: 10001, // ✅ FIXED
    padding: 20,
  },
   sidebarTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
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
   sidebarCloseButton: {
     padding: 5,
   },
   sidebarContent: {
     paddingVertical: 20,
     flex: 1,
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
   sidebarLanguageContainer: {
     flex: 1,
     marginLeft: 15,
   },
});
