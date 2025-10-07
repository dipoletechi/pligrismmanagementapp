import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DirectionsBus as TripIcon,
  AccountBalance as FinanceIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { user, logout, hasPermission, getUserPermissions } = useAuth();

  const permissions = getUserPermissions();

  const modules = [
    {
      name: 'User Management',
      icon: <PeopleIcon />,
      color: 'primary',
      path: '/users',
      permissions: permissions.users || []
    },
    {
      name: 'Trip Management',
      icon: <TripIcon />,
      color: 'secondary',
      path: '/trips',
      permissions: permissions.trips || []
    },
    {
      name: 'Financial Management',
      icon: <FinanceIcon />,
      color: 'success',
      path: '/finance',
      permissions: permissions.finance || []
    },
    {
      name: 'Reports',
      icon: <ReportsIcon />,
      color: 'info',
      path: '/reports',
      permissions: permissions.reports || []
    },
    {
      name: 'Settings',
      icon: <SettingsIcon />,
      color: 'warning',
      path: '/settings',
      permissions: permissions.settings || []
    }
  ];

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Simplified Dashboard - header and account info removed */}

      {/* Modules Grid */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Available Modules
      </Typography>
      <Grid container spacing={3}>
        {modules.map((module) => (
          <Grid item xs={12} sm={6} md={4} key={module.name}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: `${module.color}.light`,
                      color: `${module.color}.contrastText`,
                      mr: 2
                    }}
                  >
                    {module.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {module.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Permissions available:
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {module.permissions.length > 0 ? (
                    module.permissions.map((permission) => (
                      <Chip
                        key={permission}
                        label={permission}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                        color={module.color}
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      No permissions
                    </Typography>
                  )}
                </Box>
                
                <Button
                  variant="contained"
                  color={module.color}
                  fullWidth
                  disabled={module.permissions.length === 0}
                >
                  Access Module
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Permissions summary removed */}
    </Container>
  );
};

export default Dashboard;
