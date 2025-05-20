const fs = require('fs');
const path = require('path');

// @desc    Upload file
// @route   POST /api/uploads
// @access  Private/Admin
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
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

// @desc    Get all uploaded files
// @route   GET /api/uploads
// @access  Private/Admin
const getUploadedFiles = async (req, res) => {
  try {
    const uploadsDirectory = path.join(__dirname, '../../client/public/uploads');
    
    fs.readdir(uploadsDirectory, (err, files) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error reading uploads directory',
          error: err.message
        });
      }

      // Get file stats for each file
      const fileDetails = files.map(filename => {
        const filePath = path.join(uploadsDirectory, filename);
        const stats = fs.statSync(filePath);
        
        return {
          filename,
          path: `/uploads/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime
        };
      });

      res.json({
        success: true,
        count: fileDetails.length,
        data: fileDetails
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/uploads/:filename
// @access  Private/Admin
const deleteUploadedFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../client/public/uploads', filename);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
          error: err.message
        });
      }

      // Delete file
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: err.message
          });
        }

        res.json({
          success: true,
          message: 'File deleted successfully'
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  uploadFile,
  getUploadedFiles,
  deleteUploadedFile
}; 