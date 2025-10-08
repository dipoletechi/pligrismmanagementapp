# Database Migration System

This document explains how to use the database migration system for the Tirth Yatra application.

## Overview

The migration system automatically:
- Creates the database if it doesn't exist
- Runs all SQL migrations in order
- Creates a default superadmin user
- Sets up all required tables and relationships

## Quick Start

### 1. Run Demo Database Migration

```bash
# Create demo database with all tables and default superadmin
npm run migrate:demo
```

### 2. Default Superadmin Credentials

After running the migration, you can login with:
- **Email:** `superadmin@tirthyatra.com`
- **Password:** `admin123`
- **Role:** `superadmin`

## Migration Commands

```bash
# Run migrations for default database
npm run migrate

# Run migrations for demo database
npm run migrate:demo

# Start the server
npm start
```

## Database Structure

The migration creates the following tables:
- `users` - User accounts and authentication
- `destinations` - Pilgrimage destinations
- `amenities` - Available amenities
- `transport_vendors` - Transportation service providers
- `buses` - Bus fleet management
- `drivers` - Driver information
- `conductors` - Conductor information
- `accommodation_vendors` - Accommodation providers
- `food_vendors` - Food service providers
- `food_schedules` - Meal timing schedules
- `food_categories` - Food categorization
- `food_items` - Individual food items
- `support_tickets` - Customer support system
- `trips` - Trip management

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_NAME=tirthyatra_demo
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Manual Database Setup

If you prefer to set up the database manually:

1. Create a MySQL database named `tirthyatra_demo`
2. Run the SQL file: `migrations/001_initial_schema.sql`
3. Create a superadmin user manually

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify MySQL port (default: 3306)

### Migration Errors
- Check MySQL user permissions
- Ensure database doesn't have conflicting data
- Review migration logs for specific errors

### Reset Database
```bash
# Reset and recreate database
npm run reset-db
```

## Security Notes

- Change default superadmin password in production
- Use strong JWT secrets
- Configure proper CORS origins
- Use environment variables for sensitive data

## Development vs Production

### Development
- Uses `tirthyatra_demo` database
- Default superadmin created automatically
- Debug logging enabled

### Production
- Use production database name
- Change default credentials
- Disable debug logging
- Use strong secrets and passwords
