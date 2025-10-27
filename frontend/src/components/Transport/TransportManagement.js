import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsBus as BusIcon,
  Person as PersonIcon,
  SupervisorAccount as ConductorIcon
} from '@mui/icons-material';
import axios from 'axios';

const TransportManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Bus Management State
  const [buses, setBuses] = useState([]);
  const [busOpen, setBusOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [busFormData, setBusFormData] = useState({
    title: '',
    rcNo: '',
    rcDate: '',
    expiryDate: '',
    pucNo: '',
    insuranceNo: '',
    model: '',
    makeYear: '',
    make: '',
    type: 'bus',
    noOfSittings: ''
  });

  // Driver Management State
  const [drivers, setDrivers] = useState([]);
  const [driverOpen, setDriverOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverFormData, setDriverFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    drivingLicenseNo: '',
    aadharNo: ''
  });

  // Conductor Management State (using same as driver for now)
  const [conductors, setConductors] = useState([]);
  const [conductorOpen, setConductorOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState(null);
  const [conductorFormData, setConductorFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    employeeId: '',
    aadharNo: ''
  });

  const tabs = [
    { label: 'BUS MANAGEMENT', icon: <BusIcon />, value: 0 },
    { label: 'DRIVER MANAGEMENT', icon: <PersonIcon />, value: 1 },
    { label: 'CONDUCTOR MANAGEMENT', icon: <ConductorIcon />, value: 2 }
  ];

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
    fetchConductors();
  }, []);

  // Bus Management Functions
  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/buses');
      setBuses(response.data.data.items);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setSnackbar({ open: true, message: 'Error fetching buses', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBusSubmit = async () => {
    try {
      if (editingBus) {
        await axios.put(`/api/buses/${editingBus.id}`, busFormData);
        setSnackbar({ open: true, message: 'Bus updated successfully!', severity: 'success' });
      } else {
        await axios.post('/api/buses', busFormData);
        setSnackbar({ open: true, message: 'Bus created successfully!', severity: 'success' });
      }
      setBusOpen(false);
      setEditingBus(null);
      setBusFormData({
        title: '',
        rcNo: '',
        rcDate: '',
        expiryDate: '',
        pucNo: '',
        insuranceNo: '',
        model: '',
        makeYear: '',
        make: '',
        type: 'bus',
        noOfSittings: ''
      });
      fetchBuses();
    } catch (error) {
      console.error('Error saving bus:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving bus', severity: 'error' });
    }
  };

  const handleBusEdit = (bus) => {
    setEditingBus(bus);
    setBusFormData({
      title: bus.title || '',
      rcNo: bus.rcNo || '',
      rcDate: bus.rcDate || '',
      expiryDate: bus.expiryDate || '',
      pucNo: bus.pucNo || '',
      insuranceNo: bus.insuranceNo || '',
      model: bus.model || '',
      makeYear: bus.makeYear || '',
      make: bus.make || '',
      type: bus.type || 'bus',
      noOfSittings: bus.noOfSittings || ''
    });
    setBusOpen(true);
  };

  const handleBusDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await axios.delete(`/api/buses/${id}`);
        setSnackbar({ open: true, message: 'Bus deleted successfully!', severity: 'success' });
        fetchBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
        setSnackbar({ open: true, message: 'Error deleting bus', severity: 'error' });
      }
    }
  };

  // Driver Management Functions
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/drivers');
      setDrivers(response.data.data.items);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setSnackbar({ open: true, message: 'Error fetching drivers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSubmit = async () => {
    try {
      if (editingDriver) {
        await axios.put(`/api/drivers/${editingDriver.id}`, driverFormData);
        setSnackbar({ open: true, message: 'Driver updated successfully!', severity: 'success' });
      } else {
        await axios.post('/api/drivers', driverFormData);
        setSnackbar({ open: true, message: 'Driver created successfully!', severity: 'success' });
      }
      setDriverOpen(false);
      setEditingDriver(null);
      setDriverFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        drivingLicenseNo: '',
        aadharNo: ''
      });
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving driver', severity: 'error' });
    }
  };

  const handleDriverEdit = (driver) => {
    setEditingDriver(driver);
    setDriverFormData({
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      phoneNumber: driver.phoneNumber || '',
      drivingLicenseNo: driver.drivingLicenseNo || '',
      aadharNo: driver.aadharNo || ''
    });
    setDriverOpen(true);
  };

  const handleDriverDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await axios.delete(`/api/drivers/${id}`);
        setSnackbar({ open: true, message: 'Driver deleted successfully!', severity: 'success' });
        fetchDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
        setSnackbar({ open: true, message: 'Error deleting driver', severity: 'error' });
      }
    }
  };

  // Conductor Management Functions (using same API as drivers for now)
  const fetchConductors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/drivers'); // Using same API for now
      setConductors(response.data.data.items);
    } catch (error) {
      console.error('Error fetching conductors:', error);
      setSnackbar({ open: true, message: 'Error fetching conductors', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConductorSubmit = async () => {
    try {
      if (editingConductor) {
        await axios.put(`/api/drivers/${editingConductor.id}`, conductorFormData);
        setSnackbar({ open: true, message: 'Conductor updated successfully!', severity: 'success' });
      } else {
        await axios.post('/api/drivers', conductorFormData);
        setSnackbar({ open: true, message: 'Conductor created successfully!', severity: 'success' });
      }
      setConductorOpen(false);
      setEditingConductor(null);
      setConductorFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        employeeId: '',
        aadharNo: ''
      });
      fetchConductors();
    } catch (error) {
      console.error('Error saving conductor:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving conductor', severity: 'error' });
    }
  };

  const handleConductorEdit = (conductor) => {
    setEditingConductor(conductor);
    setConductorFormData({
      firstName: conductor.firstName || '',
      lastName: conductor.lastName || '',
      phoneNumber: conductor.phoneNumber || '',
      employeeId: conductor.employeeId || '',
      aadharNo: conductor.aadharNo || ''
    });
    setConductorOpen(true);
  };

  const handleConductorDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this conductor?')) {
      try {
        await axios.delete(`/api/drivers/${id}`);
        setSnackbar({ open: true, message: 'Conductor deleted successfully!', severity: 'success' });
        fetchConductors();
      } catch (error) {
        console.error('Error deleting conductor:', error);
        setSnackbar({ open: true, message: 'Error deleting conductor', severity: 'error' });
      }
    }
  };

  const renderBusManagement = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Bus Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setBusOpen(true)}
        >
          ADD BUS
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>RC No</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Seats</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buses.map((bus) => (
              <TableRow key={bus.id}>
                <TableCell>{bus.title}</TableCell>
                <TableCell>{bus.rcNo}</TableCell>
                <TableCell>{bus.model}</TableCell>
                <TableCell>
                  <Chip label={bus.type} size="small" />
                </TableCell>
                <TableCell>{bus.noOfSittings}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleBusEdit(bus)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleBusDelete(bus.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderDriverManagement = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Driver Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDriverOpen(true)}
        >
          ADD DRIVER
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>License No</TableCell>
              <TableCell>Aadhar No</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>{driver.firstName} {driver.lastName}</TableCell>
                <TableCell>{driver.phoneNumber}</TableCell>
                <TableCell>{driver.drivingLicenseNo}</TableCell>
                <TableCell>{driver.aadharNo}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDriverEdit(driver)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDriverDelete(driver.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderConductorManagement = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Conductor Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setConductorOpen(true)}
        >
          ADD CONDUCTOR
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Aadhar No</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conductors.map((conductor) => (
              <TableRow key={conductor.id}>
                <TableCell>{conductor.firstName} {conductor.lastName}</TableCell>
                <TableCell>{conductor.phoneNumber}</TableCell>
                <TableCell>{conductor.employeeId || conductor.drivingLicenseNo}</TableCell>
                <TableCell>{conductor.aadharNo}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleConductorEdit(conductor)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleConductorDelete(conductor.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderBusDialog = () => (
    <Dialog open={busOpen} onClose={() => setBusOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Title"
            value={busFormData.title}
            onChange={(e) => setBusFormData({ ...busFormData, title: e.target.value })}
            fullWidth
          />
          <TextField
            label="RC Number"
            value={busFormData.rcNo}
            onChange={(e) => setBusFormData({ ...busFormData, rcNo: e.target.value })}
            fullWidth
          />
          <TextField
            label="RC Date"
            type="date"
            value={busFormData.rcDate}
            onChange={(e) => setBusFormData({ ...busFormData, rcDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Expiry Date"
            type="date"
            value={busFormData.expiryDate}
            onChange={(e) => setBusFormData({ ...busFormData, expiryDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="PUC Number"
            value={busFormData.pucNo}
            onChange={(e) => setBusFormData({ ...busFormData, pucNo: e.target.value })}
            fullWidth
          />
          <TextField
            label="Insurance Number"
            value={busFormData.insuranceNo}
            onChange={(e) => setBusFormData({ ...busFormData, insuranceNo: e.target.value })}
            fullWidth
          />
          <TextField
            label="Model"
            value={busFormData.model}
            onChange={(e) => setBusFormData({ ...busFormData, model: e.target.value })}
            fullWidth
          />
          <TextField
            label="Make Year"
            type="number"
            value={busFormData.makeYear}
            onChange={(e) => setBusFormData({ ...busFormData, makeYear: e.target.value })}
            fullWidth
          />
          <TextField
            label="Make"
            value={busFormData.make}
            onChange={(e) => setBusFormData({ ...busFormData, make: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={busFormData.type}
              onChange={(e) => setBusFormData({ ...busFormData, type: e.target.value })}
              label="Type"
            >
              <MenuItem value="bus">Bus</MenuItem>
              <MenuItem value="traveller">Traveller</MenuItem>
              <MenuItem value="car">Car</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Number of Seats"
            type="number"
            value={busFormData.noOfSittings}
            onChange={(e) => setBusFormData({ ...busFormData, noOfSittings: e.target.value })}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setBusOpen(false)}>Cancel</Button>
        <Button onClick={handleBusSubmit} variant="contained">
          {editingBus ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDriverDialog = () => (
    <Dialog open={driverOpen} onClose={() => setDriverOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="First Name"
            value={driverFormData.firstName}
            onChange={(e) => setDriverFormData({ ...driverFormData, firstName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Last Name"
            value={driverFormData.lastName}
            onChange={(e) => setDriverFormData({ ...driverFormData, lastName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Phone Number"
            value={driverFormData.phoneNumber}
            onChange={(e) => setDriverFormData({ ...driverFormData, phoneNumber: e.target.value })}
            fullWidth
          />
          <TextField
            label="Driving License Number"
            value={driverFormData.drivingLicenseNo}
            onChange={(e) => setDriverFormData({ ...driverFormData, drivingLicenseNo: e.target.value })}
            fullWidth
          />
          <TextField
            label="Aadhar Number"
            value={driverFormData.aadharNo}
            onChange={(e) => setDriverFormData({ ...driverFormData, aadharNo: e.target.value })}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDriverOpen(false)}>Cancel</Button>
        <Button onClick={handleDriverSubmit} variant="contained">
          {editingDriver ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderConductorDialog = () => (
    <Dialog open={conductorOpen} onClose={() => setConductorOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>{editingConductor ? 'Edit Conductor' : 'Add New Conductor'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="First Name"
            value={conductorFormData.firstName}
            onChange={(e) => setConductorFormData({ ...conductorFormData, firstName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Last Name"
            value={conductorFormData.lastName}
            onChange={(e) => setConductorFormData({ ...conductorFormData, lastName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Phone Number"
            value={conductorFormData.phoneNumber}
            onChange={(e) => setConductorFormData({ ...conductorFormData, phoneNumber: e.target.value })}
            fullWidth
          />
          <TextField
            label="Employee ID"
            value={conductorFormData.employeeId}
            onChange={(e) => setConductorFormData({ ...conductorFormData, employeeId: e.target.value })}
            fullWidth
          />
          <TextField
            label="Aadhar Number"
            value={conductorFormData.aadharNo}
            onChange={(e) => setConductorFormData({ ...conductorFormData, aadharNo: e.target.value })}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConductorOpen(false)}>Cancel</Button>
        <Button onClick={handleConductorSubmit} variant="contained">
          {editingConductor ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography 
        component="h1" 
        gutterBottom
        sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' } }}
      >
        Transport Management
      </Typography>
      <Typography 
        color="text.secondary" 
        sx={{ 
          fontSize: { xs: '0.875rem', sm: '1rem' },
          mb: { xs: 2, md: 4 }
        }}
      >
        Manage buses, drivers, and conductors
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            mb: { xs: 2, md: 3 }
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ 
                textTransform: 'none', 
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                minHeight: { xs: 48, md: 56 },
                px: { xs: 1, md: 2 }
              }}
            />
          ))}
        </Tabs>

        {activeTab === 0 && renderBusManagement()}
        {activeTab === 1 && renderDriverManagement()}
        {activeTab === 2 && renderConductorManagement()}
      </Paper>

      {renderBusDialog()}
      {renderDriverDialog()}
      {renderConductorDialog()}

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
  );
};

export default TransportManagement;
