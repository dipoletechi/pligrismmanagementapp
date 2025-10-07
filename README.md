# Tirth Yatra - Pilgrimage Management App

A comprehensive pilgrimage management system built with Node.js, React, and MySQL.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- 5 user roles: Superadmin, Admin, Trip Manager, Financial Manager, User

### 📊 Admin Panel
- Modern Material-UI dashboard
- Responsive design for all devices
- Real-time notifications

### 🏛️ Master Data Management
- **Destinations**: Manage pilgrimage destinations with geo-location
- **Amenities**: Track available amenities
- **Food Management**: 
  - Food Schedules (Breakfast, Lunch, Dinner)
  - Food Categories (Veg, Jain, Non-Veg)
  - Food Items with category assignment

### 🚌 Transport Management
- **Bus Management**: Complete bus details with RC, PUC, Insurance
- **Driver Management**: Driver profiles with license and Aadhar details

### 🏢 Vendor Management
- **Accommodation Vendors**: Hotel and accommodation providers
- **Food Vendors**: Food service providers
- **Transport Vendors**: Transportation service providers

### 🎯 Trip Management
- **Create Trips**: Multi-step trip creation with all details
- **Trip Listing**: View and manage all trips
- **Trip Tracking**: Real-time trip monitoring and GPS tracking

### 🎫 Support Management
- **Support Tickets**: Customer support system
- Priority-based ticket management
- Assignment and status tracking

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database with Sequelize ORM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security
- **express-rate-limit** for rate limiting

### Frontend
- **React.js** with hooks
- **Material-UI** for components
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
DB_NAME=tirthyatra
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=3306
CORS_ORIGIN=http://localhost:3000
```

Start the backend server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm start
```

## Default Users

The system comes with pre-configured users:

| Email | Password | Role |
|-------|----------|------|
| superadmin@tirthyatra.com | password123 | Super Admin |
| admin@tirthyatra.com | admin123 | Admin |
| tripmanager@tirthyatra.com | trip123 | Trip Manager |
| finance@tirthyatra.com | fina123 | Financial Manager |
| user@tirthyatra.com | user123 | User |

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Master Data
- `GET/POST/PUT/DELETE /api/destinations` - Destinations CRUD
- `GET/POST/PUT/DELETE /api/amenities` - Amenities CRUD
- `GET/POST/PUT/DELETE /api/food-schedules` - Food Schedules CRUD
- `GET/POST/PUT/DELETE /api/food-categories` - Food Categories CRUD
- `GET/POST/PUT/DELETE /api/food-items` - Food Items CRUD

### Transport
- `GET/POST/PUT/DELETE /api/drivers` - Drivers CRUD
- `GET/POST/PUT/DELETE /api/buses` - Buses CRUD

### Vendors
- `GET/POST/PUT/DELETE /api/accommodation-vendors` - Accommodation Vendors CRUD
- `GET/POST/PUT/DELETE /api/food-vendors` - Food Vendors CRUD
- `GET/POST/PUT/DELETE /api/transport-vendors` - Transport Vendors CRUD

### Trips
- `GET/POST/PUT/DELETE /api/trips` - Trips CRUD

### Support
- `GET/POST/PUT/DELETE /api/support-tickets` - Support Tickets CRUD

## Database Schema

The application uses MySQL with the following main tables:
- `users` - User accounts and roles
- `destinations` - Pilgrimage destinations
- `amenities` - Available amenities
- `food_schedules` - Meal time schedules
- `food_categories` - Food categories (Veg, Jain, etc.)
- `food_items` - Individual food items
- `drivers` - Driver information
- `buses` - Bus details and documentation
- `accommodation_vendors` - Accommodation providers
- `food_vendors` - Food service providers
- `transport_vendors` - Transportation providers
- `trips` - Trip information and details
- `support_tickets` - Customer support tickets

## Role Permissions

### Super Admin
- Full access to all modules
- User management
- System configuration

### Admin
- All modules except user management
- Trip and vendor management
- Financial oversight

### Trip Manager
- Trip creation and management
- Driver and bus assignment
- Trip tracking

### Financial Manager
- Financial modules
- Budget management
- Vendor payments
- Read-only trip access

### User
- View trips
- Submit support tickets
- Basic profile management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@tirthyatra.com or create an issue in the repository.