import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  Star,
  StarBorder,
  Visibility,
  Refresh,
  Close as CloseIcon,
  TripOrigin,
  Store,
  AutoAwesome
} from '@mui/icons-material';
import axios from 'axios';

const FeedbackListWithTabs = () => {
  const { user } = useAuth();
  const [tripFeedbacks, setTripFeedbacks] = useState([]);
  const [vendorFeedbacks, setVendorFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [aiSummary, setAiSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching feedbacks...');
      console.log('User:', user);
      
      const response = await axios.get('/api/feedback');
      console.log('Feedback API response:', response.data);

      if (response.data.success) {
        const allFeedbacks = response.data.data;
        const tripFeedbacks = allFeedbacks.filter(f => f.type === 'trip');
        const vendorFeedbacks = allFeedbacks.filter(f => f.type === 'vendor');
        
        setTripFeedbacks(tripFeedbacks);
        setVendorFeedbacks(vendorFeedbacks);
      } else {
        setError('Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError(`Failed to load feedbacks: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedFeedback(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <Star key={i} sx={{ color: '#ffc107', fontSize: 20 }} />
        ) : (
          <StarBorder key={i} sx={{ color: '#ddd', fontSize: 20 }} />
        )
      );
    }
    return stars;
  };

  const getFeedbackTypeColor = (type) => {
    switch (type) {
      case 'vendor':
        return 'primary';
      case 'trip':
        return 'success';
      default:
        return 'default';
    }
  };

  const getFeedbackTypeLabel = (type) => {
    switch (type) {
      case 'vendor':
        return 'Vendor Feedback';
      case 'trip':
        return 'Trip Feedback';
      default:
        return 'Feedback';
    }
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
          Feedback Management
        </Typography>
        <IconButton onClick={fetchFeedbacks} color="primary">
          <Refresh />
        </IconButton>
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
        // Trip Feedback Tab
        tripFeedbacks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No trip feedback submitted yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1,
              maxHeight: '400px',
              overflow: 'auto'
            }}
          >
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trip</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Overall Rating</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Comments</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tripFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id} hover>
                    <TableCell>{feedback.id}</TableCell>
                    <TableCell>
                      {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {feedback.trip ? feedback.trip.title : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {renderStars(feedback.overall_rating || 1)}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {feedback.comments || 'No comments'}
                    </TableCell>
                    <TableCell>{new Date(feedback.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : (
        // Vendor Feedback Tab
        vendorFeedbacks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No vendor feedback submitted yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1,
              maxHeight: '400px',
              overflow: 'auto'
            }}
          >
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trip</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id} hover>
                    <TableCell>{feedback.id}</TableCell>
                    <TableCell>
                      {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {feedback.trip ? feedback.trip.title : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {renderStars(feedback.ratings)}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {feedback.comment || 'No comments'}
                    </TableCell>
                    <TableCell>{new Date(feedback.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
              <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      Overall User Experience
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.overallUserExperience}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      Scope of Improvement
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.scopeOfImprovement}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      Safety Notes
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.safetyNotes}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Middle-Left Column */}
                <Grid item xs={12} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                      Best Vendor
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.bestVendor}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      Behaviour Notes
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.behaviourNotes}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      Hygiene Notes
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.hygieneNotes}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Middle-Right Column */}
                <Grid item xs={12} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main" sx={{ mb: 1 }}>
                      Poor Vendor
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.poorVendor}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      Ease of Onboarding/Off Boarding
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.easeOfOnboarding} | {aiSummary.easeOfOffboarding}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                      Best Transport Vendor
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.bestTransportVendor}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                      Best Accommodation Vendor
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.bestAccommodationVendor}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main" sx={{ mb: 1 }}>
                      Worst Accommodation Vendor
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.worstAccommodationVendor}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main" sx={{ mb: 1 }}>
                      Worst Transport Vendor
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'left' }}>
                        {aiSummary.worstTransportVendor}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Feedback Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', pb: 1 }}>
          Feedback Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailsDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedFeedback && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Type:</Typography>
                <Chip
                  label={getFeedbackTypeLabel(selectedFeedback.type)}
                  color={getFeedbackTypeColor(selectedFeedback.type)}
                  size="small"
                  sx={{ mb: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">User:</Typography>
                <Typography>N/A</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Trip:</Typography>
                <Typography>N/A</Typography>
              </Grid>

              {selectedFeedback.type === 'vendor' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Vendor ID:</Typography>
                  <Typography>{selectedFeedback.vendorid}</Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Rating:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {renderStars(selectedFeedback.ratings || selectedFeedback.overall_rating || 1)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({selectedFeedback.ratings || selectedFeedback.overall_rating || 1} / 5)
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Comment:</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedFeedback.comment || selectedFeedback.comments || 'No comment provided.'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Submitted On:</Typography>
                <Typography>{new Date(selectedFeedback.created_at).toLocaleString()}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackListWithTabs;
