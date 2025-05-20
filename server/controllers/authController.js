const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = (req, res) => {
  try {
    // For now just return success message
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      data: { 
        user: { 
          id: 1, 
          name: req.body.name || 'Test User',
          email: req.body.email || 'user@example.com'
        } 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = (req, res) => {
  try {
    // Mock user data
    const user = {
      id: 1,
      name: 'Test User',
      email: req.body.email || 'user@example.com',
      role: 'user'
    };

    // Create token
    const token = jwt.sign(
      { user: { id: user.id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
}; 