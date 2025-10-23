import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageDropdown from '@/components/LanguageDropdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/config';

interface TripDetails {
  id?: number;
  title?: string;
  transport_vendor_name?: string;
  accommodationVendor?: { title: string; address?: string; phone?: string };
  foodVendor?: { title: string; address?: string; phone?: string };
  transportVendor?: { title: string; address?: string; phone?: string };
  allFoodVendors?: Array<{ id: number; title: string; address?: string; phone?: string }>;
  allFoodCategories?: Array<{ id: number; title: string }>;
  allFoodItems?: Array<{ id: number; title: string }>;
  allAccommodationVendors?: Array<{ id: number; title: string }>;
  selected_accommodation_vendor?: string;
  vendors_by_day?: string | { [key: string]: string };
  all_days_food_entries?: string | any[];
  food_vendors_by_day?: string | { [key: string]: any[] };
  accommodations_by_day?: string | { [key: string]: any[] };
}

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

  // Feedback states
  const [foodFeedbackExpanded, setFoodFeedbackExpanded] = useState(false);
  const [foodVendorRatings, setFoodVendorRatings] = useState<{[key: string]: number}>({});
  const [foodVendorDescriptions, setFoodVendorDescriptions] = useState<{[key: string]: string}>({});
  const [submittedFoodVendors, setSubmittedFoodVendors] = useState<string[]>([]);
  
  const [accommodationFeedbackExpanded, setAccommodationFeedbackExpanded] = useState(false);
  const [accommodationVendorRatings, setAccommodationVendorRatings] = useState<{[key: string]: number}>({});
  const [accommodationVendorDescriptions, setAccommodationVendorDescriptions] = useState<{[key: string]: string}>({});
  const [submittedAccommodationVendors, setSubmittedAccommodationVendors] = useState<string[]>([]);
  
  const [transportFeedbackExpanded, setTransportFeedbackExpanded] = useState(false);
  const [transportVendorRatings, setTransportVendorRatings] = useState<{[key: string]: number}>({});
  const [transportVendorDescriptions, setTransportVendorDescriptions] = useState<{[key: string]: string}>({});
  const [submittedTransportVendors, setSubmittedTransportVendors] = useState<string[]>([]);
  
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  
  // Overall rating state
  const [overallRating, setOverallRating] = useState<number>(0);
  const [overallComment, setOverallComment] = useState<string>('');

  // Load trip details from API using tripId
  useEffect(() => {
    const fetchTripDetails = async () => {
      console.log('Params received:', params);
      console.log('Trip ID from params:', params.tripId);
      
      if (!params.tripId) {
        console.log('No tripId in params!');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_ENDPOINTS.MOBILE}/trips/${params.tripId}/details`);
        const result = await response.json();
        
        if (result.success) {
          console.log('Trip details fetched:', result.data);
          console.log('Trip ID from API:', result.data.id);
          setTripDetails(result.data);
        } else {
          console.error('Failed to fetch trip details:', result.message);
          Alert.alert(t('error'), t('failedToLoadTripDetails'));
        }
      } catch (error) {
        console.error('Error fetching trip details:', error);
        Alert.alert('Error', 'Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTripDetails();
  }, [params.tripId]);

  // Check if user has already submitted feedback (without loading the data)
  useEffect(() => {
    const checkFeedbackSubmitted = async () => {
      if (!params.tripId) {
        setIsLoadingFeedback(false);
        return;
      }

      try {
        setIsLoadingFeedback(true);
        // Get JWT token from AsyncStorage
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
          setIsLoadingFeedback(false);
          return;
        }

        const response = await fetch(`${API_ENDPOINTS.MOBILE}/feedback/trip/${params.tripId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();

        console.log('=== FRONTEND FEEDBACK DEBUG ===');
        console.log('API Response:', JSON.stringify(result, null, 2));
        console.log('Has Submitted:', result.hasSubmitted);
        console.log('Result Data:', result.data);

        if (result.success && result.hasSubmitted) {
          console.log('Feedback already submitted for this trip');
          console.log('Loading submitted feedback data:', result.data);
          
          // Mark as submitted and enable read-only mode
          setHasSubmitted(true);
          setIsReadOnly(true);
          
          // Populate overall feedback
          if (result.data.overall) {
            console.log('Setting overall rating:', result.data.overall.rating);
            console.log('Setting overall comment:', result.data.overall.comment);
            setOverallRating(result.data.overall.rating || 0);
            setOverallComment(result.data.overall.comment || '');
          }
          
          // Populate food vendor feedback
          if (result.data.food && Array.isArray(result.data.food)) {
            console.log('Food feedback array:', result.data.food);
            const foodRatings: {[key: string]: number} = {};
            const foodDescriptions: {[key: string]: string} = {};
            const foodVendorsList: string[] = [];
            result.data.food.forEach((item: any) => {
              console.log('Processing food item:', item);
              if (item.vendor) {
                foodRatings[item.vendor] = item.rating || 0;
                foodDescriptions[item.vendor] = item.description || '';
                foodVendorsList.push(item.vendor);
                console.log(`Set food vendor "${item.vendor}": rating=${item.rating}, desc="${item.description}"`);
              }
            });
            console.log('Final food ratings:', foodRatings);
            console.log('Final food descriptions:', foodDescriptions);
            console.log('Final food vendors list:', foodVendorsList);
            setFoodVendorRatings(foodRatings);
            setFoodVendorDescriptions(foodDescriptions);
            setSubmittedFoodVendors(foodVendorsList);
          }
          
          // Populate accommodation vendor feedback
          if (result.data.accommodation && Array.isArray(result.data.accommodation)) {
            console.log('Accommodation feedback array:', result.data.accommodation);
            const accommodationRatings: {[key: string]: number} = {};
            const accommodationDescriptions: {[key: string]: string} = {};
            const accommodationVendorsList: string[] = [];
            result.data.accommodation.forEach((item: any) => {
              console.log('Processing accommodation item:', item);
              if (item.vendor) {
                accommodationRatings[item.vendor] = item.rating || 0;
                accommodationDescriptions[item.vendor] = item.description || '';
                accommodationVendorsList.push(item.vendor);
                console.log(`Set accommodation vendor "${item.vendor}": rating=${item.rating}`);
              }
            });
            console.log('Final accommodation ratings:', accommodationRatings);
            console.log('Final accommodation vendors list:', accommodationVendorsList);
            setAccommodationVendorRatings(accommodationRatings);
            setAccommodationVendorDescriptions(accommodationDescriptions);
            setSubmittedAccommodationVendors(accommodationVendorsList);
          }
          
          // Populate transport vendor feedback
          if (result.data.transport && Array.isArray(result.data.transport)) {
            console.log('Transport feedback array:', result.data.transport);
            const transportRatings: {[key: string]: number} = {};
            const transportDescriptions: {[key: string]: string} = {};
            const transportVendorsList: string[] = [];
            result.data.transport.forEach((item: any) => {
              console.log('Processing transport item:', item);
              if (item.vendor) {
                transportRatings[item.vendor] = item.rating || 0;
                transportDescriptions[item.vendor] = item.description || '';
                transportVendorsList.push(item.vendor);
                console.log(`Set transport vendor "${item.vendor}": rating=${item.rating}`);
              }
            });
            console.log('Final transport ratings:', transportRatings);
            console.log('Final transport vendors list:', transportVendorsList);
            setTransportVendorRatings(transportRatings);
            setTransportVendorDescriptions(transportDescriptions);
            setSubmittedTransportVendors(transportVendorsList);
          }
          
          console.log('=== END FRONTEND DEBUG ===');
          
          // Auto-expand sections if feedback is submitted
          if (result.data.food && result.data.food.length > 0) {
            setFoodFeedbackExpanded(true);
          }
          if (result.data.accommodation && result.data.accommodation.length > 0) {
            setAccommodationFeedbackExpanded(true);
          }
          if (result.data.transport && result.data.transport.length > 0) {
            setTransportFeedbackExpanded(true);
          }
        } else {
          console.log('No feedback submitted yet or API call failed');
        }
      } catch (error) {
        console.error('Error checking feedback status:', error);
      } finally {
        setIsLoadingFeedback(false);
      }
    };

    checkFeedbackSubmitted();
  }, [params.tripId]);

  // Extract unique food vendors from all_days_food_entries or food_vendors_by_day
  const getFoodVendors = (): string[] => {
    const vendorSet = new Set<string>();
    
    try {
      // Check for all-days food entries first
      if (tripDetails?.all_days_food_entries) {
        const allDaysEntries = typeof tripDetails.all_days_food_entries === 'string'
          ? JSON.parse(tripDetails.all_days_food_entries)
          : tripDetails.all_days_food_entries;
        
        if (Array.isArray(allDaysEntries) && allDaysEntries.length > 0) {
          allDaysEntries.forEach((entry: any) => {
            // Get vendor names from IDs
            if (entry.vendors && Array.isArray(entry.vendors)) {
              entry.vendors.forEach((vendorId: number) => {
                const vendor = tripDetails?.allFoodVendors?.find((v: any) => v.id === vendorId);
                if (vendor?.title) {
                  vendorSet.add(vendor.title.trim());
                }
              });
            }
          });
        }
      }
      
      // Check for day-wise food vendors
      if (tripDetails?.food_vendors_by_day) {
        const foodVendorsByDay = typeof tripDetails.food_vendors_by_day === 'string'
          ? JSON.parse(tripDetails.food_vendors_by_day)
          : tripDetails.food_vendors_by_day;

        // Iterate through all days
        Object.values(foodVendorsByDay).forEach((dayData: any) => {
          if (Array.isArray(dayData)) {
            dayData.forEach((item: any) => {
              // Check for vendorNames (enhanced names)
              if (item.vendorNames && Array.isArray(item.vendorNames)) {
                item.vendorNames.forEach((vendorName: string) => {
                  const trimmedVendor = vendorName?.trim();
                  if (trimmedVendor) {
                    vendorSet.add(trimmedVendor);
                  }
                });
              }
              // Fallback to vendors array (names)
              else if (item.vendors && Array.isArray(item.vendors)) {
                item.vendors.forEach((vendor: string) => {
                  const trimmedVendor = vendor?.trim();
                  if (trimmedVendor) {
                    vendorSet.add(trimmedVendor);
                  }
                });
              }
            });
          }
        });
      }

      // Convert Set to Array and sort alphabetically (Set automatically makes them distinct)
      return Array.from(vendorSet).sort();
    } catch (error) {
      console.error('Error parsing food vendors:', error);
      return [];
    }
  };

  // Extract unique accommodation vendors from selected_accommodation_vendor or accommodations_by_day
  const getAccommodationVendors = (): string[] => {
    const vendorSet = new Set<string>();
    
    try {
      // Check for all-days accommodation vendor first
      if (tripDetails?.accommodationVendor?.title) {
        const trimmedVendor = tripDetails.accommodationVendor.title.trim();
        if (trimmedVendor) {
          vendorSet.add(trimmedVendor);
        }
      } else if (tripDetails?.selected_accommodation_vendor) {
        // If it's an ID, convert to name
        const vendorId = parseInt(tripDetails.selected_accommodation_vendor);
        if (!isNaN(vendorId)) {
          const vendor = tripDetails?.allAccommodationVendors?.find((v: any) => v.id === vendorId);
          if (vendor?.title) {
            vendorSet.add(vendor.title.trim());
          }
        } else {
          // It's already a name
          const trimmedVendor = tripDetails.selected_accommodation_vendor.trim();
          if (trimmedVendor) {
            vendorSet.add(trimmedVendor);
          }
        }
      }
      
      // Check for day-wise accommodation vendors
      if (tripDetails?.accommodations_by_day) {
        const accommodationsByDay = typeof tripDetails.accommodations_by_day === 'string'
          ? JSON.parse(tripDetails.accommodations_by_day)
          : tripDetails.accommodations_by_day;

        // Iterate through all days
        Object.values(accommodationsByDay).forEach((dayData: any) => {
          if (Array.isArray(dayData)) {
            dayData.forEach((accommodation: any) => {
              // Get vendor name from either vendorName or vendor field
              const vendorName = accommodation.vendorName || accommodation.vendor;
              if (vendorName) {
                const trimmedVendor = String(vendorName).trim();
                if (trimmedVendor) {
                  vendorSet.add(trimmedVendor);
                }
              }
            });
          }
        });
      }

      // Convert Set to Array and sort alphabetically (Set automatically makes them distinct)
      return Array.from(vendorSet).sort();
    } catch (error) {
      console.error('Error parsing accommodation vendors:', error);
      return [];
    }
  };

  // Extract unique transport vendors from transport_vendor_name or vendors_by_day
  const getTransportVendors = (): string[] => {
    const vendorSet = new Set<string>();
    
    try {
      // Check for all-days transport vendor first
      if (tripDetails?.transport_vendor_name) {
        const trimmedVendor = tripDetails.transport_vendor_name.trim();
        if (trimmedVendor) {
          vendorSet.add(trimmedVendor);
        }
      }
      
      // Check for day-wise transport vendors
      if (tripDetails?.vendors_by_day) {
        const vendorsByDay = typeof tripDetails.vendors_by_day === 'string'
          ? JSON.parse(tripDetails.vendors_by_day)
          : tripDetails.vendors_by_day;

        // Iterate through all days
        Object.values(vendorsByDay).forEach((vendorName: any) => {
          if (vendorName) {
            const trimmedVendor = String(vendorName).trim();
            if (trimmedVendor) {
              vendorSet.add(trimmedVendor);
            }
          }
        });
      }

      // Convert Set to Array and sort alphabetically (Set automatically makes them distinct)
      return Array.from(vendorSet).sort();
    } catch (error) {
      console.error('Error parsing transport vendors:', error);
      return [];
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      console.log('=== Starting Submit Feedback ===');
      console.log('Current tripDetails state:', tripDetails);
      console.log('Trip ID from state:', tripDetails?.id);
      
      // Check if tripDetails is loaded
      if (!tripDetails || !tripDetails.id) {
        Alert.alert(t('error'), t('failedToLoadTripDetails'));
        return;
      }
      
      // Get JWT token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');

      console.log('Trip ID:', tripDetails.id);
      
      if (!token) {
        Alert.alert(t('error'), t('pleaseLoginToApply'));
        return;
      }

      // Collect all feedback data
      console.log('=== FRONTEND DEBUG ===');
      console.log('Food Vendor Ratings State:', foodVendorRatings);
      console.log('Accommodation Vendor Ratings State:', accommodationVendorRatings);
      console.log('Transport Vendor Ratings State:', transportVendorRatings);
      
      const feedbackData = {
        tripId: tripDetails.id,  // Already checked above
        overall: {
          rating: overallRating,
          comment: overallComment
        },
        food: Object.keys(foodVendorRatings).map(vendor => ({
          vendor,
          rating: foodVendorRatings[vendor],
          description: foodVendorDescriptions[vendor] || ''
        })),
        accommodation: Object.keys(accommodationVendorRatings).map(vendor => ({
          vendor,
          rating: accommodationVendorRatings[vendor],
          description: accommodationVendorDescriptions[vendor] || ''
        })),
        transport: Object.keys(transportVendorRatings).map(vendor => ({
          vendor,
          rating: transportVendorRatings[vendor],
          description: transportVendorDescriptions[vendor] || ''
        }))
      };

      console.log('Feedback Data Being Sent:', JSON.stringify(feedbackData, null, 2));
      console.log('Food array length:', feedbackData.food.length);
      console.log('Accommodation array length:', feedbackData.accommodation.length);
      console.log('Transport array length:', feedbackData.transport.length);

      // Submit feedback to API
      const response = await fetch(`${API_ENDPOINTS.MOBILE}/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feedbackData)
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert(t('success'), t('feedbackSubmittedThankYou'), [
          {
            text: t('ok'),
            onPress: () => router.back()
          }
        ]);
      } else {
        Alert.alert(t('error'), result.message || t('feedbackSubmitFailed'));
      }

    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(t('error'), t('pleaseCheckConnectionRetry'));
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('loadingTripDetails')}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!tripDetails) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{t('tripDetailsNotFound')}</Text>
            <TouchableOpacity 
              style={styles.backButtonStyle}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>{t('goBack')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (isLoadingFeedback) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{t('loadingFeedbackData')}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Fixed Header */}
        <View style={styles.mainHeader}>
          <Text style={styles.headerTitle}>Tirth Yatra</Text>
          <TouchableOpacity 
            style={styles.headerMenuButton}
            onPress={() => setHeaderMenuVisible(!headerMenuVisible)}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
          </TouchableOpacity>
          
          {/* Header Dropdown Menu */}
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

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Show message if feedback already submitted */}
        {isReadOnly && (
          <View style={styles.submittedMessageBox}>
            <Ionicons name="checkmark-circle" size={40} color="#28a745" />
            <View style={styles.submittedMessageContent}>
              <Text style={styles.submittedMessageTitle}>{t('feedbackAlreadySubmitted')}</Text>
              <Text style={styles.submittedMessageText}>{t('feedbackSubmittedMessage')}</Text>
            </View>
          </View>
        )}

        {/* Food Section */}
        <TouchableOpacity 
          style={styles.feedbackSection}
          onPress={() => setFoodFeedbackExpanded(!foodFeedbackExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.feedbackSectionTitle}>{t('foodVendorFeedback')}</Text>
          <Ionicons 
            name={foodFeedbackExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#007AFF" 
          />
        </TouchableOpacity>

        {/* Food Vendors - Expanded */}
        {foodFeedbackExpanded && (
          <View style={styles.feedbackContent}>
            {(isReadOnly && submittedFoodVendors.length > 0 ? submittedFoodVendors : getFoodVendors()).length > 0 ? (
              (isReadOnly && submittedFoodVendors.length > 0 ? submittedFoodVendors : getFoodVendors()).map((vendorName: string, index: number) => (
                <View key={index} style={styles.vendorFeedbackItem}>
                  <Text style={styles.vendorName}>{vendorName}</Text>
                  
                  {/* Star Rating */}
                  <View style={styles.starRatingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          if (!isReadOnly) {
                            const currentRating = foodVendorRatings[vendorName] || 0;
                            setFoodVendorRatings({
                              ...foodVendorRatings,
                              [vendorName]: currentRating === star ? 0 : star
                            });
                          }
                        }}
                        disabled={isReadOnly}
                      >
                        <Ionicons
                          name={star <= (foodVendorRatings[vendorName] || 0) ? "star" : "star-outline"}
                          size={32}
                          color={isReadOnly ? "#ccc" : "#FFD700"}
                          style={styles.starIcon}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Description Box */}
                  <TextInput
                    style={[styles.feedbackDescriptionBox, isReadOnly && styles.readOnlyInput]}
                    placeholder={t('descriptionOptional')}
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    value={foodVendorDescriptions[vendorName] || ''}
                    onChangeText={(text) => {
                      setFoodVendorDescriptions({
                        ...foodVendorDescriptions,
                        [vendorName]: text
                      });
                    }}
                    editable={!isReadOnly}
                  />
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>{t('noVendorsAvailable')}</Text>
            )}
          </View>
        )}

        {/* Accommodation Section */}
        <TouchableOpacity 
          style={styles.feedbackSection}
          onPress={() => setAccommodationFeedbackExpanded(!accommodationFeedbackExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.feedbackSectionTitle}>{t('accommodationVendorFeedback')}</Text>
          <Ionicons 
            name={accommodationFeedbackExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#007AFF" 
          />
        </TouchableOpacity>

        {/* Accommodation Vendors - Expanded */}
        {accommodationFeedbackExpanded && (
          <View style={styles.feedbackContent}>
            {(isReadOnly && submittedAccommodationVendors.length > 0 ? submittedAccommodationVendors : getAccommodationVendors()).length > 0 ? (
              (isReadOnly && submittedAccommodationVendors.length > 0 ? submittedAccommodationVendors : getAccommodationVendors()).map((vendorName: string, index: number) => (
                <View key={index} style={styles.vendorFeedbackItem}>
                  <Text style={styles.vendorName}>{vendorName}</Text>
                  
                  {/* Star Rating */}
                  <View style={styles.starRatingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          if (!isReadOnly) {
                            const currentRating = accommodationVendorRatings[vendorName] || 0;
                            setAccommodationVendorRatings({
                              ...accommodationVendorRatings,
                              [vendorName]: currentRating === star ? 0 : star
                            });
                          }
                        }}
                        disabled={isReadOnly}
                      >
                        <Ionicons
                          name={star <= (accommodationVendorRatings[vendorName] || 0) ? "star" : "star-outline"}
                          size={32}
                          color={isReadOnly ? "#ccc" : "#FFD700"}
                          style={styles.starIcon}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Description Box */}
                  <TextInput
                    style={[styles.feedbackDescriptionBox, isReadOnly && styles.readOnlyInput]}
                    placeholder={t('descriptionOptional')}
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    value={accommodationVendorDescriptions[vendorName] || ''}
                    onChangeText={(text) => {
                      setAccommodationVendorDescriptions({
                        ...accommodationVendorDescriptions,
                        [vendorName]: text
                      });
                    }}
                    editable={!isReadOnly}
                  />
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>{t('noVendorsAvailable')}</Text>
            )}
          </View>
        )}

        {/* Transport Section */}
        <TouchableOpacity 
          style={styles.feedbackSection}
          onPress={() => setTransportFeedbackExpanded(!transportFeedbackExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.feedbackSectionTitle}>{t('transportVendorFeedback')}</Text>
          <Ionicons 
            name={transportFeedbackExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#007AFF" 
          />
        </TouchableOpacity>

        {/* Transport Vendors - Expanded */}
        {transportFeedbackExpanded && (
          <View style={styles.feedbackContent}>
            {(isReadOnly && submittedTransportVendors.length > 0 ? submittedTransportVendors : getTransportVendors()).length > 0 ? (
              (isReadOnly && submittedTransportVendors.length > 0 ? submittedTransportVendors : getTransportVendors()).map((vendorName: string, index: number) => (
                <View key={index} style={styles.vendorFeedbackItem}>
                  <Text style={styles.vendorName}>{vendorName}</Text>
                  
                  {/* Star Rating */}
                  <View style={styles.starRatingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          if (!isReadOnly) {
                            const currentRating = transportVendorRatings[vendorName] || 0;
                            setTransportVendorRatings({
                              ...transportVendorRatings,
                              [vendorName]: currentRating === star ? 0 : star
                            });
                          }
                        }}
                        disabled={isReadOnly}
                      >
                        <Ionicons
                          name={star <= (transportVendorRatings[vendorName] || 0) ? "star" : "star-outline"}
                          size={32}
                          color={isReadOnly ? "#ccc" : "#FFD700"}
                          style={styles.starIcon}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Description Box */}
                  <TextInput
                    style={[styles.feedbackDescriptionBox, isReadOnly && styles.readOnlyInput]}
                    placeholder={t('descriptionOptional')}
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    value={transportVendorDescriptions[vendorName] || ''}
                    onChangeText={(text) => {
                      setTransportVendorDescriptions({
                        ...transportVendorDescriptions,
                        [vendorName]: text
                      });
                    }}
                    editable={!isReadOnly}
                  />
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>{t('noVendorsAvailable')}</Text>
            )}
          </View>
        )}

        {/* Overall Rating Section */}
        <View style={styles.overallRatingContainer}>
          <Text style={styles.overallRatingTitle}>
            {t('overallRating')} {isReadOnly && <Text style={styles.readOnlyBadge}>({t('feedbackAlreadySubmitted')})</Text>}
          </Text>
          
          {/* Star Rating */}
          <View style={styles.starRatingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  if (!isReadOnly) {
                    setOverallRating(overallRating === star ? 0 : star);
                  }
                }}
                disabled={isReadOnly}
              >
                <Ionicons
                  name={star <= overallRating ? "star" : "star-outline"}
                  size={36}
                  color={isReadOnly ? "#ccc" : "#FFD700"}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Overall Comment Box */}
          <TextInput
            style={[styles.overallCommentBox, isReadOnly && styles.readOnlyInput]}
            placeholder={t('shareThoughts')}
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            value={overallComment}
            onChangeText={setOverallComment}
            editable={!isReadOnly}
          />
        </View>

        {/* Add spacing for buttons and footer */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Submit/Back Buttons */}
      <View style={styles.buttonContainer}>
        {!isReadOnly && (
          <TouchableOpacity 
            style={styles.backButtonStyle}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>{t('back')}</Text>
          </TouchableOpacity>
        )}
        
        {isReadOnly ? (
          <TouchableOpacity 
            style={styles.fullWidthBackButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>{t('back')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitFeedback}
          >
            <Text style={styles.submitButtonText}>{t('submitButton')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Fixed Footer */}
      <View style={styles.mainFooter}>
        <Text style={styles.footerText}></Text>
        <Ionicons name="help-circle-outline" size={24} color="#666" />
      </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 20,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerMenuButton: {
    padding: 8,
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
    elevation: 5,
    minWidth: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 12,
  },
  languageDropdownContainer: {
    marginLeft: 12,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  overallRatingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  overallRatingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  readOnlyBadge: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#28a745',
  },
  submittedMessageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  submittedMessageContent: {
    flex: 1,
    marginLeft: 12,
  },
  submittedMessageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 4,
  },
  submittedMessageText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  overallCommentBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f9f9f9',
    minHeight: 120,
    textAlignVertical: 'top',
    marginTop: 16,
  },
  readOnlyInput: {
    backgroundColor: '#e9ecef',
    color: '#666',
  },
  feedbackSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  feedbackSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  feedbackContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  vendorFeedbackItem: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  starIcon: {
    marginRight: 8,
  },
  feedbackDescriptionBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mainFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  backButtonStyle: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidthBackButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

