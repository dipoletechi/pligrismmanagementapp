import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Rating,
  Chip,
  Tabs,
  Tab,
  Paper,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Star,
  StarBorder,
  Refresh,
  TripOrigin,
  Store,
  AutoAwesome,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import axios from 'axios';

const FeedbackListWithTabs = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [tripFeedbacks, setTripFeedbacks] = useState([]);
  const [vendorFeedbacks, setVendorFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [foodVendors, setFoodVendors] = useState([]);
  const [transportVendors, setTransportVendors] = useState([]);
  const [accommodationVendors, setAccommodationVendors] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [aiSummary, setAiSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    transport: true,
    accommodation: true,
    event: true
  });
  
  // Get tripId from location state
  const tripId = location.state?.tripId;
  const tripTitle = location.state?.tripTitle || 'Trip Feedback';

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching feedbacks for trip:', tripId);
      console.log('User:', user);
      
      // Fetch feedbacks and all vendor types in parallel
      const [feedbacksResponse, foodVendorsResponse, transportVendorsResponse, accommodationVendorsResponse] = await Promise.all([
        axios.get('/api/feedback'),
        axios.get('/api/food-vendors'),
        axios.get('/api/transport-vendors'),
        axios.get('/api/accommodation-vendors')
      ]);
      
      console.log('Feedback API response:', feedbacksResponse.data);
      console.log('Food Vendors API response:', foodVendorsResponse.data);

      if (feedbacksResponse.data.success) {
        const allFeedbacks = feedbacksResponse.data.data;
        
        // Filter feedbacks for specific trip if tripId is provided
        let filteredTripFeedbacks = allFeedbacks.filter(f => f.type === 'trip');
        let filteredVendorFeedbacks = allFeedbacks.filter(f => f.type === 'vendor');
        
        if (tripId) {
          filteredTripFeedbacks = filteredTripFeedbacks.filter(f => f.trip_id === tripId);
          filteredVendorFeedbacks = filteredVendorFeedbacks.filter(f => f.tripid === tripId);
        }
        
        setTripFeedbacks(filteredTripFeedbacks);
        setVendorFeedbacks(filteredVendorFeedbacks);
      } else {
        setError('Failed to fetch feedbacks');
      }

      if (foodVendorsResponse.data.success) {
        console.log('Food vendors data:', foodVendorsResponse.data.data);
        setFoodVendors(foodVendorsResponse.data.data.items || []);
      }

      if (transportVendorsResponse.data.success) {
        console.log('Transport vendors data:', transportVendorsResponse.data.data);
        setTransportVendors(transportVendorsResponse.data.data.items || []);
      }

      if (accommodationVendorsResponse.data.success) {
        console.log('Accommodation vendors data:', accommodationVendorsResponse.data.data);
        console.log('Accommodation vendors items:', accommodationVendorsResponse.data.data.items);
        setAccommodationVendors(accommodationVendorsResponse.data.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [tripId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateAISummary = () => {
    setIsGeneratingSummary(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const summary = {
        overallUserExperience: "Overall user experience has been positive with 85% satisfaction rate. Users appreciate the organized structure and timely services.",
        scopeOfImprovement: "Food quality needs improvement. Transportation scheduling could be more flexible. Better communication during delays.",
        safetyNotes: "All safety protocols followed. No incidents reported. Emergency contacts readily available.",
        bestVendor: "Shree Krishna Travels - Excellent service, punctual, clean vehicles",
        behaviourNotes: "Staff is courteous and helpful. Drivers are professional and knowledgeable about routes.",
        hygieneNotes: "Good hygiene maintained in accommodation. Food preparation areas are clean. Regular sanitization.",
        poorVendor: "City Transport Co. - Delays, poor vehicle condition, unprofessional staff",
        easeOfOnboarding: "Simple registration process. Clear instructions provided. Quick verification system.",
        easeOfOffboarding: "Smooth checkout process. Quick settlement of accounts. Helpful staff assistance.",
        bestTransportVendor: "Royal Transport Services - 5-star rating, modern vehicles, experienced drivers",
        bestAccommodationVendor: "Hotel Paradise - Clean rooms, good food, excellent service",
        worstAccommodationVendor: "Budget Stay Inn - Poor maintenance, unhygienic conditions",
        worstTransportVendor: "Local Transport Co. - Old vehicles, frequent breakdowns, rude staff"
      };
      
      setAiSummary(summary);
      setIsGeneratingSummary(false);
    }, 2000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={fetchFeedbacks} variant="contained" startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          {tripTitle}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="feedback tabs">
          <Tab 
            icon={<TripOrigin />} 
            label={`Trip Feedback (${tripFeedbacks.length})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<Store />} 
            label={`Vendor Feedback (${vendorFeedbacks.length})`} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 ? (
        // Trip Feedback Tab - Card Layout
        tripFeedbacks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No trip feedback submitted yet.
            </Typography>
          </Box>
        ) : (
          <Box>
            {tripFeedbacks.map((feedback) => (
              <Card key={feedback.id} sx={{ 
                mb: 3,
                width: '100%',
                boxShadow: 2,
                '&:hover': { boxShadow: 4 }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: 'left' }}>
                    {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'Anonymous'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'flex-start' }}>
                    <Rating 
                      value={feedback.overall_rating || 1} 
                      readOnly 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({feedback.overall_rating || 1}/5)
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2, textAlign: 'left', lineHeight: 1.6 }}>
                    {feedback.comments || 'No comments provided.'}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'left', display: 'block' }}>
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )
      ) : (
        // Vendor Feedback Tab - Grouped by Vendor Type
        vendorFeedbacks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No vendor feedback submitted yet.
            </Typography>
          </Box>
        ) : (
          <Box>
                {/* Transport Vendors */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store /> Transport Vendors
                    </Typography>
                    <IconButton 
                      onClick={() => toggleSection('transport')}
                      sx={{ color: '#1976d2' }}
                    >
                      {expandedSections.transport ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedSections.transport}>
              {vendorFeedbacks.filter(f => f.vendorid <= 3).length > 0 ? (
                <Box>
                  {Object.entries(
                    vendorFeedbacks
                      .filter(f => f.vendorid <= 3)
                      .reduce((acc, feedback) => {
                        if (!acc[feedback.vendorid]) {
                          acc[feedback.vendorid] = [];
                        }
                        acc[feedback.vendorid].push(feedback);
                        return acc;
                      }, {})
                  ).map(([vendorId, feedbacks]) => (
                    <Card key={vendorId} sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {(() => {
                                if (Array.isArray(transportVendors) && transportVendors.length > 0) {
                                  const vendor = transportVendors.find(v => v.id === parseInt(vendorId));
                                  return vendor ? vendor.title : `Transport Vendor ${vendorId}`;
                                }
                                return `Transport Vendor ${vendorId}`;
                              })()}
                            </Typography>
                        <Chip 
                          label={`${(feedbacks.reduce((sum, f) => sum + f.ratings, 0) / feedbacks.length).toFixed(1)}/5`} 
                          color="primary" 
                          size="medium"
                        />
                      </Box>
                      
                      <Box>
                        {feedbacks.map((feedback, index) => (
                          <Box key={feedback.id} sx={{ mb: 2, pb: 2, borderBottom: index < feedbacks.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'left' }}>
                              <Chip 
                                label={`${feedback.ratings}/5`} 
                                color="primary" 
                                size="small"
                                variant="outlined"
                              /> {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'Anonymous'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, textAlign: 'left', lineHeight: 1.6 }}>
                             {feedback.comment || 'No comment provided.'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}>
                              
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}>
                              <strong> {new Date(feedback.created_at).toLocaleDateString()}</strong>
                              </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  ))}
                </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                      No transport vendor feedback yet.
                    </Typography>
                  )}
                  </Collapse>
                </Box>

                {/* Accommodation Vendors */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store /> Accommodation Vendors
                    </Typography>
                    <IconButton 
                      onClick={() => toggleSection('accommodation')}
                      sx={{ color: '#2e7d32' }}
                    >
                      {expandedSections.accommodation ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedSections.accommodation}>
              {vendorFeedbacks.filter(f => f.vendorid >= 1 && f.vendorid <= 3).length > 0 ? (
                <Box>
                  {Object.entries(
                    vendorFeedbacks
                      .filter(f => f.vendorid >= 1 && f.vendorid <= 3)
                      .reduce((acc, feedback) => {
                        if (!acc[feedback.vendorid]) {
                          acc[feedback.vendorid] = [];
                        }
                        acc[feedback.vendorid].push(feedback);
                        return acc;
                      }, {})
                  ).map(([vendorId, feedbacks]) => (
                    <Card key={vendorId} sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {(() => {
                                console.log('Accommodation vendors array:', accommodationVendors);
                                console.log('Looking for accommodation vendor ID:', vendorId);
                                if (Array.isArray(accommodationVendors) && accommodationVendors.length > 0) {
                                  const vendor = accommodationVendors.find(v => v.id === parseInt(vendorId));
                                  console.log('Found accommodation vendor:', vendor);
                                  return vendor ? vendor.title : `Accommodation Vendor ${vendorId}`;
                                }
                                return `Accommodation Vendor ${vendorId}`;
                              })()}
                            </Typography>
                        <Chip 
                          label={`${(feedbacks.reduce((sum, f) => sum + f.ratings, 0) / feedbacks.length).toFixed(1)}/5`} 
                          color="success" 
                          size="medium"
                        />
                      </Box>
                      
                      <Box>
                        {feedbacks.map((feedback, index) => (
                          <Box key={feedback.id} sx={{ mb: 2, pb: 2, borderBottom: index < feedbacks.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'left' }}>
                            <Chip 
                                label={`${feedback.ratings}/5`} 
                                color="success" 
                                size="small"
                                variant="outlined"
                              /> {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'Anonymous'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, textAlign: 'left', lineHeight: 1.6 }}>
                              <strong>Comment:</strong> {feedback.comment || 'No comment provided.'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}>
                             
                              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'left' }}>
                                {new Date(feedback.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  ))}
                </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                      No accommodation vendor feedback yet.
                    </Typography>
                  )}
                  </Collapse>
                </Box>

                {/* Food Vendors */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#ed6c02', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store /> Food Vendors
                    </Typography>
                    <IconButton 
                      onClick={() => toggleSection('event')}
                      sx={{ color: '#ed6c02' }}
                    >
                      {expandedSections.event ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedSections.event}>
              {vendorFeedbacks.filter(f => f.vendorid >= 1 && f.vendorid <= 3).length > 0 ? (
                <Box>
                  {Object.entries(
                    vendorFeedbacks
                      .filter(f => f.vendorid >= 1 && f.vendorid <= 3)
                      .reduce((acc, feedback) => {
                        if (!acc[feedback.vendorid]) {
                          acc[feedback.vendorid] = [];
                        }
                        acc[feedback.vendorid].push(feedback);
                        return acc;
                      }, {})
                  ).map(([vendorId, feedbacks]) => (
                    <Card key={vendorId} sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {(() => {
                            console.log('Food vendors array:', foodVendors);
                            console.log('Looking for vendor ID:', vendorId);
                            if (Array.isArray(foodVendors) && foodVendors.length > 0) {
                              const vendor = foodVendors.find(v => v.id === parseInt(vendorId));
                              console.log('Found vendor:', vendor);
                              return vendor ? vendor.title : `Food Vendor ${vendorId}`;
                            }
                            return `Food Vendor ${vendorId}`;
                          })()}
                        </Typography>
                        <Chip 
                          label={`${(feedbacks.reduce((sum, f) => sum + f.ratings, 0) / feedbacks.length).toFixed(1)}/5`} 
                          color="warning" 
                          size="medium"
                        />
                      </Box>
                      
                      <Box>
                        {feedbacks.map((feedback, index) => (
                          <Box key={feedback.id} sx={{ mb: 2, pb: 2, borderBottom: index < feedbacks.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'left' }}>
                              <Chip 
                                label={`${feedback.ratings}/5`} 
                                color="warning" 
                                size="small"
                                variant="outlined"
                              /> {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'Anonymous'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, textAlign: 'left', lineHeight: 1.6 }}>
                              <strong>Comment:</strong> {feedback.comment || 'No comment provided.'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}>
                              
                              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'left' }}>
                                {new Date(feedback.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  ))}
                </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                      No food vendor feedback yet.
                    </Typography>
                  )}
                  </Collapse>
                </Box>
          </Box>
        )
      )}

      {/* AI Summary Section */}
      <Box sx={{ mt: 4 }}>
        <Card sx={{ border: '2px solid #e0e0e0', borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome sx={{ color: '#1976d2' }} />
                AI Summary
              </Typography>
              <Button
                variant="contained"
                onClick={generateAISummary}
                disabled={isGeneratingSummary}
                startIcon={isGeneratingSummary ? <CircularProgress size={20} /> : <AutoAwesome />}
                sx={{ 
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                {isGeneratingSummary ? 'Generating...' : 'Generate'}
              </Button>
            </Box>

                {aiSummary && (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, textAlign: 'left' }}>
                        Overall User Experience
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Overall user experience has been positive with 85% satisfaction rate. Users appreciate the organized structure and timely services.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ mb: 1, textAlign: 'left' }}>
                        Best Vendor
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Shree Krishna Travels - Excellent service, punctual, clean vehicles
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, textAlign: 'left' }}>
                        Scope of Improvement
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Food quality needs improvement. Transportation scheduling could be more flexible. Better communication during delays.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, textAlign: 'left' }}>
                        Safety Notes
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          All safety protocols followed. No incidents reported. Emergency contacts readily available.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="error.main" sx={{ mb: 1, textAlign: 'left' }}>
                        Poor Vendor
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          City Transport Co. - Delays, poor vehicle condition, unprofessional staff
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, textAlign: 'left' }}>
                        Behaviour Notes
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Staff is courteous and helpful. Drivers are professional and knowledgeable about routes.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, textAlign: 'left' }}>
                        Hygiene Notes
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Good hygiene maintained in accommodation. Food preparation areas are clean. Regular sanitization.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, textAlign: 'left' }}>
                        Ease of Onboarding/Off Boarding
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Simple registration process. Clear instructions provided. Quick verification system. | Smooth checkout process. Quick settlement of accounts. Helpful staff assistance.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ mb: 1, textAlign: 'left' }}>
                        Best Transport Vendor
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Royal Transport Services - 5-star rating, modern vehicles, experienced drivers
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ mb: 1, textAlign: 'left' }}>
                        Best Accommodation Vendor
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Hotel Paradise - Clean rooms, good food, excellent service
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="error.main" sx={{ mb: 1, textAlign: 'left' }}>
                        Worst Accommodation Vendor
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Budget Stay Inn - Poor maintenance, unhygienic conditions
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="error.main" sx={{ mb: 1, textAlign: 'left' }}>
                        Worst Transport Vendor
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          Local Transport Co. - Old vehicles, frequent breakdowns, rude staff
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default FeedbackListWithTabs;
