-- Complete Database Schema Migration for Tirth Yatra App - Version 2
-- This migration creates ALL tables including the missing ones from the current database
-- Run this on a fresh system to set up the entire database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'trip_manager', 'financial_manager', 'user') NOT NULL DEFAULT 'user',
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

-- Buses table (updated with more fields)
CREATE TABLE IF NOT EXISTS buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    rc_no VARCHAR(20),
    rc_date DATE,
    expiry_date DATE,
    puc_no VARCHAR(50),
    insurance_no VARCHAR(50),
    model VARCHAR(50),
    make_year INT,
    make VARCHAR(50),
    type VARCHAR(50),
    no_of_sittings INT,
    transport_vendor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id) ON DELETE CASCADE
);

-- Bus Details table (additional bus information)
CREATE TABLE IF NOT EXISTS bus_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    engine_no VARCHAR(50),
    chassis_no VARCHAR(50),
    fuel_type ENUM('diesel', 'petrol', 'cng', 'electric') DEFAULT 'diesel',
    seating_capacity INT,
    ac_available BOOLEAN DEFAULT FALSE,
    wifi_available BOOLEAN DEFAULT FALSE,
    charging_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
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

-- Refresh Tokens table (for JWT refresh functionality)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Budget Distribution table
CREATE TABLE IF NOT EXISTS budget_distribution (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    allocated_amount DECIMAL(12, 2) NOT NULL,
    spent_amount DECIMAL(12, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Finance table
CREATE TABLE IF NOT EXISTS finance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    transaction_type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- CCTV Logs table
CREATE TABLE IF NOT EXISTS cctv_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    bus_id INT,
    log_type ENUM('security', 'safety', 'maintenance', 'other') NOT NULL,
    description TEXT NOT NULL,
    incident_time DATETIME NOT NULL,
    location VARCHAR(255),
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL
);

-- Trip Amenities table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS trip_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    amenity_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trip_amenity (trip_id, amenity_id)
);

-- Trip Attendees table
CREATE TABLE IF NOT EXISTS trip_attendees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'confirmed', 'cancelled', 'completed') DEFAULT 'registered',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trip_attendee (trip_id, user_id)
);

-- Trip Events table (separate from main events table)
CREATE TABLE IF NOT EXISTS trip_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Trip Feedback table
CREATE TABLE IF NOT EXISTS trip_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    categories JSON, -- Store feedback categories as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trip_user_feedback (trip_id, user_id)
);

-- Trip Food Management table
CREATE TABLE IF NOT EXISTS trip_food_management (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    day_number INT NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL,
    food_vendor_id INT,
    menu_items JSON, -- Store menu items as JSON
    cost_per_person DECIMAL(8, 2),
    total_cost DECIMAL(10, 2),
    meal_time TIME,
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (food_vendor_id) REFERENCES food_vendors(id) ON DELETE SET NULL
);

-- Trip GPS Tracking table
CREATE TABLE IF NOT EXISTS trip_gps_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    bus_id INT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2), -- km/h
    direction DECIMAL(5, 2), -- degrees
    altitude DECIMAL(8, 2), -- meters
    accuracy DECIMAL(5, 2), -- meters
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL
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
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_distribution_trip_id ON budget_distribution(trip_id);
CREATE INDEX IF NOT EXISTS idx_finance_trip_id ON finance(trip_id);
CREATE INDEX IF NOT EXISTS idx_cctv_logs_trip_id ON cctv_logs(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_amenities_trip_id ON trip_amenities(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_attendees_trip_id ON trip_attendees(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_events_trip_id ON trip_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_feedback_trip_id ON trip_feedback(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_food_management_trip_id ON trip_food_management(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_gps_tracking_trip_id ON trip_gps_tracking(trip_id);
CREATE INDEX IF NOT EXISTS idx_bus_details_bus_id ON bus_details(bus_id);
