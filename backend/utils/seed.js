const User = require('../models/User');

const defaultUsers = [
  {
    name: 'Super Admin',
    email: 'superadmin@tirthyatra.com',
    password: 'password123',
    role: 'superadmin'
  },
  {
    name: 'Admin User',
    email: 'admin@tirthyatra.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Trip Manager',
    email: 'tripmanager@tirthyatra.com',
    password: 'trip123',
    role: 'trip_manager'
  },
  {
    name: 'Financial Manager',
    email: 'finance@tirthyatra.com',
    password: 'fina123',
    role: 'financial_manager'
  },
  {
    name: 'Regular User',
    email: 'user@tirthyatra.com',
    password: 'user123',
    role: 'user'
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
        name: userData.name,
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


