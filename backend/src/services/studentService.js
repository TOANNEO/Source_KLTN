const { Student, User, Grade, Department } = require('../models');
const { hashPassword } = require('./authService');
const { Op } = require('sequelize');

/**
 * Get all students with filters
 */
const getAllStudents = async (filters = {}) => {
  const where = {};

  if (filters.course_year) {
    where.course_year = filters.course_year;
  }

  if (filters.major) {
    where.major = { [Op.like]: `%${filters.major}%` };
  }

  if (filters.search) {
    where[Op.or] = [
      { student_code: { [Op.like]: `%${filters.search}%` } },
      { full_name: { [Op.like]: `%${filters.search}%` } }
    ];
  }

  return await Student.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name']
      }
    ],
    order: [['student_code', 'ASC']]
  });
};

/**
 * Get student by ID
 */
const getStudentById = async (id) => {
  const student = await Student.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name']
      }
    ]
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  return student;
};

/**
 * Create new student
 
 */
const createStudent = async (data) => {
  const {
    email,
    password,
    first_name,
    last_name,
    student_code,
    full_name,
    major,
    course_year
  } = data;

  // Check if email exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email đã tồn tại');
  }

  // Check if student code exists
  const existingStudent = await Student.findOne({ where: { student_code } });
  if (existingStudent) {
    throw new Error('Mã sinh viên đã tồn tại');
  }

  // Hash password
  const hashedPassword = await hashPassword(password || '123456');

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    role: 'student',
    first_name,
    last_name
  });

  // Create student profile
  const student = await Student.create({
    user_id: user.id,
    student_code,
    full_name,
    major,
    course_year,
    total_credits: 0,
    gpa_cumulative: 0.00
  });

  return await getStudentById(student.id);
};

/**
 * Update student
 * UC06: Khi sửa SV đã có điểm → cảnh báo confirm trước
 */
const updateStudent = async (id, data) => {
  const student = await Student.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const {
    email,
    first_name,
    last_name,
    student_code,
    full_name,
    major,
    course_year
  } = data;

  // Check if student has grades (for warning)
  const gradeCount = await Grade.count({ where: { student_id: id } });
  const hasGrades = gradeCount > 0;

  // Check if new student code conflicts
  if (student_code && student_code !== student.student_code) {
    const existing = await Student.findOne({
      where: {
        student_code,
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      throw new Error('Mã sinh viên đã tồn tại');
    }
  }

  // Update user info
  if (email || first_name || last_name) {
    // Check if new email conflicts
    if (email && email !== student.user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: student.user_id }
        }
      });
      if (existingUser) {
        throw new Error('Email đã tồn tại');
      }
    }

    await student.user.update({
      email: email || student.user.email,
      first_name: first_name || student.user.first_name,
      last_name: last_name || student.user.last_name
    });
  }

  // Update student profile
  await student.update({
    student_code: student_code || student.student_code,
    full_name: full_name || student.full_name,
    major: major || student.major,
    course_year: course_year || student.course_year
  });

  return {
    student: await getStudentById(id),
    hasGrades
  };
};

/**
 * Delete student
 */
const deleteStudent = async (id) => {
  const student = await Student.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  // Check if student has grades
  const gradeCount = await Grade.count({ where: { student_id: id } });
  if (gradeCount > 0) {
    throw new Error('Không thể xóa sinh viên đã có điểm');
  }

  // Delete student (will cascade delete user due to foreign key)
  await student.destroy();
  await student.user.destroy();

  return true;
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
