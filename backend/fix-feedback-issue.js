const mysql = require('mysql2/promise');

async function fixFeedbackIssue() {
  let connection;
  
  try {
    // Database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root', // Change this to your MySQL password
      database: 'tirthyatra'
    });

    console.log('Connected to database');

    // Check if tables exist
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE '%feedback%'"
    );
    
    console.log('Existing feedback tables:', tables);

    // Create vendor_feedback table if not exists
    await connection.execute(`
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
      )
    `);

    console.log('vendor_feedback table created/verified');

    // Create trip_feedback table if not exists
    await connection.execute(`
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
      )
    `);

    console.log('trip_feedback table created/verified');

    // Insert sample data
    await connection.execute(`
      INSERT IGNORE INTO trip_feedback (tripid, userId, ratings, comment, created_at, updated_at) VALUES
      (48, 7, 5, 'Excellent trip experience! Everything was well organized.', NOW(), NOW()),
      (48, 8, 4, 'Good trip overall, but food could be better.', NOW(), NOW()),
      (48, 9, 5, 'Amazing pilgrimage experience. Highly recommended!', NOW(), NOW())
    `);

    console.log('Sample trip feedback data inserted');

    await connection.execute(`
      INSERT IGNORE INTO vendor_feedback (tripid, userId, ratings, vendorid, comment, datetime, created_at, updated_at) VALUES
      (48, 7, 5, 1, 'Great accommodation service!', NOW(), NOW(), NOW()),
      (48, 7, 4, 2, 'Good food quality, but service was slow.', NOW(), NOW(), NOW()),
      (48, 8, 5, 1, 'Excellent transport service, very comfortable.', NOW(), NOW(), NOW()),
      (48, 9, 3, 2, 'Average food, needs improvement.', NOW(), NOW(), NOW())
    `);

    console.log('Sample vendor feedback data inserted');

    // Verify data
    const [tripFeedbacks] = await connection.execute('SELECT * FROM trip_feedback');
    const [vendorFeedbacks] = await connection.execute('SELECT * FROM vendor_feedback');

    console.log('Trip feedbacks:', tripFeedbacks.length);
    console.log('Vendor feedbacks:', vendorFeedbacks.length);

    console.log('✅ Feedback tables setup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixFeedbackIssue();
