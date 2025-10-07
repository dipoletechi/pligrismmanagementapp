import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Button, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Snackbar, Alert, Grid, Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
    <Chip label={value} color={value === 'high' ? 'error' : value === 'medium' ? 'warning' : 'default'} size="small" />
  );

  const StatusChip = ({ value }) => (
    <Chip label={value.replace('_', ' ')} color={value === 'open' ? 'info' : value === 'in_progress' ? 'warning' : 'success'} size="small" />
  );

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">Support Tickets</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>New Ticket</Button>
        </Box>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell><PriorityChip value={row.priority} /></TableCell>
                  <TableCell><StatusChip value={row.status} /></TableCell>
                  <TableCell>{row.assigned_to || '-'}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openDialog(row)}><EditIcon /></IconButton>
                    {(user?.role === 'superadmin' || user?.role === 'admin') && (
                      <IconButton size="small" onClick={() => remove(row.id)} color="error"><DeleteIcon /></IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editing ? 'Edit Ticket' : 'New Ticket'}</DialogTitle>
          <form onSubmit={save}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Subject" name="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} fullWidth>
                    {priorities.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </TextField>
                </Grid>
                {editing && (user?.role === 'superadmin' || user?.role === 'admin') && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField select label="Status" value={form.status || editing.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
                        {statuses.map(s => <MenuItem key={s} value={s}>{s.replace('_',' ')}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Assigned To (user id)" value={form.assigned_to || editing.assigned_to || ''} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} fullWidth />
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">Save</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.message}</Alert>
        </Snackbar>
      </Container>
    </MainLayout>
  );
}


