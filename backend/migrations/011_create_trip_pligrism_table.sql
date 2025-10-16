-- Migration: Create TripPligrism table
-- Description: Table to track pilgrimage trip applications and their status

CREATE TABLE IF NOT EXISTS trip_pligrism (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tripid INT NOT NULL,
    userid INT NOT NULL,
    status ENUM('Pending', 'Approved', 'Reject') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (tripid) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_trip_pligrism_tripid (tripid),
    INDEX idx_trip_pligrism_userid (userid),
    INDEX idx_trip_pligrism_status (status),
    INDEX idx_trip_pligrism_created_at (created_at),
    
    -- Unique constraint to prevent duplicate applications
    UNIQUE KEY unique_trip_user (tripid, userid)
);

