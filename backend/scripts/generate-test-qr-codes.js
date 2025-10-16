const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'tirthyatra'
};

// JWT Secret (should match your server)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production';

async function generateTestQRCodes() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');

    // Test user IDs
    const testUserIds = [7, 8];
    
    for (const userId of testUserIds) {
      console.log(`\n--- Generating QR Code for User ID: ${userId} ---`);
      
      // Get user data
      const [users] = await connection.execute(
        'SELECT id, first_name, last_name, email, phone, role, aadhaar_number, aadhaar_address, account_status FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        console.log(`❌ User with ID ${userId} not found!`);
        continue;
      }

      const user = users[0];
      console.log(`Found user: ${user.first_name} ${user.last_name} (${user.email})`);

      // Create user data object for QR code
      const userData = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        aadhaarNumber: user.aadhaar_number,
        aadhaarAddress: user.aadhaar_address,
        accountStatus: user.account_status,
        generatedAt: new Date().toISOString()
      };

      // Create JWT token with user data (this will be the QR code data)
      const qrToken = jwt.sign(
        { 
          userData,
          type: 'mobile_user_qr',
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiry
        },
        JWT_SECRET
      );

      console.log('✅ QR Code generated successfully!');
      console.log('📱 QR Code Data (JWT Token):');
      console.log(qrToken);
      console.log('\n📊 User Information:');
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone || 'Not provided'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Account Status: ${user.account_status}`);
      console.log(`   Aadhaar: ${user.aadhaar_number || 'Not provided'}`);
      console.log(`   Generated At: ${userData.generatedAt}`);
      console.log(`   Expires At: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}`);
      
      // Test the decode functionality
      console.log('\n🔍 Testing QR Code Decode...');
      try {
        const decoded = jwt.verify(qrToken, JWT_SECRET);
        console.log('✅ QR Code decode test successful!');
        console.log(`   QR Type: ${decoded.type}`);
        console.log(`   User ID: ${decoded.userData.id}`);
        console.log(`   User Name: ${decoded.userData.firstName} ${decoded.userData.lastName}`);
      } catch (decodeError) {
        console.log('❌ QR Code decode test failed:', decodeError.message);
      }
      
      console.log('\n' + '='.repeat(80));
    }

    console.log('\n🎉 QR Code generation completed for all test users!');
    console.log('\n📝 Usage Instructions:');
    console.log('1. Use the JWT tokens above as QR code data');
    console.log('2. Test with POST /api/mobile-qr/decode-qr endpoint');
    console.log('3. QR codes expire in 24 hours');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the script
generateTestQRCodes();
