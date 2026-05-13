const departmentService = require('../services/departmentService');
const courseService = require('../services/courseService');
const semesterService = require('../services/semesterService');
const studentService = require('../services/studentService');
const lecturerService = require('../services/lecturerService');

// ==================== DEPARTMENTS ====================

/**
 * GET /api/v1/admin/departments
 */
const getDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách khoa'
    });
  }
};

/**
 * GET /api/v1/admin/departments/:id
 */
const getDepartmentById = async (req, res) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy khoa'
    });
  }
};

/**
 * POST /api/v1/admin/departments
 */
const createDepartment = async (req, res) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json({
      success: true,
      data: department,
      message: 'Tạo khoa thành công'
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi tạo khoa'
    });
  }
};

/**
 * PUT /api/v1/admin/departments/:id
 */
const updateDepartment = async (req, res) => {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    res.json({
      success: true,
      data: department,
      message: 'Cập nhật khoa thành công'
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật khoa'
    });
  }
};

/**
 * DELETE /api/v1/admin/departments/:id
 */
const deleteDepartment = async (req, res) => {
  try {
    await departmentService.deleteDepartment(req.params.id);
    res.json({
      success: true,
      message: 'Xóa khoa thành công'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi xóa khoa'
    });
  }
};

// ==================== COURSES ====================

/**
 * GET /api/v1/admin/courses
 */
const getCourses = async (req, res) => {
  try {
    const filters = {
      department_id: req.query.department_id,
      course_type: req.query.course_type,
      search: req.query.search
    };
    const courses = await courseService.getAllCourses(filters);
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách môn học'
    });
  }
};

/**
 * GET /api/v1/admin/courses/:id
 */
const getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy môn học'
    });
  }
};

/**
 * POST /api/v1/admin/courses
 */
const createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse(req.body);
    res.status(201).json({
      success: true,
      data: course,
      message: 'Tạo môn học thành công'
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi tạo môn học'
    });
  }
};

/**
 * PUT /api/v1/admin/courses/:id
 */
const updateCourse = async (req, res) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.json({
      success: true,
      data: course,
      message: 'Cập nhật môn học thành công'
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật môn học'
    });
  }
};

/**
 * DELETE /api/v1/admin/courses/:id
 */
const deleteCourse = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.json({
      success: true,
      message: 'Xóa môn học thành công'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi xóa môn học'
    });
  }
};

module.exports = {
  // Departments
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  // Courses
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
