const mysql = require('mysql2/promise');

async function checkFeedbackStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'tirthyatra'
    });

    console.log('Connected to database');

    // Check trip_feedback structure
    const [tripStructure] = await connection.execute('DESCRIBE trip_feedback');
    console.log('trip_feedback structure:', tripStructure);

    // Check vendor_feedback structure
    const [vendorStructure] = await connection.execute('DESCRIBE vendor_feedback');
    console.log('vendor_feedback structure:', vendorStructure);

    // Check existing data
    const [tripData] = await connection.execute('SELECT * FROM trip_feedback LIMIT 1');
    console.log('Sample trip_feedback data:', tripData);

    const [vendorData] = await connection.execute('SELECT * FROM vendor_feedback LIMIT 1');
    console.log('Sample vendor_feedback data:', vendorData);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkFeedbackStructure();
