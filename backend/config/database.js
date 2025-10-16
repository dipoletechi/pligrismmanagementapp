const { Sequelize } = require('sequelize');

// Create Sequelize instance with environment-specific database
const getDatabaseName = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DB_NAME || 'tirthyatra';
  }
  return process.env.DB_NAME || 'tirthyatra_dev';
};

const sequelize = new Sequelize(
  getDatabaseName(),
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '', // Use empty string as default
  {
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
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL database connected successfully');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${getDatabaseName()}`);
    
    // Note: Database schema is managed by migrations
    // No need to sync as it can cause "too many keys" error
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
