const studentService = require('../services/studentService');
const lecturerService = require('../services/lecturerService');

// ==================== STUDENTS ====================

/**
 * GET /api/v1/admin/students
 */
const getStudents = async (req, res) => {
  try {
    const filters = {
      course_year: req.query.course_year,
      major: req.query.major,
      search: req.query.search
    };
    const students = await studentService.getAllStudents(filters);
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách sinh viên'
    });
  }
};

/**
 * GET /api/v1/admin/students/:id
 */
const getStudentById = async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy sinh viên'
    });
  }
};

/**
 * POST /api/v1/admin/students
 */
const createStudent = async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({
      success: true,
      data: student,
      message: 'Tạo sinh viên thành công'
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi tạo sinh viên'
    });
  }
};

/**
 * PUT /api/v1/admin/students/:id
 */
const updateStudent = async (req, res) => {
  try {
    const result = await studentService.updateStudent(req.params.id, req.body);
    res.json({
      success: true,
      data: result.student,
      hasGrades: result.hasGrades,
      message: 'Cập nhật sinh viên thành công',
      ...(result.hasGrades && {
        warning: 'Sinh viên này đã có điểm trong hệ thống'
      })
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật sinh viên'
    });
  }
};

/**
 * DELETE /api/v1/admin/students/:id
 */
const deleteStudent = async (req, res) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.json({
      success: true,
      message: 'Xóa sinh viên thành công'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi xóa sinh viên'
    });
  }
};

// ==================== LECTURERS ====================

/**
 * GET /api/v1/admin/lecturers
 */
const getLecturers = async (req, res) => {
  try {
    const filters = {
      department_id: req.query.department_id,
      search: req.query.search
    };
    const lecturers = await lecturerService.getAllLecturers(filters);
    res.json({
      success: true,
      data: lecturers
    });
  } catch (error) {
    console.error('Get lecturers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách giảng viên'
    });
  }
};

/**
 * GET /api/v1/admin/lecturers/:id
 */
const getLecturerById = async (req, res) => {
  try {
    const lecturer = await lecturerService.getLecturerById(req.params.id);
    res.json({
      success: true,
      data: lecturer
    });
  } catch (error) {
    console.error('Get lecturer error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy giảng viên'
    });
  }
};

/**
 * POST /api/v1/admin/lecturers
 */
const createLecturer = async (req, res) => {
  try {
    const lecturer = await lecturerService.createLecturer(req.body);
    res.status(201).json({
      success: true,
      data: lecturer,
      message: 'Tạo giảng viên thành công'
    });
  } catch (error) {
    console.error('Create lecturer error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi tạo giảng viên'
    });
  }
};

/**
 * PUT /api/v1/admin/lecturers/:id
 */
const updateLecturer = async (req, res) => {
  try {
    const lecturer = await lecturerService.updateLecturer(req.params.id, req.body);
    res.json({
      success: true,
      data: lecturer,
      message: 'Cập nhật giảng viên thành công'
    });
  } catch (error) {
    console.error('Update lecturer error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật giảng viên'
    });
  }
};

/**
 * DELETE /api/v1/admin/lecturers/:id
 */
const deleteLecturer = async (req, res) => {
  try {
    await lecturerService.deleteLecturer(req.params.id);
    res.json({
      success: true,
      message: 'Xóa giảng viên thành công'
    });
  } catch (error) {
    console.error('Delete lecturer error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi xóa giảng viên'
    });
  }
};

module.exports = {
  // Students
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  // Lecturers
  getLecturers,
  getLecturerById,
  createLecturer,
  updateLecturer,
  deleteLecturer
};
