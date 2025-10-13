const User = require('../models/User');

const defaultUsers = [
  {
    first_name: 'Super',
    last_name: 'Admin',
    email: 'superadmin@tirthyatra.com',
    password: 'SuperAdmin@2024!',
    role: 'superadmin'
  }
];

async function ensureDefaultUsers() {
  const results = [];
  
  for (const userData of defaultUsers) {
    try {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (existing) {
        console.log(`User ${userData.email} already exists`);
        results.push(existing);
        continue;
      }

      const user = await User.create({
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        isActive: true
      });

      console.log(`Created user: ${userData.email} (${userData.role})`);
      results.push(user);
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error.message);
    }
  }

  return results;
}

module.exports = { ensureDefaultUsers };


