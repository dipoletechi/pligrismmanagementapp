const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class DatabaseMigrator {
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
      console.log('Connected to MySQL server');
    } catch (error) {
      console.error('Database connection error:', error.message);
      throw error;
    }
  }

  async createDatabase() {
    try {
      await this.connection.execute(`CREATE DATABASE IF NOT EXISTS ${this.dbName}`);
      console.log(`Database '${this.dbName}' created or already exists`);
      
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
      
      console.log(`Connected to database '${this.dbName}'`);
    } catch (error) {
      console.error('Error creating database:', error.message);
      throw error;
    }
  }

  async checkTablesExist() {
    try {
      const [tables] = await this.connection.execute(
        "SELECT COUNT(*) as tableCount FROM information_schema.tables WHERE table_schema = ?",
        [this.dbName]
      );
      return tables[0].tableCount > 0;
    } catch (error) {
      console.error('Error checking tables:', error.message);
      return false;
    }
  }

  async runMigrations() {
    try {
      // Check if tables already exist
      const tablesExist = await this.checkTablesExist();
      
      if (tablesExist) {
        console.log('ℹ️  Database tables already exist, checking for new migrations...');
        
        // Check if old status column still exists in trips table
        const [columnExists] = await this.connection.execute(
          "SELECT COUNT(*) as columnCount FROM information_schema.columns WHERE table_schema = ? AND table_name = 'trips' AND column_name = 'status'",
          [this.dbName]
        );
        
        if (columnExists[0].columnCount > 0) {
          console.log('🔄 Old status column still exists, running migrations...');
        } else {
          console.log('✅ All migrations already applied, skipping');
          return;
        }
      }

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
            await this.connection.execute(statement);
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

  async migrate() {
    try {
      console.log('🚀 Starting database migration...');
      await this.connect();
      await this.createDatabase();
      await this.runMigrations();
      await this.createDefaultSuperadmin();
      console.log('✅ Database migration completed successfully!');
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
  const migrator = new DatabaseMigrator();
  migrator.migrate();
}

module.exports = DatabaseMigrator;
