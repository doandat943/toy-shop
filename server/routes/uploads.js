const express = require('express');
const router = express.Router();
const { 
  uploadFile, 
  getUploadedFiles,
  deleteUploadedFile 
} = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/uploads
// @desc    Upload file
// @access  Private/Admin
router.post('/', protect, admin, upload.single('file'), uploadFile);

// @route   GET /api/uploads
// @desc    Get all uploaded files
// @access  Private/Admin
router.get('/', protect, admin, getUploadedFiles);

// @route   DELETE /api/uploads/:filename
// @desc    Delete uploaded file
// @access  Private/Admin
router.delete('/:filename', protect, admin, deleteUploadedFile);

module.exports = router; 