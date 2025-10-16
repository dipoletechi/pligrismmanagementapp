const mysql = require('mysql2/promise');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'tirthyatra'
};

async function insertApprovedApplications() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');

    // First, let's check if we have users with role 'user'
    console.log('\nChecking for users with role "user"...');
    const [users] = await connection.execute(
      'SELECT id, first_name, last_name, email FROM users WHERE role = "user" LIMIT 5'
    );
    
    if (users.length < 2) {
      console.log('Error: Need at least 2 users with role "user" to create applications');
      console.log('Found users:', users);
      return;
    }

    console.log('Found users:', users.map(u => `${u.first_name} ${u.last_name} (ID: ${u.id})`));

    // Check if we have any trips
    console.log('\nChecking for available trips...');
    const [trips] = await connection.execute(
      'SELECT id, title FROM trips LIMIT 5'
    );
    
    if (trips.length === 0) {
      console.log('Error: No trips found. Please create a trip first.');
      return;
    }

    console.log('Found trips:', trips.map(t => `${t.title} (ID: ${t.id})`));

    // Use the first trip for both applications
    const tripId = trips[0].id;
    const tripTitle = trips[0].title;

    console.log(`\nUsing trip: ${tripTitle} (ID: ${tripId})`);

    // Insert two approved applications
    const applications = [
      {
        tripid: tripId,
        userid: users[0].id,
        status: 'Approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tripid: tripId,
        userid: users[1].id,
        status: 'Approved',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    console.log('\nInserting approved applications...');
    
    for (const app of applications) {
      try {
        // Check if application already exists
        const [existing] = await connection.execute(
          'SELECT id FROM trip_pligrim WHERE tripid = ? AND userid = ?',
          [app.tripid, app.userid]
        );

        if (existing.length > 0) {
          console.log(`Application already exists for user ${app.userid} in trip ${app.tripid}`);
          continue;
        }

        // Insert new application
        const [result] = await connection.execute(
          'INSERT INTO trip_pligrim (tripid, userid, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [app.tripid, app.userid, app.status, app.created_at, app.updated_at]
        );

        console.log(`✅ Inserted application for user ${app.userid} (ID: ${result.insertId})`);
      } catch (error) {
        console.error(`❌ Error inserting application for user ${app.userid}:`, error.message);
      }
    }

    // Verify the insertions
    console.log('\nVerifying insertions...');
    const [verification] = await connection.execute(
      `SELECT 
        tp.id,
        tp.status,
        u.first_name,
        u.last_name,
        u.email,
        t.title as trip_title
      FROM trip_pligrim tp
      JOIN users u ON tp.userid = u.id
      JOIN trips t ON tp.tripid = t.id
      WHERE tp.status = 'Approved'
      ORDER BY tp.created_at DESC`
    );

    console.log('\n📊 Approved Applications:');
    verification.forEach(app => {
      console.log(`- ${app.first_name} ${app.last_name} (${app.email}) - ${app.trip_title} - Status: ${app.status}`);
    });

    console.log(`\n✅ Successfully inserted ${verification.length} approved applications!`);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the script
insertApprovedApplications();
