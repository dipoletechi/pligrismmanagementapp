-- Create Vendor Feedback Table
CREATE TABLE IF NOT EXISTS vendor_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tripid INT NOT NULL,
    userId INT NOT NULL,
    ratings INT NOT NULL CHECK (ratings >= 1 AND ratings <= 5),
    datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tripid) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Trip Feedback Table
CREATE TABLE IF NOT EXISTS trip_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    user_id INT NOT NULL,
    transport_rating INT CHECK (transport_rating >= 1 AND transport_rating <= 5),
    food_rating INT CHECK (food_rating >= 1 AND food_rating <= 5),
    event_rating INT CHECK (event_rating >= 1 AND event_rating <= 5),
    destination_rating INT CHECK (destination_rating >= 1 AND destination_rating <= 5),
    overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance (if they don't exist)
CREATE INDEX idx_vendor_feedback_tripid ON vendor_feedback(tripid);
CREATE INDEX idx_vendor_feedback_userId ON vendor_feedback(userId);
CREATE INDEX idx_vendor_feedback_vendorid ON vendor_feedback(vendorid);

CREATE INDEX idx_trip_feedback_trip_id ON trip_feedback(trip_id);
CREATE INDEX idx_trip_feedback_user_id ON trip_feedback(user_id);
