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
    'noDescription': 'No description available',
    'lastUpdated': 'Last updated',
    'status': 'Status',
    'defaultDescription': 'A sacred pilgrimage journey. Experience the spiritual significance and cultural heritage of this holy destination.',
    
    // Accommodation
    'selectAccommodation': 'Select different accommodation vendors for specific days',
    'accommodation': 'Accommodation',
    'vendor': 'Vendor',
    'noStartTime': 'No start time',
    'noEndTime': 'No end time',
    'noAccommodationData': 'No accommodation data available',
    
    // Food
    'selectFood': 'Select different food vendors for specific days',
    'food': 'Food',
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner',
    'noFoodData': 'No food data available',
    'categories': 'Categories',
    'items': 'Items',
    'schedules': 'Schedules',
    
    // Events
    'selectEvents': 'Select different events for specific days',
    'events': 'Events',
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
    'onboardingDescription': 'This will be onboarding bus and you need to scan the code at that time',
    'hotelCheckinDescription': 'This will be onboarding bus and you need to scan the code at that time',
    'gangaVisitDescription': 'We will be visiting holy river ganga',
    'templeVisitDescription': 'Temple visit description',
    
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
    'noDescription': 'ਕੋਈ ਵਰਣਨ ਉਪਲਬਧ ਨਹੀਂ',
    'lastUpdated': 'ਆਖਰੀ ਅਪਡੇਟ',
    'status': 'ਸਥਿਤੀ',
    'defaultDescription': 'ਇੱਕ ਪਵਿੱਤਰ ਤੀਰਥ ਯਾਤਰਾ। ਇਸ ਪਵਿੱਤਰ ਗੰਮਭੀਰਤਾ ਅਤੇ ਸੱਭਿਆਚਾਰਕ ਵਿਰਾਸਤ ਦਾ ਅਨੁਭਵ ਕਰੋ।',
    
    // Accommodation
    'selectAccommodation': 'ਵੱਖ-ਵੱਖ ਦਿਨਾਂ ਲਈ ਵੱਖ-ਵੱਖ ਰਿਹਾਇਸ਼ ਵਿਕਰੇਤਾ ਚੁਣੋ',
    'accommodation': 'ਰਿਹਾਇਸ਼',
    'vendor': 'ਵਿਕਰੇਤਾ',
    'noStartTime': 'ਕੋਈ ਸ਼ੁਰੂਆਤੀ ਸਮਾਂ ਨਹੀਂ',
    'noEndTime': 'ਕੋਈ ਅੰਤਿਮ ਸਮਾਂ ਨਹੀਂ',
    'noAccommodationData': 'ਕੋਈ ਰਿਹਾਇਸ਼ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ',
    
    // Food
    'selectFood': 'ਵੱਖ-ਵੱਖ ਦਿਨਾਂ ਲਈ ਵੱਖ-ਵੱਖ ਖਾਣਾ ਵਿਕਰੇਤਾ ਚੁਣੋ',
    'food': 'ਖਾਣਾ',
    'breakfast': 'ਨਾਸ਼ਤਾ',
    'lunch': 'ਦੁਪਹਿਰ ਦਾ ਖਾਣਾ',
    'dinner': 'ਰਾਤ ਦਾ ਖਾਣਾ',
    'noFoodData': 'ਕੋਈ ਖਾਣਾ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ',
    'categories': 'ਕੈਟੇਗਰੀਆਂ',
    'items': 'ਆਈਟਮਾਂ',
    'schedules': 'ਸਮਾਯੋਜਨ',
    
    // Events
    'selectEvents': 'ਵੱਖ-ਵੱਖ ਦਿਨਾਂ ਲਈ ਵੱਖ-ਵੱਖ ਇਵੈਂਟਸ ਚੁਣੋ',
    'events': 'ਇਵੈਂਟਸ',
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
    'onboardingDescription': 'ਇਹ ਬਸ ਚੜ੍ਹਨ ਦਾ ਸਮਾਂ ਹੋਵੇਗਾ ਅਤੇ ਉਸ ਸਮੇਂ ਤੁਹਾਨੂੰ ਕੋਡ ਸਕੈਨ ਕਰਨਾ ਹੋਵੇਗਾ',
    'hotelCheckinDescription': 'ਇਹ ਬਸ ਚੜ੍ਹਨ ਦਾ ਸਮਾਂ ਹੋਵੇਗਾ ਅਤੇ ਉਸ ਸਮੇਂ ਤੁਹਾਨੂੰ ਕੋਡ ਸਕੈਨ ਕਰਨਾ ਹੋਵੇਗਾ',
    'gangaVisitDescription': 'ਅਸੀਂ ਪਵਿੱਤਰ ਗੰਗਾ ਨਦੀ ਦਾ ਦਰਸ਼ਨ ਕਰਾਂਗੇ',
    'templeVisitDescription': 'ਮੰਦਿਰ ਦਰਸ਼ਨ ਦਾ ਵਰਣਨ',
    
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
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
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
