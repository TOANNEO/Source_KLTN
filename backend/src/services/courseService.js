const { Course, Department, Grade } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all courses with filters
 */
const getAllCourses = async (filters = {}) => {
  const where = {};

  if (filters.department_id) {
    where.department_id = filters.department_id;
  }

  if (filters.course_type) {
    where.course_type = filters.course_type;
  }

  if (filters.search) {
    where[Op.or] = [
      { course_code: { [Op.like]: `%${filters.search}%` } },
      { course_name: { [Op.like]: `%${filters.search}%` } }
    ];
  }

  return await Course.findAll({
    where,
    include: [{ model: Department, as: 'department' }],
    order: [['course_code', 'ASC']]
  });
};

/**
 * Get course by ID
 */
const getCourseById = async (id) => {
  const course = await Course.findByPk(id, {
    include: [{ model: Department, as: 'department' }]
  });

  if (!course) {
    throw new Error('Không tìm thấy môn học');
  }

  return course;
};

/**
 * Create new course
 */
const createCourse = async (data) => {
  const { course_code, course_name, credits, course_type, department_id } = data;

  // Check if course code already exists
  const existing = await Course.findOne({ where: { course_code } });
  if (existing) {
    throw new Error('Mã môn học đã tồn tại');
  }

  // Validate department exists
  if (department_id) {
    const department = await Department.findByPk(department_id);
    if (!department) {
      throw new Error('Không tìm thấy khoa');
    }
  }

  return await Course.create({
    course_code,
    course_name,
    credits,
    course_type: course_type || 'required',
    department_id
  });
};

/**
 * Update course
 */
const updateCourse = async (id, data) => {
  const course = await Course.findByPk(id);
  if (!course) {
    throw new Error('Không tìm thấy môn học');
  }

  const { course_code, course_name, credits, course_type, department_id } = data;

  // Check if new code conflicts
  if (course_code && course_code !== course.course_code) {
    const existing = await Course.findOne({ where: { course_code } });
    if (existing) {
      throw new Error('Mã môn học đã tồn tại');
    }
  }

  // Validate department if changed
  if (department_id && department_id !== course.department_id) {
    const department = await Department.findByPk(department_id);
    if (!department) {
      throw new Error('Không tìm thấy khoa');
    }
  }

  return await course.update({
    course_code,
    course_name,
    credits,
    course_type,
    department_id
  });
};

/**
 * Delete course
 */
const deleteCourse = async (id) => {
  const course = await Course.findByPk(id);
  if (!course) {
    throw new Error('Không tìm thấy môn học');
  }

  // Check if course has grades
  const gradeCount = await Grade.count({ where: { course_id: id } });
  if (gradeCount > 0) {
    throw new Error('Không thể xóa môn học đã có điểm');
  }

  await course.destroy();
  return true;
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
