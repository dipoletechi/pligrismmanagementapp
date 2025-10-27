import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordPolicy from './PasswordPolicy';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import axios from 'axios';

const UserManagement = () => {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });
  const [passwordStrength, setPasswordStrength] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0
  });
  const [activeTab, setActiveTab] = useState(0);
  const [allUsersData, setAllUsersData] = useState([]);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/users?page=1&limit=1000'); // Get all users for counts
      // Filter out users with role='user'
      const nonRegularUsers = response.data.data.users.filter(u => u.role !== 'user');
      setAllUsersData(nonRegularUsers);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const fetchUsers = async (page = 1, role = null) => {
    try {
      setLoading(true);
      let url = `/api/users?page=${page}&limit=10`;
      if (role) {
        url += `&role=${role}`;
      }
      const response = await axios.get(url);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching users',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission('users', 'read')) {
      fetchAllUsers(); // Fetch all users for counts
      fetchUsers(1, 'admin'); // Fetch paginated users (default: admin role)
    }
  }, [hasPermission]);

  // Update allUsersData when users change
  useEffect(() => {
    if (users.length > 0 && allUsersData.length === 0) {
      setAllUsersData(users);
    }
  }, [users, allUsersData.length]);

  // Check if user has permission to manage users
  if (!hasPermission('users', 'read')) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          You don't have permission to access user management.
        </Alert>
      </Container>
    );
  }

  const handleOpen = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        firstName: userToEdit.firstName || '',
        lastName: userToEdit.lastName || '',
        email: userToEdit.email,
        password: '',
        role: userToEdit.role,
        isActive: userToEdit.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
        isActive: true
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      isActive: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check password strength for new users or when password is being changed
    if ((!editingUser || formData.password) && passwordStrength.percentage < 100) {
      setSnackbar({
        open: true,
        message: 'Password does not meet all security requirements',
        severity: 'error'
      });
      return;
    }
    
    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await axios.put(`/api/users/${editingUser.id}`, updateData);
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
      } else {
        // Create user
        await axios.post('/api/users', formData);
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success'
        });
      }
      handleClose();
      fetchAllUsers(); // Refresh counts
      fetchUsers(pagination.currentPage);
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving user',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
        fetchAllUsers(); // Refresh counts
        fetchUsers(pagination.currentPage);
      } catch (error) {
        console.error('Error deleting user:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error deleting user',
          severity: 'error'
        });
      }
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      superadmin: 'error',
      admin: 'warning',
      trip_manager: 'info',
      financial_manager: 'success',
      user: 'default'
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      superadmin: 'Super Admin',
      admin: 'Admin',
      trip_manager: 'Trip Manager',
      financial_manager: 'Financial Manager',
      user: 'User'
    };
    return labels[role] || role;
  };

  // Tab configuration (excluding regular users)
  const tabs = [
    { label: 'Admins', value: 'admin', role: 'admin' },
    { label: 'Super Admins', value: 'superadmin', role: 'superadmin' },
    { label: 'Trip Managers', value: 'trip_manager', role: 'trip_manager' },
    { label: 'Financial Managers', value: 'financial_manager', role: 'financial_manager' }
  ];

  // Use users directly since backend filtering is now implemented
  const filteredUsers = users;

  // Get counts for each role (excluding regular users)
  const getRoleCount = (role) => {
    const dataToUse = allUsersData.length > 0 ? allUsersData : users;
    return dataToUse.filter(user => user.role === role && user.role !== 'user').length;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Fetch users based on selected role
    const selectedRole = tabs[newValue].role;
    fetchUsers(1, selectedRole);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: { xs: 2, md: 4 },
      px: { xs: 1, sm: 2, md: 0 }
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
            gap: { xs: 2, sm: 0 },
            mb: 3,
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Typography 
                component="h1" 
                gutterBottom
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  mb: 1
                }}
              >
                User Management
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                  fontWeight: 400 
                }} 
                color="text.secondary"
              >
                Manage system users and their roles
              </Typography>
            </Box>
            {hasPermission('users', 'create') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                size="large"
                fullWidth={{ xs: true, sm: false }}
                sx={{
                  borderRadius: 3,
                  px: { xs: 2, md: 4 },
                  py: { xs: 1.5, md: 2 },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Add User
              </Button>
            )}
          </Box>
        </Box>

        {/* Role-based Tabs */}
        <Paper sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          mb: { xs: 2, md: 3 }
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
                minHeight: { xs: 48, md: 60 },
                px: { xs: 2, md: 3 }
              },
              '& .Mui-selected': {
                color: '#1976d2',
                fontWeight: 700
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={tab.value} 
                label={`${tab.label} (${getRoleCount(tab.role)})`}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Users Table */}
        <Paper sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <TableContainer sx={{ 
            maxHeight: { xs: 500, md: 400 },
            overflowX: 'auto'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', md: '1.1rem' },
                    border: 'none',
                    py: { xs: 1.5, md: 2 }
                  }
                }}>
                  <TableCell sx={{ minWidth: { xs: 120, md: 'auto' } }}>Name</TableCell>
                  <TableCell sx={{ minWidth: { xs: 150, md: 'auto' } }}>Email</TableCell>
                  <TableCell sx={{ minWidth: { xs: 100, md: 'auto' } }}>Role</TableCell>
                  <TableCell sx={{ minWidth: { xs: 80, md: 'auto' } }}>Status</TableCell>
                  <TableCell sx={{ minWidth: { xs: 100, md: 'auto' } }}>Created</TableCell>
                  <TableCell align="center" sx={{ minWidth: { xs: 100, md: 'auto' } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((userData, index) => (
                  <TableRow 
                    key={userData.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ py: { xs: 1, md: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ color: '#1976d2', mr: { xs: 1, md: 2 }, fontSize: { xs: 20, md: 24 } }} />
                        <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, fontWeight: 600 }} color="text.primary">
                          {userData.firstName} {userData.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, md: 2 } }}>
                      <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }} color="text.secondary">
                        {userData.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, md: 2 } }}>
                      <Chip
                        label={getRoleLabel(userData.role)}
                        color={getRoleColor(userData.role)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          fontSize: { xs: '0.7rem', md: '0.8125rem' },
                          height: { xs: 24, md: 32 }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, md: 2 } }}>
                      <Chip
                        label={userData.isActive ? 'Active' : 'Inactive'}
                        color={userData.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          fontSize: { xs: '0.7rem', md: '0.8125rem' },
                          height: { xs: 24, md: 32 }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, md: 2 } }}>
                      <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }} color="text.secondary">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: { xs: 1, md: 2 } }}>
                      <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, justifyContent: 'center' }}>
                        {hasPermission('users', 'update') && (
                          <IconButton
                            onClick={() => handleOpen(userData)}
                            size="small"
                            sx={{
                              color: '#1976d2',
                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                              p: { xs: 0.5, md: 1 },
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                          </IconButton>
                        )}
                        {hasPermission('users', 'delete') && userData.id !== user.id && (
                          <IconButton
                            onClick={() => handleDelete(userData.id)}
                            size="small"
                            sx={{
                              color: '#d32f2f',
                              backgroundColor: 'rgba(211, 47, 47, 0.1)',
                              p: { xs: 0.5, md: 1 },
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.2)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      {/* User Form Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        fullScreen={{ xs: true, sm: false }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          py: { xs: 2, md: 3 }
        }}>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="firstName"
              label="First Name"
              fullWidth
              variant="outlined"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="lastName"
              label="Last Name"
              fullWidth
              variant="outlined"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              required={!editingUser}
              helperText={editingUser ? "Leave blank to keep current password" : ""}
            />
            
            {/* Password Policy Component - only show for new users or when password is being changed */}
            {(!editingUser || formData.password) && (
              <PasswordPolicy 
                password={formData.password}
                onStrengthChange={setPasswordStrength}
                showPolicy={true}
              />
            )}
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="trip_manager">Trip Manager</MenuItem>
                <MenuItem value="financial_manager">Financial Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="superadmin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                name="isActive"
                value={formData.isActive}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ 
            px: { xs: 2, md: 3 }, 
            py: { xs: 2, md: 2 },
            gap: { xs: 1, md: 1 }
          }}>
            <Button 
              onClick={handleClose}
              sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
            >
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default UserManagement;
