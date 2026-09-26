const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const allowedRoles = roles.flat().map((r) => r.toUpperCase());
    const userRole = (req.user.role || '').toUpperCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}. Current role: ${userRole}`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
