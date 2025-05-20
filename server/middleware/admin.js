module.exports = function (req, res, next) {
  // Check user role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
}; 