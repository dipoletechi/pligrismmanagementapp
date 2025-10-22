const mysql = require('mysql2/promise');

async function createVendorFeedbackTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'tirthyatra'
    });

    console.log('Connected to database');

    // Drop table if exists
    await connection.execute('DROP TABLE IF EXISTS vendor_feedback');
    console.log('Dropped existing vendor_feedback table');

    // Create vendor_feedback table
    await connection.execute(`
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
      )
    `);
    console.log('Created vendor_feedback table');

    // Create indexes
    await connection.execute('CREATE INDEX idx_vendor_feedback_tripid ON vendor_feedback(tripid)');
    await connection.execute('CREATE INDEX idx_vendor_feedback_userId ON vendor_feedback(userId)');
    await connection.execute('CREATE INDEX idx_vendor_feedback_vendorid ON vendor_feedback(vendorid)');
    console.log('Created indexes');

    // Insert sample data
    await connection.execute(`
      INSERT INTO vendor_feedback (tripid, userId, ratings, vendorid, comment, datetime, created_at, updated_at) VALUES
      (48, 7, 5, 1, 'Great accommodation service!', NOW(), NOW(), NOW()),
      (48, 7, 4, 2, 'Good food quality, but service was slow.', NOW(), NOW(), NOW()),
      (48, 8, 5, 1, 'Excellent transport service, very comfortable.', NOW(), NOW(), NOW()),
      (48, 9, 3, 2, 'Average food, needs improvement.', NOW(), NOW(), NOW())
    `);
    console.log('Inserted sample data');

    // Verify data
    const [rows] = await connection.execute('SELECT * FROM vendor_feedback');
    console.log('Vendor feedback records:', rows.length);
    console.log('Sample data:', rows);

    console.log('✅ Vendor Feedback table created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createVendorFeedbackTable();
