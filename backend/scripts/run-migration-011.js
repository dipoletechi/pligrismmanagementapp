const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'tirthyatra',
  multipleStatements: true
};

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/011_create_trip_pligrim_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration: 011_create_trip_pligrim_table.sql');
    console.log('Creating TripPligrim table...');
    
    // Execute the migration
    await connection.execute(migrationSQL);
    
    console.log('✅ Migration 011 completed successfully!');
    console.log('✅ TripPligrim table created with the following structure:');
    console.log('   - id (Primary Key, Auto Increment)');
    console.log('   - tripid (Foreign Key to trips table)');
    console.log('   - userid (Foreign Key to users table)');
    console.log('   - status (ENUM: Pending, Approved, Reject)');
    console.log('   - created_at (Timestamp)');
    console.log('   - updated_at (Timestamp)');
    console.log('   - Unique constraint on (tripid, userid)');
    console.log('   - Indexes for performance optimization');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the migration
runMigration();
