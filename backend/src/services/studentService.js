const { Student, User, Grade, Department, Class, Lecturer } = require('../models');
const { hashPassword } = require('./authService');
const { Op, Sequelize } = require('sequelize');

const studentIncludes = [
  {
    model: User,
    as: 'user',
    attributes: ['id', 'email', 'first_name', 'last_name', 'is_active']
  },
  {
    model: Class,
    as: 'class',
    required: false,
    attributes: ['id', 'class_name'],
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'code', 'name']
      },
      {
        model: Lecturer,
        as: 'homeroom_teacher',
        required: false,
        attributes: ['id', 'lecturer_code'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['first_name', 'last_name']
          }
        ]
      }
    ]
  }
];

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
      { '$user.first_name$': { [Op.like]: `%${filters.search}%` } },
      { '$user.last_name$': { [Op.like]: `%${filters.search}%` } },
      Sequelize.literal( `CONCAT(user.first_name, ' ', user.last_name) LIKE '%${filters.search}%'` )
    ];
  }

  return await Student.findAll({
    where,
    include: studentIncludes,
    order: [['student_code', 'ASC']]
  });
};

/**
 * Get student by ID
 */
const getStudentById = async (id) => {
  const student = await Student.findByPk(id, { include: studentIncludes });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  return student;
};

/**
 * Create new student — also creates linked user account
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
    course_year,
    class_id
  } = data;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error('Email đã tồn tại');

  const existingStudent = await Student.findOne({ where: { student_code } });
  if (existingStudent) throw new Error('Mã sinh viên đã tồn tại');

  const hashedPassword = await hashPassword(password || 'TLU@123456');

  const user = await User.create({
    email,
    password: hashedPassword,
    role: 'student',
    first_name,
    last_name,
    is_active: true
  });

  const student = await Student.create({
    user_id: user.id,
    student_code,
    full_name: full_name || `${first_name} ${last_name}`.trim(),
    major,
    course_year,
    class_id: class_id || null,
    total_credits: 0,
    gpa_cumulative: 0.00
  });

  return await getStudentById(student.id);
};

/**
 * Update student — also updates linked user fields
 * Blocked if is_active = 0
 */
const updateStudent = async (id, data) => {
  const student = await Student.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!student) throw new Error('Không tìm thấy sinh viên');

  if (!student.user.is_active) {
    const err = new Error('Tài khoản không hoạt động');
    err.status = 403;
    throw err;
  }

  const {
    email,
    first_name,
    last_name,
    student_code,
    full_name,
    major,
    course_year,
    class_id
  } = data;

  const gradeCount = await Grade.count({ where: { student_id: id } });
  const hasGrades = gradeCount > 0;

  if (student_code && student_code !== student.student_code) {
    const existing = await Student.findOne({
      where: { student_code, id: { [Op.ne]: id } }
    });
    if (existing) throw new Error('Mã sinh viên đã tồn tại');
  }

  if (email || first_name || last_name) {
    if (email && email !== student.user.email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Op.ne]: student.user_id } }
      });
      if (existingUser) throw new Error('Email đã tồn tại');
    }

    await student.user.update({
      ...(email     && { email }),
      ...(first_name && { first_name }),
      ...(last_name  && { last_name })
    });
  }

  await student.update({
    ...(student_code && { student_code }),
    ...(full_name    && { full_name }),
    ...(major        && { major }),
    ...(course_year  && { course_year }),
    ...(class_id !== undefined && { class_id: class_id || null })
  });

  return {
    student: await getStudentById(id),
    hasGrades
  };
};

/**
 * Soft-delete: set is_active = 0 on linked user
 */
const deleteStudent = async (id) => {
  const student = await Student.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!student) throw new Error('Không tìm thấy sinh viên');

  await student.user.update({ is_active: false });

  return true;
};

/**
 * Toggle is_active 0 <-> 1
 */
const toggleStudentActive = async (id) => {
  const student = await Student.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!student) throw new Error('Không tìm thấy sinh viên');

  const newState = !student.user.is_active;
  await student.user.update({ is_active: newState });

  return { is_active: newState };
};

/**
 * Reset password
 */
const resetStudentPassword = async (id, newPassword) => {
  const student = await Student.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!student) throw new Error('Không tìm thấy sinh viên');

  const hashed = await hashPassword(newPassword);
  await student.user.update({ password: hashed });

  return true;
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentActive,
  resetStudentPassword
};
