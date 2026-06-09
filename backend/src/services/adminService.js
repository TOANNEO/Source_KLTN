const { User, Student, Lecturer, Course, Semester, Grade, PredictionHistory, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Get dashboard statistics — returns accountStats + gradeTrends
 */
const getDashboardStats = async () => {
  // Active / inactive per role
  const [
    adminActive, adminInactive,
    studentActive, studentInactive,
    lecturerActive, lecturerInactive
  ] = await Promise.all([
    User.count({ where: { role: 'admin',    is_active: true  } }),
    User.count({ where: { role: 'admin',    is_active: false } }),
    User.count({ where: { role: 'student',  is_active: true  } }),
    User.count({ where: { role: 'student',  is_active: false } }),
    User.count({ where: { role: 'lecturer', is_active: true  } }),
    User.count({ where: { role: 'lecturer', is_active: false } })
  ]);

  const accountStats = {
    admin:    { active: adminActive,    inactive: adminInactive    },
    student:  { active: studentActive,  inactive: studentInactive  },
    lecturer: { active: lecturerActive, inactive: lecturerInactive }
  };

  // Average grade per course per semester (for line chart)
  let gradeTrends = [];
  try {
    gradeTrends = await Grade.findAll({
      attributes: [
        'course_id',
        'semester_id',
        [sequelize.fn('AVG', sequelize.col('Grade.total_score')), 'avg_score']
      ],
      include: [
        { model: Course,   as: 'course',   attributes: ['id', 'course_code', 'course_name'] },
        { model: Semester, as: 'semester', attributes: ['id', 'name', 'academic_year', 'start_date'] }
      ],
      group: ['course_id', 'semester_id', 'course.id', 'semester.id'],
      order: [[{ model: Semester, as: 'semester' }, 'start_date', 'ASC']],
      raw: false
    });

    // Flatten for JSON serialization
    gradeTrends = gradeTrends.map(g => ({
      course_id:  g.course_id,
      semester_id: g.semester_id,
      avg_score:  parseFloat(Number(g.dataValues.avg_score || 0).toFixed(2)),
      Course:   g.course   ? { id: g.course.id,   course_code: g.course.course_code,   course_name: g.course.course_name }   : null,
      Semester: g.semester ? { id: g.semester.id, name: g.semester.name, academic_year: g.semester.academic_year, start_date: g.semester.start_date } : null
    }));
  } catch (err) {
    console.error('gradeTrends query error:', err.message);
    gradeTrends = [];
  }

  return { accountStats, gradeTrends };
};

/**
 * Get recent logins (ordered by last_login_at DESC)
 */
const getRecentLogins = async (limit = 20) => {
  return await User.findAll({
    where: { last_login_at: { [Op.not]: null } },
    attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'last_login_at'],
    order: [['last_login_at', 'DESC']],
    limit: parseInt(limit)
  });
};

/**
 * Update last_login_at timestamp for a user
 */
const updateLastLogin = async (userId) => {
  await User.update({ last_login_at: new Date() }, { where: { id: userId } });
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
  getRecentLogins,
  updateLastLogin,
  getAtRiskStudents,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
