const express = require('express');
const router = express.Router();
const { query, param, body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validate');
const lecturerController = require('../controllers/lecturerController');
const { authenticateToken } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/authorize');

// All lecturer routes require authentication and lecturer role
router.use(authenticateToken);
router.use(requireRole('lecturer'));

// ==================== DASHBOARD ====================

// GET /api/v1/lecturer/dashboard
router.get('/dashboard', lecturerController.getDashboard);

// ==================== UC22: AT-RISK STUDENTS ====================

// GET /api/v1/lecturer/at-risk-students
// UC22: Get at-risk students with filters
router.get('/at-risk-students',
  [
    query('semester_id')
      .optional()
      .isInt().withMessage('ID học kỳ không hợp lệ'),
    query('predicted_gpa_threshold')
      .optional()
      .isFloat({ min: 0, max: 10 }).withMessage('Ngưỡng GPA phải từ 0.0 đến 10.0'),
    query('stress_level')
      .optional()
      .isInt({ min: 0, max: 10 }).withMessage('Mức stress phải từ 0 đến 10'),
    handleValidationErrors
  ],
  lecturerController.getAtRiskStudents
);

// GET /api/v1/lecturer/students/:id/report
// Get detailed student report
router.get('/students/:id/report',
  [
    param('id').isInt().withMessage('ID sinh viên không hợp lệ'),
    handleValidationErrors
  ],
  lecturerController.getStudentReport
);

// ==================== UC23: IMPROVEMENT REPORT ====================

// GET /api/v1/lecturer/improvement-report
// UC23: Get improvement effectiveness report
router.get('/improvement-report',
  [
    query('semester_id')
      .optional()
      .isInt().withMessage('ID học kỳ không hợp lệ'),
    query('student_id')
      .optional()
      .isInt().withMessage('ID sinh viên không hợp lệ'),
    handleValidationErrors
  ],
  lecturerController.getImprovementReport
);

// ==================== EXPORT ====================

// POST /api/v1/lecturer/reports/export
// Export reports to Excel/PDF
router.post('/reports/export',
  [
    body('report_type')
      .isIn(['at-risk', 'improvement']).withMessage('Loại báo cáo không hợp lệ'),
    body('format')
      .isIn(['excel', 'pdf']).withMessage('Format phải là excel hoặc pdf'),
    body('filters')
      .optional()
      .isObject().withMessage('Filters phải là object'),
    handleValidationErrors
  ],
  lecturerController.exportReport
);

module.exports = router;
