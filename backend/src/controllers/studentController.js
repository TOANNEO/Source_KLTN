const studentProfileService = require('../services/studentProfileService');
const behaviorService = require('../services/behaviorService');
const predictionService = require('../services/predictionService');
const improvementService = require('../services/improvementService');

// ==================== PROFILE & GRADES ====================

/**
 * GET /api/v1/student/dashboard
 * UC14: Dashboard với GPA tích lũy, biểu đồ, thống kê
 */
const getDashboard = async (req, res) => {
  try {
    const dashboard = await studentProfileService.getStudentDashboard(req.user.id);

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin dashboard'
    });
  }
};

/**
 * GET /api/v1/student/profile
 * UC14: Xem hồ sơ bản thân + GPA tích lũy
 */
const getProfile = async (req, res) => {
  try {
    const profile = await studentProfileService.getStudentProfile(req.user.id);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy hồ sơ sinh viên'
    });
  }
};

/**
 * GET /api/v1/student/grades
 * UC14: Bảng điểm toàn khóa
 */
const getGrades = async (req, res) => {
  try {
    const filters = {
      semester_id: req.query.semester_id
    };

    const grades = await studentProfileService.getStudentGrades(req.user.id, filters);

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy bảng điểm'
    });
  }
};

/**
 * GET /api/v1/student/grades/semester/:id
 * UC14: Điểm theo học kỳ
 */
const getGradesBySemester = async (req, res) => {
  try {
    const result = await studentProfileService.getGradesBySemester(
      req.user.id,
      req.params.id
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get grades by semester error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy điểm theo học kỳ'
    });
  }
};

/**
 * GET /api/v1/student/gpa-history
 * Get GPA history for chart
 */
const getGPAHistory = async (req, res) => {
  try {
    const history = await studentProfileService.getGPAHistory(req.user.id);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get GPA history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy lịch sử GPA'
    });
  }
};

// ==================== BEHAVIOR RECORDS ====================

/**
 * GET /api/v1/student/behavior/current
 * UC15: Xem chỉ số hành vi học kỳ hiện tại
 */
const getCurrentBehavior = async (req, res) => {
  try {
    const behavior = await behaviorService.getCurrentBehavior(req.user.id);

    if (!behavior) {
      return res.json({
        success: true,
        data: null,
        message: 'Chưa có dữ liệu hành vi cho học kỳ hiện tại'
      });
    }

    res.json({
      success: true,
      data: behavior
    });
  } catch (error) {
    console.error('Get current behavior error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy chỉ số hành vi'
    });
  }
};

/**
 * GET /api/v1/student/behavior
 * Get all behavior records
 */
const getBehaviorRecords = async (req, res) => {
  try {
    const behaviors = await behaviorService.getAllBehaviors(req.user.id);

    res.json({
      success: true,
      data: behaviors
    });
  } catch (error) {
    console.error('Get behavior records error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách hành vi'
    });
  }
};

/**
 * POST /api/v1/student/behavior
 * UC15: Tạo/cập nhật chỉ số hành vi
 */
const createOrUpdateBehavior = async (req, res) => {
  try {
    const behavior = await behaviorService.createOrUpdateBehavior(
      req.user.id,
      req.body
    );

    res.json({
      success: true,
      data: behavior,
      message: 'Cập nhật chỉ số hành vi thành công'
    });
  } catch (error) {
    console.error('Create/update behavior error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật chỉ số hành vi'
    });
  }
};

/**
 * DELETE /api/v1/student/behavior/:semesterId
 * Delete behavior record
 */
const deleteBehavior = async (req, res) => {
  try {
    await behaviorService.deleteBehavior(req.user.id, req.params.semesterId);

    res.json({
      success: true,
      message: 'Xóa dữ liệu hành vi thành công'
    });
  } catch (error) {
    console.error('Delete behavior error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi xóa dữ liệu hành vi'
    });
  }
};

// ==================== PREDICTIONS & IMPROVEMENTS ====================

/**
 * POST /api/v1/student/predict
 * UC17: Dự báo kết quả học tập
 * UC18: Phân loại nguy cơ
 */
const runPrediction = async (req, res) => {
  try {
    const { semester_id } = req.body;

    const result = await predictionService.runPrediction(req.user.id, semester_id);

    res.json({
      success: true,
      data: result,
      message: 'Dự báo thành công'
    });
  } catch (error) {
    console.error('Run prediction error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi chạy dự báo'
    });
  }
};

/**
 * GET /api/v1/student/prediction/history
 * Get prediction history
 */
const getPredictionHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const history = await predictionService.getPredictionHistory(req.user.id, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get prediction history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy lịch sử dự báo'
    });
  }
};

/**
 * GET /api/v1/student/prediction/latest
 * Get latest prediction
 */
const getLatestPrediction = async (req, res) => {
  try {
    const prediction = await predictionService.getLatestPrediction(req.user.id);

    if (!prediction) {
      return res.json({
        success: true,
        data: null,
        message: 'Chưa có dự báo nào'
      });
    }

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Get latest prediction error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy dự báo gần nhất'
    });
  }
};

/**
 * POST /api/v1/student/improvement-suggestions
 *  Hỗ trợ  ra quyết định học cải thiện GPA
 */
const getImprovementSuggestions = async (req, res) => {
  try {
    const { target_gpa } = req.body;

    const result = await improvementService.getImprovementPlan(req.user.id, target_gpa);

    res.json({
      success: result.success,
      data: result,
      message: result.message
    });
  } catch (error) {
    console.error('Get improvement suggestions error:', error);

    if (error.code === 'INVALID_TARGET') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tính toán gợi ý cải thiện'
    });
  }
};

module.exports = {
  // Profile & Grades
  getDashboard,
  getProfile,
  getGrades,
  getGradesBySemester,
  getGPAHistory,
  // Behavior
  getCurrentBehavior,
  getBehaviorRecords,
  createOrUpdateBehavior,
  deleteBehavior,
  // Predictions & Improvements
  runPrediction,
  getPredictionHistory,
  getLatestPrediction,
  getImprovementSuggestions
};
