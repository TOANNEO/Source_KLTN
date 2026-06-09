const express = require('express');
const router = express.Router();
const { query, param, body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validate');
const lecturerController = require('../controllers/lecturerController');
const classController = require('../controllers/classController');
const interventionController = require('../controllers/interventionController');
const { authenticateToken } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/authorize');

// All lecturer routes require authentication and lecturer role
router.use(authenticateToken);
router.use(requireRole('lecturer'));

// ==================== DASHBOARD ====================

// GET /api/v1/lecturer/dashboard
router.get('/dashboard', lecturerController.getDashboard);

// GET /api/v1/lecturer/dashboard/stats — UC30 thống kê
router.get('/dashboard/stats', interventionController.getDashboardStats);

// ==================== UC22: AT-RISK STUDENTS ====================

// GET /api/v1/lecturer/at-risk-students
router.get('/at-risk-students',
  [
    query('semester_id').optional().isInt().withMessage('ID học kỳ không hợp lệ'),
    query('predicted_gpa_threshold').optional().isFloat({ min: 0, max: 10 }).withMessage('Ngưỡng GPA phải từ 0.0 đến 10.0'),
    query('stress_level').optional().isInt({ min: 0, max: 10 }).withMessage('Mức stress phải từ 0 đến 10'),
    handleValidationErrors
  ],
  lecturerController.getAtRiskStudents
);

// GET /api/v1/lecturer/students/:id/report
router.get('/students/:id/report',
  [param('id').isInt().withMessage('ID sinh viên không hợp lệ'), handleValidationErrors],
  lecturerController.getStudentReport
);

// ==================== UC23: IMPROVEMENT REPORT ====================

// GET /api/v1/lecturer/improvement-report
router.get('/improvement-report',
  [
    query('semester_id').optional().isInt().withMessage('ID học kỳ không hợp lệ'),
    query('student_id').optional().isInt().withMessage('ID sinh viên không hợp lệ'),
    handleValidationErrors
  ],
  lecturerController.getImprovementReport
);

// ==================== EXPORT (UC22 legacy) ====================

// POST /api/v1/lecturer/reports/export
router.post('/reports/export',
  [
    body('report_type').isIn(['at-risk', 'improvement']).withMessage('Loại báo cáo không hợp lệ'),
    body('format').isIn(['excel', 'pdf']).withMessage('Format phải là excel hoặc pdf'),
    body('filters').optional().isObject().withMessage('Filters phải là object'),
    handleValidationErrors
  ],
  lecturerController.exportReport
);

// ==================== CLASSES (UC28) ====================

// GET /api/v1/lecturer/classes
router.get('/classes', classController.getLecturerClasses);

// GET /api/v1/lecturer/classes/:id
router.get('/classes/:id',
  [param('id').isInt().withMessage('ID không hợp lệ'), handleValidationErrors],
  classController.getLecturerClassDetail
);

// ==================== UC30+UC31: ALERTS & SEARCH ====================

// GET /api/v1/lecturer/alerts — UC31 cảnh báo real-time
router.get('/alerts', interventionController.getAlerts);

// GET /api/v1/lecturer/students/search?q= — UC30 tìm kiếm nhanh
router.get('/students/search',
  [query('q').optional().isString(), handleValidationErrors],
  interventionController.searchStudents
);

// ==================== UC32: Chi tiết hồ sơ sinh viên ====================

// GET /api/v1/lecturer/students/:id/detail
router.get('/students/:id/detail',
  [param('id').isInt().withMessage('ID sinh viên không hợp lệ'), handleValidationErrors],
  interventionController.getStudentDetail
);

// ==================== UC33: Nhật ký can thiệp ====================

// GET /api/v1/lecturer/interventions
router.get('/interventions',
  [
    query('student_id').optional().isInt(),
    query('semester_id').optional().isInt(),
    query('status').optional().isIn(['not_contacted', 'consulting', 'reminded', 'need_family']),
    handleValidationErrors
  ],
  interventionController.getInterventions
);

// POST /api/v1/lecturer/interventions
router.post('/interventions',
  [
    body('student_id').isInt().withMessage('student_id không hợp lệ'),
    body('semester_id').isInt().withMessage('semester_id không hợp lệ'),
    body('method').isIn(['direct', 'phone', 'email']).withMessage('method không hợp lệ'),
    body('content').notEmpty().withMessage('content không được để trống'),
    body('status').optional().isIn(['not_contacted', 'consulting', 'reminded', 'need_family']),
    handleValidationErrors
  ],
  interventionController.createIntervention
);

// PUT /api/v1/lecturer/interventions/:id
router.put('/interventions/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('method').optional().isIn(['direct', 'phone', 'email']),
    body('status').optional().isIn(['not_contacted', 'consulting', 'reminded', 'need_family']),
    handleValidationErrors
  ],
  interventionController.updateIntervention
);

// GET /api/v1/lecturer/interventions/template — sinh mẫu nội dung UC33
router.get('/interventions/template',
  [
    query('student_id').isInt().withMessage('student_id không hợp lệ'),
    query('semester_id').isInt().withMessage('semester_id không hợp lệ'),
    handleValidationErrors
  ],
  interventionController.getInterventionTemplate
);

// POST /api/v1/lecturer/interventions/:id/approve-rejection
router.post('/interventions/:id/approve-rejection',
  [param('id').isInt().withMessage('ID không hợp lệ'), handleValidationErrors],
  interventionController.approveRejection
);

// POST /api/v1/lecturer/interventions/:id/deny-rejection
router.post('/interventions/:id/deny-rejection',
  [param('id').isInt().withMessage('ID không hợp lệ'), handleValidationErrors],
  interventionController.denyRejection
);

// ==================== UC35: Báo cáo ====================

// GET /api/v1/lecturer/report/risk-ratio
router.get('/report/risk-ratio',
  [
    query('semester_id').optional().isInt(),
    query('class_id').optional().isInt(),
    handleValidationErrors
  ],
  interventionController.getRiskRatioReport
);

// GET /api/v1/lecturer/report/intervention-roi
router.get('/report/intervention-roi',
  [query('semester_id').isInt().withMessage('semester_id không hợp lệ'), handleValidationErrors],
  interventionController.getInterventionROIReport
);

// GET /api/v1/lecturer/report/export
router.get('/report/export',
  [
    query('semester_id').isInt().withMessage('semester_id không hợp lệ'),
    query('format').isIn(['excel', 'pdf']).withMessage('format phải là excel hoặc pdf'),
    handleValidationErrors
  ],
  interventionController.exportReport
);

module.exports = router;
