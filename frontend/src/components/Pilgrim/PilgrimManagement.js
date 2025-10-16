import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
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
  Grid,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const PilgrimManagement = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [pilgrims, setPilgrims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPilgrim, setSelectedPilgrim] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [tripFilter, setTripFilter] = useState(null);

  const [tabs, setTabs] = useState([
    { label: 'All', value: 0, status: 'All', count: 0, color: 'default' },
    { label: 'Approved', value: 1, status: 'approved', count: 0, color: 'success' },
    { label: 'In Review', value: 2, status: 'in_verification', count: 0, color: 'warning' },
    { label: 'Not Verified', value: 3, status: 'pending', count: 0, color: 'error' },
    { label: 'Rejected', value: 4, status: 'rejected', count: 0, color: 'error' }
  ]);

  useEffect(() => {
    fetchPilgrims();
  }, [tripFilter]);

  useEffect(() => {
    // Check if we have trip filter data from navigation
    if (location.state?.filterByTrip && location.state?.tripId) {
      setTripFilter({
        tripId: location.state.tripId,
        tripTitle: location.state.tripTitle
      });
    }
  }, [location.state]);

  const fetchPilgrims = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (tripFilter?.tripId) {
        // Fetch pilgrims who have applied for this specific trip
        response = await axios.get(`/api/trip-pligrim/trip/${tripFilter.tripId}`);
      } else {
        // Fetch all pilgrims
        response = await axios.get('/api/trip-pligrim');
      }
      
      if (response.data.success) {
        setPilgrims(response.data.data);
        updateTabCounts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching pilgrims:', err);
      setError('Failed to fetch pilgrims data');
    } finally {
      setLoading(false);
    }
  };

  const updateTabCounts = (data) => {
    const counts = {
      All: data.length,
      approved: data.filter(p => p.status === 'Approved' || p.status === 'approved').length,
      in_verification: data.filter(p => p.status === 'in_verification').length,
      pending: data.filter(p => p.status === 'Pending' || p.status === 'pending').length,
      rejected: data.filter(p => p.status === 'Reject' || p.status === 'rejected').length
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

  const handleStatusUpdate = async (pilgrimId, newStatus) => {
    try {
      const response = await axios.put(`/api/users/${pilgrimId}`, {
        accountStatus: newStatus
      });
      
      if (response.data.success) {
        // Update local state
        setPilgrims(prevPilgrims =>
          prevPilgrims.map(pilgrim =>
            pilgrim.id === pilgrimId ? { ...pilgrim, status: newStatus } : pilgrim
          )
        );
        updateTabCounts(pilgrims.map(pilgrim =>
          pilgrim.id === pilgrimId ? { ...pilgrim, status: newStatus } : pilgrim
        ));
        setEditDialogOpen(false);
        setSelectedPilgrim(null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to update pilgrim status: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditClick = (pilgrim) => {
    setSelectedPilgrim(pilgrim);
    setEditStatus(pilgrim.status);
    setEditDialogOpen(true);
  };

  const handleStatusChange = (event) => {
    setEditStatus(event.target.value);
  };

  const handleSaveStatus = () => {
    if (selectedPilgrim && editStatus) {
      handleStatusUpdate(selectedPilgrim.id, editStatus);
    }
  };

  const handleDeletePilgrim = async (pilgrimId) => {
    if (window.confirm('Are you sure you want to delete this pilgrim application?')) {
      try {
        const response = await axios.delete(`/api/trip-pligrim/${pilgrimId}`);
        if (response.data.success) {
          setPilgrims(prevPilgrims => prevPilgrims.filter(p => p.id !== pilgrimId));
          updateTabCounts(pilgrims.filter(p => p.id !== pilgrimId));
        }
      } catch (err) {
        console.error('Error deleting pilgrim:', err);
        setError('Failed to delete pilgrim application');
      }
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'Approved': { color: 'success', icon: <CheckCircleIcon />, label: 'Approved' },
      'approved': { color: 'success', icon: <CheckCircleIcon />, label: 'Approved' },
      'in_verification': { color: 'warning', icon: <PendingIcon />, label: 'In Review' },
      'Pending': { color: 'error', icon: <CancelIcon />, label: 'Not Verified' },
      'pending': { color: 'error', icon: <CancelIcon />, label: 'Not Verified' },
      'Reject': { color: 'error', icon: <CancelIcon />, label: 'Rejected' },
      'rejected': { color: 'error', icon: <CancelIcon />, label: 'Rejected' }
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

  const filteredPilgrims = pilgrims.filter(pilgrim => {
    if (statusFilter === 'All') return true;
    
    // Handle both account status and trip application status formats
    const status = pilgrim.status;
    switch (statusFilter) {
      case 'approved':
        return status === 'Approved' || status === 'approved';
      case 'in_verification':
        return status === 'in_verification';
      case 'pending':
        return status === 'Pending' || status === 'pending';
      case 'rejected':
        return status === 'Reject' || status === 'rejected';
      default:
        return status === statusFilter;
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
      case 'approved': 
        return <CheckCircleIcon color="success" />;
      case 'in_verification': 
        return <PendingIcon color="warning" />;
      case 'Pending':
      case 'pending': 
        return <CancelIcon color="error" />;
      case 'Reject':
      case 'rejected': 
        return <CancelIcon color="error" />;
      default: 
        return <PendingIcon color="action" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 2, fontSize: 32 }} />
            Pilgrim Management
          </Typography>
          {tripFilter && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Showing applicants for: <strong>{tripFilter.tripTitle}</strong>
            </Typography>
          )}
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
                  {getStatusIcon(tab.status)}
                  {tab.label}
                  <Chip
                    label={tab.count}
                    size="small"
                    color={tab.color}
                    variant="outlined"
                  />
                </Box>
              }
              value={tab.value}
            />
          ))}
        </Tabs>
      </Card>

      {/* Content */}
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
                    <TableCell>Pilgrim</TableCell>
                    <TableCell>Contact Details</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPilgrims.map((pilgrim) => (
                    <TableRow key={pilgrim.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {pilgrim.user?.first_name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {pilgrim.user?.first_name} {pilgrim.user?.last_name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            📧 {pilgrim.user?.email || 'No email'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📞 {pilgrim.user?.phone || 'No phone'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🆔 Aadhaar: {pilgrim.user?.aadhaar_number || 'Not provided'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📍 {pilgrim.user?.aadhaar_address || 'No address'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(pilgrim.status)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Status">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditClick(pilgrim)}
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
          
          {!loading && filteredPilgrims.length === 0 && (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No pilgrims found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statusFilter === 'All' 
                  ? 'No pilgrim applications available'
                  : `No pilgrims with status "${statusFilter}"`
                }
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Status</DialogTitle>
        <DialogContent>
          {selectedPilgrim && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedPilgrim.user?.first_name} {selectedPilgrim.user?.last_name}
              </Typography>
              <TextField
                select
                fullWidth
                label="Account Status"
                value={editStatus}
                onChange={handleStatusChange}
                sx={{ mt: 2 }}
              >
                <MenuItem value="pending">Not Verified</MenuItem>
                <MenuItem value="in_verification">In Review</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStatus} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default PilgrimManagement;
