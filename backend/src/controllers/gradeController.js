const gradeService = require('../services/gradeService');

/**
 * GET /api/v1/admin/grades
 * Get all grades with filters
 */
const getGrades = async (req, res) => {
  try {
    const filters = {
      student_id: req.query.student_id,
      course_id: req.query.course_id,
      semester_id: req.query.semester_id,
      class_id: req.query.class_id,
      course_year: req.query.course_year,
      is_improvement: req.query.is_improvement
    };

    const grades = await gradeService.getAllGrades(filters);

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách điểm'
    });
  }
};

/**
 * GET /api/v1/admin/grades/:id
 * Get grade by ID
 */
const getGradeById = async (req, res) => {
  try {
    const grade = await gradeService.getGradeById(req.params.id);

    res.json({
      success: true,
      data: grade
    });
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy điểm'
    });
  }
};

/**
 * POST /api/v1/admin/grades
 * UC09: Nhập điểm học phần
 * Backend tự tính: total_score = 0.3*GK + 0.7*CK
 */
const createGrade = async (req, res) => {
  try {
    const grade = await gradeService.createGrade(req.body);

    res.status(201).json({
      success: true,
      data: grade,
      message: 'Nhập điểm thành công. GPA tích lũy đã được cập nhật.'
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi nhập điểm'
    });
  }
};

/**
 * PUT /api/v1/admin/grades/:id
 * UC10: Cập nhật bảng điểm
 * - Phải nhập lý do khi sửa
 * - Hệ thống ghi audit log
 * - Tính lại GPA tích lũy
 */
const updateGrade = async (req, res) => {
  try {
    // req.user.id is set by authenticateToken middleware
    const grade = await gradeService.updateGrade(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      data: grade,
      message: 'Cập nhật điểm thành công. GPA tích lũy đã được tính lại.'
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật điểm'
    });
  }
};

/**
 * DELETE /api/v1/admin/grades/:id
 * Delete grade
 */
const deleteGrade = async (req, res) => {
  try {
    await gradeService.deleteGrade(req.params.id);

    res.json({
      success: true,
      message: 'Xóa điểm thành công. GPA tích lũy đã được cập nhật.'
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi xóa điểm'
    });
  }
};

/**
 * GET /api/v1/admin/grades/audit-log/:gradeId
 * UC10: Lịch sử chỉnh sửa điểm
 */
const getGradeAuditLog = async (req, res) => {
  try {
    const logs = await gradeService.getGradeAuditLog(req.params.gradeId);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy lịch sử chỉnh sửa'
    });
  }
};

/**
 * GET /api/v1/admin/grades/student/:studentId
 * Get all grades for a student
 */
const getStudentGrades = async (req, res) => {
  try {
    const grades = await gradeService.getAllGrades({
      student_id: req.params.studentId
    });

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy điểm sinh viên'
    });
  }
};

module.exports = {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradeAuditLog,
  getStudentGrades
};
