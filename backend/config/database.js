const { Sequelize } = require('sequelize');

// Determine database name based on environment
const getDatabaseName = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DB_NAME || 'tirthyatra';
  }
  return process.env.DB_NAME || 'tirthyatra_dev';
};

// Build connection options dynamically
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Use password only if provided
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || null;
const dbName = getDatabaseName();
console.log("dbPassword");
console.log(dbPassword);
const sequelize = dbPassword
  ? new Sequelize(dbName, dbUser, dbPassword, dbConfig) // with password
  : new Sequelize(dbName, dbUser, null, dbConfig); // no password

// Connection function
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL database connected successfully');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${dbName}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
