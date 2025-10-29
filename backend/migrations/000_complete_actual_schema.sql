-- Complete Actual Database Schema
-- This migration creates all tables exactly as they exist in your production database

-- Drop existing tables if they exist (in correct order to avoid foreign key constraints)
DROP TABLE IF EXISTS `triplog`;
DROP TABLE IF EXISTS `trip_pligrim`;
DROP TABLE IF EXISTS `support_tickets`;
DROP TABLE IF EXISTS `trip_food_management`;
DROP TABLE IF EXISTS `trip_gps_tracking`;
DROP TABLE IF EXISTS `trip_feedback`;
DROP TABLE IF EXISTS `trip_events`;
DROP TABLE IF EXISTS `trip_attendees`;
DROP TABLE IF EXISTS `trip_amenities`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `finance`;
DROP TABLE IF EXISTS `cctv_logs`;
DROP TABLE IF EXISTS `budget_distribution`;
DROP TABLE IF EXISTS `bus_details`;
DROP TABLE IF EXISTS `buses`;
DROP TABLE IF EXISTS `conductors`;
DROP TABLE IF EXISTS `drivers`;
DROP TABLE IF EXISTS `food_schedules`;
DROP TABLE IF EXISTS `food_items`;
DROP TABLE IF EXISTS `food_categories`;
DROP TABLE IF EXISTS `food_vendors`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `accommodation_vendors`;
DROP TABLE IF EXISTS `transport_vendors`;
DROP TABLE IF EXISTS `amenities`;
DROP TABLE IF EXISTS `destinations`;
DROP TABLE IF EXISTS `trips`;
DROP TABLE IF EXISTS `trip_status`;
DROP TABLE IF EXISTS `users`;

-- Create users table
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('superadmin','admin','trip_manager','financial_manager','user') DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(20) DEFAULT NULL,
  `registration_method` enum('email','phone','digilocker') DEFAULT 'email',
  `otp` varchar(10) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT '0',
  `is_phone_verified` tinyint(1) DEFAULT '0',
  `age` int DEFAULT NULL,
  `digilocker_data` json DEFAULT NULL,
  `aadhaar_number` varchar(20) DEFAULT NULL,
  `aadhaar_front_image` text,
  `aadhaar_back_image` text,
  `aadhaar_name` varchar(100) DEFAULT NULL,
  `aadhaar_address` text,
  `account_status` enum('pending','in_verification','approved','rejected') DEFAULT 'pending',
  `step6_completed` tinyint(1) NOT NULL DEFAULT '0',
  `step6_completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `unique_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create destinations table
CREATE TABLE `destinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create transport_vendors table
CREATE TABLE `transport_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create accommodation_vendors table
CREATE TABLE `accommodation_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create amenities table
CREATE TABLE `amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create trip_status table
CREATE TABLE `trip_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create trips table
CREATE TABLE `trips` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `destination` varchar(255) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `destination_id` int DEFAULT NULL,
  `bus_id` int DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  `boarding_details` text,
  `checklist_items` text,
  `accommodation_vendor_id` int DEFAULT NULL,
  `food_vendor_id` int DEFAULT NULL,
  `transport_vendor_id` int DEFAULT NULL,
  `selected_drivers` text,
  `selected_conductors` text,
  `selected_buses` text,
  `drivers_by_day` text,
  `conductors_by_day` text,
  `buses_by_day` text,
  `vendors_by_day` text,
  `time_by_day` text,
  `accommodations_by_day` text,
  `selected_accommodation_vendor` varchar(255) DEFAULT NULL,
  `selected_accommodation_start_time` varchar(50) DEFAULT NULL,
  `selected_accommodation_end_time` varchar(50) DEFAULT NULL,
  `selected_food_vendors` text,
  `food_vendors_by_day` text,
  `selected_food_schedules` text,
  `selected_food_categories` text,
  `selected_food_items` text,
  `food_schedules_by_day` text,
  `food_categories_by_day` text,
  `food_items_by_day` text,
  `all_days_food_entries` text,
  `events_by_day` text,
  `all_days_events` text,
  `selected_event_title` varchar(255) DEFAULT NULL,
  `selected_event_description` text,
  `selected_event_start_time` varchar(50) DEFAULT NULL,
  `selected_event_end_time` varchar(50) DEFAULT NULL,
  `finance_data` text,
  `use_all_days_selection` tinyint(1) DEFAULT '0',
  `trip_status_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_trips_trip_status_id` (`trip_status_id`),
  CONSTRAINT `fk_trips_trip_status` FOREIGN KEY (`trip_status_id`) REFERENCES `trip_status` (`id`) ON DELETE SET NULL,
  CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create drivers table
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `driving_license_no` varchar(20) DEFAULT NULL,
  `aadhar_no` varchar(12) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `transport_vendor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transport_vendor_id` (`transport_vendor_id`),
  CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`transport_vendor_id`) REFERENCES `transport_vendors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create conductors table
CREATE TABLE `conductors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `transport_vendor_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `transport_vendor_id` (`transport_vendor_id`),
  CONSTRAINT `conductors_ibfk_1` FOREIGN KEY (`transport_vendor_id`) REFERENCES `transport_vendors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create buses table
CREATE TABLE `buses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `rc_no` varchar(50) NOT NULL,
  `rc_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `puc_no` varchar(50) DEFAULT NULL,
  `insurance_no` varchar(50) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `make_year` year DEFAULT NULL,
  `make` varchar(100) DEFAULT NULL,
  `type` enum('bus','traveller','car') DEFAULT 'bus',
  `no_of_sittings` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create bus_details table
CREATE TABLE `bus_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `rc_no` varchar(20) DEFAULT NULL,
  `rc_date` datetime DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `puc_no` varchar(20) DEFAULT NULL,
  `insurance_no` varchar(30) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `make_year` int DEFAULT NULL,
  `make` varchar(30) DEFAULT NULL,
  `type` enum('bus','traveller','car') DEFAULT NULL,
  `no_of_sittings` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `transport_vendor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transport_vendor_id` (`transport_vendor_id`),
  CONSTRAINT `bus_details_ibfk_1` FOREIGN KEY (`transport_vendor_id`) REFERENCES `transport_vendors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create events table
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_trip_id` (`trip_id`),
  KEY `idx_events_start_time` (`start_time`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create food_categories table
CREATE TABLE `food_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create food_items table
CREATE TABLE `food_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `food_category_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `food_category_id` (`food_category_id`),
  CONSTRAINT `food_items_ibfk_1` FOREIGN KEY (`food_category_id`) REFERENCES `food_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create food_vendors table
CREATE TABLE `food_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create food_schedules table
CREATE TABLE `food_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create support_tickets table
CREATE TABLE `support_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `trip_id` int DEFAULT NULL,
  `subject` varchar(150) NOT NULL,
  `description` text,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `assigned_to` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `trip_id` (`trip_id`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `support_tickets_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`),
  CONSTRAINT `support_tickets_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create trip_pligrim table
CREATE TABLE `trip_pligrim` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tripid` int NOT NULL,
  `userid` int NOT NULL,
  `status` enum('Pending','Approved','Reject') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_trip_user` (`tripid`,`userid`),
  KEY `idx_trip_pligrim_tripid` (`tripid`),
  KEY `idx_trip_pligrim_userid` (`userid`),
  KEY `idx_trip_pligrim_status` (`status`),
  KEY `idx_trip_pligrim_created_at` (`created_at`),
  CONSTRAINT `trip_pligrim_ibfk_1` FOREIGN KEY (`tripid`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trip_pligrim_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create triplog table
CREATE TABLE `triplog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `trip_id` int NOT NULL,
  `log_type` enum('TransportCheckIn','TransportCheckOut','AccommodationCheckIn','AccommodationCheckOut','EventCheckIn','EventCheckOut') NOT NULL,
  `log_item_id` varchar(255) DEFAULT NULL,
  `scanned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  KEY `idx_user_trip` (`user_id`,`trip_id`),
  KEY `idx_log_type` (`log_type`),
  KEY `idx_scanned_at` (`scanned_at`),
  CONSTRAINT `triplog_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `triplog_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create additional tables for complete schema
CREATE TABLE `budget_distribution` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `vendor_type` enum('accommodation','food','transport') NOT NULL,
  `vendor_id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','approved','processing','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `budget_distribution_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `cctv_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `camera_location` varchar(255) DEFAULT NULL,
  `log_data` text,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `cctv_logs_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `finance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int DEFAULT NULL,
  `category` enum('transport','accommodation','food','activities','other') NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_date` date NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `finance_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE SET NULL,
  CONSTRAINT `finance_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trip_amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `amenity_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  KEY `amenity_id` (`amenity_id`),
  CONSTRAINT `trip_amenities_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trip_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trip_attendees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `boarding_qr_code` varchar(255) DEFAULT NULL,
  `feedback_rating` int DEFAULT NULL,
  `feedback_comments` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `trip_attendees_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trip_attendees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `trip_attendees_chk_1` CHECK (((`feedback_rating` >= 1) and (`feedback_rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trip_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `day_number` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `trip_events_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trip_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `user_id` int NOT NULL,
  `transport_rating` int DEFAULT NULL,
  `food_rating` int DEFAULT NULL,
  `event_rating` int DEFAULT NULL,
  `destination_rating` int DEFAULT NULL,
  `overall_rating` int DEFAULT NULL,
  `comments` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `trip_feedback_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trip_feedback_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `trip_feedback_chk_1` CHECK (((`transport_rating` >= 1) and (`transport_rating` <= 5))),
  CONSTRAINT `trip_feedback_chk_2` CHECK (((`food_rating` >= 1) and (`food_rating` <= 5))),
  CONSTRAINT `trip_feedback_chk_3` CHECK (((`event_rating` >= 1) and (`event_rating` <= 5))),
  CONSTRAINT `trip_feedback_chk_4` CHECK (((`destination_rating` >= 1) and (`destination_rating` <= 5))),
  CONSTRAINT `trip_feedback_chk_5` CHECK (((`overall_rating` >= 1) and (`overall_rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trip_food_management` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `day_number` int NOT NULL,
  `food_schedule_id` int NOT NULL,
  `food_category_id` int NOT NULL,
  `food_item_ids` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  KEY `food_schedule_id` (`food_schedule_id`),
  KEY `food_category_id` (`food_category_id`),
  CONSTRAINT `trip_food_management_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trip_food_management_ibfk_2` FOREIGN KEY (`food_schedule_id`) REFERENCES `food_schedules` (`id`),
  CONSTRAINT `trip_food_management_ibfk_3` FOREIGN KEY (`food_category_id`) REFERENCES `food_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trip_gps_tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `trip_gps_tracking_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default data
INSERT INTO `trip_status` (`name`, `description`, `is_active`) VALUES
('Draft', 'Trip is in draft state and not yet published', 1),
('Published', 'Trip is published and visible to users', 1),
('Cancelled', 'Trip has been cancelled', 1),
('Completed', 'Trip has been completed successfully', 1);

INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `role`, `is_active`, `account_status`) VALUES
('Super', 'Admin', 'superadmin@tirthyatra.com', '$2a$10$OAajmRo0vmdNWWFV22TCd.GjV9nmpI/7tGk1hGgGnWQgkOUVY9QRO', 'superadmin', 1, 'approved');
