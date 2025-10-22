const mysql = require('mysql2/promise');

async function insertSampleFeedbackData() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'tirthyatra'
    });

    console.log('Connected to database');

    // Insert sample trip feedback data
    await connection.execute(`
      INSERT IGNORE INTO trip_feedback (trip_id, user_id, transport_rating, food_rating, event_rating, destination_rating, overall_rating, comments, created_at) VALUES
      (48, 7, 5, 4, 5, 5, 5, 'Excellent trip experience! Everything was well organized.', NOW()),
      (48, 8, 4, 3, 4, 4, 4, 'Good trip overall, but food could be better.', NOW()),
      (48, 9, 5, 5, 5, 5, 5, 'Amazing pilgrimage experience. Highly recommended!', NOW())
    `);

    console.log('Sample trip feedback data inserted');

    // Insert sample vendor feedback data
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

    console.log('Trip feedbacks count:', tripFeedbacks.length);
    console.log('Vendor feedbacks count:', vendorFeedbacks.length);

    console.log('✅ Sample feedback data inserted successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

insertSampleFeedbackData();
