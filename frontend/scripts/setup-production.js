const fs = require('fs');
const path = require('path');

console.log('🎨 Setting up Frontend Production Environment...');

// Production environment configuration
const productionEnv = `REACT_APP_API_URL=https://tripmanagerapi.dipoletechi.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
REACT_APP_BACKEND_URL=https://tripmanagerapi.dipoletechi.com
REACT_APP_FRONTEND_URL=https://tripmanager.dipoletechi.com`;

// Write .env.production file
const envPath = path.join(__dirname, '..', '.env.production');
fs.writeFileSync(envPath, productionEnv);

console.log('✅ Frontend production environment configured!');
console.log('📄 .env.production file created');
console.log('🌐 API URL: https://tripmanagerapi.dipoletechi.com');
console.log('🌐 Frontend URL: https://tripmanager.dipoletechi.com');
console.log('🔧 Environment: production');
console.log('');
console.log('🚀 To build and start in production mode:');
console.log('   npm run build');
console.log('   npm run start:prod');
console.log('');
console.log('📝 Note: This will not affect your development environment');
