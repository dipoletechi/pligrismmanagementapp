-- Insert sample accommodation and events data for user 7
-- This will help you see the full page design with all sections

-- Sample Accommodation Logs
INSERT INTO triplog (user_id, trip_id, log_type, log_item_id, trip_check_date, scanned_at, created_at, updated_at) VALUES
(7, 48, 'AccommodationCheckIn', '1', '2025-10-14', '2025-10-14 20:00:00', NOW(), NOW()),
(7, 48, 'AccommodationCheckOut', '1', '2025-10-15', '2025-10-15 08:00:00', NOW(), NOW()),
(7, 48, 'AccommodationCheckIn', '2', '2025-10-15', '2025-10-15 20:30:00', NOW(), NOW()),
(7, 48, 'AccommodationCheckOut', '2', '2025-10-16', '2025-10-16 09:00:00', NOW(), NOW());

-- Sample Events Logs
INSERT INTO triplog (user_id, trip_id, log_type, log_item_id, trip_check_date, scanned_at, created_at, updated_at) VALUES
(7, 48, 'EventCheckIn', 'Temple Visit', '2025-10-14', '2025-10-14 10:00:00', NOW(), NOW()),
(7, 48, 'EventCheckOut', 'Temple Visit', '2025-10-14', '2025-10-14 12:00:00', NOW(), NOW()),
(7, 48, 'EventCheckIn', 'Prayer Ceremony', '2025-10-15', '2025-10-15 18:00:00', NOW(), NOW()),
(7, 48, 'EventCheckOut', 'Prayer Ceremony', '2025-10-15', '2025-10-15 20:00:00', NOW(), NOW());

-- Verify the data
SELECT id, user_id, trip_id, log_type, log_item_id, trip_check_date, scanned_at
FROM triplog 
WHERE user_id = 7 AND trip_id = 48
ORDER BY scanned_at ASC;
