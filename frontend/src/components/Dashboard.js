import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  DirectionsBus as TripIcon,
  Support as SupportIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState({
    trips: {
      total: 0,
      upcoming: 0,
      past: 0,
      completed: 0,
      cancelled: 0
    },
    funds: {
      total: 0,
      published: 0,
      draft: 0,
      pastPublished: 0,
      futurePublished: 0
    },
    users: {
      total: 0,
      pending: 0,
      verified: 0,
      inProgress: 0
    },
    supportTickets: {
      total: 0,
      byStatus: {}
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/mobile/dashboard-stats');
      const data = response.data.data;

      setStats({
        trips: data.trips,
        funds: data.funds,
        users: data.users,
        supportTickets: data.supportTickets
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ mt: 4, mb: 4, textAlign: 'center', px: 2 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
  return (
    <Box sx={{ mt: 4, mb: 4, px: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: '#fafafa',
      py: 4
    }}>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        

        {/* Statistics Cards */}
        <Grid container spacing={0} sx={{ mb: 4 }}>
          {/* Trip Statistics - Only for superadmin, admin, trip_manager */}
          {(user.role === 'superadmin' || user.role === 'admin' || user.role === 'trip_manager') && (
            <Grid item xs={12} md={4} sx={{ pr: 0.5 }} width={'50%'} >
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                background: '#ffffff',
                border: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                      p: 2.5,
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      color: 'white',
                      mr: 3,
                      boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)'
                    }}>
                      <TripIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Trip Statistics
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2.5, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 3,
                        color: 'white',
                        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)'
                        }
                      }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {stats.trips.total}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                          Total Trips
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2.5, 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        borderRadius: 3,
                        color: 'white',
                        boxShadow: '0 8px 16px rgba(240, 147, 251, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(240, 147, 251, 0.4)'
                        }
                      }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {stats.trips.upcoming}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                          Upcoming
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2.5, 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        borderRadius: 3,
                        color: 'white',
                        boxShadow: '0 8px 16px rgba(79, 172, 254, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(79, 172, 254, 0.4)'
                        }
                      }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {stats.trips.past}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                          Past
      </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2.5, 
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        borderRadius: 3,
                        color: 'white',
                        boxShadow: '0 8px 16px rgba(67, 233, 123, 0.3)',
                        transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(67, 233, 123, 0.4)'
                        }
                      }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {stats.trips.completed}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* User Statistics - Only for superadmin, admin, trip_manager, financial_manager */}
          {(user.role === 'superadmin' || user.role === 'admin' || user.role === 'trip_manager' || user.role === 'financial_manager') && (
            <Grid item xs={12} md={4} sx={{ px: 0.5 }} width={'50%'}>
            <Card sx={{
              width: '100%',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                    color: 'white',
                    mr: 3,
                    boxShadow: '0 8px 16px rgba(156, 39, 176, 0.3)'
                  }}>
                    <PeopleIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    User Statistics
                  </Typography>
                </Box>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 3,
                      color: 'white',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)'
                      }
                    }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {stats.users.total}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Total Users
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderRadius: 3,
                      color: 'white',
                      boxShadow: '0 8px 16px rgba(240, 147, 251, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(240, 147, 251, 0.4)'
                      }
                    }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {stats.users.verified}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Verified
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      borderRadius: 3,
                      color: 'white',
                      boxShadow: '0 8px 16px rgba(79, 172, 254, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(79, 172, 254, 0.4)'
                      }
                    }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {stats.users.pending}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Pending
      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5, 
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      borderRadius: 3,
                      color: 'white',
                      boxShadow: '0 8px 16px rgba(67, 233, 123, 0.3)',
                      transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(67, 233, 123, 0.4)'
                      }
                    }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {stats.users.inProgress}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            </Grid>
          )}
        </Grid>

        {/* Financial Statistics - Only for superadmin, admin, trip_manager, financial_manager */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {(user.role === 'superadmin' || user.role === 'admin' || user.role === 'trip_manager' || user.role === 'financial_manager') && (
            <Grid item xs={12} md={6} width={'100%'}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: '#ffffff',
              border: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                    color: 'white',
                    mr: 3,
                    boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)'
                  }}>
                    <MoneyIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Financial Statistics
                </Typography>
                </Box>
                
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        ₹{stats.funds.total.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Funds
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                        ₹{stats.funds.published.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Published
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                        ₹{stats.funds.draft.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Draft
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(156, 39, 176, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                        ₹{stats.funds.pastPublished.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Past Published
                    </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            </Grid>
          )}
          {/* Support Ticket Statistics - Only for superadmin, admin */}
          {(user.role === 'superadmin' || user.role === 'admin') && (
            <Grid item xs={12} md={4} sx={{ pl: 0.5 }}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: '#ffffff',
              border: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #f44336 30%, #ff5722 90%)',
                    color: 'white',
                    mr: 3,
                    boxShadow: '0 8px 16px rgba(244, 67, 54, 0.3)'
                  }}>
                    <SupportIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #f44336 30%, #ff5722 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Support Tickets
                  </Typography>
                </Box>
                
                {/* Charts Section */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3, minHeight: 400 }}>
                  {/* Pie Chart */}
                  <Box sx={{ flex: 1, minHeight: 350, border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                      Status Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(stats.supportTickets.byStatus).map(([status, count]) => ({
                            name: status,
                            value: count
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(stats.supportTickets.byStatus).map(([status, count], index) => (
                            <Cell key={`cell-${index}`} fill={['#f44336', '#ff9800', '#4caf50', '#2196f3'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                </Box>
                
              </CardContent>
            </Card>
          </Grid>
          )}
      </Grid>

      </Box>
    </Box>
  );
};

export default Dashboard;
