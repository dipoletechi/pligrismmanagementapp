const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'tirthyatra'
};

// Sample pilgrim applications data
const sampleApplications = [
  {
    tripid: 1, // Assuming trip ID 1 exists
    userid: 7, // Rajesh Kumar
    status: 'Pending'
  },
  {
    tripid: 1, // Assuming trip ID 1 exists
    userid: 8, // Priya Sharma
    status: 'Approved'
  },
  {
    tripid: 1, // Assuming trip ID 1 exists
    userid: 9, // Amit Singh
    status: 'Reject'
  }
];

async function createSampleApplications() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    console.log('Creating sample pilgrim applications...');
    
    for (let i = 0; i < sampleApplications.length; i++) {
      const application = sampleApplications[i];
      
      try {
        // Check if application already exists
        const [existingApplications] = await connection.execute(
          'SELECT id FROM trip_pligrim WHERE tripid = ? AND userid = ?',
          [application.tripid, application.userid]
        );
        
        if (existingApplications.length > 0) {
          console.log(`⚠️  Application for user ${application.userid} and trip ${application.tripid} already exists, skipping...`);
          continue;
        }
        
        // Insert application
        const [result] = await connection.execute(
          `INSERT INTO trip_pligrim (tripid, userid, status, created_at, updated_at) 
           VALUES (?, ?, ?, NOW(), NOW())`,
          [
            application.tripid,
            application.userid,
            application.status
          ]
        );
        
        console.log(`✅ Application ${i + 1}: User ${application.userid} - Trip ${application.tripid} - Status: ${application.status} (ID: ${result.insertId})`);
        
      } catch (applicationError) {
        console.error(`❌ Error creating application ${i + 1}:`, applicationError.message);
      }
    }
    
    console.log('🎉 Sample pilgrim applications created successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- 3 sample applications created');
    console.log('- 1 Pending, 1 Approved, 1 Rejected');
    console.log('- Applications can be viewed in Pilgrim Management');
    
  } catch (error) {
    console.error('❌ Creation failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the creation
createSampleApplications();
