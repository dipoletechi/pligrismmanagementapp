import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

export default function WelcomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.welcomeIcon}>
              <ThemedText style={styles.welcomeEmoji}>🎉</ThemedText>
            </View>
            <ThemedText type="title" style={styles.title}>
              Welcome to Trith Yatra!
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              Hello, {user?.name || 'User'}! 👋
            </ThemedText>
            <ThemedText type="default" style={styles.description}>
              You have successfully logged in to your account
            </ThemedText>
          </View>

          {/* User Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <View style={styles.userAvatar}>
                <ThemedText style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </ThemedText>
              </View>
              <View style={styles.userInfo}>
                <ThemedText type="defaultSemiBold" style={styles.userName}>
                  {user?.name || 'User'}
                </ThemedText>
                <ThemedText type="default" style={styles.userEmail}>
                  {user?.email}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              What's Next?
            </ThemedText>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <ThemedText style={styles.featureEmoji}>🚀</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                  Explore Features
                </ThemedText>
                <ThemedText type="default" style={styles.featureDescription}>
                  Discover all the amazing features of Trith Yatra
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <ThemedText style={styles.featureEmoji}>⚙️</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                  Customize Profile
                </ThemedText>
                <ThemedText type="default" style={styles.featureDescription}>
                  Personalize your experience and settings
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <ThemedText style={styles.featureEmoji}>🗺️</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                  Start Your Journey
                </ThemedText>
                <ThemedText type="default" style={styles.featureDescription}>
                  Begin your spiritual journey with Trith Yatra
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Your Progress
            </ThemedText>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText type="title" style={styles.statNumber}>0</ThemedText>
                <ThemedText type="default" style={styles.statLabel}>Temples Visited</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="title" style={styles.statNumber}>0</ThemedText>
                <ThemedText type="default" style={styles.statLabel}>Prayers Offered</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="title" style={styles.statNumber}>0</ThemedText>
                <ThemedText type="default" style={styles.statLabel}>Days Active</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>🚪 Logout</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 20,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    marginBottom: 4,
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    marginBottom: 20,
    color: '#1A1A1A',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    marginBottom: 4,
    color: '#1A1A1A',
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
