const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing .env file password...');

const envPath = path.join(__dirname, '..', '.env');

try {
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update DB_PASSWORD to empty string
    if (envContent.includes('DB_PASSWORD=')) {
      envContent = envContent.replace(/DB_PASSWORD=.*/, 'DB_PASSWORD=');
      console.log('✅ Updated DB_PASSWORD to empty string');
    } else {
      envContent += '\nDB_PASSWORD=';
      console.log('✅ Added DB_PASSWORD= (empty)');
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated successfully');
    console.log('📄 Database will now connect without password');
    
  } else {
    console.log('❌ .env file not found. Run: npm run setup:prod');
  }
} catch (error) {
  console.error('❌ Error fixing .env file:', error.message);
}
