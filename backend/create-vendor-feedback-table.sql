-- Create vendor_feedback table with correct structure
USE tirthyatra;

-- Drop table if exists (for clean recreation)
DROP TABLE IF EXISTS vendor_feedback;

-- Create vendor_feedback table
CREATE TABLE vendor_feedback (
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

-- Create indexes for better performance
CREATE INDEX idx_vendor_feedback_tripid ON vendor_feedback(tripid);
CREATE INDEX idx_vendor_feedback_userId ON vendor_feedback(userId);
CREATE INDEX idx_vendor_feedback_vendorid ON vendor_feedback(vendorid);

-- Insert sample data
INSERT INTO vendor_feedback (tripid, userId, ratings, vendorid, comment, datetime, created_at, updated_at) VALUES
(48, 7, 5, 1, 'Great accommodation service!', NOW(), NOW(), NOW()),
(48, 7, 4, 2, 'Good food quality, but service was slow.', NOW(), NOW(), NOW()),
(48, 8, 5, 1, 'Excellent transport service, very comfortable.', NOW(), NOW(), NOW()),
(48, 9, 3, 2, 'Average food, needs improvement.', NOW(), NOW(), NOW());

-- Show the data
SELECT 'Vendor Feedback Table Created Successfully!' as status;
SELECT 'Sample Data:' as info;
SELECT * FROM vendor_feedback;
