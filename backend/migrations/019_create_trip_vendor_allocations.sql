-- Create trip_vendor_allocations table
-- This table stores vendor budget allocation data from Trip Management Step 6
-- Replaces the JSON storage in trips.finance_data column

CREATE TABLE IF NOT EXISTS trip_vendor_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    vendor_type ENUM('transport', 'accommodation', 'food') NOT NULL,
    vendor_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'approved', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    payment_date DATE NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_tva_trip_id FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_tva_trip_id (trip_id),
    INDEX idx_tva_vendor (vendor_id, vendor_type),
    INDEX idx_tva_status (status),
    INDEX idx_tva_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

