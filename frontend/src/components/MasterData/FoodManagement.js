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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
          start_time: scheduleForm.startTime,
          end_time: scheduleForm.endTime
        });
      } else {
        await axios.post('/api/food-schedules', {
          title: scheduleForm.title,
          start_time: scheduleForm.startTime,
          end_time: scheduleForm.endTime
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Food Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Manage food schedules, categories, and items
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Food Schedules" icon={<ScheduleIcon />} />
            <Tab label="Food Categories" icon={<CategoryIcon />} />
            <Tab label="Food Items" icon={<FoodIcon />} />
          </Tabs>
        </Box>

        {/* Food Schedules Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Food Schedules</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleScheduleOpen()}
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
                    <TableCell>{schedule.start_time}</TableCell>
                    <TableCell>{schedule.end_time}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleScheduleOpen(schedule)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error">
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
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Food Categories</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleCategoryOpen()}
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
                      <IconButton color="error">
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
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Food Items</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleFoodItemOpen()}
            >
              Add Food Item
            </Button>
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
                {foodItems.map((item) => (
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
                      <IconButton color="error">
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
                <TextField
                  name="startTime"
                  label="Start Time"
                  type="time"
                  fullWidth
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="endTime"
                  label="End Time"
                  type="time"
                  fullWidth
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
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
      <Dialog open={categoryOpen} onClose={handleCategoryClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Food Category' : 'Add Food Category'}
        </DialogTitle>
        <form onSubmit={handleCategorySubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  name="title"
                  label="Title"
                  fullWidth
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm({...categoryForm, title: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCategoryClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
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
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={foodItemForm.description}
                  onChange={(e) => setFoodItemForm({...foodItemForm, description: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={foodItemForm.categoryId}
                    onChange={(e) => setFoodItemForm({...foodItemForm, categoryId: e.target.value})}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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
  );
};

export default FoodManagement;
