import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const TripApplicants = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { tripId } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');

  const [tabs, setTabs] = useState([
    { label: 'All', value: 0, status: 'All', count: 0, color: 'default' },
    { label: 'Pending', value: 1, status: 'Pending', count: 0, color: 'error' },
    { label: 'Approved', value: 2, status: 'Approved', count: 0, color: 'success' },
    { label: 'Reject', value: 3, status: 'Reject', count: 0, color: 'error' }
  ]);

  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (tripId) {
      fetchApplicants();
    }
  }, [tripId]);

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/trip-pligrim/trip/${tripId}`);
      if (response.data.success) {
        setApplicants(response.data.data);
        updateTabCounts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Failed to fetch applicants data');
    } finally {
      setLoading(false);
    }
  };

  const updateTabCounts = (data) => {
    const counts = {
      All: data.length,
      Pending: data.filter(p => p.status === 'Pending').length,
      Approved: data.filter(p => p.status === 'Approved').length,
      Reject: data.filter(p => p.status === 'Reject').length
    };
    
    setTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        count: counts[tab.status] || 0
      }))
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const selectedTab = tabs[newValue];
    setStatusFilter(selectedTab.status);
  };

  const handleViewDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setDetailsDialogOpen(true);
  };

  const handleEditClick = (applicant) => {
    setSelectedApplicant(applicant);
    setEditStatus(applicant.status);
    setEditDialogOpen(true);
  };

  const handleStatusChange = (event) => {
    setEditStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    if (!selectedApplicant) return;

    try {
      const response = await axios.put(`/api/trip-pligrim/${selectedApplicant.id}`, {
        status: editStatus
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Update local state
        setApplicants(prevApplicants =>
          prevApplicants.map(applicant =>
            applicant.id === selectedApplicant.id ? { ...applicant, status: editStatus } : applicant
          )
        );
        updateTabCounts(applicants.map(applicant =>
          applicant.id === selectedApplicant.id ? { ...applicant, status: editStatus } : applicant
        ));
        setEditDialogOpen(false);
        setSelectedApplicant(null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(`Failed to update applicant status: ${err.response?.data?.message || err.message}`);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'Approved': { color: 'success', icon: <CheckCircleIcon />, label: 'Approved' },
      'Pending': { color: 'error', icon: <CancelIcon />, label: 'Pending' },
      'Reject': { color: 'error', icon: <CancelIcon />, label: 'Rejected' }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: <PendingIcon />, label: status };
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const filteredApplicants = applicants.filter(applicant => {
    if (statusFilter === 'All') return true;
    return applicant.status === statusFilter;
  });

  const getTripTitle = () => {
    return location.state?.tripTitle || 'Trip Applicants';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 2, fontSize: 32 }} />
            {getTripTitle()}
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{tab.label}</span>
                  <Chip
                    label={tab.count}
                    size="small"
                    color={tab.color}
                    sx={{ minWidth: 24, height: 24 }}
                  />
                </Box>
              }
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          ))}
        </Tabs>
      </Card>

      {/* Applicants Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Contact Details</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {applicant.user?.first_name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {applicant.user?.first_name} {applicant.user?.last_name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            📧 {applicant.user?.email || 'No email'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📞 {applicant.user?.phone || 'No phone'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🆔 Aadhaar: {applicant.user?.aadhaar_number || 'Not provided'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📍 {applicant.user?.aadhaar_address || 'No address'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(applicant.status)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewDetails(applicant)}
                              size="small"
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Status">
                            <IconButton
                              onClick={() => handleEditClick(applicant)}
                              size="small"
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && filteredApplicants.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No applicants found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statusFilter === 'All' 
                  ? 'No applicants have applied for this trip yet.'
                  : `No applicants with status "${statusFilter}" found.`
                }
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Applicant Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Applicant Details</DialogTitle>
        <DialogContent>
          {selectedApplicant && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Personal Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedApplicant.user?.first_name} {selectedApplicant.user?.last_name}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedApplicant.user?.email || 'Not provided'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{selectedApplicant.user?.phone || 'Not provided'}</Typography>
                  </Box>
                </Grid>

                {/* Application Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Application Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Application Status</Typography>
                    <Box sx={{ mt: 1 }}>
                      {getStatusChip(selectedApplicant.status)}
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Application Date</Typography>
                    <Typography variant="body1">
                      {new Date(selectedApplicant.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                      {new Date(selectedApplicant.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </Grid>

                {/* Aadhaar Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Aadhaar Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Aadhaar Number</Typography>
                    <Typography variant="body1">{selectedApplicant.user?.aadhaar_number || 'Not provided'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Aadhaar Address</Typography>
                    <Typography variant="body1">{selectedApplicant.user?.aadhaar_address || 'Not provided'}</Typography>
                  </Box>
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

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Status"
            value={editStatus}
            onChange={handleStatusChange}
            margin="normal"
            variant="outlined"
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Reject">Reject</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStatus} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripApplicants;
