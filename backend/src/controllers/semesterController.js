const semesterService = require('../services/semesterService');

/**
 * GET /api/v1/admin/semesters
 */
const getSemesters = async (req, res) => {
  try {
    const semesters = await semesterService.getAllSemesters();
    res.json({
      success: true,
      data: semesters
    });
  } catch (error) {
    console.error('Get semesters error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách học kỳ'
    });
  }
};

/**
 * GET /api/v1/admin/semesters/current
 */
const getCurrentSemester = async (req, res) => {
  try {
    const semester = await semesterService.getCurrentSemester();
    res.json({
      success: true,
      data: semester
    });
  } catch (error) {
    console.error('Get current semester error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không có học kỳ hiện hành'
    });
  }
};

/**
 * GET /api/v1/admin/semesters/:id
 */
const getSemesterById = async (req, res) => {
  try {
    const semester = await semesterService.getSemesterById(req.params.id);
    res.json({
      success: true,
      data: semester
    });
  } catch (error) {
    console.error('Get semester error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy học kỳ'
    });
  }
};

/**
 * POST /api/v1/admin/semesters
 */
const createSemester = async (req, res) => {
  try {
    const semester = await semesterService.createSemester(req.body);
    res.status(201).json({
      success: true,
      data: semester,
      message: 'Tạo học kỳ thành công'
    });
  } catch (error) {
    console.error('Create semester error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi tạo học kỳ'
    });
  }
};

/**
 * PUT /api/v1/admin/semesters/:id
 */
const updateSemester = async (req, res) => {
  try {
    const semester = await semesterService.updateSemester(req.params.id, req.body);
    res.json({
      success: true,
      data: semester,
      message: 'Cập nhật học kỳ thành công'
    });
  } catch (error) {
    console.error('Update semester error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật học kỳ'
    });
  }
};

/**
 * PUT /api/v1/admin/semesters/:id/set-current
 * UC08: Đặt học kỳ hiện hành (chỉ 1 học kỳ is_current=1)
 */
const setCurrentSemester = async (req, res) => {
  try {
    const semester = await semesterService.setCurrentSemester(req.params.id);
    res.json({
      success: true,
      data: semester,
      message: 'Đã đặt học kỳ hiện hành'
    });
  } catch (error) {
    console.error('Set current semester error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi đặt học kỳ hiện hành'
    });
  }
};

/**
 * DELETE /api/v1/admin/semesters/:id
 */
const deleteSemester = async (req, res) => {
  try {
    await semesterService.deleteSemester(req.params.id);
    res.json({
      success: true,
      message: 'Xóa học kỳ thành công'
    });
  } catch (error) {
    console.error('Delete semester error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi xóa học kỳ'
    });
  }
};

module.exports = {
  getSemesters,
  getCurrentSemester,
  getSemesterById,
  createSemester,
  updateSemester,
  setCurrentSemester,
  deleteSemester
};
