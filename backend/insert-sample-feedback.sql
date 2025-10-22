-- Insert sample feedback data
-- First, let's insert some sample trip feedback

-- Sample Trip Feedback
INSERT INTO trip_feedback (tripid, userId, ratings, comment, created_at, updated_at) VALUES
(48, 7, 5, 'Excellent trip experience! Everything was well organized.', NOW(), NOW()),
(48, 8, 4, 'Good trip overall, but food could be better.', NOW(), NOW()),
(48, 9, 5, 'Amazing pilgrimage experience. Highly recommended!', NOW(), NOW());

-- Sample Vendor Feedback
INSERT INTO vendor_feedback (tripid, userId, ratings, vendorid, comment, datetime, created_at, updated_at) VALUES
(48, 7, 5, 1, 'Great accommodation service!', NOW(), NOW(), NOW()),
(48, 7, 4, 2, 'Good food quality, but service was slow.', NOW(), NOW(), NOW()),
(48, 8, 5, 1, 'Excellent transport service, very comfortable.', NOW(), NOW(), NOW()),
(48, 9, 3, 2, 'Average food, needs improvement.', NOW(), NOW(), NOW());

-- Check if tables exist and show structure
SELECT 'trip_feedback table structure:' as info;
DESCRIBE trip_feedback;

SELECT 'vendor_feedback table structure:' as info;
DESCRIBE vendor_feedback;

-- Show inserted data
SELECT 'Sample trip feedback data:' as info;
SELECT * FROM trip_feedback;

SELECT 'Sample vendor feedback data:' as info;
SELECT * FROM vendor_feedback;
