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
import { router, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';
import { API_ENDPOINTS } from '@/constants/config';

const { width: screenWidth } = Dimensions.get('window');

const API_BASE_URL = `${API_ENDPOINTS.MOBILE}/trips`;

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
  const { t, language } = useLanguage();
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
  const [isAccountApproved, setIsAccountApproved] = useState(false);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    console.log('Index page params received:', params);
    console.log('fromDashboard param:', params.fromDashboard);
    console.log('fromMyTrips param:', params.fromMyTrips);
    if (params.loginSuccess === 'true') {
      console.log('Setting login status to true from loginSuccess');
      setIsLoggedIn(true);
      setLoginError(null);
    } else if (params.loginError) {
      console.log('Setting login status to false from loginError:', params.loginError);
      setIsLoggedIn(false);
      setLoginError(params.loginError as string);
    } else if (params.fromDashboard === 'true' || params.fromMyTrips === 'true') {
      console.log('Setting login status to true from fromDashboard or fromMyTrips');
      setIsLoggedIn(true);
      setLoginError(null);
    } else {
      console.log('No special params, checking AsyncStorage for login status');
      // Check AsyncStorage for login status
      const checkLoginStatus = async () => {
        try {
          const userEmail = await AsyncStorage.getItem('userEmail');
          const userPhone = await AsyncStorage.getItem('userPhone');
          const userPassword = await AsyncStorage.getItem('userPassword');
          const hasCredentials = !!((userEmail || userPhone) && userPassword);
          console.log('AsyncStorage login check:', { userEmail: !!userEmail, userPhone: !!userPhone, userPassword: !!userPassword, hasCredentials });
          setIsLoggedIn(hasCredentials);
        } catch (error) {
          console.error('Error checking login status:', error);
          setIsLoggedIn(false);
        }
      };
      checkLoginStatus();
    }
  }, [params]);

  // Log login status changes
  useEffect(() => {
    console.log('Index page isLoggedIn state changed to:', isLoggedIn);
    console.log('Current UI should show:', isLoggedIn ? 'Logged-in UI' : 'Logged-out UI');
  }, [isLoggedIn]);

  // Check account status
  const checkAccountStatus = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const storedPassword = await AsyncStorage.getItem('userPassword');
      
      if ((storedEmail || storedPhone) && storedPassword) {
        const requestBody: any = {
          password: storedPassword
        };
        
        if (storedEmail) {
          requestBody.email = storedEmail;
        }
        if (storedPhone) {
          requestBody.phone = storedPhone;
        }
        
        const response = await fetch(`${API_ENDPOINTS.MOBILE}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        const data = await response.json();
        if (response.ok && data.success && data.data.accountStatus === 'approved') {
          setIsAccountApproved(true);
          // Fetch user applications when account is approved
          await fetchUserApplications();
        } else {
          setIsAccountApproved(false);
        }
      } else {
        setIsAccountApproved(false);
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      setIsAccountApproved(false);
    }
  };

  // Fetch user trip applications
  const fetchUserApplications = async () => {
    try {
      // Get JWT token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        return;
      }

      // Call API with JWT token
      const response = await fetch(`${API_ENDPOINTS.MOBILE}/user-trips-comprehensive`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUserApplications(data.data.myTrips.applications || []);
        console.log('User applications fetched:', data.data.myTrips.applications.length);
      }
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  // Check account status when component mounts
  useEffect(() => {
    if (isLoggedIn) {
      checkAccountStatus();
    }
  }, [isLoggedIn]);

  // Set default tab to "All" when user is logged in and account is approved
  useEffect(() => {
    if (isLoggedIn && isAccountApproved) {
      setActiveTab('All');
    }
  }, [isLoggedIn, isAccountApproved]);

  // Check login status and navigate to dashboard
  const navigateToDashboard = async () => {
    setSidebarVisible(false);
    console.log('navigateToDashboard called');
    
    // If user is already logged in on this page, just navigate with fromTrips param
    // Dashboard will check account status itself
    if (isLoggedIn) {
      console.log('User already logged in, navigating with fromTrips param');
      router.push({
        pathname: '/dashboard',
        params: { fromTrips: 'true' }
      });
      return;
    }
    
    // If not logged in, redirect to login page
    console.log('User not logged in, redirecting to login');
    router.push('/login');
  };

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

  const filteredTrips = activeTab === 'All' 
    ? trips.filter((trip) => trip.trip_role === 'Upcoming' || trip.trip_role === 'Current')
    : trips.filter(
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

  // Get application status for a trip
  const getApplicationStatus = (tripId: number) => {
    const application = userApplications.find(app => app.tripid === tripId);
    return application ? application.application_status : null;
  };

  // Get status color
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

  const renderEventCard = (trip: Trip) => {
    const applicationStatus = getApplicationStatus(trip.id);
    // Only show status if user is logged in, account approved, AND trip exists in user's applications
    const shouldShowStatus = isLoggedIn && isAccountApproved && applicationStatus;
    
    return (
      <TouchableOpacity 
        key={trip.id} 
        style={styles.eventCard}
        onPress={() => {
          router.push(`/trip-details?id=${trip.id}`);
        }}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{trip.title || (language === 'pa' ? 'ਸਿਰਲੇਖ ਉਪਲਬਧ ਨਹੀਂ' : 'Title not available')}</Text>
          {shouldShowStatus && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(applicationStatus) }]}>
              <Text style={styles.statusText}>{applicationStatus}</Text>
            </View>
          )}
        </View>
        <Text style={styles.eventDescription}>
          {trip.destinationInfo?.description || 'A sacred pilgrimage journey to this holy destination.'}
        </Text>
        <View style={styles.eventFooter}>
          <View style={styles.dateContainer}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>{t('startDate')}: </Text>
              <Text style={styles.dateValue}>{formatDate(trip.start_date)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>{t('endDate')}: </Text>
              <Text style={styles.dateValue}>{formatDate(trip.end_date)}</Text>
            </View>
            {shouldShowStatus && (
              <Text style={styles.applicationStatusText}>
                {language === 'pa' ? 'ਤੁਹਾਡੀ ਅਰਜ਼ੀ' : 'Your Application'}: {applicationStatus}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container]}>
      {/* Header - Conditional Design */}
      <View style={styles.mainHeader}>
        {isLoggedIn ? (
          // Login Mode: Title on left, hamburger menu on right
          <>
            <View>
              <Text style={styles.headerTitle}>Tirth Yatra - Pilgrimage Trips</Text>
            </View>
            
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color="#333" />
              </TouchableOpacity>
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
          </>
        ) : (
          // Sign Out Mode: Original design with Sign In/Sign Up options
          <>
            <Text style={styles.headerTitle}>Tirth Yatra</Text>
            <TouchableOpacity
              style={styles.headerMenuButton}
              onPress={() => setHeaderMenuVisible(!headerMenuVisible)}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Header Dropdown for Sign Out Mode */}
      {!isLoggedIn && headerMenuVisible && (
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

       {sidebarVisible && (
         <View style={styles.sidebarOverlay}>
           <View style={styles.sidebar}>
             <View style={styles.sidebarHeader}>
               <Text style={styles.sidebarTitle}>{t('menu')}</Text>
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
                   console.log('Dashboard button pressed');
                   navigateToDashboard();
                 }}
               >
                 <Ionicons name="grid-outline" size={24} color="#007AFF" />
                 <Text style={styles.sidebarItemText}>{t('dashboard')}</Text>
               </TouchableOpacity>
               
              <TouchableOpacity 
                style={[styles.sidebarItem, { backgroundColor: '#f0f0f0' }]}
                onPress={() => {
                  setSidebarVisible(false);
                  // Stay on current page (index)
                }}
              >
                <Ionicons name="globe-outline" size={24} color="#007AFF" />
                <Text style={styles.sidebarItemText}>{t('allTrips')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => {
                  setSidebarVisible(false);
                  router.push({
                    pathname: '/my-trips',
                    params: { accountApproved: isAccountApproved ? 'true' : 'false' }
                  } as any);
                }}
              >
                <Ionicons name="airplane-outline" size={24} color="#007AFF" />
                <Text style={styles.sidebarItemText}>{t('myTrips')}</Text>
              </TouchableOpacity>

              {/* Language Dropdown in Sidebar */}
              <View style={styles.dropdownItem}>
                <Ionicons name="language-outline" size={20} color="#000" />
                <View style={styles.sidebarLanguageContainer}>
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
                  Alert.alert(
                    t('signOut'),
                    'Are you sure you want to sign out?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: t('signOut'), 
                        style: 'destructive',
                        onPress: async () => {
                          console.log('Sign out pressed in index page');
                          // Clear credentials from AsyncStorage
                          await AsyncStorage.removeItem('userEmail');
                          await AsyncStorage.removeItem('userPhone');
                          await AsyncStorage.removeItem('userPassword');
                          console.log('Credentials cleared from AsyncStorage');
                          
                          // Clear fromDashboard parameter by navigating to same page without params
                          router.replace('/');
                          
                          // Update UI state
                          setIsLoggedIn(false);
                          setLoginError(null);
                          setSidebarVisible(false);
                          
                          console.log('Login status set to false, fromDashboard cleared');
                          console.log('UI should update to show logged-out state');
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                <Text style={[styles.sidebarItemText, { color: '#FF3B30' }]}>{t('signOut')}</Text>
              </TouchableOpacity>
            </View>
           </View>
         </View>
       )}

      {renderCarousel()}

      <View style={styles.tabContainer}>
        {isLoggedIn && isAccountApproved && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'All' && styles.activeTab]}
            onPress={() => setActiveTab('All')}>
            <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>
              {language === 'pa' ? 'ਸਭ' : 'All'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('Upcoming')}>
          <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>
            {t('upcoming')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Current' && styles.activeTab]}
          onPress={() => setActiveTab('Current')}>
          <Text style={[styles.tabText, activeTab === 'Current' && styles.activeTabText]}>
            {t('current')}
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

      {/* Footer - Only show in logout mode */}
      {!isLoggedIn && (
        <View style={styles.mainFooter}>
          <Text style={styles.footerText}>© 2024 Tirth Yatra. All rights reserved.</Text>
          <Text style={styles.footerSubText}>Pilgrimage Management System</Text>
        </View>
      )}
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
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
    elevation: 10,
  },
  sidebarButton: {
    padding: 8,
    marginTop: -5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationButton: {
    padding: 5,
    marginTop: -5,
  },
  headerMenuButton: {
    padding: 5,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  eventDescription: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  eventFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateContainer: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  applicationStatusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 4,
  },

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
     paddingTop: 20,
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
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 5,
    alignItems: 'center',
  },
   
   // Footer styles
   mainFooter: {
     backgroundColor: '#f8f9fa',
     paddingVertical: 20,
     paddingHorizontal: 16,
     borderTopWidth: 1,
     borderTopColor: '#e0e0e0',
     alignItems: 'center',
   },
   footerText: {
     fontSize: 14,
     color: '#666',
     marginBottom: 4,
   },
   footerSubText: {
     fontSize: 12,
     color: '#999',
   },
});
