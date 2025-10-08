const { sequelize } = require('../config/database');

async function addUserFields() {
  try {
    console.log('Adding phone and address fields to users table...');
    
    // Add phone column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN phone VARCHAR(20) NULL
    `);
    console.log('✓ Added phone column');
    
    // Add address column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN address TEXT NULL
    `);
    console.log('✓ Added address column');
    
    console.log('✅ User fields added successfully!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('⚠️  Columns already exist, skipping...');
      process.exit(0);
    } else {
      console.error('❌ Error adding user fields:', error);
      process.exit(1);
    }
  }
}

addUserFields();
