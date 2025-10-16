const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class SingleMigrator {
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
      console.error('Error creating database:', error.message);
      throw error;
    }
  }

  async runSingleMigration() {
    try {
      const migrationPath = path.join(__dirname, '..', 'migrations', '000_complete_production_schema.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      console.log('🚀 Running complete production schema migration...');
      
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
      
      console.log('✅ Complete production schema migration completed');
    } catch (error) {
      console.error('Migration error:', error.message);
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
      console.log('🚀 Starting single migration...');
      await this.connect();
      await this.createDatabase();
      await this.runSingleMigration();
      console.log('✅ Single migration completed successfully!');
      console.log('🎉 Your database is ready for production!');
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
  const migrator = new SingleMigrator();
  migrator.migrate();
}

module.exports = SingleMigrator;
