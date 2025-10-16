import React, { useState, useEffect } from 'react';
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
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import axios from 'axios';

const PilgrimManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pilgrims, setPilgrims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPilgrim, setSelectedPilgrim] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const tabs = [
    { label: 'All', value: 0, status: 'All', count: 0, color: 'default' },
    { label: 'Approved', value: 1, status: 'Approved', count: 0, color: 'success' },
    { label: 'In Review', value: 2, status: 'InReview', count: 0, color: 'warning' },
    { label: 'Not Verified', value: 3, status: 'NotVerified', count: 0, color: 'error' }
  ];

  useEffect(() => {
    fetchPilgrims();
  }, []);

  const fetchPilgrims = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/trip-pligrim');
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
      Approved: data.filter(p => p.status === 'Approved').length,
      InReview: data.filter(p => p.status === 'Pending').length,
      NotVerified: data.filter(p => p.status === 'Reject').length
    };
    
    tabs.forEach(tab => {
      tab.count = counts[tab.status] || 0;
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const selectedTab = tabs[newValue];
    setStatusFilter(selectedTab.status);
  };

  const handleStatusUpdate = async (pilgrimId, newStatus) => {
    try {
      const response = await axios.put(`/api/trip-pligrim/${pilgrimId}`, {
        status: newStatus
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
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update pilgrim status');
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
      'Approved': { color: 'success', icon: <CheckCircleIcon /> },
      'Pending': { color: 'warning', icon: <PendingIcon /> },
      'Reject': { color: 'error', icon: <CancelIcon /> }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: <PendingIcon /> };
    
    return (
      <Chip
        icon={config.icon}
        label={status}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const filteredPilgrims = pilgrims.filter(pilgrim => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'InReview') return pilgrim.status === 'Pending';
    if (statusFilter === 'NotVerified') return pilgrim.status === 'Reject';
    return pilgrim.status === statusFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircleIcon color="success" />;
      case 'Pending': return <PendingIcon color="warning" />;
      case 'Reject': return <CancelIcon color="error" />;
      default: return <PendingIcon color="action" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 2, fontSize: 32 }} />
          Pilgrim Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPilgrims}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<FilterIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Filter
          </Button>
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell>Pilgrim</TableCell>
                    <TableCell>Trip Details</TableCell>
                    <TableCell>Application Date</TableCell>
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
                            {pilgrim.user?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {pilgrim.user?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {pilgrim.user?.email || 'No email'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {pilgrim.user?.phone || 'No phone'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {pilgrim.trip?.title || 'Trip Title'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Destination: {pilgrim.trip?.destinationInfo?.title || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Start: {pilgrim.trip?.start_date ? new Date(pilgrim.trip.start_date).toLocaleDateString() : 'TBD'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            End: {pilgrim.trip?.end_date ? new Date(pilgrim.trip.end_date).toLocaleDateString() : 'TBD'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(pilgrim.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(pilgrim.created_at).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(pilgrim.status)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {pilgrim.status === 'Pending' && (
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleStatusUpdate(pilgrim.id, 'Approved')}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {pilgrim.status === 'Pending' && (
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleStatusUpdate(pilgrim.id, 'Reject')}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeletePilgrim(pilgrim.id)}
                            >
                              <DeleteIcon />
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

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {tabs.map((tab) => (
          <Grid item xs={12} sm={6} md={3} key={tab.value}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                {getStatusIcon(tab.status)}
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {tab.count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tab.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PilgrimManagement;
