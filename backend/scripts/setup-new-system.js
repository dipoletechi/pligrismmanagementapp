const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class NewSystemSetup {
  constructor() {
    this.connection = null;
    this.dbName = process.env.DB_NAME || 'tirthyatra';
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 3306;
    this.user = process.env.DB_USER || 'root';
    this.password = process.env.DB_PASSWORD || 'root';
  }

  async connect() {
    try {
      // Connect without specifying database first
      this.connection = await mysql.createConnection({
        host: this.host,
        port: this.port,
        user: this.user,
        password: this.password
      });
      console.log('✅ Connected to MySQL server');
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      throw error;
    }
  }

  async createDatabase() {
    try {
      await this.connection.execute(`CREATE DATABASE IF NOT EXISTS ${this.dbName}`);
      console.log(`✅ Database '${this.dbName}' created or already exists`);
      
      // Close current connection and reconnect to specific database
      await this.connection.end();
      
      // Reconnect to the specific database
      this.connection = await mysql.createConnection({
        host: this.host,
        port: this.port,
        user: this.user,
        password: this.password,
        database: this.dbName
      });
      
      console.log(`✅ Connected to database '${this.dbName}'`);
    } catch (error) {
      console.error('❌ Error creating database:', error.message);
      throw error;
    }
  }

  async runCompleteMigration() {
    try {
      console.log('🚀 Running complete schema migration...');
      
      const migrationPath = path.join(__dirname, '..', 'migrations', '000_complete_schema_v2.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await this.connection.execute(statement);
        }
      }
      
      console.log('✅ Complete schema migration completed');
    } catch (error) {
      console.error('❌ Migration error:', error.message);
      throw error;
    }
  }

  async createDefaultSuperadmin() {
    try {
      // Check if superadmin already exists
      const [existing] = await this.connection.execute(
        'SELECT id FROM users WHERE email = ?',
        ['superadmin@tirthyatra.com']
      );

      if (existing.length === 0) {
        const bcrypt = require('bcryptjs');
        // Strong password that meets policy requirements
        const strongPassword = 'SuperAdmin@2024!';
        const hashedPassword = await bcrypt.hash(strongPassword, 10);
        
        await this.connection.execute(
          `INSERT INTO users (first_name, last_name, email, password, role, is_active) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['Super', 'Admin', 'superadmin@tirthyatra.com', hashedPassword, 'superadmin', true]
        );
        console.log('✅ Default superadmin created');
        console.log('📧 Email: superadmin@tirthyatra.com');
        console.log('🔑 Password: SuperAdmin@2024!');
        console.log('🔒 Password meets all security requirements');
      } else {
        console.log('ℹ️  Superadmin already exists');
      }
    } catch (error) {
      console.error('❌ Error creating superadmin:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Database connection closed');
    }
  }

  async setup() {
    try {
      console.log('🚀 Starting new system setup...');
      console.log('📋 This will create the complete database schema and default admin user');
      console.log('');
      
      await this.connect();
      await this.createDatabase();
      await this.runCompleteMigration();
      await this.createDefaultSuperadmin();
      
      console.log('');
      console.log('🎉 New system setup completed successfully!');
      console.log('');
      console.log('📝 Next steps:');
      console.log('1. Start the backend server: npm start');
      console.log('2. Test the API: http://localhost:5000/api/health');
      console.log('3. Login with superadmin credentials');
      console.log('');
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  const setup = new NewSystemSetup();
  setup.setup();
}

module.exports = NewSystemSetup;
