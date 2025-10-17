const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Production Environment...');

// Production environment configuration
const productionEnv = `NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tirthyatra

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-production-change-this-immediately

# CORS Configuration
FRONTEND_URL=https://tripmanager.dipoletechi.com
BACKEND_URL=https://tripmanagerapi.dipoletechi.com

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Logging
LOG_LEVEL=info`;

// Write .env file
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, productionEnv);

console.log('✅ Production environment configured!');
console.log('📄 .env file created with production settings');
console.log('🗄️  Database: tirthyatra');
console.log('🌐 Environment: production');
console.log('');
console.log('🚀 To start in production mode, run:');
console.log('   npm run start:prod');
console.log('');
console.log('⚠️  Make sure to:');
console.log('   1. Update JWT_SECRET with a secure key');
console.log('   2. Create the tirthyatra database');
console.log('   3. Run migrations: npm run migrate');
