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
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
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
    },
    pilgrims: {
      total: 0,
      active: 0,
      inactive: 0
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

      // Fetch pilgrim stats (users with role='user')
      const pilgrimResponse = await axios.get('/api/users?role=user&page=1&limit=1000');
      const pilgrimData = pilgrimResponse.data.data.users;
      const totalPilgrims = pilgrimData.length;
      const activePilgrims = pilgrimData.filter(u => u.isActive).length;
      const inactivePilgrims = pilgrimData.filter(u => !u.isActive).length;

      setStats({
        trips: data.trips,
        funds: data.funds,
        users: data.users,
        supportTickets: data.supportTickets,
        pilgrims: {
          total: totalPilgrims,
          active: activePilgrims,
          inactive: inactivePilgrims
        }
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
      py: { xs: 2, md: 4 },
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 2, md: 0 }} sx={{ mb: { xs: 2, md: 4 } }}>
          {/* Trip Statistics - Visible to all roles */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pr: { xs: 0, md: 0.5 }, mb: { xs: 2, md: 0 } }}>
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
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
                    <Box sx={{
                      p: { xs: 1.5, md: 2.5 },
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      color: 'white',
                      mr: { xs: 1.5, md: 3 },
                      boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)'
                    }}>
                      <TripIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
                    </Box>
                    <Typography sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
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
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, md: 2.5 }, 
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
                        <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                          {stats.trips.total}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                          Total Trips
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, md: 2.5 }, 
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
                        <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                          {stats.trips.upcoming}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                          Upcoming
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, md: 2.5 }, 
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
                        <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                          {stats.trips.past}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                          Past
      </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, md: 2.5 }, 
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
                        <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                          {stats.trips.completed}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

          {/* User Statistics - Visible to all roles */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ px: { xs: 0, md: 0.5 }, mb: { xs: 2, md: 0 } }}>
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
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 4 } }}>
                  <Box sx={{
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                    color: 'white',
                    mr: { xs: 1.5, md: 3 },
                    boxShadow: '0 8px 16px rgba(156, 39, 176, 0.3)'
                  }}>
                    <PeopleIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
                  </Box>
                  <Typography sx={{ 
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
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
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: { xs: 1.5, md: 2.5 }, 
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
                      <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                        {stats.users.total}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                        Total Users
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: { xs: 1.5, md: 2.5 }, 
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
                      <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                        {stats.users.verified}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                        Verified
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: { xs: 1.5, md: 2.5 }, 
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
                      <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                        {stats.users.pending}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                        Pending
      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: { xs: 1.5, md: 2.5 }, 
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
                      <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                        {stats.users.inProgress}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            </Grid>

          {/* Support Ticket Statistics - Visible to all roles */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pl: { xs: 0, md: 0.5 } }}>
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
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 4 } }}>
                  <Box sx={{
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #f44336 30%, #ff5722 90%)',
                    color: 'white',
                    mr: { xs: 1.5, md: 3 },
                    boxShadow: '0 8px 16px rgba(244, 67, 54, 0.3)'
                  }}>
                    <SupportIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
                  </Box>
                  <Typography sx={{ 
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #f44336 30%, #ff5722 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Support Tickets
                </Typography>
                </Box>
                
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: { xs: 1.5, md: 2.5 }, 
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
                      <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                        {stats.supportTickets.total}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                        Total Tickets
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: { xs: 1.5, md: 2.5 }, 
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
                      <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                        {stats.supportTickets.byStatus?.open || 0}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                        Open
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: { xs: 1.5, md: 2.5 }, 
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
                      <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                        {stats.supportTickets.byStatus?.['in-progress'] || 0}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: { xs: 1.5, md: 2.5 }, 
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
                      <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                        {stats.supportTickets.byStatus?.resolved || 0}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                        Resolved
                    </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            </Grid>
        </Grid>

        {/* Pilgrim Statistics & Financial Statistics Row */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
          {/* Pilgrim Statistics - Visible to all roles */}
            <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: '#ffffff',
              border: 'none',
              transition: 'all 0.3s ease',
                height: '100%',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 4 } }}>
                  <Box sx={{
                      p: { xs: 1.5, md: 2 },
                    borderRadius: 3,
                      background: 'linear-gradient(45deg, #ff6b6b 30%, #ee5a6f 90%)',
                    color: 'white',
                      mr: { xs: 1.5, md: 3 },
                      boxShadow: '0 8px 16px rgba(255, 107, 107, 0.3)'
                  }}>
                      <PeopleIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
                  </Box>
                    <Typography sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                    fontWeight: 700,
                      background: 'linear-gradient(45deg, #ff6b6b 30%, #ee5a6f 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                      Pilgrim Statistics
                  </Typography>
                </Box>
                
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, md: 2.5 }, 
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
                        <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, mb: 1 }}>
                          {stats.pilgrims.total}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, opacity: 0.9, fontWeight: 500 }}>
                          Total Pilgrims
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, md: 2 }, 
                        bgcolor: 'rgba(76, 175, 80, 0.1)', 
                        borderRadius: 2 
                      }}>
                        <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' }, fontWeight: 700, color: '#4caf50' }}>
                          {stats.pilgrims.active}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }} color="text.secondary">
                          Active
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, md: 2 }, 
                        bgcolor: 'rgba(244, 67, 54, 0.1)', 
                        borderRadius: 2 
                      }}>
                        <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' }, fontWeight: 700, color: '#f44336' }}>
                          {stats.pilgrims.inactive}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }} color="text.secondary">
                          Inactive
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

          {/* Financial Statistics - Visible to all roles */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                background: '#ffffff',
                border: 'none',
                transition: 'all 0.3s ease',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 4 } }}>
                    <Box sx={{
                      p: { xs: 1.5, md: 2 },
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                      color: 'white',
                      mr: { xs: 1.5, md: 3 },
                      boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)'
                    }}>
                      <MoneyIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
                    </Box>
                    <Typography sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
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
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                      <Box sx={{ textAlign: 'center', p: { xs: 1.5, md: 2 }, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                        <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' }, fontWeight: 700, color: '#4caf50' }}>
                          ₹{stats.funds.total.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }} color="text.secondary">
                          Total Funds
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                      <Box sx={{ textAlign: 'center', p: { xs: 1.5, md: 2 }, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                        <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' }, fontWeight: 700, color: '#2196f3' }}>
                          ₹{stats.funds.published.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }} color="text.secondary">
                          Published
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                      <Box sx={{ textAlign: 'center', p: { xs: 1.5, md: 2 }, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                        <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' }, fontWeight: 700, color: '#ff9800' }}>
                          ₹{stats.funds.draft.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }} color="text.secondary">
                          Draft
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                      <Box sx={{ textAlign: 'center', p: { xs: 1.5, md: 2 }, bgcolor: 'rgba(156, 39, 176, 0.1)', borderRadius: 2 }}>
                        <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' }, fontWeight: 700, color: '#9c27b0' }}>
                          ₹{stats.funds.pastPublished.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }} color="text.secondary">
                          Past Published
                        </Typography>
                </Box>
                    </Grid>
                  </Grid>
              </CardContent>
            </Card>
          </Grid>
      </Grid>

      </Box>
    </Box>
  );
};

export default Dashboard;
