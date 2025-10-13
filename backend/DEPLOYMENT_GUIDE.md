# Tirth Yatra Backend - Deployment Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MySQL** (v5.7 or higher)
3. **Git** (to clone the repository)

## Quick Setup Commands

### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd tirth-yatra-app/backend

# Install dependencies
npm install
```

### 2. Database Configuration
```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your database credentials
# Update DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT as needed
```

### 3. Run Complete Migration
```bash
# Run the complete database setup (creates all tables and default admin)
npm run setup:new
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_NAME=tirthyatra
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Default Admin Credentials

After running the migration, you can login with:

- **Email**: `superadmin@tirthyatra.com`
- **Password**: `SuperAdmin@2024!`

## API Endpoints

- **Health Check**: `GET /api/health`
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Trips**: `/api/trips/*`
- **Destinations**: `/api/destinations/*`
- **And many more...**

## Database Schema

The migration creates the following main tables:
- `users` - User management
- `trips` - Trip management with complex data fields
- `destinations` - Travel destinations
- `events` - Trip events
- `trip_status` - Trip status management
- `transport_vendors`, `buses`, `drivers`, `conductors` - Transport management
- `accommodation_vendors` - Accommodation management
- `food_vendors`, `food_categories`, `food_items`, `food_schedules` - Food management
- `amenities` - Amenities management
- `support_tickets` - Support system

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL is running
2. Check database credentials in `.env`
3. Verify database exists and user has proper permissions

### Migration Issues
1. Ensure database is empty or doesn't have conflicting tables
2. Check MySQL user has CREATE, DROP, and ALTER permissions
3. Run `npm run setup:new` for fresh installation

### Port Issues
1. Check if port 5000 is available
2. Change PORT in `.env` if needed
3. Ensure no other service is using the port

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong JWT_SECRET
3. Configure proper CORS origins
4. Use a process manager like PM2
5. Set up reverse proxy (nginx)
6. Configure SSL certificates
7. Set up database backups

## Support

For issues or questions, check the support tickets system in the application or contact the development team.
