-- Create Trip Status table
CREATE TABLE IF NOT EXISTS trip_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default trip status values
INSERT INTO trip_status (name, description) VALUES
('Draft', 'Trip is in draft state and not yet published'),
('Published', 'Trip is published and visible to users'),
('Cancelled', 'Trip has been cancelled'),
('Completed', 'Trip has been completed successfully');

-- Add trip_status_id column to trips table
ALTER TABLE trips ADD COLUMN trip_status_id INT DEFAULT 1;

-- Add foreign key constraint
ALTER TABLE trips ADD CONSTRAINT fk_trips_trip_status 
    FOREIGN KEY (trip_status_id) REFERENCES trip_status(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_trips_trip_status_id ON trips(trip_status_id);
