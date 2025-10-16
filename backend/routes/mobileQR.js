const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate QR Code Data (Hash user data with JWT)
router.post('/generate-qr', async (req, res) => {
  try {
    const { userId } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production');
    
    // Check if user exists and get their data
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'first_name', 'last_name', 'email', 'phone', 
        'role', 'aadhaar_number', 'aadhaar_address', 'accountStatus'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create user data object for QR code
    const userData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      aadhaarNumber: user.aadhaar_number,
      aadhaarAddress: user.aadhaar_address,
      accountStatus: user.accountStatus,
      generatedAt: new Date().toISOString()
    };

    // Create JWT token with user data (this will be the QR code data)
    const qrToken = jwt.sign(
      { 
        userData,
        type: 'mobile_user_qr',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiry
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production'
    );

    res.json({
      success: true,
      message: 'QR code data generated successfully',
      data: {
        qrData: qrToken,
        userInfo: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code data',
      error: error.message
    });
  }
});

// Decode QR Code Data (Get actual user data from JWT)
router.post('/decode-qr', async (req, res) => {
  try {
    const { qrData } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Verify the scanner's JWT token (admin/trip_manager)
    const scannerDecoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production');
    
    console.log('=== QR DECODE DEBUG ===');
    console.log('Raw token:', token);
    console.log('Scanner decoded token:', JSON.stringify(scannerDecoded, null, 2));
    
    // Get user details from database using the ID from JWT token
    const scannerUser = await User.findByPk(scannerDecoded.id, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'role']
    });
    
    if (!scannerUser) {
      console.log('❌ Scanner user not found in database');
      return res.status(404).json({
        success: false,
        message: 'Scanner user not found'
      });
    }
    
    console.log('Scanner user from DB:', scannerUser.toJSON());
    console.log('Scanner role from DB:', scannerUser.role);
    console.log('Scanner role type:', typeof scannerUser.role);
    
    // Check if scanner has permission (admin, trip_manager, superadmin, transport)
    const allowedRoles = ['superadmin', 'admin', 'trip_manager', 'transport'];
    console.log('Allowed roles:', allowedRoles);
    console.log('Role check result:', allowedRoles.includes(scannerUser.role));
    
    if (!allowedRoles.includes(scannerUser.role)) {
      console.log('❌ Permission denied. User role:', scannerUser.role, 'Allowed roles:', allowedRoles);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to scan QR codes'
      });
    }
    
    console.log('✅ Permission granted for role:', scannerUser.role);

    // Decode the QR code data
    console.log('=== QR DATA DEBUG ===');
    console.log('QR Data received:', qrData);
    console.log('QR Data type:', typeof qrData);
    console.log('QR Data length:', qrData?.length);
    console.log('QR Data starts with:', qrData?.substring(0, 20));
    console.log('QR Data ends with:', qrData?.substring(qrData.length - 20));
    
    // Check if QR data looks like a JWT token
    if (!qrData || typeof qrData !== 'string' || !qrData.includes('.')) {
      console.log('❌ QR data does not look like a JWT token');
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format. Expected JWT token.'
      });
    }
    
    const qrDecoded = jwt.verify(qrData, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production');
    
    // Verify it's a mobile user QR code
    if (qrDecoded.type !== 'mobile_user_qr') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code type'
      });
    }

    // Get fresh user data from database
    const user = await User.findByPk(qrDecoded.userData.id, {
      attributes: [
        'id', 'first_name', 'last_name', 'email', 'phone', 
        'role', 'aadhaar_number', 'aadhaar_address', 'accountStatus',
        'created_at', 'updated_at'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    // Return decoded user data
    res.json({
      success: true,
      message: 'QR code decoded successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          aadhaarNumber: user.aadhaar_number,
          aadhaarAddress: user.aadhaar_address,
          accountStatus: user.accountStatus,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        qrInfo: {
          generatedAt: qrDecoded.userData.generatedAt,
          scannedAt: new Date().toISOString(),
          scanner: {
            id: scannerUser.id,
            name: `${scannerUser.first_name} ${scannerUser.last_name}`,
            email: scannerUser.email,
            role: scannerUser.role
          }
        }
      }
    });

  } catch (error) {
    console.error('Error decoding QR code:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'QR code has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to decode QR code',
      error: error.message
    });
  }
});

// Get QR Code Status (Check if QR code is valid without decoding)
router.post('/validate-qr', async (req, res) => {
  try {
    const { qrData } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Verify the scanner's JWT token
    const scannerDecoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production');
    
    // Get user details from database using the ID from JWT token
    const scannerUser = await User.findByPk(scannerDecoded.id, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'role']
    });
    
    if (!scannerUser) {
      return res.status(404).json({
        success: false,
        message: 'Scanner user not found'
      });
    }
    
    // Check if scanner has permission
    const allowedRoles = ['superadmin', 'admin', 'trip_manager', 'transport'];
    if (!allowedRoles.includes(scannerUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to validate QR codes'
      });
    }

    // Decode the QR code data
    const qrDecoded = jwt.verify(qrData, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production');
    
    // Verify it's a mobile user QR code
    if (qrDecoded.type !== 'mobile_user_qr') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code type'
      });
    }

    // Check if user still exists
    const user = await User.findByPk(qrDecoded.userData.id);
    
    res.json({
      success: true,
      message: 'QR code is valid',
      data: {
        isValid: true,
        userExists: !!user,
        generatedAt: qrDecoded.userData.generatedAt,
        expiresAt: new Date(qrDecoded.exp * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Error validating QR code:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'QR code has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to validate QR code',
      error: error.message
    });
  }
});

module.exports = router;
