const authService = require('../services/authService');

/**
 * POST /api/v1/auth/login
 * Login user and return JWT token
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email và mật khẩu là bắt buộc'
      });
    }

    // Login
    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: result,
      message: 'Đăng nhập thành công'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Đăng nhập thất bại'
    });
  }
};

/**
 * POST /api/v1/auth/logout
 * Logout user (client-side token removal)
 */
const logout = async (req, res) => {
  try {
    // JWT is stateless, so logout is handled on client side
    // This endpoint can be used for logging or cleanup if needed
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Đăng xuất thất bại'
    });
  }
};

/**
 * GET /api/v1/auth/me
 * Get current authenticated user info
 */
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    const user = await authService.getUserById(req.user.id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy người dùng'
    });
  }
};

/**
 * PUT /api/v1/auth/change-password
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    // Validate input
    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu cũ và mật khẩu mới là bắt buộc'
      });
    }

    // Validate new password length
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Change password
    await authService.changePassword(req.user.id, old_password, new_password);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Đổi mật khẩu thất bại'
    });
  }
};

module.exports = {
  login,
  logout,
  getCurrentUser,
  changePassword
};
