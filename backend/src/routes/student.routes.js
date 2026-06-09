const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validate');
const studentController = require('../controllers/studentController');
const classController = require('../controllers/classController');
const interventionController = require('../controllers/interventionController');
const { authenticateToken } = require('../middleware/authenticate');
const { requireStudent } = require('../middleware/authorize');

// All student routes require authentication and student role
router.use(authenticateToken);
router.use(requireStudent);

// ==================== PROFILE & GRADES ====================

// GET /api/v1/student/dashboard
// UC14: Dashboard với GPA tích lũy, biểu đồ, thống kê
router.get('/dashboard', studentController.getDashboard);

// GET /api/v1/student/profile
// UC14: Xem hồ sơ bản thân + GPA tích lũy
router.get('/profile', studentController.getProfile);

// GET /api/v1/student/grades
// UC14: Bảng điểm toàn khóa
router.get('/grades', studentController.getGrades);

// GET /api/v1/student/grades/semester/:id
// UC14: Điểm theo học kỳ
router.get('/grades/semester/:id',
  [
    param('id').isInt().withMessage('ID học kỳ không hợp lệ'),
    handleValidationErrors
  ],
  studentController.getGradesBySemester
);

// GET /api/v1/student/gpa-history
// Get GPA history for chart
router.get('/gpa-history', studentController.getGPAHistory);

// ==================== BEHAVIOR RECORDS ====================

// GET /api/v1/student/behavior/current
// UC15: Xem chỉ số hành vi học kỳ hiện tại
router.get('/behavior/current', studentController.getCurrentBehavior);

// GET /api/v1/student/behavior
// Get all behavior records
router.get('/behavior', studentController.getBehaviorRecords);

// POST /api/v1/student/behavior
// UC15: Tạo/cập nhật chỉ số hành vi
router.post('/behavior',
  [
    body('study_hours_per_day')
      .isFloat({ min: 0, max: 16 }).withMessage('Số giờ tự học phải từ 0-16 giờ/ngày'),
    body('sleep_hours_per_day')
      .isFloat({ min: 0, max: 12 }).withMessage('Số giờ ngủ phải từ 0-12 giờ/ngày'),
    body('class_attendance')
      .isFloat({ min: 0, max: 100 }).withMessage('Tỷ lệ đi học phải từ 0-100%'),
    body('social_media_hours')
      .optional()
      .isFloat({ min: 0, max: 24 }).withMessage('Số giờ dùng mạng xã hội phải từ 0-24 giờ/ngày'),
    body('screen_time_hours')
      .optional()
      .isFloat({ min: 0, max: 24 }).withMessage('Thời gian sử dụng màn hình phải từ 0-24 giờ/ngày'),
    body('mental_stress_level')
      .isInt({ min: 0, max: 9 }).withMessage('Mức độ căng thẳng phải từ 0-9'),
    body('extracurricular_hours_per_week')
      .isFloat({ min: 0, max: 24 }).withMessage('Tỉ lệ tham gia hoạt động ngoại khóa phải từ 0-24 giờ/tuần'),
    body('exercise_hours_per_week')
      .optional()
      .isFloat({ min: 0, max: 10 }).withMessage('Số giờ tập thể dục phải từ 0-10 giờ/tuần'),
    handleValidationErrors
  ],
  studentController.createOrUpdateBehavior
);

// DELETE /api/v1/student/behavior/:semesterId
router.delete('/behavior/:semesterId',
  [
    param('semesterId').isInt().withMessage('ID học kỳ không hợp lệ'),
    handleValidationErrors
  ],
  studentController.deleteBehavior
);

// ==================== PREDICTIONS & IMPROVEMENTS ====================

// POST /api/v1/student/predict
// UC17: Dự báo kết quả học tập
// UC18: Phân loại nguy cơ
router.post('/predict',
  [
    body('semester_id')
      .optional()
      .isInt().withMessage('ID học kỳ không hợp lệ'),
    handleValidationErrors
  ],
  studentController.runPrediction
);

// GET /api/v1/student/prediction/history
// Get prediction history
router.get('/prediction/history', studentController.getPredictionHistory);

// GET /api/v1/student/prediction/latest
// Get latest prediction
router.get('/prediction/latest', studentController.getLatestPrediction);

// POST /api/v1/student/improvement-suggestions
router.post('/improvement-suggestions',
  [
    body('target_gpa')
      .isFloat({ min: 0, max: 10 }).withMessage('GPA mục tiêu phải từ 0.0 đến 10.0'),
    handleValidationErrors
  ],
  studentController.getImprovementSuggestions
);

// ==================== CLASS INFO (UC29) ====================

// GET /api/v1/student/class
router.get('/class', classController.getStudentClassInfo);

// ==================== INTERVENTION CONFIRMATION ====================

// GET /api/v1/student/interventions/pending
router.get('/interventions/pending', interventionController.getStudentInterventions);

// POST /api/v1/student/interventions/:id/accept
router.post('/interventions/:id/accept',
  [param('id').isInt().withMessage('ID không hợp lệ'), handleValidationErrors],
  interventionController.acceptIntervention
);

// POST /api/v1/student/interventions/:id/reject
router.post('/interventions/:id/reject',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('reason').optional().isString(),
    handleValidationErrors
  ],
  interventionController.rejectIntervention
);

module.exports = router;
