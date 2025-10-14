const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: true, // Optional for mobile registration
    field: 'first_name',
    validate: {
      len: {
        args: [2, 50],
        msg: 'First name must be between 2 and 50 characters'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: true, // Optional for mobile registration
    field: 'last_name',
    validate: {
      len: {
        args: [2, 50],
        msg: 'Last name must be between 2 and 50 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email'
      }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: {
        args: [10, 20],
        msg: 'Phone number must be between 10 and 20 characters'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'admin', 'trip_manager', 'financial_manager', 'user'),
    defaultValue: 'user',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active'
  },
  registrationMethod: {
    type: DataTypes.ENUM('email', 'phone', 'digilocker'),
    defaultValue: 'email',
    allowNull: false,
    field: 'registration_method'
  },
  otp: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  otpExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'otp_expiry'
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_email_verified'
  },
  isPhoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_phone_verified'
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  digilockerData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'digilocker_data'
  },
  aadhaarNumber: {
    type: DataTypes.STRING(12),
    allowNull: true,
    field: 'aadhaar_number'
  },
  aadhaarFrontImage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'aadhaar_front_image'
  },
  aadhaarBackImage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'aadhaar_back_image'
  },
  aadhaarName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'aadhaar_name'
  },
  aadhaarAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'aadhaar_address'
  },
  accountStatus: {
    type: DataTypes.ENUM('pending', 'in_verification', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
    field: 'account_status'
  },
  // Explicit timestamp fields to ensure valid defaults in MySQL
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to check password (alias)
User.prototype.checkPassword = async function(enteredPassword) {
  return await this.matchPassword(enteredPassword);
};

// Instance method to get user without password
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
