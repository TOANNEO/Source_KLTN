const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Lecturer } = require('../models');

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user by email
  const user = await User.findOne({
    where: { email },
    include: [
      { model: Student, as: 'student', required: false },
      { model: Lecturer, as: 'lecturer', required: false }
    ]
  });

  if (!user) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Check password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Generate token
  const token = generateToken(user);

  // Prepare user data (exclude password)
  const userData = {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name
  };

  // Add profile data based on role
  if (user.role === 'student' && user.student) {
    userData.profile = {
      student_id: user.student.id,
      student_code: user.student.student_code,
      full_name: user.student.full_name,
      major: user.student.major,
      course_year: user.student.course_year,
      gpa_cumulative: user.student.gpa_cumulative
    };
  } else if (user.role === 'lecturer' && user.lecturer) {
    userData.profile = {
      lecturer_id: user.lecturer.id,
      lecturer_code: user.lecturer.lecturer_code,
      degree: user.lecturer.degree
    };
  }

  return { token, user: userData };
};

/**
 * Change password
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  // Find user
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  // Verify old password
  const isValidPassword = await comparePassword(oldPassword, user.password);
  if (!isValidPassword) {
    throw new Error('Mật khẩu cũ không đúng');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await user.update({ password: hashedPassword });

  return true;
};

/**
 * Get user by ID with profile
 */
const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Student, as: 'student', required: false },
      { model: Lecturer, as: 'lecturer', required: false }
    ]
  });

  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  return user;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  login,
  changePassword,
  getUserById
};
