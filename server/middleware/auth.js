const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to check if user is authenticated
const protect = function (req, res, next) {
  let token;
  
  // Check header for token - supports both x-auth-token and Authorization: Bearer format
  if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  } else if (req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')) {
    token = req.header('Authorization').split(' ')[1];
  }
  
  // Check if not token
  if (!token) {
    console.log('No token provided in headers:', req.headers);
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully:', decoded);
    
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin privileges required' });
  }
};

// Generate JWT token
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

module.exports = { protect, admin }; 