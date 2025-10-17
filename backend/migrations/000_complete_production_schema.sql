-- Complete Production Database Schema
-- This migration creates all tables needed for the Tirth Yatra Management System

-- Drop existing tables if they exist (in correct order to avoid foreign key constraints)
DROP TABLE IF EXISTS triplog;
DROP TABLE IF EXISTS trip_pligrim;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS food_schedules;
DROP TABLE IF EXISTS food_items;
DROP TABLE IF EXISTS food_categories;
DROP TABLE IF EXISTS food_vendors;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS conductors;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS buses;
DROP TABLE IF EXISTS accommodation_vendors;
DROP TABLE IF EXISTS transport_vendors;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('superadmin', 'admin', 'trip_manager', 'finance', 'transport', 'user') DEFAULT 'user',
    aadhaar_number VARCHAR(20),
    aadhaar_address TEXT,
    account_status ENUM('pending', 'in_verification', 'approved', 'rejected') DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create destinations table
CREATE TABLE destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create transport_vendors table
CREATE TABLE transport_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create accommodation_vendors table
CREATE TABLE accommodation_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create buses table
CREATE TABLE buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    bus_number VARCHAR(50),
    capacity INT,
    transport_vendor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id)
);

-- Create drivers table
CREATE TABLE drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    driving_license_no VARCHAR(50),
    transport_vendor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id)
);

-- Create conductors table
CREATE TABLE conductors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    transport_vendor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id)
);

-- Create amenities table
CREATE TABLE amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create trips table
CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    destination_id INT,
    transport_vendor_id INT,
    accommodation_vendor_id INT,
    trip_manager_id INT,
    status ENUM('planning', 'confirmed', 'ongoing', 'completed', 'cancelled') DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id),
    FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id),
    FOREIGN KEY (accommodation_vendor_id) REFERENCES accommodation_vendors(id),
    FOREIGN KEY (trip_manager_id) REFERENCES users(id)
);

-- Create events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIME,
    end_time TIME,
    trip_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id)
);

-- Create food_categories table
CREATE TABLE food_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create food_items table
CREATE TABLE food_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES food_categories(id)
);

-- Create food_vendors table
CREATE TABLE food_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create food_schedules table
CREATE TABLE food_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT,
    vendor_id INT,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL,
    scheduled_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id),
    FOREIGN KEY (vendor_id) REFERENCES food_vendors(id)
);

-- Create support_tickets table
CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create trip_pligrim table
CREATE TABLE trip_pligrim (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tripid INT NOT NULL,
    userid INT NOT NULL,
    status ENUM('Pending', 'Approved', 'Reject') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tripid) REFERENCES trips(id),
    FOREIGN KEY (userid) REFERENCES users(id),
    UNIQUE KEY unique_trip_user (tripid, userid)
);

-- Create triplog table
CREATE TABLE triplog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    trip_id INT NOT NULL,
    log_type ENUM('TransportCheckIn', 'TransportCheckOut', 'AccommodationCheckIn', 'AccommodationCheckOut', 'EventCheckIn', 'EventCheckOut') NOT NULL,
    log_item_id VARCHAR(255) NOT NULL,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_triplog_user_id ON triplog(user_id);
CREATE INDEX idx_triplog_trip_id ON triplog(trip_id);
CREATE INDEX idx_triplog_log_type ON triplog(log_type);
CREATE INDEX idx_trip_pligrim_tripid ON trip_pligrim(tripid);
CREATE INDEX idx_trip_pligrim_userid ON trip_pligrim(userid);

-- Insert default superadmin user
INSERT INTO users (first_name, last_name, email, password, role, account_status, is_active) 
VALUES ('Super', 'Admin', 'superadmin@tirthyatra.com', '$2b$10$rQZ8K9vL8mN7pQrS5tU6COY8vL8mN7pQrS5tU6COY8vL8mN7pQrS5tU6C', 'superadmin', 'approved', true);

-- Insert sample destination
INSERT INTO destinations (title, description, location) 
VALUES ('Kashi Yatra - Varanasi', 'Sacred pilgrimage to Varanasi', 'Varanasi, Uttar Pradesh, India');

-- Insert sample transport vendor
INSERT INTO transport_vendors (title, phone, email, address) 
VALUES ('Pioneer Transport Co.', '+91-9876543210', 'info@pioneertransport.com', '123 Transport Street, Delhi, India');

-- Insert sample accommodation vendor
INSERT INTO accommodation_vendors (title, phone, email, address) 
VALUES ('Hotel Accommodation', '+91-9876543211', 'info@hotelaccommodation.com', '456 Hotel Avenue, Varanasi, India');

-- Insert sample trip
INSERT INTO trips (title, description, start_date, end_date, destination_id, transport_vendor_id, accommodation_vendor_id, trip_manager_id, status) 
VALUES ('Kashi Yatra - Varanasi', 'Sacred pilgrimage trip to Varanasi', '2024-01-15', '2024-01-20', 1, 1, 1, 1, 'confirmed');
