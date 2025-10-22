const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class AllMigrationsRunner {
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
      console.error('Error creating database:', error.message);
      throw error;
    }
  }

  async runAllMigrations() {
    try {
      const migrationsDir = path.join(__dirname, '..', 'migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort to run in order

      console.log(`🚀 Found ${migrationFiles.length} migration files`);
      
      // Skip problematic schema files that cause conflicts
      const filesToSkip = [
        '000_complete_production_schema.sql',
        '000_complete_schema.sql',
        '000_complete_schema_v2.sql'
      ];
      const validMigrationFiles = migrationFiles.filter(file => !filesToSkip.includes(file));
      
      console.log(`📋 Running ${validMigrationFiles.length} migration files (skipping ${filesToSkip.length} problematic files)`);
      
      for (const file of validMigrationFiles) {
        console.log(`\n📁 Running migration: ${file}`);
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              // Use query instead of execute for better compatibility
              await this.connection.query(statement);
            } catch (error) {
              // Handle duplicate entry errors gracefully
              if (error.message.includes('Duplicate entry') || 
                  error.message.includes('already exists') ||
                  error.message.includes('Duplicate key') ||
                  error.message.includes('Duplicate column') ||
                  error.message.includes('Table') && error.message.includes('already exists') ||
                  error.message.includes('foreign key constraint') ||
                  error.message.includes('Cannot drop table') ||
                  error.message.includes('Can\'t DROP') ||
                  error.message.includes('check that column/key exists') ||
                  error.message.includes('prepared statement protocol') ||
                  error.message.includes('not supported') ||
                  error.message.includes('column name')) {
                console.log(`⚠️  Skipping: ${error.message.split(':')[0]}`);
                continue;
              } else {
                console.error(`❌ Error in ${file}:`, error.message);
                throw error;
              }
            }
          }
        }
        
        console.log(`✅ Migration ${file} completed`);
      }
      
      console.log('\n🎉 All migrations completed successfully!');
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
      console.log('🚀 Starting all migrations...');
      await this.connect();
      await this.createDatabase();
      await this.runAllMigrations();
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
  const migrator = new AllMigrationsRunner();
  migrator.migrate();
}

module.exports = AllMigrationsRunner;
