const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token ? 'Present' : 'Missing');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token decoded successfully, user ID:', decoded.id);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found:', req.user ? 'Yes' : 'No', 'Role:', req.user?.role);

      if (!req.user) {
        console.log('User not found in database');
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        console.log('User account is deactivated');
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      console.log('Authentication successful for user:', req.user.email);
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorization check - User role:', req.user?.role, 'Required roles:', roles);
    
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no user'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('User role not authorized:', req.user.role, 'Required:', roles);
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    console.log('Authorization successful for role:', req.user.role);
    next();
  };
};

// Optional authentication - doesn't require token but adds user if present
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token is invalid but we don't fail the request
      console.log('Optional auth token invalid:', error.message);
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth
}; 