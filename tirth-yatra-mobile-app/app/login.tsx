import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';

export default function LoginScreen() {
  const { t, language } = useLanguage();
  
  // Form states
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  
  // Form validation states
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // Login error state
  const [loginError, setLoginError] = useState<string | null>(null);


  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  // Validate password
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // Validate field
  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'email':
        if (!value.trim()) error = t('emailRequired');
        else if (!validateEmail(value)) error = t('validEmailRequired');
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!validatePhone(value)) error = 'Please enter a valid 10-digit phone number';
        break;
      case 'password':
        if (!value.trim()) error = t('passwordRequired');
        else if (!validatePassword(value)) error = t('passwordMinLength');
        break;
    }
    
    return error;
  };

  // Handle field blur
  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let value = '';
    if (field === 'email') value = email;
    else if (field === 'phone') value = phone;
    else if (field === 'password') value = password;
    
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Login API call
  const callLoginAPI = async () => {
    try {
      setLoading(true);
      setLoginError(null); // Clear any previous errors
      
      const requestData: any = {
        password: password
      };

      // Add email or phone based on login type
      if (loginType === 'email') {
        requestData.email = email;
        // Store credentials for later use
        await AsyncStorage.setItem('userEmail', email);
      } else {
        requestData.phone = phone;
        // Store credentials for later use
        await AsyncStorage.setItem('userPhone', phone);
      }

      await AsyncStorage.setItem('userPassword', password);

      const response = await fetch('http://192.168.1.3:5000/api/mobile/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      // Save token if available
      if (data.data && data.data.token) {
        await AsyncStorage.setItem('userToken', data.data.token);
      }

      // Save userId if available
      if (data.data && data.data.userId) {
        await AsyncStorage.setItem('userId', data.data.userId.toString());
      }

      // Check for 401 status first (registration incomplete)
      if (response.status === 401 && data.data && data.data.requiresVerification) {
        // Check if user has completed Step 6
        if (data.data.step6Completed && data.data.redirectToStep === 7) {
          // Step 6 completed but not approved - redirect to dashboard with message
          router.push({
            pathname: '/dashboard',
            params: { loginError: data.message || t('accountInReview') }
          } as any);
        } else {
          // User needs to complete registration - redirect to appropriate step
          router.push({
            pathname: '/register',
            params: { 
              step: data.data.redirectToStep?.toString() || '3',
              userId: data.data.userId?.toString(),
              email: data.data.email || '',
              phone: data.data.phone || '',
              password: data.data.password || '',
              otp: data.data.otp || '',
              otp_expiry: data.data.otp_expiry || '',
              registrationType: data.data.registrationMethod || 'email',
              hasAadhaarFront: data.data.hasAadhaarFront?.toString() || 'false',
              hasAadhaarBack: data.data.hasAadhaarBack?.toString() || 'false',
              aadhaarNumber: data.data.aadhaarNumber || '',
              aadhaarName: data.data.aadhaarName || '',
              age: data.data.age || '',
              aadhaarAddress: data.data.aadhaarAddress || ''
            }
          } as any);
        }
      } else if (response.ok && data.success) {
        // Check if user is active and approved
        if (data.data.accountStatus === 'approved') {
          // User fully verified and approved - redirect to dashboard
          router.push({
            pathname: '/dashboard',
            params: { loginSuccess: 'true' }
          } as any);
        } else {
          // User not approved yet - redirect to dashboard with message
          router.push({
            pathname: '/dashboard',
            params: { loginError: data.message || t('accountInReview') }
          } as any);
        }
      } else {
        // Login failed - show error on login page only
        setLoginError(data.message || t('invalidCredentials'));
      }
    } catch (error) {
      // Network error - redirect to dashboard with error
      router.push({
        pathname: '/dashboard',
        params: { loginError: t('networkError') }
      } as any);
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = () => {
    // Validate all fields based on login type
    let emailError = '';
    let phoneError = '';
    
    if (loginType === 'email') {
      emailError = validateField('email', email);
    } else {
      phoneError = validateField('phone', phone);
    }
    
    const passwordError = validateField('password', password);
    
    setErrors({
      email: emailError,
      phone: phoneError,
      password: passwordError
    });
    
    setTouched({
      email: loginType === 'email',
      phone: loginType === 'phone',
      password: true
    });

    // If no errors, proceed with login
    const hasErrors = loginType === 'email' 
      ? (emailError || passwordError) 
      : (phoneError || passwordError);
      
    if (!hasErrors) {
      callLoginAPI();
    } else {
      Alert.alert(t('validationError'), t('pleaseFixErrors'));
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <Text style={styles.headerTitle}>Tirth Yatra</Text>
          <TouchableOpacity 
            style={styles.headerMenuButton}
            onPress={() => setHeaderMenuVisible(!headerMenuVisible)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
          
          {headerMenuVisible && (
            <View style={styles.headerDropdown}>
              <LanguageDropdown />
            </View>
          )}
        </View>

        {/* Main Content */}
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>{t('welcomeBack')}</Text>
              <Text style={styles.formSubtitle}>{t('signInToAccount')}</Text>

              {/* Login Type Toggle */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity 
                  style={[
                    styles.toggleButton, 
                    loginType === 'email' && styles.toggleButtonActive
                  ]}
                  onPress={() => setLoginType('email')}
                >
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={loginType === 'email' ? '#fff' : '#666'} 
                  />
                  <Text style={[
                    styles.toggleText,
                    loginType === 'email' && styles.toggleTextActive
                  ]}>
                    {t('email')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.toggleButton, 
                    loginType === 'phone' && styles.toggleButtonActive
                  ]}
                  onPress={() => setLoginType('phone')}
                >
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={loginType === 'phone' ? '#fff' : '#666'} 
                  />
                  <Text style={[
                    styles.toggleText,
                    loginType === 'phone' && styles.toggleTextActive
                  ]}>
                    {t('phone')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Email or Phone Input - Based on Login Type */}
              {loginType === 'email' ? (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('email')} *</Text>
                  <View style={[
                    styles.inputWrapper,
                    errors.email && touched.email && styles.inputError
                  ]}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color={errors.email && touched.email ? "#ff4444" : "#666"} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('enterYourEmail')}
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      onBlur={() => handleFieldBlur('email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('phone')} *</Text>
                  <View style={[
                    styles.inputWrapper,
                    errors.phone && touched.phone && styles.inputError
                  ]}>
                    <Ionicons 
                      name="call-outline" 
                      size={20} 
                      color={errors.phone && touched.phone ? "#ff4444" : "#666"} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('enterYourPhone')}
                      placeholderTextColor="#999"
                      value={phone}
                      onChangeText={setPhone}
                      onBlur={() => handleFieldBlur('phone')}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                  {errors.phone && touched.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>
              )}

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('password')} *</Text>
                <View style={[
                  styles.inputWrapper,
                  errors.password && touched.password && styles.inputError
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={errors.password && touched.password ? "#ff4444" : "#666"} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('enterYourPassword')}
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() => handleFieldBlur('password')}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Login Error Message - Only for Invalid Credentials */}
              {loginError && (
                <View style={styles.errorContainer}>
                  <View style={styles.errorCard}>
                    <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
                    <Text style={styles.loginErrorText}>{loginError}</Text>
                  </View>
                </View>
              )}

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>{t('signIn')}</Text>
                )}
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>{t('dontHaveAccount')} </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.registerLink}>{t('registerNow')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  keyboardAvoidingView: { 
    flex: 1,
    flexGrow: 1,
  },
  scrollContent: { 
    flexGrow: 1, 
    padding: 20,
    paddingBottom: 40,
    minHeight: '100%',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  // Toggle container
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 5,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },
  // Login error styles
  errorContainer: {
    marginBottom: 20,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loginErrorText: {
    color: '#ff4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    opacity: 1,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});