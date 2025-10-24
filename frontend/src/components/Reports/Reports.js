import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Checkbox,
  ListItemText
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    trips: [],
    vendors: { accommodation: [], food: [], transport: [] },
    statuses: [],
    vendorTypes: []
  });

  // Filter states
  const [filters, setFilters] = useState({
    trip_ids: [], // Changed to array for multiple selection
    vendor_type: '',
    vendor_id: '',
    start_date: '',
    end_date: '',
    amount_min: '',
    amount_max: '',
    status: ''
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchReports();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/api/reports/filter-options');
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (key === 'trip_ids' && Array.isArray(filters[key]) && filters[key].length > 0) {
          // Send trip_ids as comma-separated string
          params[key] = filters[key].join(',');
        } else if (filters[key] && key !== 'trip_ids') {
          params[key] = filters[key];
        }
      });

      console.log('🔍 Filters applied:', filters);
      console.log('🔍 API params:', params);

      const response = await axios.get('/api/reports', { params });
      console.log('✅ Reports received:', response.data);
      
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchReports();
  };

  const handleResetFilters = async () => {
    // Clear filters in state
    setFilters({
      trip_ids: [], // Changed to empty array
      vendor_type: '',
      vendor_id: '',
      start_date: '',
      end_date: '',
      amount_min: '',
      amount_max: '',
      status: ''
    });
    
    // Immediately fetch reports with empty filters
    setLoading(true);
    try {
      const response = await axios.get('/api/reports');
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      const response = await axios.get('/api/reports/export/csv', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vendor_payments_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Vendor Payments Report', 14, 20);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Prepare table data
    const tableData = reports.map(report => [
      report.trip_title,
      `${new Date(report.trip_start_date).toLocaleDateString()} - ${new Date(report.trip_end_date).toLocaleDateString()}`,
      report.vendor_title,
      report.vendor_type,
      `Rs. ${parseFloat(report.amount).toFixed(2)}`,
      report.status
    ]);

    // Add table using autoTable as a function
    autoTable(doc, {
      head: [['Trip', 'Duration', 'Vendor', 'Type', 'Amount', 'Status']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] }
    });

    doc.save(`vendor_payments_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'info',
      processing: 'primary',
      completed: 'success'
    };
    return colors[status] || 'default';
  };

  const getVendorsByType = () => {
    if (!filters.vendor_type) return [];
    return filterOptions.vendors[filters.vendor_type] || [];
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
            Vendor Payments Reports
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Track and analyze vendor payments across trips
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          
          {/* First Row - 4 Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="medium">
                <InputLabel>Trips</InputLabel>
                <Select
                  multiple
                  value={filters.trip_ids}
                  label="Trips"
                  onChange={(e) => {
                    const value = e.target.value;
                    // Handle "All" selection
                    if (value.includes('all')) {
                      // If "All" is selected, toggle between all trips and none
                      if (filters.trip_ids.length === filterOptions.trips.length) {
                        handleFilterChange('trip_ids', []);
                      } else {
                        handleFilterChange('trip_ids', filterOptions.trips.map(t => t.id));
                      }
                    } else {
                      handleFilterChange('trip_ids', value);
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em>Select trips</em>;
                    }
                    if (selected.length === filterOptions.trips.length) {
                      return <Chip label="All Trips" size="small" sx={{ height: '24px' }} />;
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.slice(0, 2).map((value) => {
                          const trip = filterOptions.trips.find(t => t.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={trip?.title || value} 
                              size="small"
                              sx={{ height: '24px' }}
                            />
                          );
                        })}
                        {selected.length > 2 && (
                          <Chip 
                            label={`+${selected.length - 2} more`} 
                            size="small"
                            sx={{ height: '24px' }}
                          />
                        )}
                      </Box>
                    );
                  }}
                  sx={{ minHeight: '56px' }}
                >
                  {/* Select All Option */}
                  <MenuItem value="all">
                    <Checkbox 
                      checked={filters.trip_ids.length === filterOptions.trips.length && filterOptions.trips.length > 0}
                      indeterminate={filters.trip_ids.length > 0 && filters.trip_ids.length < filterOptions.trips.length}
                    />
                    <ListItemText primary="All Trips" />
                  </MenuItem>
                  
                  {/* Individual Trip Options */}
                  {filterOptions.trips.map(trip => (
                    <MenuItem key={trip.id} value={trip.id}>
                      <Checkbox checked={filters.trip_ids.indexOf(trip.id) > -1} />
                      <ListItemText primary={trip.title} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="medium">
                <InputLabel>Vendor Type</InputLabel>
                <Select
                  value={filters.vendor_type}
                  label="Vendor Type"
                  onChange={(e) => {
                    handleFilterChange('vendor_type', e.target.value);
                    handleFilterChange('vendor_id', ''); // Reset vendor selection
                  }}
                  sx={{ height: '56px' }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="accommodation">Accommodation</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="transport">Transport</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="medium">
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={filters.vendor_id}
                  label="Vendor"
                  onChange={(e) => handleFilterChange('vendor_id', e.target.value)}
                  disabled={!filters.vendor_type}
                  sx={{ height: '56px' }}
                >
                  <MenuItem value="">All Vendors</MenuItem>
                  {getVendorsByType().map(vendor => (
                    <MenuItem key={vendor.id} value={vendor.id}>{vendor.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="medium">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{ height: '56px' }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Second Row - 4 Filters */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="medium"
                label="Start Date"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { height: '56px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="medium"
                label="End Date"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { height: '56px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="medium"
                label="Min Amount (₹)"
                type="number"
                value={filters.amount_min}
                onChange={(e) => handleFilterChange('amount_min', e.target.value)}
                sx={{ '& .MuiInputBase-root': { height: '56px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="medium"
                label="Max Amount (₹)"
                type="number"
                value={filters.amount_max}
                onChange={(e) => handleFilterChange('amount_max', e.target.value)}
                sx={{ '& .MuiInputBase-root': { height: '56px' } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button 
              variant="contained" 
              startIcon={<FilterIcon />}
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </Box>
        </Paper>

        {/* Export Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCSV}
          >
            Download CSV
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<PdfIcon />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        </Box>

        {/* Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Trip Title</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Trip Duration</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vendor Title</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vendor Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No records found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>{report.trip_title}</TableCell>
                        <TableCell>
                          {report.trip_start_date && report.trip_end_date ? (
                            <>
                              {new Date(report.trip_start_date).toLocaleDateString()} - <br />
                              {new Date(report.trip_end_date).toLocaleDateString()}
                            </>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>{report.vendor_title}</TableCell>
                        <TableCell>
                          <Chip 
                            label={report.vendor_type} 
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                          ₹{report.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status} 
                            color={getStatusColor(report.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Reports;

