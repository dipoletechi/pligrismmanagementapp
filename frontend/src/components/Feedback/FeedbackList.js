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
  Alert
} from '@mui/material';
import {
  Star,
  StarBorder,
  Visibility,
  Refresh,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const FeedbackList = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching feedbacks...');
      console.log('User:', user);
      
      const response = await axios.get('/api/feedback');
      console.log('Feedback API response:', response.data);

      if (response.data.success) {
        setFeedbacks(response.data.data);
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
        <Button
          onClick={fetchFeedbacks}
          variant="outlined"
          startIcon={<Refresh />}
          sx={{ ml: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Feedback Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trip</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id} hover>
                    <TableCell>{feedback.id}</TableCell>
                    <TableCell>
                      {feedback.user ? `${feedback.user.first_name} ${feedback.user.last_name}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {feedback.trip ? feedback.trip.title : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getFeedbackTypeLabel(feedback.type)}
                        color={getFeedbackTypeColor(feedback.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {renderStars(feedback.ratings)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({feedback.ratings}/5)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(feedback.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleViewDetails(feedback)}
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Feedback Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Feedback Details</DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Feedback ID
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedFeedback.id}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip
                    label={getFeedbackTypeLabel(selectedFeedback.type)}
                    color={getFeedbackTypeColor(selectedFeedback.type)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedFeedback.user ? `${selectedFeedback.user.first_name} ${selectedFeedback.user.last_name}` : 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trip
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedFeedback.trip ? selectedFeedback.trip.title : 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {renderStars(selectedFeedback.ratings)}
                    <Typography variant="body1" fontWeight="bold" sx={{ ml: 1 }}>
                      {selectedFeedback.ratings} out of 5
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(selectedFeedback.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Comment
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    {selectedFeedback.comment || 'No comment provided'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackList;
