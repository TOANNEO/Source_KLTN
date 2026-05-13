const { User, Student, Lecturer, Course, Semester, PredictionHistory } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async () => {
  // Tổng số sinh viên
  const totalStudents = await Student.count();

  // Tổng số giảng viên
  const totalLecturers = await Lecturer.count();

  // Tổng số môn học
  const totalCourses = await Course.count();

  // Học kỳ hiện tại
  const currentSemester = await Semester.findOne({
    where: { is_current: true }
  });
  // số lượng tài khoản theo vai trò
  const adminCount = await User.count({ where: { role: 'admin' } });
  const studentCount = await User.count({ where: { role: 'student' } });
  const lecturerCount = await User.count({ where: { role: 'lecturer' } });

  // Tổng số tài khoản
  const totalAccounts = await User.count();

  // Số SV nguy cơ trong học kỳ hiện tại
  const atRiskStats = await getAtRiskStudents(currentSemester);

  return {
    overview: {
      totalStudents,
      totalLecturers,
      totalCourses,
      currentSemester: currentSemester ? {
        id: currentSemester.id,
        name: currentSemester.name,
        start_date: currentSemester.start_date,
        end_date: currentSemester.end_date
      } : null
    },
    accounts: {
      total: totalAccounts,
      admin: adminCount,
      student: studentCount,
      lecturer: lecturerCount
    },
    atRisk: atRiskStats
  };
};

/**
 * Get at-risk students statistics for current semester
 */
const getAtRiskStudents = async (currentSemester) => {
  const stats = {
    safe: 0,
    warning: 0,
    danger: 0
  };

  if (!currentSemester) {
    return stats;
  }

  // Lấy dự báo gần nhất của từng sinh viên
  const predictions = await PredictionHistory.findAll({
    where: { semester_id: currentSemester.id },
    attributes: ['student_id', 'risk_label', 'predicted_at'],
    order: [['predicted_at', 'DESC']]
  });

  // Lọc lấy dự báo mới nhất của mỗi sinh viên
  const latestPredictions = {};
  predictions.forEach(pred => {
    if (!latestPredictions[pred.student_id]) {
      latestPredictions[pred.student_id] = pred.risk_label;
    }
  });

  // Đếm số lượng theo từng mức nguy cơ
  Object.values(latestPredictions).forEach(riskLabel => {
    if (riskLabel === 'safe') stats.safe++;
    else if (riskLabel === 'warning') stats.warning++;
    else if (riskLabel === 'danger') stats.danger++;
  });

  return stats;
};

/**
 * Get all users with filters and pagination
 */
const getAllUsers = async (filters = {}, pagination = {}) => {
  const { role, search } = filters;
  const { page = 1, limit = 20 } = pagination;

  const where = {};

  // Filter by role
  if (role && ['admin', 'student', 'lecturer'].includes(role)) {
    where.role = role;
  }

  // Search by email
  if (search) {
    where.email = { [Op.like]: `%${search}%` };
  }

  const offset = (page - 1) * limit;

  const { count, rows: users } = await User.findAndCountAll({
    where,
    attributes: ['id', 'email', 'role', 'first_name', 'last_name', 'created_at', 'updated_at'],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']]
  });

  return {
    users,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Create new user
 */
const createUser = async (userData) => {
  const { email, password, role, first_name, last_name } = userData;

  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email đã tồn tại trong hệ thống');
  }
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    role,
    first_name,
    last_name
  });

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

/**
 * Update user
 */
const updateUser = async (userId, updateData) => {
  const { role, first_name, last_name } = updateData;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  // Update user
  await user.update({
    ...(role && { role }),
    ...(first_name && { first_name }),
    ...(last_name && { last_name })
  });

  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      { model: Student, as: 'student' },
      { model: Lecturer, as: 'lecturer' }
    ]
  });

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  // Check if user has related data
  if (user.student || user.lecturer) {
    throw new Error('Không thể xóa người dùng có dữ liệu liên kết');
  }

  await user.destroy();

  return { message: 'Xóa người dùng thành công' };
};

module.exports = {
  getDashboardStats,
  getAtRiskStudents,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
