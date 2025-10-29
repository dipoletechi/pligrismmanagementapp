const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
process.env.DB_NAME = process.env.DB_NAME || 'tirthyatra';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD;
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const { connectDB } = require('./config/database');
// Ensure models and associations are loaded before sync
require('./models');
const { ensureDefaultUsers } = require('./utils/seed');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const destinationRoutes = require('./routes/destinations');
const amenityRoutes = require('./routes/amenities');
const driverRoutes = require('./routes/drivers');
const conductorRoutes = require('./routes/conductors');
const busRoutes = require('./routes/buses');
const supportTicketRoutes = require('./routes/supportTickets');
const accommodationVendorRoutes = require('./routes/accommodationVendors');
const foodVendorRoutes = require('./routes/foodVendors');
const transportVendorRoutes = require('./routes/transportVendors');
const foodScheduleRoutes = require('./routes/foodSchedules');
const foodCategoryRoutes = require('./routes/foodCategories');
const foodItemRoutes = require('./routes/foodItems');
const tripRoutes = require('./routes/trips');
const eventRoutes = require('./routes/events');
const tripStatusRoutes = require('./routes/tripStatus');
const mobileRoutes = require('./routes/mobile');
const tripLogRoutes = require('./routes/tripLogs');
const tripPligrimRoutes = require('./routes/tripPligrim');
const mobileQRRoutes = require('./routes/mobileQR');
const feedbackRoutes = require('./routes/feedback');
const notificationRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');

const app = express();
app.set('trust proxy', 1);
// Connect to database
connectDB().then(async () => {
  try {
    await ensureDefaultUsers();
    console.log('Seed: ensured all default users exist');
  } catch (e) {
    console.error('Seed error:', e.message);
  }
});

// Security middleware
app.use(helmet());

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,

  // ✅ Custom IP extraction to strip the port
  keyGenerator: (req) => {
    const rawIp = req.ip || req.connection?.remoteAddress || '';
    // Remove ":<port>" if present
    return rawIp.replace(/:\d+$/, '');
  },
});
app.use(limiter);


// CORS - More permissive for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.1.3:5000', 'http://192.168.1.5:5000', 'https://tripmanager.dipoletechi.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/conductors', conductorRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/accommodation-vendors', accommodationVendorRoutes);
app.use('/api/food-vendors', foodVendorRoutes);
app.use('/api/transport-vendors', transportVendorRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/food-schedules', foodScheduleRoutes);
app.use('/api/food-categories', foodCategoryRoutes);
app.use('/api/food-items', foodItemRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/trip-status', tripStatusRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/trip-logs', tripLogRoutes);
app.use('/api/trip-pligrim', tripPligrimRoutes);
app.use('/api/mobile-qr', mobileQRRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tirth Yatra API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
