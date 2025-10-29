import React, { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Fastfood as FoodIcon
} from '@mui/icons-material';
import axios from 'axios';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

// Utility functions for time conversion
const formatTimeForDisplay = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatTimeForInput = (time12) => {
  if (!time12) return '';
  const [time, ampm] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours, 10);
  
  if (ampm === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (ampm === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

const FoodManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Food Schedules
  const [schedules, setSchedules] = useState([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    startTime: '',
    endTime: ''
  });

  // Food Categories
  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    description: ''
  });

  // Food Items
  const [foodItems, setFoodItems] = useState([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [foodItemOpen, setFoodItemOpen] = useState(false);
  const [editingFoodItem, setEditingFoodItem] = useState(null);
  const [foodItemForm, setFoodItemForm] = useState({
    title: '',
    description: '',
    categoryId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch from actual APIs
      const [schedulesRes, categoriesRes, foodItemsRes] = await Promise.all([
        axios.get('/api/food-schedules'),
        axios.get('/api/food-categories'),
        axios.get('/api/food-items')
      ]);

      const schedules = schedulesRes.data.data.items;
      const categories = categoriesRes.data.data.items;
      const foodItems = foodItemsRes.data.data.items;

      // Map food items with category titles
      const foodItemsWithCategory = foodItems.map(item => {
        const category = categories.find(cat => cat.id === item.food_category_id);
        return {
          ...item,
          categoryId: item.food_category_id,
          categoryTitle: category ? category.title : 'Unknown'
        };
      });

      setSchedules(schedules);
      setCategories(categories);
      setFoodItems(foodItemsWithCategory);
      setFilteredFoodItems(foodItemsWithCategory);
      
      // Debug: Log categories
      console.log('Categories loaded:', categories);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset filter when food items change
  useEffect(() => {
    if (selectedCategory === '') {
      setFilteredFoodItems(foodItems);
    } else {
      const filtered = foodItems.filter(item => item.food_category_id === parseInt(selectedCategory));
      setFilteredFoodItems(filtered);
    }
  }, [foodItems, selectedCategory]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Category filter handler
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === '') {
      setFilteredFoodItems(foodItems);
    } else {
      const filtered = foodItems.filter(item => item.food_category_id === parseInt(categoryId));
      setFilteredFoodItems(filtered);
    }
  };

  // Food Schedule handlers
  const handleScheduleOpen = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setScheduleForm({
        title: schedule.title,
        startTime: schedule.start_time,
        endTime: schedule.end_time
      });
    } else {
      setEditingSchedule(null);
      setScheduleForm({ title: '', startTime: '', endTime: '' });
    }
    setScheduleOpen(true);
  };

  const handleScheduleClose = () => {
    setScheduleOpen(false);
    setEditingSchedule(null);
    setScheduleForm({ title: '', startTime: '', endTime: '' });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await axios.put(`/api/food-schedules/${editingSchedule.id}`, {
          title: scheduleForm.title,
          start_time: formatTimeForInput(scheduleForm.startTime),
          end_time: formatTimeForInput(scheduleForm.endTime)
        });
      } else {
        await axios.post('/api/food-schedules', {
          title: scheduleForm.title,
          start_time: formatTimeForInput(scheduleForm.startTime),
          end_time: formatTimeForInput(scheduleForm.endTime)
        });
      }
      setSnackbar({ open: true, message: 'Schedule saved successfully', severity: 'success' });
      handleScheduleClose();
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      setSnackbar({ open: true, message: 'Error saving schedule', severity: 'error' });
    }
  };

  const handleScheduleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`/api/food-schedules/${id}`);
        await fetchData();
        setSnackbar({ open: true, message: 'Schedule deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting schedule:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting schedule', severity: 'error' });
      }
    }
  };

  // Food Category handlers
  const handleCategoryOpen = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ title: category.title, description: category.description });
    } else {
      setEditingCategory(null);
      setCategoryForm({ title: '', description: '' });
    }
    setCategoryOpen(true);
  };

  const handleCategoryClose = () => {
    setCategoryOpen(false);
    setEditingCategory(null);
    setCategoryForm({ title: '', description: '' });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/api/food-categories/${editingCategory.id}`, categoryForm);
      } else {
        await axios.post('/api/food-categories', categoryForm);
      }
      setSnackbar({ open: true, message: 'Category saved successfully', severity: 'success' });
      handleCategoryClose();
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({ open: true, message: 'Error saving category', severity: 'error' });
    }
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/food-categories/${id}`);
        await fetchData();
        setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting category:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting category', severity: 'error' });
      }
    }
  };

  // Food Item handlers
  const handleFoodItemOpen = (foodItem = null) => {
    if (foodItem) {
      setEditingFoodItem(foodItem);
      setFoodItemForm({
        title: foodItem.title,
        description: foodItem.description,
        categoryId: foodItem.categoryId
      });
    } else {
      setEditingFoodItem(null);
      setFoodItemForm({ title: '', description: '', categoryId: '' });
    }
    setFoodItemOpen(true);
  };

  const handleFoodItemClose = () => {
    setFoodItemOpen(false);
    setEditingFoodItem(null);
    setFoodItemForm({ title: '', description: '', categoryId: '' });
  };

  const handleFoodItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFoodItem) {
        await axios.put(`/api/food-items/${editingFoodItem.id}`, {
          title: foodItemForm.title,
          description: foodItemForm.description,
          food_category_id: foodItemForm.categoryId
        });
      } else {
        await axios.post('/api/food-items', {
          title: foodItemForm.title,
          description: foodItemForm.description,
          food_category_id: foodItemForm.categoryId
        });
      }
      setSnackbar({ open: true, message: 'Food item saved successfully', severity: 'success' });
      handleFoodItemClose();
      fetchData();
    } catch (error) {
      console.error('Error saving food item:', error);
      setSnackbar({ open: true, message: 'Error saving food item', severity: 'error' });
    }
  };

  const handleFoodItemDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        await axios.delete(`/api/food-items/${id}`);
        await fetchData();
        setSnackbar({ open: true, message: 'Food item deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting food item:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting food item', severity: 'error' });
      }
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

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
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
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
              Food Management
            </Typography>
            <Typography 
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                fontWeight: 400 
              }} 
              color="text.secondary"
            >
              Manage food schedules, categories, and items
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ 
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
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
                  fontSize: { xs: '0.875rem', md: '1.1rem' },
                  py: { xs: 1.5, md: 2 },
                  px: { xs: 2, md: 3 },
                  minHeight: { xs: 48, md: 60 },
                  '&.Mui-selected': {
                    color: '#1976d2',
                    background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.1) 30%, rgba(66, 165, 245, 0.1) 90%)'
                  }
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab 
                label="Food Schedules" 
                icon={<ScheduleIcon sx={{ fontSize: { xs: 20, md: 24 } }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Food Categories" 
                icon={<CategoryIcon sx={{ fontSize: { xs: 20, md: 24 } }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Food Items" 
                icon={<FoodIcon sx={{ fontSize: { xs: 20, md: 24 } }} />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>

        {/* Food Schedules Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Food Schedules</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleScheduleOpen()}
              fullWidth={{ xs: true, sm: false }}
              sx={{
                fontSize: { xs: '0.875rem', md: '1rem' },
                py: { xs: 1, md: 1.5 }
              }}
            >
              Add Schedule
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.title}</TableCell>
                    <TableCell>{formatTimeForDisplay(schedule.start_time)}</TableCell>
                    <TableCell>{formatTimeForDisplay(schedule.end_time)}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleScheduleOpen(schedule)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleScheduleDelete(schedule.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Food Categories Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Food Categories</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleCategoryOpen()}
              fullWidth={{ xs: true, sm: false }}
              sx={{
                fontSize: { xs: '0.875rem', md: '1rem' },
                py: { xs: 1, md: 1.5 }
              }}
            >
              Add Category
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.title}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleCategoryOpen(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleCategoryDelete(category.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Food Items Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            flexWrap: 'wrap', 
            gap: 2 
          }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Food Items</Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2, 
              alignItems: { xs: 'stretch', sm: 'center' }, 
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' }
            }}>
              <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  label="Filter by Category"
                  displayEmpty
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleFoodItemOpen()}
                fullWidth={{ xs: true, sm: false }}
                sx={{
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  py: { xs: 1, md: 1.5 }
                }}
              >
                Add Food Item
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFoodItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <Chip label={item.categoryTitle} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleFoodItemOpen(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleFoodItemDelete(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Food Schedule Dialog */}
      <Dialog open={scheduleOpen} onClose={handleScheduleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSchedule ? 'Edit Food Schedule' : 'Add Food Schedule'}
        </DialogTitle>
        <form onSubmit={handleScheduleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  name="title"
                  label="Title"
                  fullWidth
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <TimePicker
                    label="Start Time"
                    value={scheduleForm.startTime ? moment(scheduleForm.startTime, 'HH:mm') : null}
                    onChange={(newValue) => {
                      const timeString = newValue ? newValue.format('HH:mm') : '';
                      setScheduleForm({...scheduleForm, startTime: timeString});
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        variant="outlined"
                        required
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <TimePicker
                    label="End Time"
                    value={scheduleForm.endTime ? moment(scheduleForm.endTime, 'HH:mm') : null}
                    onChange={(newValue) => {
                      const timeString = newValue ? newValue.format('HH:mm') : '';
                      setScheduleForm({...scheduleForm, endTime: timeString});
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        variant="outlined"
                        required
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleScheduleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Food Category Dialog */}
      <Dialog
        open={categoryOpen}
        onClose={handleCategoryClose}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.5rem',
            textAlign: 'center',
            py: 3
          }}
        >
          {editingCategory ? 'Edit Food Category' : 'Add New Food Category'}
        </DialogTitle>
        <form onSubmit={handleCategorySubmit}>
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                autoFocus
                name="title"
                label="Title"
                fullWidth
                variant="outlined"
                value={categoryForm.title}
                onChange={(e) => setCategoryForm({...categoryForm, title: e.target.value})}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1976d2'
                  }
                }}
              />
              <TextField
                name="description"
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1976d2'
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCategoryClose}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #3d8bdb 90%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Food Item Dialog */}
      <Dialog open={foodItemOpen} onClose={handleFoodItemClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFoodItem ? 'Edit Food Item' : 'Add Food Item'}
        </DialogTitle>
        <form onSubmit={handleFoodItemSubmit}>
           <DialogContent>
             <Box sx={{ mt: 1 }}>
               {/* First Row: Title and Category */}
               <Grid container spacing={2} sx={{ mb: 2 }}>
                 <Grid item xs={6}>
                   <TextField
                     autoFocus
                     name="title"
                     label="Title"
                     fullWidth
                     value={foodItemForm.title}
                     onChange={(e) => setFoodItemForm({...foodItemForm, title: e.target.value})}
                     required
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <FormControl fullWidth required>
                     <InputLabel id="category-label">Category</InputLabel>
                     <Select
                       labelId="category-label"
                       value={foodItemForm.categoryId}
                       onChange={(e) => setFoodItemForm({...foodItemForm, categoryId: e.target.value})}
                       label="Category"
                       displayEmpty
                       sx={{
                         '& .MuiOutlinedInput-root': {
                           borderRadius: 2,
                           '&:hover .MuiOutlinedInput-notchedOutline': {
                             borderColor: '#1976d2',
                             borderWidth: 2
                           },
                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                             borderColor: '#1976d2',
                             borderWidth: 2
                           }
                         },
                         '& .MuiInputLabel-root.Mui-focused': {
                           color: '#1976d2'
                         }
                       }}
                     >
                       <MenuItem value="">
                         <em>Select Category</em>
                       </MenuItem>
                       {categories && categories.length > 0 ? (
                         categories.map((category) => (
                           <MenuItem key={category.id} value={category.id}>
                             {category.title}
                           </MenuItem>
                         ))
                       ) : (
                         <MenuItem disabled>
                           <em>No categories available</em>
                         </MenuItem>
                       )}
                     </Select>
                   </FormControl>
                 </Grid>
               </Grid>
               
               {/* Second Row: Description */}
               <Grid container spacing={2}>
                 <Grid item xs={12}>
                   <TextField
                     name="description"
                     label="Description"
                     fullWidth
                     multiline
                     rows={3}
                     value={foodItemForm.description}
                     onChange={(e) => setFoodItemForm({...foodItemForm, description: e.target.value})}
                   />
                 </Grid>
               </Grid>
             </Box>
           </DialogContent>
          <DialogActions>
            <Button onClick={handleFoodItemClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
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

export default FoodManagement;
