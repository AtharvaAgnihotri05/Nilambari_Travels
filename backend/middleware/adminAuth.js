const adminAuth = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.',
    });
  }

  if (req.admin.role !== 'admin' && req.admin.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions.',
    });
  }

  next();
};

module.exports = adminAuth;
