import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';
import QRCode from 'react-native-qrcode-svg';

export default function DashboardScreen() {
  const { t, language } = useLanguage();
  const params = useLocalSearchParams();
  
  // UI states
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tripModalVisible, setTripModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Helper function to translate error messages
  const translateMessage = (message: string | null): string => {
    if (!message) return '';
    
    // Map backend messages to translation keys
    if (message.includes('account is in review') || message.includes('account is approved')) {
      return t('accountInReview');
    }
    if (message.includes('not verified')) {
      return t('accountInReview');
    }
    if (message.includes('login to access')) {
      return t('pleaseLoginToViewTrips');
    }
    if (message.includes('Network error')) {
      return t('networkError');
    }
    
    // If no match, return original message
    return message;
  };

  // Check account status and login state
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
        
        const response = await fetch('http://192.168.1.3:5000/api/mobile/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        const data = await response.json();
        if (response.ok && data.success && data.data.accountStatus === 'approved') {
          setLoginError(null);
          setIsLoggedIn(true);
          setIsAccountVerified(true);
        } else if (response.ok && data.success) {
          setLoginError(data.message);
          setIsLoggedIn(true);
          setIsAccountVerified(false);
        } else {
          setLoginError(data.message || 'Please login to access dashboard');
          setIsLoggedIn(false);
          setIsAccountVerified(false);
        }
      } else {
        setLoginError('Please login to access dashboard');
        setIsLoggedIn(false);
        setIsAccountVerified(false);
      }
    } catch (error) {
      setLoginError('Network error. Please check your connection.');
      setIsLoggedIn(false);
      setIsAccountVerified(false);
    }
  };

  // Generate QR Code
  const generateQRCode = async () => {
    setQrLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert(t('error'), 'Authentication token not found. Please login again.');
        setQrLoading(false);
        return;
      }
      
      const response = await fetch('http://192.168.1.3:5000/api/mobile-qr/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setQrData(data.data.qrData);
        setQrModalVisible(true);
      } else {
        Alert.alert(t('error'), data.message || 'Failed to generate QR code');
      }
    } catch (error) {
      Alert.alert(t('error'), t('networkError'));
    } finally {
      setQrLoading(false);
    }
  };

  // Check for login error from params
  useEffect(() => {
    if (params.error) {
      setLoginError(params.error as string);
      setIsLoggedIn(false);
      setIsAccountVerified(false);
    } else if (params.loginError) {
      // Handle loginError parameter (from Step 6 completion)
      setLoginError(params.loginError as string);
      setIsLoggedIn(true); // User is logged in but account not verified
      setIsAccountVerified(false);
    } else if (params.loginSuccess === 'true') {
      setLoginError(null);
      setIsLoggedIn(true);
      setIsAccountVerified(true); // Account is verified if login is successful
    } else if (params.fromMyTrips === 'true' || params.fromTrips === 'true') {
      // When navigating from My Trips or Trips, check account status
      checkAccountStatus();
    } else {
      // Default: check account status from stored credentials
      checkAccountStatus();
    }
  }, [params]);

  // Fetch comprehensive trip data
  const fetchTripData = async () => {
    try {
      setLoading(true);
      // Get JWT token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('No token found');
        return;
      }
      
      const response = await fetch('http://192.168.1.3:5000/api/mobile/user-trips-comprehensive', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTripData(data.data);
      }
    } catch (error) {
      // Error fetching trip data
    } finally {
      setLoading(false);
    }
  };

  // Fetch trip data when logged in
  useEffect(() => {
    if (isLoggedIn && isAccountVerified) {
      fetchTripData();
    }
  }, [isLoggedIn, isAccountVerified]);

  // Get current trip (approved and current date is between trip dates)
  const getCurrentTrip = () => {
    if (!tripData?.myTrips?.applications) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentTrip = tripData.myTrips.applications.find((app: any) => {
      if (app.application_status !== 'Approved') return false;
      
      const startDate = new Date(app.start_date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(app.end_date);
      endDate.setHours(0, 0, 0, 0);
      
      return today >= startDate && today <= endDate;
    });
    
    return currentTrip || null;
  };

  // Get upcoming trip (nearest approved trip with start date > current date)
  const getUpcomingTrip = () => {
    if (!tripData?.myTrips?.applications) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingTrips = tripData.myTrips.applications.filter((app: any) => {
      if (app.application_status !== 'Approved') return false;
      
      const startDate = new Date(app.start_date);
      startDate.setHours(0, 0, 0, 0);
      
      return startDate > today;
    });
    
    // Sort by start date and get the nearest one
    if (upcomingTrips.length > 0) {
      upcomingTrips.sort((a: any, b: any) => {
        const dateA = new Date(a.start_date);
        const dateB = new Date(b.start_date);
        return dateA.getTime() - dateB.getTime();
      });
      return upcomingTrips[0];
    }
    
    return null;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            // Clear credentials from AsyncStorage
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.removeItem('userPhone');
            await AsyncStorage.removeItem('userPassword');
            // Redirect to index page (All Trips)
            router.replace('/');
          }
        }
      ]
    );
  };


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <View>
            <Text style={styles.headerTitle}>{t('dashboard')}</Text>
            <Text style={styles.headerSubtitle}>{t('welcomeToTirthYatra')}</Text>
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
                    setSidebarVisible(false);
                    // Stay on dashboard
                  }}
                >
                  <Ionicons name="grid-outline" size={24} color="#007AFF" />
                  <Text style={styles.sidebarItemText}>{t('dashboard')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push({
                      pathname: '/my-trips',
                      params: { accountApproved: isAccountVerified ? 'true' : 'false' }
                    } as any);
                  }}
                >
                  <Ionicons name="airplane-outline" size={24} color="#007AFF" />
                  <Text style={styles.sidebarItemText}>{t('myTrips')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push({
                      pathname: '/',
                      params: { fromDashboard: 'true' }
                    } as any);
                  }}
                >
                  <Ionicons name="globe-outline" size={24} color="#007AFF" />
                  <Text style={styles.sidebarItemText}>{t('allTrips')}</Text>
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
                  <Text style={[styles.sidebarItemText, { color: '#FF3B30' }]}>{t('signOut')}</Text>
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
          {isLoggedIn && isAccountVerified ? (
            <>
              {/* My Trip Section */}
              <View style={styles.statsContainer}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>{t('myTrip')}</Text>
                  {/* Show My QR Button - Positioned in corner */}
                  <TouchableOpacity 
                    style={styles.qrButtonCorner}
                    onPress={generateQRCode}
                    disabled={qrLoading}
                  >
                    {qrLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Ionicons name="qr-code-outline" size={24} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Current Trip Card */}
                {getCurrentTrip() && (
                  <View style={styles.tripCard}>
                    <View style={styles.tripCardHeader}>
                      <Ionicons name="location" size={24} color="#007AFF" />
                      <Text style={styles.tripCardTitle}>{t('currentTrip')}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.tripCardContent}
                      onPress={() => {
                        const trip = getCurrentTrip();
                        router.push({
                          pathname: '/trip-details',
                          params: { 
                            id: trip.tripid.toString(),
                            fromMyTrips: 'true',
                            applicationStatus: trip.application_status,
                            tripEndDate: trip.end_date,
                            tripStatusName: trip.trip_status_name || 'Ongoing',
                            tripTitle: trip.trip_title
                          }
                        } as any);
                      }}
                    >
                      <Text style={styles.tripCardTripTitle}>{getCurrentTrip()?.trip_title}</Text>
                      <View style={styles.tripCardDateRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.tripCardDate}>
                          {formatDate(getCurrentTrip()!.start_date)} - {formatDate(getCurrentTrip()!.end_date)}
                        </Text>
                      </View>
                      <View style={styles.tripCardBadge}>
                        <Text style={styles.tripCardBadgeText}>Approved</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Upcoming Trip Card */}
                {getUpcomingTrip() && (
                  <View style={styles.tripCard}>
                    <View style={styles.tripCardHeader}>
                      <Ionicons name="calendar" size={24} color="#34C759" />
                      <Text style={styles.tripCardTitle}>{t('upcomingTrip')}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.tripCardContent}
                      onPress={() => {
                        const trip = getUpcomingTrip();
                        router.push({
                          pathname: '/trip-details',
                          params: { 
                            id: trip.tripid.toString(),
                            fromMyTrips: 'true',
                            applicationStatus: trip.application_status,
                            tripEndDate: trip.end_date,
                            tripStatusName: trip.trip_status_name || 'Upcoming',
                            tripTitle: trip.trip_title
                          }
                        } as any);
                      }}
                    >
                      <Text style={styles.tripCardTripTitle}>{getUpcomingTrip()?.trip_title}</Text>
                      <View style={styles.tripCardDateRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.tripCardDate}>
                          {formatDate(getUpcomingTrip()!.start_date)} - {formatDate(getUpcomingTrip()!.end_date)}
                        </Text>
                      </View>
                      <View style={styles.tripCardBadge}>
                        <Text style={styles.tripCardBadgeText}>Approved</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* My Trip Stats - Now at bottom */}
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Ionicons name="airplane" size={24} color="#007AFF" />
                    <Text style={styles.statNumber}>{tripData?.summary?.myTripTotal || 0}</Text>
                    <Text style={styles.statLabel}>{t('total')}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="time" size={24} color="#FF9500" />
                    <Text style={styles.statNumber}>{tripData?.summary?.currentTrip || 0}</Text>
                    <Text style={styles.statLabel}>{t('currentTrip')}</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Ionicons name="checkmark" size={24} color="#34C759" />
                    <Text style={styles.statNumber}>{tripData?.summary?.tripApproved || 0}</Text>
                    <Text style={styles.statLabel}>{t('tripApproved')}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="eye" size={24} color="#007AFF" />
                    <Text style={styles.statNumber}>{tripData?.summary?.tripReview || 0}</Text>
                    <Text style={styles.statLabel}>{t('tripReview')}</Text>
                  </View>
                </View>
                <View style={styles.statsRowSingle}>
                  <View style={styles.statCard}>
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    <Text style={styles.statNumber}>{tripData?.summary?.tripRejected || 0}</Text>
                    <Text style={styles.statLabel}>{t('tripRejected')}</Text>
                  </View>
                </View>
              </View>

              {/* General Trip Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>{t('generalTripStatistics')}</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Ionicons name="globe" size={24} color="#007AFF" />
                    <Text style={styles.statNumber}>{tripData?.summary?.totalTrip || 0}</Text>
                    <Text style={styles.statLabel}>{t('totalTripPublished')}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="calendar" size={24} color="#34C759" />
                    <Text style={styles.statNumber}>{tripData?.summary?.upcomingTrip || 0}</Text>
                    <Text style={styles.statLabel}>{t('upcomingTrip')}</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                    <Text style={styles.statNumber}>{tripData?.summary?.completedTrip || 0}</Text>
                    <Text style={styles.statLabel}>{t('completedTrip')}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="play-circle" size={24} color="#FF9500" />
                    <Text style={styles.statNumber}>{tripData?.summary?.currentTripGeneral || 0}</Text>
                    <Text style={styles.statLabel}>{t('currentTripToday')}</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            /* Account Status Message */
            <View style={styles.errorContainer}>
              <View style={styles.errorCard}>
                <Text style={styles.errorMessage}>
                  {translateMessage(loginError)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* QR Code Modal */}
        <Modal
          visible={qrModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setQrModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.qrModalContainer}>
              <View style={styles.qrModalHeader}>
                <Text style={styles.qrModalTitle}>{t('myQRCode')}</Text>
                <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.qrCodeWrapper}>
                {qrData ? (
                  <QRCode
                    value={qrData}
                    size={250}
                    color="#000"
                    backgroundColor="#fff"
                  />
                ) : (
                  <ActivityIndicator size="large" color="#007AFF" />
                )}
              </View>

              <Text style={styles.qrDescription}>
                {t('qrCodeDescription')}
              </Text>

              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setQrModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </>
  );
}

// 💅 Styles
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Reduce padding since container has paddingBottom
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 0,
    marginBottom: 12,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tripCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    color: '#333',
  },
  tripCardContent: {
    padding: 0,
  },
  tripCardTripTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  tripCardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripCardDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  tripCardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tripCardBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 30,
    padding: 0,
    marginHorizontal: 0,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 0,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statsRowSingle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 0,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 15,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Sidebar styles
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarButton: {
    padding: 5,
    marginTop: -5,
  },
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
  qrButtonCorner: {
    position: 'absolute',
    right: 15,
    top: '40%',
    transform: [{ translateY: -8 }],
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  qrButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
    maxWidth: 200,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  qrModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
