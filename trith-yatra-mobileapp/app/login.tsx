import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, isLoading } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Check if fields are empty
    if (!email && !password) {
      setEmailError('Please enter your email address');
      setPasswordError('Please enter your password');
      return;
    }

    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      Alert.alert('Error', 'Invalid credentials. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <ThemedText style={styles.logoText}>🙏</ThemedText>
              </View>
            </View>
            <ThemedText type="title" style={styles.title}>Welcome to Trith Yatra</ThemedText>
            <ThemedText type="default" style={styles.subtitle}>
              Sign in to continue your spiritual journey
            </ThemedText>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.label}>📧 Email Address</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, emailError ? styles.inputError : null]}
                    placeholder="Enter your email"
                    placeholderTextColor="#A0A0A0"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {emailError ? (
                  <ThemedText style={styles.errorText}>{emailError}</ThemedText>
                ) : (
                  <ThemedText style={styles.helpText}>
                    Please enter your email address (e.g., user@example.com)
                  </ThemedText>
                )}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.label}>🔒 Password</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <ThemedText style={styles.eyeIcon}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
                ) : (
                  <ThemedText style={styles.helpText}>
                    Enter your password (minimum 6 characters)
                  </ThemedText>
                )}
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <ThemedText style={styles.loadingButtonText}>Signing In...</ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo Info Section */}
          <View style={styles.demoSection}>
            <View style={styles.demoCard}>
              <ThemedText style={styles.demoIcon}>💡</ThemedText>
              <View style={styles.demoContent}>
                <ThemedText type="defaultSemiBold" style={styles.demoTitle}>
                  Demo Mode
                </ThemedText>
                <ThemedText type="default" style={styles.demoText}>
                  Use any email and password to login
                </ThemedText>
                <ThemedText type="default" style={styles.demoExample}>
                  Example: test@example.com / password123
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText type="default" style={styles.footerText}>
              Your spiritual journey begins here
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    color: '#666',
  },
  formContainer: {
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordInput: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 16,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 4,
    zIndex: 1,
  },
  eyeIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  helpText: {
    color: '#666',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoSection: {
    marginBottom: 30,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  demoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 16,
    color: '#856404',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 2,
  },
  demoExample: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});
