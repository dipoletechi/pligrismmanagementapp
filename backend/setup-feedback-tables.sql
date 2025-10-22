-- Setup Feedback Tables
USE tirthyatra;

-- Create vendor_feedback table
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

-- Create trip_feedback table  
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
CREATE INDEX IF NOT EXISTS idx_vendor_feedback_tripid ON vendor_feedback(tripid);
CREATE INDEX IF NOT EXISTS idx_vendor_feedback_userId ON vendor_feedback(userId);
CREATE INDEX IF NOT EXISTS idx_vendor_feedback_vendorid ON vendor_feedback(vendorid);

CREATE INDEX IF NOT EXISTS idx_trip_feedback_tripid ON trip_feedback(tripid);
CREATE INDEX IF NOT EXISTS idx_trip_feedback_userId ON trip_feedback(userId);

-- Insert sample data
INSERT INTO trip_feedback (tripid, userId, ratings, comment, created_at, updated_at) VALUES
(48, 7, 5, 'Excellent trip experience! Everything was well organized.', NOW(), NOW()),
(48, 8, 4, 'Good trip overall, but food could be better.', NOW(), NOW()),
(48, 9, 5, 'Amazing pilgrimage experience. Highly recommended!', NOW(), NOW());

INSERT INTO vendor_feedback (tripid, userId, ratings, vendorid, comment, datetime, created_at, updated_at) VALUES
(48, 7, 5, 1, 'Great accommodation service!', NOW(), NOW(), NOW()),
(48, 7, 4, 2, 'Good food quality, but service was slow.', NOW(), NOW(), NOW()),
(48, 8, 5, 1, 'Excellent transport service, very comfortable.', NOW(), NOW(), NOW()),
(48, 9, 3, 2, 'Average food, needs improvement.', NOW(), NOW(), NOW());

-- Show the data
SELECT 'Trip Feedback Data:' as info;
SELECT * FROM trip_feedback;

SELECT 'Vendor Feedback Data:' as info;
SELECT * FROM vendor_feedback;
