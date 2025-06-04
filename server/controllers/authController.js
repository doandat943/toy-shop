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
    const token = jwt.sign(
      { user: { id: 1, role: 'user' } },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      token,
      data: { 
        user: { 
          id: 1, 
          name: req.body.name || 'Test User',
          email: req.body.email || 'user@example.com',
          role: 'user'
        } 
      }
    });
  } catch (error) {
    console.error('Register error:', error);
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
const login = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    // Kiểm tra email đã được cung cấp chưa
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Tìm user theo email từ database
    const user = await User.findOne({ where: { email: req.body.email } });
    
    // Nếu không tìm thấy user hoặc password không khớp
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Kiểm tra password có đúng không
    const isPasswordValid = await bcryptjs.compare(req.body.password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Tạo token với thông tin user từ database
    const token = jwt.sign(
      { 
        user: { 
          id: user.id, 
          role: user.role 
        } 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('Generated token for user:', { id: user.id, role: user.role });
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: { 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        } 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
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
const getMe = async (req, res) => {
  try {
    console.log('GetMe called with user:', req.user);
    
    // Lấy thông tin user từ database
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
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