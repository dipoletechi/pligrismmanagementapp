-- Complete Database Schema Migration for Tirth Yatra App
-- This migration creates the complete database structure in one go
-- Run this on a fresh system to set up the entire database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'tripmanager', 'finance', 'user') NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Amenities table
CREATE TABLE IF NOT EXISTS amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Transport Vendors table
CREATE TABLE IF NOT EXISTS transport_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    rc_no VARCHAR(20),
    capacity INT,
    model VARCHAR(50),
    bus_type VARCHAR(50),
    make_year INT,
    transport_vendor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id) ON DELETE CASCADE
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    driving_license_no VARCHAR(50),
    transport_vendor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id) ON DELETE CASCADE
);

-- Conductors table
CREATE TABLE IF NOT EXISTS conductors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    transport_vendor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id) ON DELETE CASCADE
);

-- Accommodation Vendors table
CREATE TABLE IF NOT EXISTS accommodation_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Food Vendors table
CREATE TABLE IF NOT EXISTS food_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Food Schedules table
CREATE TABLE IF NOT EXISTS food_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Food Categories table
CREATE TABLE IF NOT EXISTS food_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Food Items table
CREATE TABLE IF NOT EXISTS food_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    food_category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (food_category_id) REFERENCES food_categories(id) ON DELETE SET NULL
);

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Trip Status table
CREATE TABLE IF NOT EXISTS trip_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default trip status values
INSERT INTO trip_status (name, description) VALUES
('Draft', 'Trip is in draft state and not yet published'),
('Published', 'Trip is published and visible to users'),
('Cancelled', 'Trip has been cancelled'),
('Completed', 'Trip has been completed successfully');

-- Trips table with all complex fields
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    destination_id INT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2),
    description TEXT,
    boarding_details TEXT,
    checklist_items TEXT,
    bus_id INT,
    driver_id INT,
    transport_vendor_id INT,
    trip_status_id INT DEFAULT 1,
    -- Complex data fields
    selected_drivers TEXT,
    selected_conductors TEXT,
    selected_buses TEXT,
    drivers_by_day TEXT,
    conductors_by_day TEXT,
    buses_by_day TEXT,
    vendors_by_day TEXT,
    time_by_day TEXT,
    accommodations_by_day TEXT,
    selected_accommodation_vendor VARCHAR(255),
    selected_accommodation_start_time VARCHAR(50),
    selected_accommodation_end_time VARCHAR(50),
    selected_food_vendors TEXT,
    food_vendors_by_day TEXT,
    selected_food_schedules TEXT,
    selected_food_categories TEXT,
    selected_food_items TEXT,
    food_schedules_by_day TEXT,
    food_categories_by_day TEXT,
    food_items_by_day TEXT,
    all_days_food_entries TEXT,
    events_by_day TEXT,
    all_days_events TEXT,
    selected_event_title VARCHAR(255),
    selected_event_description TEXT,
    selected_event_start_time VARCHAR(50),
    selected_event_end_time VARCHAR(50),
    finance_data TEXT,
    use_all_days_selection BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (trip_status_id) REFERENCES trip_status(id) ON DELETE SET NULL
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_trip_status_id ON trips(trip_status_id);
CREATE INDEX IF NOT EXISTS idx_trips_destination_id ON trips(destination_id);
CREATE INDEX IF NOT EXISTS idx_trips_bus_id ON trips(bus_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_transport_vendor_id ON trips(transport_vendor_id);
CREATE INDEX IF NOT EXISTS idx_events_trip_id ON events(trip_id);
CREATE INDEX IF NOT EXISTS idx_buses_transport_vendor_id ON buses(transport_vendor_id);
CREATE INDEX IF NOT EXISTS idx_drivers_transport_vendor_id ON drivers(transport_vendor_id);
CREATE INDEX IF NOT EXISTS idx_conductors_transport_vendor_id ON conductors(transport_vendor_id);
CREATE INDEX IF NOT EXISTS idx_food_items_food_category_id ON food_items(food_category_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
