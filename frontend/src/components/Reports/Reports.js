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
  ListItemText,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as ArrowDownIcon
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
      paid: 'success',      // Green
      pending: 'info',   // Orange/Yellow
      approved: 'warning'   // Yellow
    };
    return colors[status] || 'default';
  };

  const getVendorsByType = () => {
    if (!filters.vendor_type) return [];
    return filterOptions.vendors[filters.vendor_type] || [];
  };

  // Dropdown checklist component
  const DropdownChecklist = ({ 
    label, 
    options, 
    selectedValues, 
    onChange, 
    placeholder = "Select items..."
  }) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggle = (value) => {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter(item => item !== value)
        : [...selectedValues, value];
      onChange(newSelectedValues);
    };

    const handleSelectAll = () => {
      if ((selectedValues?.length || 0) === (filteredOptions?.length || 0)) {
        onChange([]);
      } else {
        onChange(filteredOptions.map(option => option.value));
      }
    };

    const selectedLabels = selectedValues.map(value => 
      options.find(option => option.value === value)?.label
    ).filter(Boolean);

    return (
      <FormControl fullWidth size="medium">
        <Select
          multiple























          
          value={selectedValues}
          onChange={() => {}}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          open={open}
          displayEmpty
          sx={{
            height: '56px',
            '& .MuiOutlinedInput-root': {
              height: '56px'
            },
            '& .MuiSelect-select': {
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              padding: '16.5px 40px 16.5px 14px',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
                width: 'auto',
                minWidth: '300px'
              }
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left'
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left'
            },
            autoFocus: false,
            disableAutoFocusItem: true
          }}
          IconComponent={ArrowDownIcon}
          renderValue={(selected) => {
            if (selectedLabels.length === 0) {
              return <Box sx={{ maxWidth: 'fit-content' }}><span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{label}</span></Box>;
            }
            if (selectedLabels.length === options.length) {
              return <Chip label="All Selected" size="small" sx={{ height: '24px' }} />;
            }
            return (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'nowrap', 
                gap: 0.5, 
                overflow: 'hidden', 
                alignItems: 'center',
                height: '24px'
              }}>
                <Chip 
                  label={`${selectedLabels.length} selected`}
                  size="small"
                  sx={{ height: '24px' }}
                />
              </Box>
            );
          }}
        >
          <Box 
            sx={{ p: 1 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              autoFocus={false}
            />
            <Box 
              sx={{ mt: 1, mb: 1 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Button
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectAll();
                }}
                fullWidth
                variant="outlined"
              >
                {(selectedValues?.length || 0) === (filteredOptions?.length || 0) ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            <Divider 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </Box>
          {filteredOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle(option.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
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
          
          {/* All 8 Filters in Single Row */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={1.3}>
              <DropdownChecklist
                label="Trips"
                options={filterOptions.trips.map(trip => ({ value: trip.id, label: trip.title }))}
                selectedValues={filters.trip_ids}
                onChange={(newValues) => handleFilterChange('trip_ids', newValues)}
                placeholder="Select trips..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1.3}>
              <FormControl fullWidth size="medium">
                <Select
                  value={filters.vendor_type}
                  onChange={(e) => {
                    handleFilterChange('vendor_type', e.target.value);
                    handleFilterChange('vendor_id', ''); // Reset vendor selection
                  }}
                  displayEmpty
                  sx={{ 
                    height: '56px',
                    '& .MuiSelect-select': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                  renderValue={(selected) => {
                    if (!selected) return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Type</span>;
                    return selected.charAt(0).toUpperCase() + selected.slice(1);
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="accommodation">Accommodation</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="transport">Transport</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth size="medium">
                <Select
                  value={filters.vendor_id}
                  onChange={(e) => handleFilterChange('vendor_id', e.target.value)}
                  disabled={!filters.vendor_type}
                  displayEmpty
                  sx={{ 
                    height: '56px',
                    '& .MuiSelect-select': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                  renderValue={(selected) => {
                    if (!selected) return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Vendor</span>;
                    const vendor = getVendorsByType().find(v => v.id === selected);
                    const title = vendor?.title || selected;
                    return title.length > 12 ? title.substring(0, 12) + '...' : title;
                  }}
                >
                  <MenuItem value="">All Vendors</MenuItem>
                  {getVendorsByType().map(vendor => (
                    <MenuItem key={vendor.id} value={vendor.id}>{vendor.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1.3}>
              <FormControl fullWidth size="medium">
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: '56px',
                    '& .MuiSelect-select': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                  renderValue={(selected) => {
                    if (!selected) return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Status</span>;
                    return selected.charAt(0).toUpperCase() + selected.slice(1);
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1.8}>
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
            <Grid item xs={12} sm={6} md={1.8}>
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
            <Grid item xs={12} sm={6} md={1.5}>
              <TextField
                fullWidth
                size="medium"
                label="Min (₹)"
                type="number"
                value={filters.amount_min}
                onChange={(e) => handleFilterChange('amount_min', e.target.value)}
                sx={{ '& .MuiInputBase-root': { height: '56px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <TextField
                fullWidth
                size="medium"
                label="Max (₹)"
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
                {reports.length > 0 && (
                  <TableBody>
                    <TableRow sx={{ backgroundColor: '#f5f5f5', borderTop: '2px solid #1976d2' }}>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        Total:
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1976d2' }}>
                        ₹{reports.reduce((sum, report) => sum + parseFloat(report.amount), 0).toLocaleString()}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Reports;

