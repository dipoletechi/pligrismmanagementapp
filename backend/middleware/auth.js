const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      // if (!req.user.isActive) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'Not authorized, account deactivated'
      //   });
      // }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check specific permissions
exports.checkPermission = (module, action) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = getRolePermissions(userRole);
    
    if (!permissions[module] || !permissions[module].includes(action)) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to ${action} ${module}`
      });
    }
    next();
  };
};

// Role-based permissions configuration
const getRolePermissions = (role) => {
  const permissions = {
    superadmin: {
      users: ['create', 'read', 'update', 'delete'],
      trips: ['create', 'read', 'update', 'delete'],
      finance: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete']
    },
    admin: {
      users: ['read'], // Admin cannot manage users
      trips: ['create', 'read', 'update', 'delete'],
      finance: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete']
    },
    trip_manager: {
      users: [],
      trips: ['create', 'read', 'update', 'delete'],
      finance: [],
      reports: ['read'],
      settings: []
    },
    financial_manager: {
      users: [],
      trips: ['read'], // Read-only access to trips
      finance: [], // No finance management access
      reports: ['read'], // Read-only access to reports
      vendors: ['create', 'read', 'update', 'delete'], // Full access to vendors
      feedback: ['read'], // Read-only access to feedback
      settings: []
    },
    user: {
      users: [],
      trips: ['read'],
      finance: [],
      reports: [],
      settings: []
    }
  };

  return permissions[role] || {};
};
