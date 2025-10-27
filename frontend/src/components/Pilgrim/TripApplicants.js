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
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  DirectionsBus as TransportIcon,
  Hotel as AccommodationIcon,
  Event as EventIcon,
  NotificationsActive as NotificationIcon
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
  const [userLogs, setUserLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notificationContent, setNotificationContent] = useState('');
  const [notificationTypes, setNotificationTypes] = useState({
    email: false,
    mobile: true,
    text: false
  });
  const [sendingNotification, setSendingNotification] = useState(false);

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

  // Clear selections when status filter changes
  useEffect(() => {
    setSelectedApplicants([]);
  }, [statusFilter]);

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

  const fetchUserLogs = async (userId) => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const response = await axios.get(`/api/trip-logs/user/${userId}/trip/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setUserLogs(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching user logs:', err);
      setUserLogs([]);
      if (err.response?.status === 403) {
        setLogsError('Access denied. You need admin privileges to view user logs.');
      } else {
        setLogsError('Failed to load activity logs. Please try again.');
      }
    } finally {
      setLogsLoading(false);
    }
  };

  // Helper function to group logs by date and type
  const groupLogsByDateAndType = (logs) => {
    return logs.reduce((groups, log) => {
      // Use trip_check_date if available, otherwise fallback to scanned_at
      const dateString = log.trip_check_date || log.scanned_at;
      const date = new Date(dateString).toDateString();
      const logType = log.log_type.includes('Transport') ? 'Transport' : 
                    log.log_type.includes('Accommodation') ? 'Accommodation' : 'Event';
      
      if (!groups[date]) groups[date] = {};
      if (!groups[date][logType]) groups[date][logType] = [];
      groups[date][logType].push(log);
      return groups;
    }, {});
  };

  const handleViewDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setDetailsDialogOpen(true);
    // Fetch user logs when opening details
    if (applicant.user?.id) {
      fetchUserLogs(applicant.user.id);
    }
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

  // Checkbox handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filteredApplicants.map(applicant => applicant.id);
      setSelectedApplicants(allIds);
    } else {
      setSelectedApplicants([]);
    }
  };

  const handleSelectOne = (applicantId) => {
    setSelectedApplicants(prev => {
      if (prev.includes(applicantId)) {
        return prev.filter(id => id !== applicantId);
      } else {
        return [...prev, applicantId];
      }
    });
  };

  const isAllSelected = filteredApplicants.length > 0 && 
    selectedApplicants.length === filteredApplicants.length;

  const isSomeSelected = selectedApplicants.length > 0 && 
    selectedApplicants.length < filteredApplicants.length;

  const handleSendNotification = () => {
    setNotificationDialogOpen(true);
  };

  const handleNotificationTypeChange = (event) => {
    setNotificationTypes({
      ...notificationTypes,
      [event.target.name]: event.target.checked
    });
  };

  const handleSendNotificationSubmit = async () => {
    if (!notificationContent.trim()) {
      setError('Please enter notification content');
      return;
    }

    if (!notificationTypes.email && !notificationTypes.mobile && !notificationTypes.text) {
      setError('Please select at least one notification type');
      return;
    }

    setSendingNotification(true);
    try {
      // Get selected applicants' user IDs
      const userIds = selectedApplicants.map(applicantId => {
        const applicant = applicants.find(a => a.id === applicantId);
        return applicant?.user?.id;
      }).filter(Boolean);

      const response = await axios.post('/api/notifications/send-bulk', {
        userIds: userIds,
        content: notificationContent,
        types: notificationTypes
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setNotificationDialogOpen(false);
        setNotificationContent('');
        setSelectedApplicants([]);
        setNotificationTypes({ email: false, mobile: true, text: false });
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(`Failed to send notification: ${err.response?.data?.message || err.message}`);
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 },
        mb: { xs: 2, md: 3 }
      }}>
        <Box>
          <Typography 
            component="h1" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' }
            }}
          >
            <PersonIcon sx={{ mr: { xs: 1.5, md: 2 }, fontSize: { xs: 28, md: 32 } }} />
            {getTripTitle()}
          </Typography>
        </Box>
        {user?.role !== 'financial_manager' && (
          <Button
            variant="contained"
            color="primary"
            disabled={selectedApplicants.length === 0}
            onClick={handleSendNotification}
            startIcon={<NotificationIcon />}
            fullWidth={{ xs: true, sm: false }}
            sx={{ 
              minWidth: { xs: '100%', sm: 180 },
              fontSize: { xs: '0.875rem', md: '1rem' }
            }}
          >
            Send Notification
            {selectedApplicants.length > 0 && ` (${selectedApplicants.length})`}
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: { xs: 2, md: 3 } }} onClose={() => setError(null)}>
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
                    {user?.role !== 'financial_manager' && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isAllSelected}
                          indeterminate={isSomeSelected}
                          onChange={handleSelectAll}
                          color="primary"
                        />
                      </TableCell>
                    )}
                    <TableCell>Applicant</TableCell>
                    <TableCell>Contact Details</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id} hover>
                      {user?.role !== 'financial_manager' && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedApplicants.includes(applicant.id)}
                            onChange={() => handleSelectOne(applicant.id)}
                            color="primary"
                          />
                        </TableCell>
                      )}
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
                          {user?.role !== 'financial_manager' && (
                            <Tooltip title="Edit Status">
                              <IconButton
                                onClick={() => handleEditClick(applicant)}
                                size="small"
                                color="secondary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
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
        <DialogContent>
          {selectedApplicant && (
            <Box sx={{ mt: 2 }}>
               <Box>
                 {/* Activity Logs */}
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                     <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                     <Typography variant="h6" color="primary">
                       Applicant Logs
                  </Typography>
                   </Box>
                   {logsLoading ? (
                     <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                       <CircularProgress size={24} />
                     </Box>
                   ) : logsError ? (
                     <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#ffebee', borderRadius: 1, border: '1px solid #f44336' }}>
                       <CancelIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                       <Typography variant="body2" color="error.main" sx={{ fontStyle: 'italic' }}>
                         {logsError}
                    </Typography>
                  </Box>
                   ) : userLogs.length > 0 ? (
                     <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                       {/* Simple table format - no grouping */}
                       <TableContainer sx={{ border: '2px solid #000' }}>
                         <Table>
                           <TableHead>
                             <TableRow sx={{ backgroundColor: '#000' }}>
                               <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                 LOG TYPE
                               </TableCell>
                               <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                 VENDOR/EVENT
                               </TableCell>
                               <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                 DATE
                               </TableCell>
                               <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                 TIME
                               </TableCell>
                             </TableRow>
                           </TableHead>
                           <TableBody>
                             {userLogs
                               .sort((a, b) => new Date(b.scanned_at) - new Date(a.scanned_at)) // Descending order
                               .map((log, index) => (
                                 <TableRow 
                                   key={log.id} 
                                   sx={{ 
                                     backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                                     borderBottom: '1px solid #ddd'
                                   }}
                                 >
                                   <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                     {log.log_type}
                                   </TableCell>
                                   <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                     {log.vendor_info ? log.vendor_info.name : log.log_item_id}
                                   </TableCell>
                                   <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                     {new Date(log.trip_check_date || log.scanned_at).toLocaleDateString('en-GB', {
                                       day: '2-digit',
                                       month: '2-digit',
                                       year: 'numeric'
                                     })}
                                   </TableCell>
                                   <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                     {new Date(log.scanned_at).toLocaleTimeString('en-US', {
                                       hour: '2-digit',
                                       minute: '2-digit',
                                       hour12: true
                                     })}
                                   </TableCell>
                                 </TableRow>
                               ))}
                           </TableBody>
                         </Table>
                       </TableContainer>
                     </Box>
                   ) : (
                     <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
                       <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                       <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                         No activity logs found for this user.
                       </Typography>
                  </Box>
                   )}
               </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDetailsDialogOpen(false);
            setUserLogs([]);
            setLogsError(null);
          }} variant="contained">
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

      {/* Send Notification Dialog */}
      <Dialog 
        open={notificationDialogOpen} 
        onClose={() => setNotificationDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationIcon color="primary" />
            Send Notification to {selectedApplicants.length} Applicant(s)
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Notification Type
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationTypes.email}
                    onChange={handleNotificationTypeChange}
                    name="email"
                    color="primary"
                  />
                }
                label="Email Notification"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationTypes.mobile}
                    onChange={handleNotificationTypeChange}
                    name="mobile"
                    color="primary"
                  />
                }
                label="Mobile Notification"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationTypes.text}
                    onChange={handleNotificationTypeChange}
                    name="text"
                    color="primary"
                  />
                }
                label="Text Notification"
              />
            </FormGroup>

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Notification Content"
              value={notificationContent}
              onChange={(e) => setNotificationContent(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Enter your notification message here..."
              sx={{ mt: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setNotificationDialogOpen(false);
              setNotificationContent('');
              setNotificationTypes({ email: false, mobile: true, text: false });
            }}
            disabled={sendingNotification}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendNotificationSubmit} 
            variant="contained" 
            color="primary"
            disabled={sendingNotification || !notificationContent.trim()}
            startIcon={sendingNotification ? <CircularProgress size={20} /> : <NotificationIcon />}
          >
            {sendingNotification ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripApplicants;
