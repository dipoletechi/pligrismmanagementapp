import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Button, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Snackbar, Alert, Grid, Chip, TableContainer, Card, CardContent
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Support as SupportIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../Layout/MainLayout';

const priorities = ['low', 'medium', 'high'];
const statuses = ['open', 'in_progress', 'resolved', 'closed'];

export default function SupportTickets() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchItems = async () => {
    const res = await axios.get('/api/support-tickets');
    setItems(res.data.data.items);
  };

  useEffect(() => { fetchItems(); }, []);

  const openDialog = (row) => {
    if (row) {
      setEditing(row);
      setForm({ subject: row.subject, description: row.description || '', priority: row.priority });
    } else {
      setEditing(null);
      setForm({ subject: '', description: '', priority: 'medium' });
    }
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (editing) {
      await axios.put(`/api/support-tickets/${editing.id}`, form);
    } else {
      await axios.post('/api/support-tickets', form);
    }
    setSnack({ open: true, message: 'Saved', severity: 'success' });
    setOpen(false);
    await fetchItems();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete ticket?')) return;
    await axios.delete(`/api/support-tickets/${id}`);
    setSnack({ open: true, message: 'Deleted', severity: 'success' });
    await fetchItems();
  };

  const PriorityChip = ({ value }) => (
    <Chip 
      label={value.charAt(0).toUpperCase() + value.slice(1)} 
      size="small"
      sx={{
        fontWeight: 600,
        backgroundColor: value === 'high' ? '#ffebee' : value === 'medium' ? '#fff3e0' : '#e8f5e9',
        color: value === 'high' ? '#d32f2f' : value === 'medium' ? '#f57c00' : '#388e3c',
        border: `1px solid ${value === 'high' ? '#ef5350' : value === 'medium' ? '#ff9800' : '#66bb6a'}`
      }}
    />
  );

  const StatusChip = ({ value }) => (
    <Chip 
      label={value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1)} 
      size="small"
      sx={{
        fontWeight: 600,
        backgroundColor: value === 'open' ? '#e3f2fd' : value === 'in_progress' ? '#fff3e0' : value === 'resolved' ? '#e8f5e9' : '#f5f5f5',
        color: value === 'open' ? '#1976d2' : value === 'in_progress' ? '#f57c00' : value === 'resolved' ? '#388e3c' : '#757575',
        border: `1px solid ${value === 'open' ? '#42a5f5' : value === 'in_progress' ? '#ff9800' : value === 'resolved' ? '#66bb6a' : '#bdbdbd'}`
      }}
    />
  );

  return (
    <MainLayout>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <SupportIcon sx={{ fontSize: 48, color: '#1976d2' }} />
                  Support Tickets
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Manage and track support requests
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<AddIcon />} 
                onClick={() => openDialog()}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                New Ticket
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <Paper 
            elevation={3}
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1976d2' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Subject</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Priority</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Assigned To</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Created</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row, index) => (
                    <TableRow 
                      key={row.id} 
                      hover
                      sx={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                          transition: 'background-color 0.3s ease'
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{row.subject}</TableCell>
                      <TableCell><PriorityChip value={row.priority} /></TableCell>
                      <TableCell><StatusChip value={row.status} /></TableCell>
                      <TableCell>{row.assigned_to || '-'}</TableCell>
                      <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => openDialog(row)}
                          sx={{
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#e3f2fd'
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        {(user?.role === 'superadmin' || user?.role === 'admin') && (
                          <IconButton 
                            size="small" 
                            onClick={() => remove(row.id)} 
                            sx={{
                              color: '#d32f2f',
                              '&:hover': {
                                backgroundColor: '#ffebee'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No support tickets found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>

        <Dialog 
          open={open} 
          onClose={() => setOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              width: '600px'
            }
          }}
        >
          <DialogTitle 
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.5rem',
              py: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SupportIcon sx={{ fontSize: 32 }} />
              {editing ? 'Edit Ticket' : 'New Ticket'}
            </Box>
            <IconButton 
              onClick={() => setOpen(false)}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <form onSubmit={save}>
            <DialogContent sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
              {/* First Row: Subject and Priority */}
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField 
                    label="Subject" 
                    name="subject" 
                    value={form.subject} 
                    onChange={(e) => setForm({ ...form, subject: e.target.value })} 
                    fullWidth 
                    required
                    variant="outlined"
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: 1,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField 
                    select 
                    label="Priority" 
                    value={form.priority} 
                    onChange={(e) => setForm({ ...form, priority: e.target.value })} 
                    fullWidth
                    variant="outlined"
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: 1,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  >
                    {priorities.map(p => (
                      <MenuItem key={p} value={p}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: p === 'high' ? '#d32f2f' : p === 'medium' ? '#ff9800' : '#4caf50' 
                            }} 
                          />
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
              
              {/* Second Row: Description */}
              <Box sx={{ mb: 3 }}>
                <TextField 
                  label="Description" 
                  name="description" 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  fullWidth 
                  multiline 
                  rows={4}
                  variant="outlined"
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                        borderWidth: '2px'
                      }
                    }
                  }}
                />
              </Box>
              
              {/* Admin Fields */}
              <Grid container spacing={3}>
                
                {/* Third Row: Admin Fields */}
                {/* Third Row: Status and Assigned To (Admin Only) */}
                {editing && (user?.role === 'superadmin' || user?.role === 'admin') && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        select 
                        label="Status" 
                        value={form.status || editing.status} 
                        onChange={(e) => setForm({ ...form, status: e.target.value })} 
                        fullWidth
                        variant="outlined"
                        sx={{
                          backgroundColor: 'white',
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#1976d2',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                              borderWidth: '2px'
                            }
                          }
                        }}
                      >
                        {statuses.map(s => (
                          <MenuItem key={s} value={s}>
                            {s.replace('_',' ').charAt(0).toUpperCase() + s.replace('_',' ').slice(1)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Assigned To (User ID)" 
                        value={form.assigned_to || editing.assigned_to || ''} 
                        onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} 
                        fullWidth
                        variant="outlined"
                        sx={{
                          backgroundColor: 'white',
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#1976d2',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                              borderWidth: '2px'
                            }
                          }
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
              <Button 
                onClick={() => setOpen(false)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#666',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                CANCEL
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                SAVE
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Snackbar 
          open={snack.open} 
          autoHideDuration={4000} 
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            severity={snack.severity} 
            onClose={() => setSnack({ ...snack, open: false })}
            sx={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              borderRadius: 2
            }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </MainLayout>
  );
}


