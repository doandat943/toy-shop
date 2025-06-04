const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Thêm middleware debug token
const debugToken = (req, res, next) => {
  console.log('Auth route called:', req.path);
  console.log('Headers:', req.headers);
  next();
};

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get current user route
router.get('/me', debugToken, protect, getMe);

// Logout route
router.post('/logout', protect, logout);

module.exports = router; 