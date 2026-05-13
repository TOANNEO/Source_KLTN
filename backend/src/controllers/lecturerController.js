const lecturerService = require('../services/lecturerService');

// ==================== DASHBOARD ====================

/**
 * GET /api/v1/lecturer/dashboard
 * Lecturer dashboard overview
 */
const getDashboard = async (req, res) => {
  try {
    // Get current semester at-risk students count
    const atRiskStudents = await lecturerService.getAtRiskStudents({});

    const dashboard = {
      total_at_risk: atRiskStudents.length,
      risk_breakdown: {
        danger: atRiskStudents.filter(s => s.risk_label === 'danger').length,
        warning: atRiskStudents.filter(s => s.risk_label === 'warning').length,
        safe: atRiskStudents.filter(s => s.risk_label === 'safe').length
      },
      recent_predictions: atRiskStudents.slice(0, 10)
    };

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

// ==================== UC22: AT-RISK STUDENTS ====================

/**
 * GET /api/v1/lecturer/at-risk-students
 * UC22: Get at-risk students with filters
 */
const getAtRiskStudents = async (req, res) => {
  try {
    const filters = {
      semester_id: req.query.semester_id,
      predicted_gpa_threshold: req.query.predicted_gpa_threshold,
      stress_level: req.query.stress_level
    };

    const students = await lecturerService.getAtRiskStudents(filters);

    res.json({
      success: true,
      data: {
        total: students.length,
        students
      },
      message: students.length === 0
        ? 'Không có sinh viên nguy cơ theo tiêu chí lọc'
        : `Tìm thấy ${students.length} sinh viên nguy cơ`
    });
  } catch (error) {
    console.error('Get at-risk students error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách sinh viên nguy cơ'
    });
  }
};

/**
 * GET /api/v1/lecturer/students/:id/report
 * Get detailed student report
 */
const getStudentReport = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);

    const report = await lecturerService.getStudentDetailReport(studentId);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get student report error:', error);
    res.status(error.message === 'Không tìm thấy sinh viên' ? 404 : 500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy báo cáo sinh viên'
    });
  }
};

// ==================== UC23: IMPROVEMENT REPORT ====================

/**
 * GET /api/v1/lecturer/improvement-report
 * UC23: Get improvement effectiveness report
 */
const getImprovementReport = async (req, res) => {
  try {
    const filters = {
      semester_id: req.query.semester_id,
      student_id: req.query.student_id
    };

    const report = await lecturerService.getImprovementReport(filters);

    res.json({
      success: true,
      data: report,
      message: report.improvements.length === 0
        ? 'Chưa có dữ liệu cải thiện'
        : `Tìm thấy ${report.improvements.length} bản ghi cải thiện`
    });
  } catch (error) {
    console.error('Get improvement report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy báo cáo hiệu quả cải thiện'
    });
  }
};

// ==================== EXPORT ====================

/**
 * POST /api/v1/lecturer/reports/export
 * Export reports to Excel/PDF
 */
const exportReport = async (req, res) => {
  try {
    const { report_type, format, filters } = req.body;

    // Validate format
    if (!['excel', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Format không hợp lệ. Chỉ hỗ trợ excel hoặc pdf'
      });
    }

    let data;
    let filename;

    // Get data based on report type
    if (report_type === 'at-risk') {
      data = await lecturerService.getAtRiskStudents(filters || {});
      filename = `at-risk-students-${Date.now()}`;
    } else if (report_type === 'improvement') {
      data = await lecturerService.getImprovementReport(filters || {});
      filename = `improvement-report-${Date.now()}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Loại báo cáo không hợp lệ'
      });
    }

    // TODO: Implement actual export logic with xlsx/pdfkit
    // For now, return JSON data
    res.json({
      success: true,
      message: `Export ${format.toUpperCase()} - Coming soon`,
      data: {
        filename: `${filename}.${format}`,
        record_count: Array.isArray(data) ? data.length : data.improvements?.length || 0
      }
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xuất báo cáo'
    });
  }
};

module.exports = {
  getDashboard,
  getAtRiskStudents,
  getStudentReport,
  getImprovementReport,
  exportReport
};
