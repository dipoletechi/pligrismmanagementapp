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
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';

export default function DashboardScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  
  // UI states
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for login error from params
  useEffect(() => {
    if (params.error) {
      setLoginError(params.error as string);
      setIsLoggedIn(false);
    } else if (params.loginError) {
      // Handle loginError parameter (from Step 6 completion)
      setLoginError(params.loginError as string);
      setIsLoggedIn(false);
    } else if (params.loginSuccess === 'true') {
      setLoginError(null);
      setIsLoggedIn(true);
    } else {
      // Check if coming from registration completion
      // If no error and no explicit login success, assume logged in from registration
      if (!params.error && !params.loginError && !params.loginSuccess) {
        setLoginError(null);
        setIsLoggedIn(true);
      } else {
        // Default: assume not logged in if no parameters
        setIsLoggedIn(false);
        setLoginError('Please login to access dashboard');
      }
    }
  }, [params]);

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

  // Dashboard menu items
  const menuItems = [
    {
      id: 1,
      title: 'My Trips',
      icon: 'airplane-outline',
      color: '#007AFF',
      onPress: () => Alert.alert('Coming Soon', 'My Trips feature will be available soon!')
    },
    {
      id: 2,
      title: 'Book Trip',
      icon: 'calendar-outline',
      color: '#34C759',
      onPress: () => router.push('/')
    },
    {
      id: 3,
      title: 'Profile',
      icon: 'person-outline',
      color: '#FF9500',
      onPress: () => Alert.alert('Coming Soon', 'Profile feature will be available soon!')
    },
    {
      id: 4,
      title: 'Support',
      icon: 'help-circle-outline',
      color: '#FF3B30',
      onPress: () => Alert.alert('Coming Soon', 'Support feature will be available soon!')
    },
    {
      id: 5,
      title: 'Notifications',
      icon: 'notifications-outline',
      color: '#AF52DE',
      onPress: () => Alert.alert('Coming Soon', 'Notifications feature will be available soon!')
    },
    {
      id: 6,
      title: 'Settings',
      icon: 'settings-outline',
      color: '#8E8E93',
      onPress: () => Alert.alert('Coming Soon', 'Settings feature will be available soon!')
    }
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome to Tirth Yatra</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.sidebarButton}
              onPress={() => setSidebarVisible(!sidebarVisible)}
            >
              <Ionicons name="menu" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerMenuButton}
              onPress={() => setHeaderMenuVisible(!headerMenuVisible)}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {headerMenuVisible && (
            <View style={styles.headerDropdown}>
              <LanguageDropdown />
            </View>
          )}
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
                    // Stay on dashboard
                  }}
                >
                  <Ionicons name="grid-outline" size={24} color="#007AFF" />
                  <Text style={styles.sidebarItemText}>Dashboard</Text>
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
                  <Ionicons name="airplane-outline" size={24} color="#007AFF" />
                  <Text style={styles.sidebarItemText}>Trips</Text>
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
          {isLoggedIn ? (
            <>
              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeSubtitle}>
                  Discover amazing pilgrimage destinations and book your spiritual journey
                </Text>
              </View>

              {/* Quick Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Ionicons name="airplane" size={24} color="#007AFF" />
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Trips Booked</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="location" size={24} color="#34C759" />
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Destinations</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="star" size={24} color="#FF9500" />
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </View>

              {/* Menu Grid */}
              <View style={styles.menuContainer}>
                <Text style={styles.menuTitle}>Quick Actions</Text>
                <View style={styles.menuGrid}>
                  {menuItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.menuItem, { borderLeftColor: item.color }]}
                      onPress={item.onPress}
                    >
                      <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                        <Ionicons name={item.icon as any} size={24} color={item.color} />
                      </View>
                      <Text style={styles.menuText}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Recent Activity */}
              <View style={styles.activityContainer}>
                <Text style={styles.activityTitle}>Recent Activity</Text>
                <View style={styles.activityCard}>
                  <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>Welcome to Tirth Yatra!</Text>
                    <Text style={styles.activityTime}>Just now</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            /* Login Error Message */
            <View style={styles.errorContainer}>
              <View style={styles.errorCard}>
                <Text style={styles.errorMessage}>{loginError || 'Unable to login. Please try again.'}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.mainFooter}>
          <Text style={styles.footerText}>© 2024 Tirth Yatra. All rights reserved.</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

// 💅 Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 60, // Add space for fixed footer
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
  headerMenuButton: {
    padding: 5,
  },
  headerDropdown: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  scrollContent: { 
    padding: 20,
    paddingBottom: 40, // Reduce padding since container has paddingBottom
  },
  welcomeSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  activityContainer: {
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContent: {
    flex: 1,
    marginLeft: 15,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
  mainFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    //position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    opacity: 1,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
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
});
