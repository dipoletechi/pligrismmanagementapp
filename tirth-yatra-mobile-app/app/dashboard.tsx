import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';

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

  // Check account status and login state
  const checkAccountStatus = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPassword = await AsyncStorage.getItem('userPassword');
      
      if (storedEmail && storedPassword) {
        const response = await fetch('http://192.168.1.3:5000/api/mobile/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: storedEmail,
            password: storedPassword,
            language: language // Send language preference
          }),
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
      const response = await fetch('http://192.168.1.3:5000/api/mobile/user-trips-comprehensive?userId=70'); // Updated to correct user ID
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
              {/* My Trip Stats */}
              <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>{t('myTrip')}</Text>
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
                <Text style={styles.sectionTitle}>{t('generalTripStatistics')}</Text>
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
                  {loginError}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

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
  statsContainer: {
    marginBottom: 30,
    padding: 0,
    marginHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 0,
    marginHorizontal: -20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
});
