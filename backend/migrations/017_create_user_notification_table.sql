-- Migration: Create user_notification table
-- Description: This table stores notifications sent to users via email and mobile
-- Status: pending (default), sent, failed

CREATE TABLE IF NOT EXISTS user_notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  notification_type VARCHAR(100) DEFAULT 'mobile' COMMENT 'Comma-separated: mobile, text, email',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  error_message TEXT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments for better documentation
ALTER TABLE user_notification 
  COMMENT = 'Stores user notifications sent via email and mobile with status tracking';

