import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'pa';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  en: {
    // Header
    'title': 'Title',
    'signIn': 'SignIn',
    'signUp': 'SignUp',
    'language': 'Language',
    
    // Tabs
    'upcoming': 'Upcoming',
    'current': 'Current',
    'details': 'Details',
    'accommodation': 'Accommodation',
    'food': 'Food',
    'events': 'Events',
    
    // Trip details
    'tripTitle': 'Title',
    'description': 'Description',
    'startDate': 'Start Date',
    'endDate': 'End Date',
    'lastUpdated': 'Last updated',
    'status': 'Status',
    
    // Accommodation
    'selectAccommodation': 'Select different accommodation vendors for specific days',
    'vendor': 'Vendor',
    'noStartTime': 'No start time',
    'noEndTime': 'No end time',
    'noAccommodationData': 'No accommodation data available',
    
    // Food
    'selectFood': 'Select different food vendors for specific days',
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner',
    'noFoodData': 'No food data available',
    'categories': 'Categories',
    'items': 'Items',
    'schedules': 'Schedules',
    
    // Events
    'selectEvents': 'Select different events for specific days',
    'eventTitle': 'Event Title',
    'eventDescription': 'Event Description',
    'startTime': 'Start Time',
    'endTime': 'End Time',
    'noEventsData': 'No events data available',
    
    // Event translations
    'onboardingBus': 'Onboarding Bus',
    'hotelCheckin': 'Hotel Checkin',
    'gangaVisit': 'Ganga Visit',
    'templeVisit': 'Temple Visit',
    
    // Days
    'day': 'Day',
    'monday': 'Monday',
    'tuesday': 'Tuesday',
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday',
    'sunday': 'Sunday',
    
    // Months
    'january': 'January',
    'february': 'February',
    'march': 'March',
    'april': 'April',
    'may': 'May',
    'june': 'June',
    'july': 'July',
    'august': 'August',
    'september': 'September',
    'october': 'October',
    'november': 'November',
    'december': 'December',
    
    // Buttons
    'back': 'Back',
    'apply': 'Apply',
    'retry': 'Retry',
    'useSampleData': 'Use Sample Data',
    
    // Loading/Error states
    'loadingTrips': 'Loading trips...',
    'loadingTripDetails': 'Loading trip details...',
    'failedToLoadTrips': 'Failed to load trips',
    'failedToLoadTripDetails': 'Failed to load trip details',
    'noUpcomingTrips': 'No upcoming trips found',
    'noCurrentTrips': 'No current trips found',
    'connectionError': 'Connection Error',
    'unableToConnect': 'Unable to connect to the server. Please check:\n\n1. Backend server is running on port 5000\n2. Use your computer\'s IP address instead of localhost\n3. Check your network connection',
    
    // Footer
    'helpText': 'help icon in footer all places',
    
    // Carousel
    'auto': 'Auto',
    
    // Registration Form
    'chooseRegistrationMethod': 'Choose Registration Method',
    'howWouldYouLikeToRegister': 'How would you like to register?',
    'emailRegistration': 'Email Registration',
    'phoneRegistration': 'Phone Registration',
    'registerWithEmail': 'Register with your email address',
    'registerWithPhone': 'Register with your phone number',
    'email': 'Email',
    'phone': 'Phone',
    'password': 'Password',
    'confirmPassword': 'Confirm Password',
    'verifyOTP': 'Verify OTP',
    'enterOTP': 'Enter the 6-digit OTP sent to',
    'uploadAadhaarFront': 'Upload Aadhaar Front',
    'uploadAadhaarBack': 'Upload Aadhaar Back',
    'takeClearPhoto': 'Take a clear photo of your Aadhaar card',
    'tapToUploadFront': 'Tap to Upload Front Side',
    'tapToUploadBack': 'Tap to Upload Back Side',
    'makeSureDetailsVisible': 'Make sure all details are visible',
    'frontSideUploaded': 'Front side uploaded successfully',
    'backSideUploaded': 'Back side uploaded successfully',
    'aadhaarDetails': 'Aadhaar Details',
    'pleaseEnterAadhaarDetails': 'Please enter your Aadhaar card details',
    'aadhaarNumber': 'Aadhaar Number',
    'enterAadhaarNumber': 'Enter 12-digit Aadhaar number',
    'age': 'Age',
    'enterAge': 'Enter your age',
    'fullName': 'Full Name',
    'enterFullName': 'Enter your full name',
    'address': 'Address',
    'enterAddress': 'Enter your complete address',
    'next': 'Next',
    'complete': 'Complete',
    'alreadyHaveAccount': 'Already have an account?',
    'noImageUploadedYet': 'No image uploaded yet',
    
    // Login Page
    'welcomeBack': 'Welcome Back',
    'signInToAccount': 'Sign in to your account',
    'enterYourEmail': 'Enter your email',
    'enterYourPhone': 'Enter your phone number',
    'enterYourPassword': 'Enter your password',
    'confirmYourPassword': 'Confirm your password',
    'forgotPassword': 'Forgot Password?',
    'dontHaveAccount': "Don't have an account?",
    'registerNow': 'Register Now',
    
    // Login/Authentication errors
    'invalidCredentials': 'Invalid credentials. Please try again.',
    'accountDeactivated': 'Account is deactivated',
    'passwordRequired': 'Password is required',
    'accountInReview': 'Your account is in review. You will receive notification as soon as your account is approved.',
    'networkError': 'Network error. Please check your connection and try again.',
    'loginSuccessful': 'Login successful',
    'errorDuringLogin': 'Error during login',
    'serverError': 'Server error. Please try again later.',
    
    // Registration errors
    'emailRequired': 'Email is required',
    'phoneRequired': 'Phone is required',
    'validEmailRequired': 'Please provide a valid email',
    'validPhoneRequired': 'Please provide a valid phone number',
    'passwordMinLength': 'Password must be at least 6 characters',
    'passwordsDoNotMatch': 'Passwords do not match',
    'userAlreadyExists': 'User already exists with this email/phone',
    'otpSentSuccessfully': 'OTP sent successfully',
    'failedToSendOtp': 'Failed to send OTP',
    'invalidOtp': 'Invalid OTP',
    'otpExpired': 'OTP has expired',
    'otpVerifiedSuccessfully': 'Verification successful',
    'registrationSuccessful': 'Registration successful. Please verify your account.',
    'errorDuringRegistration': 'Error during registration',
    'registrationFailed': 'Registration Failed',
    'verificationFailed': 'Verification Failed',
    'userIdNotFound': 'User ID not found. Please try registering again.',
    'emailOrPhoneNotFound': 'Email or phone not found. Please try registering again.',
    'otpResentSuccessfully': 'OTP resent successfully!',
    'failedToCompleteStep6': 'Failed to complete Step 6. Please try again.',
    'uploadRequired': 'Upload Required',
    'uploadAadhaarFrontFirst': 'Please upload Aadhaar front side first',
    'uploadAadhaarBackFirst': 'Please upload Aadhaar back side first',
    'missingInformation': 'Missing Information',
    'fillAllRequiredFields': 'Please fill all required fields',
    'uploadAadhaar': 'Upload Aadhaar',
    'permissionRequired': 'Permission Required',
    'cameraPermissionRequired': 'Camera permission is required',
    'galleryPermissionRequired': 'Gallery permission is required',
    'failedToOpenCamera': 'Failed to open camera',
    'failedToOpenGallery': 'Failed to open gallery',
    'failedToProcessImage': 'Failed to process image',
    'uploadFailed': 'Upload Failed',
    'processingFailed': 'Processing Failed',
    'aadhaarDataProcessedSuccessfully': 'Aadhaar data processed successfully!',
    'failedToProcessAadhaarData': 'Failed to process Aadhaar data. Please try again.',
    'imageUploadedSuccessfully': 'image uploaded successfully!',
    'failedToUploadImage': 'Failed to upload image. Please try again.',
    'success': 'Success',
    'error': 'Error',
    'validOtpRequired': 'Please enter a valid OTP',
    'signOut': 'Sign Out',
    'confirmSignOut': 'Are you sure you want to sign out? Your progress will be lost.',
    'cancel': 'Cancel',
    'ok': 'OK',
    
    // QR Code
    'showMyQR': 'Show My QR',
    'myQRCode': 'My QR Code',
    'qrCodeDescription': 'Show this QR code to staff for verification',
    'close': 'Close',
    
    // Validation errors
    'validationError': 'Validation Error',
    'pleaseFixErrors': 'Please fix the errors before proceeding',
    'allFieldsRequired': 'All fields are required',
    
    // Application Status
    'applicationPending': 'Your application is pending',
    'applicationApproved': 'Application approved',
    'applicationRejected': 'Application rejected',
    'applicationUnderReview': 'Application under review',
    
    // Trip Application Errors
    'accountNotApproved': 'Your account is not approved yet. Please wait for approval before applying for trips.',
    'accountUnderReview': 'Your account is currently under review. Please wait for approval before applying for trips.',
    'applicationSubmitted': 'Application Submitted',
    'applicationSubmittedSuccess': 'Your account is approved and trip application created successfully!',
    'applicationFailed': 'Application Failed',
    'applicationAlreadyExists': 'You have already applied for this trip. Please check My Trips section.',
    'failedToSubmitApplication': 'Failed to submit application. Please try again.',
    'pleaseLoginToApply': 'Please login to apply for trips',
    'pleaseCheckConnection': 'Please check your internet connection and try again.',
    'unableToVerifyUserTryAgain': 'Unable to verify user. Please try again.',
    
    // Dashboard
    'dashboard': 'Dashboard',
    'welcomeToTirthYatra': 'Welcome to Tirth Yatra',
    'menu': 'Menu',
    'myTrips': 'My Trips',
    'myTrip': 'My Trip',
    'allTrips': 'All Trips',
    'logout': 'Logout',
    'tripsPending': 'Trips Pending',
    'tripsApproved': 'Trips Approved',
    'tripsRejected': 'Trips Rejected',
    'tripsInReview': 'Trips In Review',
    'generalTripStatistics': 'General Trip Statistics',
    'myTripStatistics': 'My Trip Statistics',
    'total': 'Total',
    'currentTrip': 'Current Trip',
    'tripApproved': 'Trip Approved',
    'tripReview': 'Trip Review',
    'tripRejected': 'Trip Rejected',
    'totalTripPublished': 'Total Trip (Published)',
    'upcomingTrip': 'Upcoming Trip',
    'completedTrip': 'Completed Trip',
    'currentTripToday': 'Current Trip (Today)',
    
    // My Trips Page
    'all': 'All',
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'review': 'Review',
    'loadingYourTrips': 'Loading your trips...',
    'noTripApplicationsFound': 'No trip applications found',
    'noApplicationsFound': 'applications found',
    'no': 'No',
    'pleaseLoginToViewTrips': 'Please login to view your trips',
    'unableToVerifyUser': 'Unable to verify user. Please login again.',
    'failedToFetchTrips': 'Failed to fetch trip applications',
  },
  pa: {
    // Header
    'title': 'ਸਿਰਲੇਖ',
    'signIn': 'ਸਾਈਨ ਇਨ',
    'signUp': 'ਸਾਈਨ ਅੱਪ',
    'language': 'ਭਾਸ਼ਾ',
    
    // Tabs
    'upcoming': 'ਆਉਣ ਵਾਲੇ',
    'current': 'ਮੌਜੂਦਾ',
    'details': 'ਵੇਰਵੇ',
    'accommodation': 'ਰਿਹਾਇਸ਼',
    'food': 'ਖਾਣਾ',
    'events': 'ਇਵੈਂਟਸ',
    
    // Trip details
    'tripTitle': 'ਸਿਰਲੇਖ',
    'description': 'ਵਰਣਨ',
    'startDate': 'ਸ਼ੁਰੂਆਤੀ ਤਾਰੀਖ',
    'endDate': 'ਅੰਤਿਮ ਤਾਰੀਖ',
    'lastUpdated': 'ਆਖਰੀ ਅਪਡੇਟ',
    'status': 'ਸਥਿਤੀ',
    
    // Accommodation
    'selectAccommodation': 'ਵੱਖ-ਵੱਖ ਦਿਨਾਂ ਲਈ ਵੱਖ-ਵੱਖ ਰਿਹਾਇਸ਼ ਵਿਕਰੇਤਾ ਚੁਣੋ',
    'vendor': 'ਵਿਕਰੇਤਾ',
    'noStartTime': 'ਕੋਈ ਸ਼ੁਰੂਆਤੀ ਸਮਾਂ ਨਹੀਂ',
    'noEndTime': 'ਕੋਈ ਅੰਤਿਮ ਸਮਾਂ ਨਹੀਂ',
    'noAccommodationData': 'ਕੋਈ ਰਿਹਾਇਸ਼ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ',
    
    // Food
    'selectFood': 'ਵੱਖ-ਵੱਖ ਦਿਨਾਂ ਲਈ ਵੱਖ-ਵੱਖ ਖਾਣਾ ਵਿਕਰੇਤਾ ਚੁਣੋ',
    'breakfast': 'ਨਾਸ਼ਤਾ',
    'lunch': 'ਦੁਪਹਿਰ ਦਾ ਖਾਣਾ',
    'dinner': 'ਰਾਤ ਦਾ ਖਾਣਾ',
    'noFoodData': 'ਕੋਈ ਖਾਣਾ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ',
    'categories': 'ਕੈਟੇਗਰੀਆਂ',
    'items': 'ਆਈਟਮਾਂ',
    'schedules': 'ਸਮਾਯੋਜਨ',
    
    // Events
    'selectEvents': 'ਵੱਖ-ਵੱਖ ਦਿਨਾਂ ਲਈ ਵੱਖ-ਵੱਖ ਇਵੈਂਟਸ ਚੁਣੋ',
    'eventTitle': 'ਇਵੈਂਟ ਸਿਰਲੇਖ',
    'eventDescription': 'ਇਵੈਂਟ ਵਰਣਨ',
    'startTime': 'ਸ਼ੁਰੂਆਤੀ ਸਮਾਂ',
    'endTime': 'ਅੰਤਿਮ ਸਮਾਂ',
    'noEventsData': 'ਕੋਈ ਇਵੈਂਟਸ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ',
    
    // Event translations
    'onboardingBus': 'ਬਸ ਚੜ੍ਹਨਾ',
    'hotelCheckin': 'ਹੋਟਲ ਚੈਕ-ਇਨ',
    'gangaVisit': 'ਗੰਗਾ ਦਰਸ਼ਨ',
    'templeVisit': 'ਮੰਦਿਰ ਦਰਸ਼ਨ',
    
    // Days
    'day': 'ਦਿਨ',
    'monday': 'ਸੋਮਵਾਰ',
    'tuesday': 'ਮੰਗਲਵਾਰ',
    'wednesday': 'ਬੁੱਧਵਾਰ',
    'thursday': 'ਵੀਰਵਾਰ',
    'friday': 'ਸ਼ੁੱਕਰਵਾਰ',
    'saturday': 'ਸ਼ਨੀਵਾਰ',
    'sunday': 'ਐਤਵਾਰ',
    
    // Months
    'january': 'ਜਨਵਰੀ',
    'february': 'ਫਰਵਰੀ',
    'march': 'ਮਾਰਚ',
    'april': 'ਅਪ੍ਰੈਲ',
    'may': 'ਮਈ',
    'june': 'ਜੂਨ',
    'july': 'ਜੁਲਾਈ',
    'august': 'ਅਗਸਤ',
    'september': 'ਸਤੰਬਰ',
    'october': 'ਅਕਤੂਬਰ',
    'november': 'ਨਵੰਬਰ',
    'december': 'ਦਸੰਬਰ',
    
    // Buttons
    'back': 'ਵਾਪਸ',
    'apply': 'ਲਾਗੂ ਕਰੋ',
    'retry': 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼',
    'useSampleData': 'ਨਮੂਨਾ ਡੇਟਾ ਵਰਤੋ',
    
    // Loading/Error states
    'loadingTrips': 'ਯਾਤਰਾਵਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...',
    'loadingTripDetails': 'ਯਾਤਰਾ ਵੇਰਵੇ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
    'failedToLoadTrips': 'ਯਾਤਰਾਵਾਂ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
    'failedToLoadTripDetails': 'ਯਾਤਰਾ ਵੇਰਵੇ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
    'noUpcomingTrips': 'ਕੋਈ ਆਉਣ ਵਾਲੀਆਂ ਯਾਤਰਾਵਾਂ ਨਹੀਂ ਮਿਲੀਆਂ',
    'noCurrentTrips': 'ਕੋਈ ਮੌਜੂਦਾ ਯਾਤਰਾਵਾਂ ਨਹੀਂ ਮਿਲੀਆਂ',
    'connectionError': 'ਕਨੈਕਸ਼ਨ ਗਲਤੀ',
    'unableToConnect': 'ਸਰਵਰ ਨਾਲ ਜੁੜਨ ਵਿੱਚ ਅਸਮਰੱਥ। ਕਿਰਪਾ ਕਰਕੇ ਜਾਂਚ ਕਰੋ:\n\n1. ਬੈਕਐਂਡ ਸਰਵਰ ਪੋਰਟ 5000 \'ਤੇ ਚੱਲ ਰਿਹਾ ਹੈ\n2. localhost ਦੀ ਬਜਾਏ ਆਪਣੇ ਕੰਪਿਊਟਰ ਦਾ IP ਪਤਾ ਵਰਤੋ\n3. ਆਪਣਾ ਨੈੱਟਵਰਕ ਕਨੈਕਸ਼ਨ ਜਾਂਚ ਕਰੋ',
    
    // Footer
    'helpText': 'ਫੁੱਟਰ ਵਿੱਚ ਸਾਰੀਆਂ ਥਾਵਾਂ \'ਤੇ ਮਦਦ ਆਈਕਨ',
    
    // Carousel
    'auto': 'ਆਟੋ',
    
    // Registration Form
    'chooseRegistrationMethod': 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਵਿਧੀ ਚੁਣੋ',
    'howWouldYouLikeToRegister': 'ਤੁਸੀਂ ਕਿਵੇਂ ਰਜਿਸਟਰ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
    'emailRegistration': 'ਈਮੇਲ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    'phoneRegistration': 'ਫੋਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    'registerWithEmail': 'ਆਪਣੇ ਈਮੇਲ ਪਤੇ ਨਾਲ ਰਜਿਸਟਰ ਕਰੋ',
    'registerWithPhone': 'ਆਪਣੇ ਫੋਨ ਨੰਬਰ ਨਾਲ ਰਜਿਸਟਰ ਕਰੋ',
    'email': 'ਈਮੇਲ',
    'phone': 'ਫੋਨ',
    'password': 'ਪਾਸਵਰਡ',
    'confirmPassword': 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    'verifyOTP': 'OTP ਦੀ ਜਾਂਚ ਕਰੋ',
    'enterOTP': 'ਭੇਜੇ ਗਏ 6-ਅੰਕੀ OTP ਦਰਜ ਕਰੋ',
    'uploadAadhaarFront': 'ਆਧਾਰ ਫਰੰਟ ਅਪਲੋਡ ਕਰੋ',
    'uploadAadhaarBack': 'ਆਧਾਰ ਬੈਕ ਅਪਲੋਡ ਕਰੋ',
    'takeClearPhoto': 'ਆਪਣੇ ਆਧਾਰ ਕਾਰਡ ਦੀ ਸਪਸ਼ਟ ਫੋਟੋ ਲਓ',
    'tapToUploadFront': 'ਫਰੰਟ ਸਾਈਡ ਅਪਲੋਡ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ',
    'tapToUploadBack': 'ਬੈਕ ਸਾਈਡ ਅਪਲੋਡ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ',
    'makeSureDetailsVisible': 'ਯਕੀਨੀ ਬਣਾਓ ਕਿ ਸਾਰੇ ਵੇਰਵੇ ਦਿਖਾਈ ਦੇ ਰਹੇ ਹਨ',
    'frontSideUploaded': 'ਫਰੰਟ ਸਾਈਡ ਸਫਲਤਾਪੂਰਵਕ ਅਪਲੋਡ ਹੋਇਆ',
    'backSideUploaded': 'ਬੈਕ ਸਾਈਡ ਸਫਲਤਾਪੂਰਵਕ ਅਪਲੋਡ ਹੋਇਆ',
    'aadhaarDetails': 'ਆਧਾਰ ਵੇਰਵੇ',
    'pleaseEnterAadhaarDetails': 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਆਧਾਰ ਕਾਰਡ ਦੇ ਵੇਰਵੇ ਦਰਜ ਕਰੋ',
    'aadhaarNumber': 'ਆਧਾਰ ਨੰਬਰ',
    'enterAadhaarNumber': '12-ਅੰਕੀ ਆਧਾਰ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    'age': 'ਉਮਰ',
    'enterAge': 'ਆਪਣੀ ਉਮਰ ਦਰਜ ਕਰੋ',
    'fullName': 'ਪੂਰਾ ਨਾਮ',
    'enterFullName': 'ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ',
    'address': 'ਪਤਾ',
    'enterAddress': 'ਆਪਣਾ ਪੂਰਾ ਪਤਾ ਦਰਜ ਕਰੋ',
    'next': 'ਅਗਲਾ',
    'complete': 'ਪੂਰਾ ਕਰੋ',
    'alreadyHaveAccount': 'ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ?',
    'noImageUploadedYet': 'ਅਜੇ ਤੱਕ ਕੋਈ ਚਿੱਤਰ ਅਪਲੋਡ ਨਹੀਂ ਹੋਇਆ',
    
    // Login Page
    'welcomeBack': 'ਜੀ ਆਇਆਂ ਨੂੰ',
    'signInToAccount': 'ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ',
    'enterYourEmail': 'ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ',
    'enterYourPhone': 'ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    'enterYourPassword': 'ਆਪਣਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ',
    'confirmYourPassword': 'ਆਪਣੇ ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    'forgotPassword': 'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?',
    'dontHaveAccount': 'ਖਾਤਾ ਨਹੀਂ ਹੈ?',
    'registerNow': 'ਹੁਣੇ ਰਜਿਸਟਰ ਕਰੋ',
    
    // Login/Authentication errors
    'invalidCredentials': 'ਗਲਤ ਪ੍ਰਮਾਣ ਪੱਤਰ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'accountDeactivated': 'ਖਾਤਾ ਬੰਦ ਹੋ ਗਿਆ ਹੈ',
    'passwordRequired': 'ਪਾਸਵਰਡ ਲੋੜੀਂਦਾ ਹੈ',
    'accountInReview': 'ਤੁਹਾਡਾ ਖਾਤਾ ਸਮੀਖਿਆ ਅਧੀਨ ਹੈ। ਤੁਹਾਨੂੰ ਜਲਦੀ ਹੀ ਸੂਚਨਾ ਮਿਲੇਗੀ ਜਦੋਂ ਤੁਹਾਡਾ ਖਾਤਾ ਮਨਜ਼ੂਰ ਹੋ ਜਾਂਦਾ ਹੈ।',
    'networkError': 'ਨੈੱਟਵਰਕ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਕਨੈਕਸ਼ਨ ਜਾਂਚੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'loginSuccessful': 'ਲੌਗਇਨ ਸਫਲ',
    'errorDuringLogin': 'ਲੌਗਇਨ ਦੌਰਾਨ ਗਲਤੀ',
    'serverError': 'ਸਰਵਰ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    
    // Registration errors
    'emailRequired': 'ਈਮੇਲ ਲੋੜੀਂਦੀ ਹੈ',
    'phoneRequired': 'ਫੋਨ ਲੋੜੀਂਦਾ ਹੈ',
    'validEmailRequired': 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਈਮੇਲ ਪ੍ਰਦਾਨ ਕਰੋ',
    'validPhoneRequired': 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਫੋਨ ਨੰਬਰ ਪ੍ਰਦਾਨ ਕਰੋ',
    'passwordMinLength': 'ਪਾਸਵਰਡ ਘੱਟੋ-ਘੱਟ 6 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ',
    'passwordsDoNotMatch': 'ਪਾਸਵਰਡ ਮੇਲ ਨਹੀਂ ਖਾਂਦੇ',
    'userAlreadyExists': 'ਇਸ ਈਮੇਲ/ਫੋਨ ਨਾਲ ਉਪਭੋਗਤਾ ਪਹਿਲਾਂ ਹੀ ਮੌਜੂਦ ਹੈ',
    'otpSentSuccessfully': 'OTP ਸਫਲਤਾਪੂਰਵਕ ਭੇਜਿਆ ਗਿਆ',
    'failedToSendOtp': 'OTP ਭੇਜਣ ਵਿੱਚ ਅਸਫਲ',
    'invalidOtp': 'ਗਲਤ OTP',
    'otpExpired': 'OTP ਦੀ ਮਿਆਦ ਖਤਮ ਹੋ ਗਈ ਹੈ',
    'otpVerifiedSuccessfully': 'ਪੁਸ਼ਟੀ ਸਫਲ',
    'registrationSuccessful': 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਖਾਤੇ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    'errorDuringRegistration': 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਦੌਰਾਨ ਗਲਤੀ',
    'registrationFailed': 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ',
    'verificationFailed': 'ਪ੍ਰਮਾਣਿਕਤਾ ਅਸਫਲ',
    'userIdNotFound': 'ਉਪਭੋਗਤਾ ID ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਰਜਿਸਟਰ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'emailOrPhoneNotFound': 'ਈਮੇਲ ਜਾਂ ਫੋਨ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਰਜਿਸਟਰ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'otpResentSuccessfully': 'OTP ਦੁਬਾਰਾ ਸਫਲਤਾਪੂਰਵਕ ਭੇਜਿਆ ਗਿਆ!',
    'failedToCompleteStep6': 'ਸਟੈਪ 6 ਪੂਰਾ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'uploadRequired': 'ਅਪਲੋਡ ਲੋੜੀਂਦਾ ਹੈ',
    'uploadAadhaarFrontFirst': 'ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਆਧਾਰ ਕਾਰਡ ਅਗਲਾ ਪਾਸਾ ਅਪਲੋਡ ਕਰੋ',
    'uploadAadhaarBackFirst': 'ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਆਧਾਰ ਕਾਰਡ ਪਿਛਲਾ ਪਾਸਾ ਅਪਲੋਡ ਕਰੋ',
    'missingInformation': 'ਗੁੰਮ ਜਾਣਕਾਰੀ',
    'fillAllRequiredFields': 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਲੋੜੀਂਦੇ ਖੇਤਰ ਭਰੋ',
    'uploadAadhaar': 'ਆਧਾਰ ਅਪਲੋਡ ਕਰੋ',
    'permissionRequired': 'ਇਜਾਜ਼ਤ ਲੋੜੀਂਦੀ ਹੈ',
    'cameraPermissionRequired': 'ਕੈਮਰੇ ਦੀ ਇਜਾਜ਼ਤ ਲੋੜੀਂਦੀ ਹੈ',
    'galleryPermissionRequired': 'ਗੈਲਰੀ ਦੀ ਇਜਾਜ਼ਤ ਲੋੜੀਂਦੀ ਹੈ',
    'failedToOpenCamera': 'ਕੈਮਰਾ ਖੋਲ੍ਹਣ ਵਿੱਚ ਅਸਫਲ',
    'failedToOpenGallery': 'ਗੈਲਰੀ ਖੋਲ੍ਹਣ ਵਿੱਚ ਅਸਫਲ',
    'failedToProcessImage': 'ਚਿੱਤਰ ਪ੍ਰੋਸੈਸ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
    'uploadFailed': 'ਅਪਲੋਡ ਅਸਫਲ',
    'processingFailed': 'ਪ੍ਰੋਸੈਸਿੰਗ ਅਸਫਲ',
    'aadhaarDataProcessedSuccessfully': 'ਆਧਾਰ ਡਾਟਾ ਸਫਲਤਾਪੂਰਵਕ ਪ੍ਰੋਸੈਸ ਹੋ ਗਿਆ!',
    'failedToProcessAadhaarData': 'ਆਧਾਰ ਡਾਟਾ ਪ੍ਰੋਸੈਸ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'imageUploadedSuccessfully': 'ਚਿੱਤਰ ਸਫਲਤਾਪੂਰਵਕ ਅਪਲੋਡ ਹੋ ਗਿਆ!',
    'failedToUploadImage': 'ਚਿੱਤਰ ਅਪਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'success': 'ਸਫਲ',
    'error': 'ਗਲਤੀ',
    'validOtpRequired': 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ OTP ਦਰਜ ਕਰੋ',
    'signOut': 'ਸਾਈਨ ਆਊਟ',
    'confirmSignOut': 'ਕੀ ਤੁਸੀਂ ਯਕੀਨੀ ਤੌਰ ਤੇ ਸਾਈਨ ਆਊਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ? ਤੁਹਾਡੀ ਤਰੱਕੀ ਗੁਆਚ ਜਾਵੇਗੀ।',
    'cancel': 'ਰੱਦ ਕਰੋ',
    'ok': 'ਠੀਕ ਹੈ',
    
    // QR Code
    'showMyQR': 'ਮੇਰਾ QR ਦਿਖਾਓ',
    'myQRCode': 'ਮੇਰਾ QR ਕੋਡ',
    'qrCodeDescription': 'ਪੁਸ਼ਟੀ ਲਈ ਇਹ QR ਕੋਡ ਸਟਾਫ ਨੂੰ ਦਿਖਾਓ',
    'close': 'ਬੰਦ ਕਰੋ',
    
    // Validation errors
    'validationError': 'ਪ੍ਰਮਾਣਿਕਤਾ ਗਲਤੀ',
    'pleaseFixErrors': 'ਕਿਰਪਾ ਕਰਕੇ ਅੱਗੇ ਵਧਣ ਤੋਂ ਪਹਿਲਾਂ ਗਲਤੀਆਂ ਨੂੰ ਠੀਕ ਕਰੋ',
    'allFieldsRequired': 'ਸਾਰੇ ਖੇਤਰ ਲੋੜੀਂਦੇ ਹਨ',
    
    // Application Status
    'applicationPending': 'ਤੁਹਾਡੀ ਅਰਜ਼ੀ ਬਕਾਇਆ ਹੈ',
    'applicationApproved': 'ਅਰਜ਼ੀ ਮਨਜ਼ੂਰ ਹੋ ਗਈ',
    'applicationRejected': 'ਅਰਜ਼ੀ ਰੱਦ ਕਰ ਦਿੱਤੀ ਗਈ',
    'applicationUnderReview': 'ਅਰਜ਼ੀ ਸਮੀਖਿਆ ਅਧੀਨ ਹੈ',
    
    // Trip Application Errors
    'accountNotApproved': 'ਤੁਹਾਡਾ ਖਾਤਾ ਅਜੇ ਮਨਜ਼ੂਰ ਨਹੀਂ ਹੋਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਯਾਤਰਾਵਾਂ ਲਈ ਅਰਜ਼ੀ ਦੇਣ ਤੋਂ ਪਹਿਲਾਂ ਮਨਜ਼ੂਰੀ ਦੀ ਉਡੀਕ ਕਰੋ।',
    'accountUnderReview': 'ਤੁਹਾਡਾ ਖਾਤਾ ਵਰਤਮਾਨ ਵਿੱਚ ਸਮੀਖਿਆ ਅਧੀਨ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਯਾਤਰਾਵਾਂ ਲਈ ਅਰਜ਼ੀ ਦੇਣ ਤੋਂ ਪਹਿਲਾਂ ਮਨਜ਼ੂਰੀ ਦੀ ਉਡੀਕ ਕਰੋ।',
    'applicationSubmitted': 'ਅਰਜ਼ੀ ਜਮ੍ਹਾਂ ਕੀਤੀ ਗਈ',
    'applicationSubmittedSuccess': 'ਤੁਹਾਡਾ ਖਾਤਾ ਮਨਜ਼ੂਰ ਹੈ ਅਤੇ ਯਾਤਰਾ ਅਰਜ਼ੀ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਈ ਗਈ!',
    'applicationFailed': 'ਅਰਜ਼ੀ ਅਸਫਲ',
    'applicationAlreadyExists': 'ਤੁਸੀਂ ਇਸ ਯਾਤਰਾ ਲਈ ਪਹਿਲਾਂ ਹੀ ਅਰਜ਼ੀ ਦੇ ਚੁੱਕੇ ਹੋ। ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀਆਂ ਯਾਤਰਾਵਾਂ ਸੈਕਸ਼ਨ ਦੇਖੋ।',
    'failedToSubmitApplication': 'ਅਰਜ਼ੀ ਜਮ੍ਹਾਂ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'pleaseLoginToApply': 'ਕਿਰਪਾ ਕਰਕੇ ਯਾਤਰਾਵਾਂ ਲਈ ਅਰਜ਼ੀ ਦੇਣ ਲਈ ਲੌਗਇਨ ਕਰੋ',
    'pleaseCheckConnection': 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਜਾਂਚੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'unableToVerifyUserTryAgain': 'ਉਪਭੋਗਤਾ ਦੀ ਪੁਸ਼ਟੀ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    
    // Dashboard
    'dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'welcomeToTirthYatra': 'ਤੀਰਥ ਯਾਤਰਾ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ',
    'menu': 'ਮੀਨੂ',
    'myTrips': 'ਮੇਰੀਆਂ ਯਾਤਰਾਵਾਂ',
    'myTrip': 'ਮੇਰੀ ਯਾਤਰਾ',
    'allTrips': 'ਸਾਰੀਆਂ ਯਾਤਰਾਵਾਂ',
    'logout': 'ਲੌਗਆਉਟ',
    'tripsPending': 'ਬਕਾਇਆ ਯਾਤਰਾਵਾਂ',
    'tripsApproved': 'ਮਨਜ਼ੂਰ ਯਾਤਰਾਵਾਂ',
    'tripsRejected': 'ਰੱਦ ਯਾਤਰਾਵਾਂ',
    'tripsInReview': 'ਸਮੀਖਿਆ ਅਧੀਨ ਯਾਤਰਾਵਾਂ',
    'generalTripStatistics': 'ਆਮ ਯਾਤਰਾ ਅੰਕੜੇ',
    'myTripStatistics': 'ਮੇਰੀ ਯਾਤਰਾ ਅੰਕੜੇ',
    'total': 'ਕੁੱਲ',
    'currentTrip': 'ਮੌਜੂਦਾ ਯਾਤਰਾ',
    'tripApproved': 'ਯਾਤਰਾ ਮਨਜ਼ੂਰ',
    'tripReview': 'ਯਾਤਰਾ ਸਮੀਖਿਆ',
    'tripRejected': 'ਯਾਤਰਾ ਰੱਦ',
    'totalTripPublished': 'ਕੁੱਲ ਯਾਤਰਾ (ਪ੍ਰਕਾਸ਼ਿਤ)',
    'upcomingTrip': 'ਆਉਣ ਵਾਲੀ ਯਾਤਰਾ',
    'completedTrip': 'ਪੂਰੀ ਹੋਈ ਯਾਤਰਾ',
    'currentTripToday': 'ਮੌਜੂਦਾ ਯਾਤਰਾ (ਅੱਜ)',
    
    // My Trips Page
    'all': 'ਸਭ',
    'pending': 'ਬਕਾਇਆ',
    'approved': 'ਮਨਜ਼ੂਰ',
    'rejected': 'ਰੱਦ',
    'review': 'ਸਮੀਖਿਆ',
    'loadingYourTrips': 'ਤੁਹਾਡੀਆਂ ਯਾਤਰਾਵਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...',
    'noTripApplicationsFound': 'ਕੋਈ ਯਾਤਰਾ ਅਰਜ਼ੀਆਂ ਨਹੀਂ ਮਿਲੀਆਂ',
    'noApplicationsFound': 'ਅਰਜ਼ੀਆਂ ਨਹੀਂ ਮਿਲੀਆਂ',
    'no': 'ਕੋਈ',
    'pleaseLoginToViewTrips': 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀਆਂ ਯਾਤਰਾਵਾਂ ਦੇਖਣ ਲਈ ਲੌਗਇਨ ਕਰੋ',
    'unableToVerifyUser': 'ਉਪਭੋਗਤਾ ਦੀ ਪੁਸ਼ਟੀ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਲੌਗਇਨ ਕਰੋ।',
    'failedToFetchTrips': 'ਯਾਤਰਾ ਅਰਜ਼ੀਆਂ ਪ੍ਰਾਪਤ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pa')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      // Error loading language
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', lang);
      setLanguageState(lang);
    } catch (error) {
      // Error saving language
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
