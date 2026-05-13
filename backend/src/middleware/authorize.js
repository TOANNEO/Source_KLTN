/**
 * Authorization middleware - check user role
 * Must be used after authenticateToken middleware
 *
 * Usage:
 *   router.get('/admin/users', authenticateToken, requireRole('admin'), controller)
 *   router.get('/student/grades', authenticateToken, requireRole('student'), controller)
 *   router.get('/data', authenticateToken, requireRole('admin', 'lecturer'), controller)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập để tiếp tục'
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập tài nguyên này'
        });
      }

      // User is authorized
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi phân quyền'
      });
    }
  };
};

/**
 * Check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Check if user is student
 */
const requireStudent = requireRole('student');

/**
 * Check if user is lecturer
 */
const requireLecturer = requireRole('lecturer');

/**
 * Check if user is admin or lecturer
 */
const requireAdminOrLecturer = requireRole('admin', 'lecturer');

module.exports = {
  requireRole,
  requireAdmin,
  requireStudent,
  requireLecturer,
  requireAdminOrLecturer
};
