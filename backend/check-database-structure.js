const mysql = require('mysql2/promise');

async function checkDatabaseStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'tirthyatra'
    });

    console.log('Connected to database');

    // Check vendor_feedback table structure
    const [vendorStructure] = await connection.execute('DESCRIBE vendor_feedback');
    console.log('vendor_feedback structure:');
    vendorStructure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check trip_feedback table structure
    const [tripStructure] = await connection.execute('DESCRIBE trip_feedback');
    console.log('\ntrip_feedback structure:');
    tripStructure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check users table structure
    const [userStructure] = await connection.execute('DESCRIBE users');
    console.log('\nusers table structure:');
    userStructure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabaseStructure();
