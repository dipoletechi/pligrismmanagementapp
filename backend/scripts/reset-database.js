const { sequelize } = require('../config/database');
const { ensureDefaultUsers } = require('../utils/seed');

async function resetDatabase() {
  try {
    console.log('🔄 Disabling foreign key checks...');
    
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('🔄 Dropping users table...');
    
    // Drop the users table if it exists
    await sequelize.query('DROP TABLE IF EXISTS users');
    console.log('✅ Users table dropped successfully');
    
    console.log('🔄 Re-enabling foreign key checks...');
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('🔄 Syncing database...');
    
    // Sync database to recreate tables
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');
    
    console.log('🔄 Seeding default users...');
    
    // Seed default users
    await ensureDefaultUsers();
    console.log('✅ Default users seeded successfully');
    
    console.log('🎉 Database reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  } finally {
    // Close the database connection
    await sequelize.close();
    process.exit(0);
  }
}

// Run the reset
resetDatabase();
