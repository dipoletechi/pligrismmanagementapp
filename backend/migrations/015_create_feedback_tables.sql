-- Create Vendor Feedback Table
CREATE TABLE IF NOT EXISTS vendor_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tripid INT NOT NULL,
    userId INT NOT NULL,
    ratings INT NOT NULL CHECK (ratings >= 1 AND ratings <= 5),
    datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    vendorid INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tripid) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Trip Feedback Table
CREATE TABLE IF NOT EXISTS trip_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tripid INT NOT NULL,
    userId INT NOT NULL,
    ratings INT NOT NULL CHECK (ratings >= 1 AND ratings <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tripid) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_vendor_feedback_tripid ON vendor_feedback(tripid);
CREATE INDEX idx_vendor_feedback_userId ON vendor_feedback(userId);
CREATE INDEX idx_vendor_feedback_vendorid ON vendor_feedback(vendorid);

CREATE INDEX idx_trip_feedback_tripid ON trip_feedback(tripid);
CREATE INDEX idx_trip_feedback_userId ON trip_feedback(userId);
