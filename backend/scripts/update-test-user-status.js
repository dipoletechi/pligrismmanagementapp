const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'tirthyatra'
};

async function updateTestUserStatus() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');

    // Find Test User
    console.log('\nLooking for Test User...');
    const [users] = await connection.execute(
      'SELECT id, first_name, last_name, email, account_status FROM users WHERE email = "test@example.com"'
    );
    
    if (users.length === 0) {
      console.log('❌ Test User not found!');
      return;
    }

    const testUser = users[0];
    console.log(`Found Test User: ${testUser.first_name} ${testUser.last_name} (ID: ${testUser.id})`);
    console.log(`Current account status: ${testUser.account_status}`);

    // Update account status to pending
    console.log('\nUpdating account status to "pending"...');
    const [result] = await connection.execute(
      'UPDATE users SET account_status = "pending" WHERE id = ?',
      [testUser.id]
    );

    if (result.affectedRows > 0) {
      console.log('✅ Successfully updated Test User account status to "pending"');
    } else {
      console.log('❌ No rows were updated');
    }

    // Verify the update
    console.log('\nVerifying the update...');
    const [updatedUser] = await connection.execute(
      'SELECT id, first_name, last_name, email, account_status FROM users WHERE id = ?',
      [testUser.id]
    );

    if (updatedUser.length > 0) {
      const user = updatedUser[0];
      console.log(`✅ Verification successful:`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Account Status: ${user.account_status}`);
    }

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
updateTestUserStatus();
