-- Create triplog table for tracking check-in/check-out activities
CREATE TABLE IF NOT EXISTS triplog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    trip_id INT NOT NULL,
    log_type ENUM(
        'TransportCheckIn', 
        'TransportCheckOut',
        'AccommodationCheckIn', 
        'AccommodationCheckOut',
        'EventCheckIn', 
        'EventCheckOut'
    ) NOT NULL,
    log_item_id VARCHAR(255) NOT NULL, -- Vendor ID or Event Title
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_user_trip (user_id, trip_id),
    INDEX idx_log_type (log_type),
    INDEX idx_scanned_at (scanned_at)
);
