import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
// import Tesseract from 'tesseract.js'; // Disabled due to React Native Worker compatibility issues



export default function RegisterScreen() {
  const { t } = useLanguage();
  
  // Stepper states
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationType, setRegistrationType] = useState<'email' | 'phone' | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState<string | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<string | null>(null);
  
  // Aadhaar form states
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [age, setAge] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  
  // Registration response data
  const [userId, setUserId] = useState<number | null>(null);
  const [nextStepValue, setNextStepValue] = useState<string | null>(null);
  const [verificationType, setVerificationType] = useState<string | null>(null);
  const [receivedOTP, setReceivedOTP] = useState<string | null>(null);
  
  // Enhanced form validation states
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // Animation refs - Start with visible values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Initialize animations on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Stepper functions
  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectRegistrationType = (type: 'email' | 'phone') => {
    setRegistrationType(type);
    nextStep();
  };

  // Enhanced validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateOTP = (otp: string) => {
    const otpRegex = /^\d{4}$/;
    return otpRegex.test(otp);
  };

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!validateEmail(value)) error = 'Please enter a valid email';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!validatePhone(value)) error = 'Please enter a valid 10-digit phone number';
        break;
      case 'password':
        if (!value.trim()) error = 'Password is required';
        else if (!validatePassword(value)) error = 'Password must be at least 6 characters';
        break;
      case 'confirmPassword':
        if (!value.trim()) error = 'Confirm password is required';
        else if (value !== password) error = 'Passwords do not match';
        break;
      case 'otp':
        if (!value.trim()) error = 'OTP is required';
        else if (!validateOTP(value)) error = 'Please enter a valid 4-digit OTP';
        break;
    }
    
    return error;
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let value = '';
    switch (field) {
      case 'email': value = email; break;
      case 'phone': value = phone; break;
      case 'password': value = password; break;
      case 'confirmPassword': value = confirmPassword; break;
      case 'otp': value = otp; break;
    }
    
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Step validation functions
  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (registrationType === 'email') {
      newErrors.email = validateField('email', email);
    } else if (registrationType === 'phone') {
      newErrors.phone = validateField('phone', phone);
    }
    
    newErrors.password = validateField('password', password);
    newErrors.confirmPassword = validateField('confirmPassword', confirmPassword);
    
    setErrors(newErrors);
    setTouched({ email: true, phone: true, password: true, confirmPassword: true });
    
    return Object.values(newErrors).every(error => error === '');
  };

  const validateStep3 = () => {
    const newErrors: {[key: string]: string} = {};
    newErrors.otp = validateField('otp', otp);
    
    setErrors(newErrors);
    setTouched({ otp: true });
    
    return Object.values(newErrors).every(error => error === '');
  };

  // Registration API call
  const callRegistrationAPI = async () => {
    try {
      setLoading(true);
      
      const requestData = registrationType === 'email' 
        ? {
            email: email,
            password: password,
            registrationMethod: 'email'
          }
        : {
            phone: phone,
            password: password,
            registrationMethod: 'phone'
          };

      console.log('Registration API call with data:', requestData);

      const response = await fetch('http://192.168.1.5:5000/api/mobile/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Registration API response:', data);

      if (response.ok && data.success) {
        // Save registration response data
        if (data.data) {
          setUserId(data.data.userId);
          setNextStepValue(data.data.nextStep);
          setVerificationType(registrationType || 'email');
          if (data.data.otp) {
            setReceivedOTP(data.data.otp);
            setOtp(data.data.otp); // Auto-fill OTP field
          }
        }
        
        // Registration successful
        Alert.alert('Success', data.message || 'Registration successful!', [
          { text: 'OK', onPress: () => nextStep() }
        ]);
      } else {
        // Registration failed
        Alert.alert('Registration Failed', data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration API error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification API call
  const callOTPVerificationAPI = async () => {
    try {
      setLoading(true);
      
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please try registering again.');
        return;
      }

      const requestData = {
        userId: userId,
        otp: otp,
        verificationType: verificationType
      };

      console.log('OTP Verification API call with data:', requestData);

      const response = await fetch('http://192.168.1.5:5000/api/mobile/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('OTP Verification API response:', data);

      if (response.ok && data.success) {
        // OTP verification successful
        Alert.alert('Success', data.message || 'OTP verified successfully!', [
          { text: 'OK', onPress: () => nextStep() }
        ]);
      } else {
        // OTP verification failed
        Alert.alert('Verification Failed', data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP Verification API error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Convert image to base64 with compression
  const convertImageToBase64 = async (imageUri: string): Promise<string | null> => {
    try {
      // First, get image info to check size
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      if (imageInfo.exists && 'size' in imageInfo) {
        console.log('Image size:', imageInfo.size, 'bytes');
      }
      
      // If image is too large, we might want to compress it
      // For now, we'll proceed with the original image
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64' as any,
      });
      
      console.log('Base64 length:', base64.length, 'characters');
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // Aadhaar Image Upload API call
  const callAadhaarImageUploadAPI = async (imageUri: string, imageType: 'front' | 'back') => {
    try {
      setLoading(true);
      
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please try registering again.');
        return;
      }

      // Convert image to base64
      const base64Data = await convertImageToBase64(imageUri);
      if (!base64Data) {
        Alert.alert('Error', 'Failed to process image. Please try again.');
        return;
      }

      const requestData = {
        userId: userId,
        imageType: imageType,
        imageData: base64Data
      };

      console.log('Aadhaar Image Upload API call with data:', {
        ...requestData,
        imageData: `${base64Data.substring(0, 50)}...` // Log only first 50 chars
      });

      const response = await fetch('http://192.168.1.5:5000/api/mobile/upload-aadhaar-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Aadhaar Image Upload API response:', data);

      if (response.ok && data.success) {
        // Image upload successful
        Alert.alert('Success', data.message || `${imageType} image uploaded successfully!`, [
          { text: 'OK', onPress: () => nextStep() }
        ]);
      } else {
        // Image upload failed
        Alert.alert('Upload Failed', data.message || `Failed to upload ${imageType} image. Please try again.`);
      }
    } catch (error) {
      console.error('Aadhaar Image Upload API error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      if (validateStep2()) {
        callRegistrationAPI();
      } else {
        Alert.alert('Validation Error', 'Please fix the errors before proceeding');
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        callOTPVerificationAPI();
      } else {
        Alert.alert('Validation Error', 'Please enter a valid OTP');
      }
    } else if (currentStep === 4) {
      if (aadhaarFront) {
        // Call API to upload front image
        await callAadhaarImageUploadAPI(aadhaarFront, 'front');
      } else {
        Alert.alert('Upload Required', 'Please upload Aadhaar front side first');
      }
    } else if (currentStep === 5) {
      if (aadhaarBack) {
        // Call API to upload back image
        await callAadhaarImageUploadAPI(aadhaarBack, 'back');
      } else {
        Alert.alert('Upload Required', 'Please upload Aadhaar back side first');
      }
    } else if (currentStep === 6) {
      if (aadhaarNumber && age && name && address) {
        Alert.alert('Success', 'Registration completed! Welcome to Tirth Yatra!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Missing Information', 'Please fill all required fields');
      }
    } else {
      nextStep();
    }
  };

  // 🟢 Aadhaar upload
  const handleAadhaarUpload = async (type: 'front' | 'back') => {
    Alert.alert(
      'Upload Aadhaar',
      `Upload ${type} side of Aadhaar card`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openCamera(type) },
        { text: 'Gallery', onPress: () => openGallery(type) }
      ]
    );
  };

  const openCamera = async (type: 'front' | 'back') => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduced quality to compress image
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await processImage(imageUri, type);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async (type: 'front' | 'back') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduced quality to compress image
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await processImage(imageUri, type);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  // 🟢 Process image (simplified - no automatic API call)
  const processImage = useCallback(async (imageUri: string, type: 'front' | 'back') => {
    try {
      if (type === 'front') {
        setAadhaarFront(imageUri);
        Alert.alert('Front Side Uploaded', 'Front side uploaded successfully!');
      } else {
        setAadhaarBack(imageUri);
        Alert.alert('Back Side Uploaded', 'Back side uploaded successfully!');
      }
    } catch (error) {
      console.error('Image processing error:', error);
      Alert.alert('Error', 'Failed to process image');
    }
  }, []);



  // 🟢 Enhanced UI Part
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
            <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
          </TouchableOpacity>

          {headerMenuVisible && (
            <View style={styles.headerDropdown}>
              <View style={styles.dropdownItem}>
                <Ionicons name="language-outline" size={20} color="#000" />
                <View style={styles.languageDropdownContainer}>
                  <LanguageDropdown />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Main Scroll with KeyboardAvoidingView */}
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
              {/* Step Indicator */}
              <View style={styles.stepIndicator}>
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <View key={step} style={styles.stepContainer}>
                    <View style={[
                      styles.stepCircle,
                      currentStep >= step && styles.stepCircleActive
                    ]}>
                      <Text style={[
                        styles.stepNumber,
                        currentStep >= step && styles.stepNumberActive
                      ]}>
                        {step}
                      </Text>
                    </View>
                    {step < 6 && (
                      <View style={[
                        styles.stepLine,
                        currentStep > step && styles.stepLineActive
                      ]} />
                    )}
                  </View>
                ))}
              </View>

              {/* Step 1: Registration Type Selection */}
              {currentStep === 1 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{t('chooseRegistrationMethod')}</Text>
                  <Text style={styles.stepSubtitle}>{t('howWouldYouLikeToRegister')}</Text>
                  
                  <TouchableOpacity 
                    style={styles.registrationOption}
                    onPress={() => selectRegistrationType('email')}
                  >
                    <Ionicons name="mail-outline" size={24} color="#007AFF" />
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>{t('email')}</Text>
                      <Text style={styles.optionSubtitle}>{t('registerWithEmail')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.registrationOption}
                    onPress={() => selectRegistrationType('phone')}
                  >
                    <Ionicons name="call-outline" size={24} color="#007AFF" />
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>{t('phone')}</Text>
                      <Text style={styles.optionSubtitle}>{t('registerWithPhone')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 2: Registration Form */}
              {currentStep === 2 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {registrationType === 'email' ? t('emailRegistration') : t('phoneRegistration')}
                  </Text>
                  <Text style={styles.stepSubtitle}>Enter your details to continue</Text>

                  {registrationType === 'email' ? (
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
                          placeholder="Enter your email"
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
                          placeholder="Enter your phone number"
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
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        onBlur={() => handleFieldBlur('password')}
                        secureTextEntry
                      />
                    </View>
                    {errors.password && touched.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('confirmPassword')} *</Text>
                    <View style={[
                      styles.inputWrapper,
                      errors.confirmPassword && touched.confirmPassword && styles.inputError
                    ]}>
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={20} 
                        color={errors.confirmPassword && touched.confirmPassword ? "#ff4444" : "#666"} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Confirm your password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onBlur={() => handleFieldBlur('confirmPassword')}
                        secureTextEntry
                      />
                    </View>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Step 3: OTP Verification */}
              {currentStep === 3 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{t('verifyOTP')}</Text>
                  <Text style={styles.stepSubtitle}>
                    {t('enterOTP')} {registrationType === 'email' ? email : phone}
                  </Text>
                  
                  {receivedOTP && (
                    <View style={styles.otpDisplayContainer}>
                      <Text style={styles.otpDisplayText}>
                        Received OTP: {receivedOTP}
                      </Text>
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>OTP *</Text>
                    <View style={[
                      styles.inputWrapper,
                      errors.otp && touched.otp && styles.inputError
                    ]}>
                      <Ionicons 
                        name="key-outline" 
                        size={20} 
                        color={errors.otp && touched.otp ? "#ff4444" : "#666"} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder={receivedOTP ? `Received OTP: ${receivedOTP}` : "Enter 4-digit OTP"}
                        placeholderTextColor="#999"
                        value={otp}
                        onChangeText={setOtp}
                        onBlur={() => handleFieldBlur('otp')}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>
                    {errors.otp && touched.otp && (
                      <Text style={styles.errorText}>{errors.otp}</Text>
                    )}
                  </View>

                  <TouchableOpacity style={styles.resendButton}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 4: Aadhaar Front Upload */}
              {currentStep === 4 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{t('uploadAadhaarFront')}</Text>
                  <Text style={styles.stepSubtitle}>{t('takeClearPhoto')}</Text>

                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={() => handleAadhaarUpload('front')}
                  >
                    <Ionicons name="camera-outline" size={48} color="#007AFF" />
                    <Text style={styles.uploadText}>{t('tapToUploadFront')}</Text>
                    <Text style={styles.uploadSubtext}>{t('makeSureDetailsVisible')}</Text>
                  </TouchableOpacity>

                  {aadhaarFront && (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: aadhaarFront }} style={styles.previewImage} />
                      <View style={styles.imageStatus}>
                        <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                        <Text style={styles.imageStatusText}>{t('frontSideUploaded')}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Step 5: Aadhaar Back Upload */}
              {currentStep === 5 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{t('uploadAadhaarBack')}</Text>
                  <Text style={styles.stepSubtitle}>{t('takeClearPhoto')}</Text>

                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={() => handleAadhaarUpload('back')}
                  >
                    <Ionicons name="camera-outline" size={48} color="#007AFF" />
                    <Text style={styles.uploadText}>{t('tapToUploadBack')}</Text>
                    <Text style={styles.uploadSubtext}>{t('makeSureDetailsVisible')}</Text>
                  </TouchableOpacity>

                  <View style={styles.imagePreviewContainer}>
                    {aadhaarBack ? (
                      <>
                        <Image source={{ uri: aadhaarBack }} style={styles.previewImage} />
                        <View style={styles.imageStatus}>
                          <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                          <Text style={styles.imageStatusText}>{t('backSideUploaded')}</Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderText}>{t('noImageUploadedYet')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Step 6: Aadhaar Details Form */}
              {currentStep === 6 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{t('aadhaarDetails')}</Text>
                  <Text style={styles.stepSubtitle}>
                    {t('pleaseEnterAadhaarDetails')}
                  </Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Aadhaar Number *</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons 
                        name="card-outline" 
                        size={20} 
                        color="#666" 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter 12-digit Aadhaar number"
                        placeholderTextColor="#999"
                        value={aadhaarNumber}
                        onChangeText={setAadhaarNumber}
                        keyboardType="numeric"
                        maxLength={12}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Age *</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons 
                        name="calendar-outline" 
                        size={20} 
                        color="#666" 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your age"
                        placeholderTextColor="#999"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Full Name *</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons 
                        name="person-outline" 
                        size={20} 
                        color="#666" 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Address *</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons 
                        name="location-outline" 
                        size={20} 
                        color="#666" 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={styles.textArea}
                        placeholder="Enter your complete address"
                        placeholderTextColor="#999"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Navigation Buttons */}
              <View style={styles.navigationContainer}>
                {currentStep > 1 && (
                  <TouchableOpacity 
                    style={styles.backButton}
                    onPress={prevStep}
                  >
                    <Ionicons name="chevron-back" size={20} color="#007AFF" />
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[
                    styles.nextButton,
                    currentStep === 1 && styles.nextButtonDisabled,
                    loading && styles.nextButtonDisabled
                  ]}
                  onPress={handleNext}
                  disabled={currentStep === 1 || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.nextButtonText}>
                        {currentStep === 6 ? 'Complete' : 'Next'}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>

        {/* Fixed Footer */}
        <View style={styles.mainFooter}>
          <Text style={styles.footerText}></Text>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50, // Added more space from top
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerMenuButton: { padding: 5 },
  headerDropdown: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  languageDropdownContainer: {
    marginLeft: 8,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    justifyContent: 'center',
  },
  formTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#000',
    textAlign: 'center', 
    marginBottom: 8 
  },
  formSubtitle: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 32 
  },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#000',
    marginBottom: 4 
  },
  inputContainer: { marginBottom: 20 },
  inputLabel: { 
    fontSize: 14,
    fontWeight: '500', 
    color: '#000',
    marginBottom: 8 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
  },
  inputIcon: { marginRight: 12 },
  textInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#000',
    paddingVertical: 12 
  },
  textArea: { 
    height: 80, 
    textAlignVertical: 'top',
    paddingTop: 12 
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  uploadContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  previewImage: { 
    width: '100%', 
    height: 150, 
    borderRadius: 6, 
    marginTop: 16,
    resizeMode: 'cover',
    opacity: 1,
  },
  ocrProcessingContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  ocrProcessingText: { 
    marginLeft: 8, 
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500'
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  registerButtonDisabled: { backgroundColor: '#ccc' },
  registerButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  // Stepper styles
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#007AFF',
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 15,
    height: 2,
    backgroundColor: '#e1e5e9',
    marginHorizontal: 2,
  },
  stepLineActive: {
    backgroundColor: '#007AFF',
  },
  stepContent: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  // Registration type selection
  registrationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // Upload styles
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#007AFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#666',
  },
  imagePreviewContainer: {
    marginTop: 20,
    opacity: 1,
    minHeight: 200,
  },
  imageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    opacity: 1,
  },
  imageStatusText: {
    fontSize: 14,
    color: '#28a745',
    marginLeft: 8,
    fontWeight: '500',
  },
  // Resend button
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  // OTP Display
  otpDisplayContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  otpDisplayText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Navigation buttons
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  // Footer styles
  mainFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    opacity: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  placeholderContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginTop: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
