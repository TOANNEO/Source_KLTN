// Admin Controller - Manage users, departments, courses, semesters, grades
const adminService = require('../services/adminService');

/**
 * GET /api/v1/admin/dashboard
 * Get admin dashboard statistics
 */
const getDashboard = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
      message: 'Lấy thống kê dashboard thành công'
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Lỗi khi lấy thống kê dashboard'
    });
  }
};

/**
 * GET /api/v1/admin/users
 * Get all users with filters and pagination
 */
const getUsers = async (req, res) => {
  try {
    const filters = {
      role: req.query.role,
      search: req.query.search
    };

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };

    const result = await adminService.getAllUsers(filters, pagination);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Lỗi khi lấy danh sách người dùng'
    });
  }
};

/**
 * POST /api/v1/admin/users
 * Create new user
 */
const createUser = async (req, res) => {
  try {
    const user = await adminService.createUser(req.body);

    res.status(201).json({
      success: true,
      data: user,
      message: 'Tạo người dùng thành công'
    });
  } catch (error) {
    console.error('Create user error:', error);

    if (error.message === 'Email đã tồn tại trong hệ thống') {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Lỗi khi tạo người dùng'
    });
  }
};

/**
 * PUT /api/v1/admin/users/:id
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);

    res.json({
      success: true,
      data: user,
      message: 'Cập nhật người dùng thành công'
    });
  } catch (error) {
    console.error('Update user error:', error);

    if (error.message === 'Không tìm thấy người dùng') {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Lỗi khi cập nhật người dùng'
    });
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id);

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);

    if (error.message === 'Không tìm thấy người dùng') {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: error.message
      });
    }

    if (error.message === 'Không thể xóa người dùng có dữ liệu liên kết') {
      return res.status(400).json({
        success: false,
        error: 'HAS_RELATED_DATA',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Lỗi khi xóa người dùng'
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
