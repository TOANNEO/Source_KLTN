const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/authenticate');

// POST /api/v1/auth/login
// Public endpoint - no authentication required
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Mật khẩu là bắt buộc')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    handleValidationErrors
  ],
  authController.login
);

// POST /api/v1/auth/logout
// Requires authentication
router.post('/logout', authenticateToken, authController.logout);

// GET /api/v1/auth/me
// Get current authenticated user info
router.get('/me', authenticateToken, authController.getCurrentUser);

// PUT /api/v1/auth/change-password
// Change password for authenticated user
router.put(
  '/change-password',
  authenticateToken,
  [
    body('old_password')
      .notEmpty()
      .withMessage('Mật khẩu cũ là bắt buộc'),
    body('new_password')
      .notEmpty()
      .withMessage('Mật khẩu mới là bắt buộc')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
      .custom((value, { req }) => {
        if (value === req.body.old_password) {
          throw new Error('Mật khẩu mới phải khác mật khẩu cũ');
        }
        return true;
      }),
    handleValidationErrors
  ],
  authController.changePassword
);

module.exports = router;
