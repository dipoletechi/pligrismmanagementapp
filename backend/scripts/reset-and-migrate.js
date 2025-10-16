const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class DatabaseResetMigrator {
  constructor() {
    this.connection = null;
    this.dbName = process.env.DB_NAME || 'tirthyatra';
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 3306;
    this.user = process.env.DB_USER || 'root';
    this.password = process.env.DB_PASSWORD || '';
  }

  async connect() {
    try {
      // Try with empty password first
      this.connection = await mysql.createConnection({
        host: this.host,
        port: this.port,
        user: this.user,
        password: ''
      });
      console.log('✅ Connected to MySQL server (no password)');
    } catch (error) {
      console.log('❌ Failed with empty password, trying "root"...');
      try {
        // Try with 'root' password
        this.connection = await mysql.createConnection({
          host: this.host,
          port: this.port,
          user: this.user,
          password: 'root'
        });
        console.log('✅ Connected to MySQL server (password: root)');
      } catch (error2) {
        console.error('❌ Database connection error:', error2.message);
        throw error2;
      }
    }
  }

  async resetDatabase() {
    try {
      console.log('🗑️  Dropping existing database...');
      await this.connection.execute(`DROP DATABASE IF EXISTS ${this.dbName}`);
      console.log(`✅ Database '${this.dbName}' dropped`);
      
      console.log('🆕 Creating fresh database...');
      await this.connection.execute(`CREATE DATABASE ${this.dbName}`);
      console.log(`✅ Database '${this.dbName}' created`);
      
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
      
      console.log(`✅ Connected to fresh database '${this.dbName}'`);
    } catch (error) {
      console.error('Error resetting database:', error.message);
      throw error;
    }
  }

  async runMigrations() {
    try {
      const migrationsDir = path.join(__dirname, '..', 'migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      console.log(`Found ${migrationFiles.length} migration files`);

      for (const file of migrationFiles) {
        console.log(`Running migration: ${file}`);
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await this.connection.execute(statement);
            } catch (error) {
              // Handle duplicate entry errors gracefully
              if (error.message.includes('Duplicate entry') || 
                  error.message.includes('already exists') ||
                  error.message.includes('Duplicate key')) {
                console.log(`⚠️  Skipping duplicate entry: ${error.message.split(':')[0]}`);
                continue;
              } else {
                throw error;
              }
            }
          }
        }
        
        console.log(`✅ Migration ${file} completed`);
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration error:', error.message);
      throw error;
    }
  }

  async createDefaultSuperadmin() {
    try {
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
    } catch (error) {
      console.error('Error creating superadmin:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('Database connection closed');
    }
  }

  async resetAndMigrate() {
    try {
      console.log('🚀 Starting fresh database migration...');
      await this.connect();
      await this.resetDatabase();
      await this.runMigrations();
      await this.createDefaultSuperadmin();
      console.log('✅ Fresh database migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const migrator = new DatabaseResetMigrator();
  migrator.resetAndMigrate();
}

module.exports = DatabaseResetMigrator;
