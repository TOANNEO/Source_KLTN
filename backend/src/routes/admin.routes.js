const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/authorize');

// Import controllers
const adminController = require('../controllers/adminController');
const catalogController = require('../controllers/catalogController');
const semesterController = require('../controllers/semesterController');
const userManagementController = require('../controllers/userManagementController');
const gradeController = require('../controllers/gradeController');
const reportController = require('../controllers/reportController');
const backupController = require('../controllers/backupController');
const classController = require('../controllers/classController');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// ==================== DASHBOARD ====================
router.get('/dashboard', adminController.getDashboard);
router.get('/dashboard/recent-logins', adminController.getRecentLogins);

// ==================== REPORT EXPORT ====================
// GET /api/v1/admin/grades/export?format=excel&semester_id=1
router.get('/grades/export', reportController.exportGrades);

// ==================== BACKUP & RESTORE ====================
// POST /api/v1/admin/backups - Create new backup
router.post('/backups', backupController.createBackup);

// GET /api/v1/admin/backups - List all backups
router.get('/backups', backupController.listBackups);

// GET /api/v1/admin/backups/:id/download - Download backup file
router.get('/backups/:id/download',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  backupController.downloadBackup
);

// DELETE /api/v1/admin/backups/:id - Delete backup
router.delete('/backups/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  backupController.deleteBackup
);

// POST /api/v1/admin/backups/:id/restore - Restore from backup
router.post('/backups/:id/restore',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  backupController.restoreBackup
);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminController.getUsers);
router.post('/users',
  [ 
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email là bắt buộc')
      .isEmail() .withMessage('Email không hợp lệ')
      .matches(/^[a-zA-Z0-9._%+-]+@tlu\.edu\.vn$/)
      .withMessage('Email phải có dạng @tlu.edu.vn'),
    body('password')
      .optional()
      .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
      .matches(/^\S+$/).withMessage('Mật khẩu không được chứa khoảng trắng'),
    body('first_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+$/)
      .withMessage('Họ chỉ được chứa chữ cái và không được chứa khoảng trắng')
      .notEmpty().withMessage('Họ là bắt buộc')
      .isLength({ max: 50 }).withMessage('Họ tối đa 50 ký tự')
      .custom((value) => {

    if (value.trim() !== value) {
      throw new Error('Họ không được có khoảng trắng đầu hoặc cuối');
    }

    if (/\s{2,}/.test(value)) {
      throw new Error('Họ không được chứa nhiều khoảng trắng liên tiếp');
    }

    return true;
  }),
    body('last_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+$/)
      .withMessage('Tên chỉ được chứa chữ cái và không được chứa khoảng trắng')
      .notEmpty().withMessage('Tên là bắt buộc')
      .isLength({ max: 50 }).withMessage('Tên tối đa 50 ký tự')
      .custom((value) => {

    if (value.trim() !== value) {
      throw new Error('Tên không được có khoảng trắng đầu hoặc cuối');
    }

    if (/\s{2,}/.test(value)) {
      throw new Error('Tên không được chứa nhiều khoảng trắng liên tiếp');
    }

    return true;
  }),
    handleValidationErrors
  ]
  , 
  adminController.createUser);
router.put('/users/:id',
  [ body('first_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+$/)
      .withMessage('Họ chỉ được chứa chữ cái và không được chứa khoảng trắng')
      .notEmpty().withMessage('Họ là bắt buộc')
      .isLength({ max: 50 }).withMessage('Họ tối đa 50 ký tự')
      .custom((value) => {

    if (value.trim() !== value) {
      throw new Error('Họ không được có khoảng trắng đầu hoặc cuối');
    }

    if (/\s{2,}/.test(value)) {
      throw new Error('Họ không được chứa nhiều khoảng trắng liên tiếp');
    }

    return true;
  }),
    body('last_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+$/)
      .withMessage('Tên chỉ được chứa chữ cái và không được chứa khoảng trắng')
      .notEmpty().withMessage('Tên là bắt buộc')
      .isLength({ max: 50 }).withMessage('Tên tối đa 50 ký tự')
      .custom((value) => {

    if (value.trim() !== value) {
      throw new Error('Tên không được có khoảng trắng đầu hoặc cuối');
    }

    if (/\s{2,}/.test(value)) {
      throw new Error('Tên không được chứa nhiều khoảng trắng liên tiếp');
    }

    return true;
  }),
    handleValidationErrors
  ]
  , adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// ==================== DEPARTMENTS ====================

// GET /api/v1/admin/departments
router.get('/departments', catalogController.getDepartments);

// GET /api/v1/admin/departments/:id
router.get('/departments/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  catalogController.getDepartmentById
);

// POST /api/v1/admin/departments
router.post('/departments',
  [
    body('code')
      .notEmpty().withMessage('Mã khoa là bắt buộc')
      .isLength({ max: 20 }).withMessage('Mã khoa tối đa 20 ký tự'),
    body('name')
      .notEmpty().withMessage('Tên khoa là bắt buộc')
      .isLength({ max: 255 }).withMessage('Tên khoa tối đa 255 ký tự'),
    handleValidationErrors
  ],
  catalogController.createDepartment
);

// PUT /api/v1/admin/departments/:id
router.put('/departments/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('code')
      .optional()
      .isLength({ max: 20 }).withMessage('Mã khoa tối đa 20 ký tự'),
    body('name')
      .optional()
      .isLength({ max: 255 }).withMessage('Tên khoa tối đa 255 ký tự'),
    handleValidationErrors
  ],
  catalogController.updateDepartment
);

// DELETE /api/v1/admin/departments/:id
router.delete('/departments/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  catalogController.deleteDepartment
);

// ==================== COURSES ====================

// GET /api/v1/admin/courses
router.get('/courses', catalogController.getCourses);

// GET /api/v1/admin/courses/:id
router.get('/courses/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  catalogController.getCourseById
);

// POST /api/v1/admin/courses
router.post('/courses',
  [
    body('course_code')
      .trim()
      .notEmpty().withMessage('Mã môn học là bắt buộc')
      .isLength({ max: 20 }).withMessage('Mã môn học tối đa 20 ký tự')
      .isLength({ min: 5}).withMessage('Mã môn học phải có ít nhất 5 ký tự')
      .matches(/^[A-Za-zÀ-ỹ0-9]+$/).withMessage('Mã môn học chỉ chứa số hoặc chữ cái và không được chứa khoảng trắng'),
    body('course_name')
      .trim()
      .notEmpty()
      .withMessage('Tên môn học là bắt buộc')
      .isLength({ max: 255 })
      .withMessage('Tên môn học tối đa 255 ký tự')
      .trim()
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
      .withMessage('Tên môn học không được phép chứa ký tự đặc biệt hoặc số'),
    body('credits')
      .isInt({ min: 1, max: 10 }).withMessage('Số tín chỉ phải từ 1-10'),
    body('course_type')
      .optional()
      .isIn(['required', 'elective']).withMessage('Loại môn học không hợp lệ'),
    body('department_id')
      .optional()
      .isInt().withMessage('ID khoa không hợp lệ'),
    handleValidationErrors
  ],
  catalogController.createCourse
);

// PUT /api/v1/admin/courses/:id
router.put('/courses/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('course_code')
      .trim()
      .optional()
      .isLength({ max: 20 }).withMessage('Mã môn học tối đa 20 ký tự')
      .isLength({ min: 5 }).withMessage('Mã môn học phải có ít nhất 5 ký tự')
      .matches(/^[A-Za-zÀ-ỹ0-9]+$/).withMessage('Mã môn học chỉ chứa số hoặc chữ cái và không được chứa khoảng trắng'),
    body('course_name')
      .trim()
      .optional()
      .isLength({ max: 255 })
      .withMessage('Tên môn học tối đa 255 ký tự')
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
      .withMessage('Tên môn học không được phép chứa ký tự đặc biệt hoặc số'),
    body('credits')
      .optional()
      .isInt({ min: 1, max: 10 }).withMessage('Số tín chỉ phải từ 1-10'),
    body('course_type')
      .optional()
      .isIn(['required', 'elective']).withMessage('Loại môn học không hợp lệ'),
    body('department_id')
      .optional()
      .isInt().withMessage('ID khoa không hợp lệ'),
    handleValidationErrors
  ],
  catalogController.updateCourse
);

// DELETE /api/v1/admin/courses/:id
router.delete('/courses/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  catalogController.deleteCourse
);

// ==================== SEMESTERS ====================

// GET /api/v1/admin/semesters 
router.get('/semesters', semesterController.getSemesters);

// GET /api/v1/admin/semesters/current
router.get('/semesters/current', semesterController.getCurrentSemester);

// GET /api/v1/admin/semesters/:id
router.get('/semesters/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  semesterController.getSemesterById
);

// POST /api/v1/admin/semesters
router.post('/semesters',
  [
    body('semester_name')
      .trim()
      .notEmpty()
      .withMessage('Tên học kì là bắt buộc')
      .matches(/^[A-Za-zÀ-ỹ0-9\s]+$/)
      .withMessage('Tên học kì không được chứa ký tự đặc biệt')
      .isLength({ max: 100 }).withMessage('Tên học kì tối đa 100 ký tự'),
    body('academic_year')
      .trim()
      .notEmpty().withMessage('Năm học là bắt buộc')
      .matches(/^\d{4}-\d{4}$/).withMessage('Năm học phải có định dạng YYYY-YYYY'),
    body('start_date')
      .optional()
      .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
    body('end_date')
      .optional()
      .isISO8601().withMessage('Ngày kết thúc không hợp lệ'),
    body('is_current')
      .optional()
      .isBoolean().withMessage('is_current phải là boolean'),
    handleValidationErrors
  ],
  semesterController.createSemester
);

// PUT /api/v1/admin/semesters/:id
router.put('/semesters/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('name')
      .trim()
      .optional()
      .isLength({ max: 100 }).withMessage('Tên học kỳ tối đa 100 ký tự'),
    body('academic_year')
      .optional()
      .matches(/^\d{4}-\d{4}$/).withMessage('Năm học phải có định dạng YYYY-YYYY'),
    body('start_date')
      .optional()
      .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
    body('end_date')
      .optional()
      .isISO8601().withMessage('Ngày kết thúc không hợp lệ'),
    body('is_current')
      .optional()
      .isBoolean().withMessage('is_current phải là boolean'),
    handleValidationErrors
  ],
  semesterController.updateSemester
);

// PUT /api/v1/admin/semesters/:id/set-current
// UC08: Đặt học kỳ hiện hành
router.put('/semesters/:id/set-current',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  semesterController.setCurrentSemester
);

// DELETE /api/v1/admin/semesters/:id
router.delete('/semesters/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  semesterController.deleteSemester
);

// ==================== STUDENTS ====================

// GET /api/v1/admin/students
router.get('/students', userManagementController.getStudents);

// GET /api/v1/admin/students/:id
router.get('/students/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  userManagementController.getStudentById
);

// POST /api/v1/admin/students
router.post('/students',
  [
    body('email')
      .matches(/^[a-zA-Z0-9._%+-]+@tlu\.edu\.vn$/)
      .withMessage('Email phải có dạng @tlu.edu.vn'),
    body('password')
      .optional()
      .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('first_name')
      .notEmpty().withMessage('Họ là bắt buộc'),
    body('last_name')
      .notEmpty().withMessage('Tên là bắt buộc'),
    body('student_code')
      .notEmpty().withMessage('Mã sinh viên là bắt buộc')
      .isLength({ max: 20 }).withMessage('Mã sinh viên tối đa 20 ký tự'),
    body('major')
      .trim()
      .optional(),
    body('class_name')
      .trim()
      .optional(),
    body('course_year')
      .isInt({ min: 2000, max: 2100 }).withMessage('Khóa học không hợp lệ')
  ],
  handleValidationErrors,
  userManagementController.createStudent
);

// PUT /api/v1/admin/students/:id
router.put('/students/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email là bắt buộc')
      .matches(/^[a-zA-Z0-9._%+-]+@tlu\.edu\.vn$/)
      .withMessage('Email phải có dạng @tlu.edu.vn')
      .optional(),
    body('first_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+(?: [A-Za-zÀ-ỹ]+)*$/)
      .withMessage('Họ chỉ được chứa chữ cái và khoảng trắng')
      .isLength({ max: 50 }).withMessage('Họ tối đa 50 ký tự')
      .optional(),
    body('last_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+(?: [A-Za-zÀ-ỹ]+)*$/)
      .withMessage('Tên chỉ được chứa chữ cái và khoảng trắng')
      .isLength({ max: 50 }).withMessage('Tên tối đa 50 ký tự')
      .optional(),
    body('student_code')
      .optional()
      .isLength({ max: 20 }).withMessage('Mã sinh viên tối đa 20 ký tự'),
    body('full_name')
      .optional(),
    body('major')
      .optional(),
    body('course_year')
      .trim()
      .optional()
      .isInt({ min: 2000, max: 2100 }).withMessage('Khóa học không hợp lệ'),
    handleValidationErrors
  ],
  userManagementController.updateStudent
);

// DELETE /api/v1/admin/students/:id
router.delete('/students/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  userManagementController.deleteStudent
);

// PUT /api/v1/admin/students/:id/toggle-active
router.put('/students/:id/toggle-active',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  userManagementController.toggleStudentActive
);

// PUT /api/v1/admin/students/:id/reset-password
router.put('/students/:id/reset-password',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('new_password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    handleValidationErrors
  ],
  userManagementController.resetStudentPassword
);

// ==================== LECTURERS ====================

// GET /api/v1/admin/lecturers
router.get('/lecturers', userManagementController.getLecturers);

// GET /api/v1/admin/lecturers/:id
router.get('/lecturers/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  userManagementController.getLecturerById
);

// POST /api/v1/admin/lecturers
router.post('/lecturers',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email là bắt buộc')
      .matches(/^[a-zA-Z0-9._%+-]+@tlu\.edu\.vn$/)
      .withMessage('Email phải có dạng @tlu.edu.vn')
      .isEmail().withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .trim()
      .optional()
      .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('first_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+$/)
      .withMessage('Họ chỉ được chứa chữ cái')
      .isLength({ max: 50 }).withMessage('Họ tối đa 50 ký tự')
      .notEmpty().withMessage('Họ là bắt buộc'),
    body('last_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+$/)
      .withMessage('Tên chỉ được chứa chữ cái')
      .isLength({ max: 50 }).withMessage('Tên tối đa 50 ký tự')
      .notEmpty().withMessage('Tên là bắt buộc'),
    body('phone')
      .trim()
      .optional()
      .isLength({ min: 10, max: 10 }).withMessage('Số điện thoại phải có 10 chữ số')
      .matches(/^(0[1-9][0-9]{8}|84[1-9][0-9]{8})$/)
      .withMessage('Số điện thoại không hợp lệ'),
    body('lecturer_code')
      .matches(/^[a-zA-Z0-9]+$/).withMessage('Mã giảng viên chỉ được chứa chữ cái hoặc số')
      .trim()
      .notEmpty().withMessage('Mã giảng viên là bắt buộc')
      .isLength({ max: 20 }).withMessage('Mã giảng viên tối đa 20 ký tự'),
    body('degree')
      .trim()
      .notEmpty().withMessage('Học vị là bắt buộc'),
    body('department_id')
      .isInt().withMessage('ID khoa không hợp lệ'),
    handleValidationErrors
  ],
  userManagementController.createLecturer
);

// PUT /api/v1/admin/lecturers/:id
router.put('/lecturers/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('email')
      .trim()
      .optional()
      .matches(/^[a-zA-Z0-9._%+-]+@tlu\.edu\.vn$/)
      .withMessage('Email phải có dạng @tlu.edu.vn')
      .normalizeEmail(),
    body('first_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+$/)
      .withMessage('Họ chỉ được chứa chữ cái và không được chứa khoảng trắng')
      .isLength({ max: 50 }).withMessage('Họ tối đa 50 ký tự')
      .optional(),
    body('last_name')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ]+(?: [A-Za-zÀ-ỹ]+)*$/)
      .withMessage('Tên chỉ được chứa chữ cái')
      .isLength({ max: 50 }).withMessage('Tên tối đa 50 ký tự')
      .optional(),
    body('lecturer_code')
      .trim()
      .optional()
      .isLength({ max: 20 }).withMessage('Mã giảng viên tối đa 20 ký tự'),
    body('phone')
      .trim()
      .optional()
      .isLength({ min: 10, max: 10 }).withMessage('Số điện thoại phải có 10 chữ số')
      .matches(/^(0[1-9][0-9]{8}|84[1-9][0-9]{8})$/)
      .withMessage('Số điện thoại không hợp lệ'),
    body('degree')
      .trim()
      .matches(/^[A-Za-zÀ-ỹ\s]+$/)
      .withMessage('Học vị chỉ được chứa chữ cái')
      .isLength({ max: 50 }).withMessage('Học vị tối đa 50 ký tự')
      .optional(),
    body('department_id')
      .trim()
      .optional()
      .isInt().withMessage('ID khoa không hợp lệ'),
    handleValidationErrors
  ],
  userManagementController.updateLecturer
);

// DELETE /api/v1/admin/lecturers/:id
router.delete('/lecturers/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  userManagementController.deleteLecturer
);

// PUT /api/v1/admin/lecturers/:id/toggle-active
router.put('/lecturers/:id/toggle-active',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  userManagementController.toggleLecturerActive
);

// PUT /api/v1/admin/lecturers/:id/reset-password
router.put('/lecturers/:id/reset-password',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('new_password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    handleValidationErrors
  ],
  userManagementController.resetLecturerPassword
);

// ==================== GRADES ====================

// GET /api/v1/admin/grades
router.get('/grades', gradeController.getGrades);

// GET /api/v1/admin/grades/:id
router.get('/grades/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  gradeController.getGradeById
);

// GET /api/v1/admin/grades/student/:studentId
router.get('/grades/student/:studentId',
  [
    param('studentId').isInt().withMessage('ID sinh viên không hợp lệ'),
    handleValidationErrors
  ],
  gradeController.getStudentGrades
);

// GET /api/v1/admin/grades/audit-log/:gradeId
// UC10: Lịch sử chỉnh sửa điểm
router.get('/grades/audit-log/:gradeId',
  [
    param('gradeId').isInt().withMessage('ID điểm không hợp lệ'),
    handleValidationErrors
  ],
  gradeController.getGradeAuditLog
);

// POST /api/v1/admin/grades
// UC09: Nhập điểm học phần
router.post('/grades',
  [
    body('student_id')
      .isInt().withMessage('ID sinh viên không hợp lệ'),
    body('course_id')
      .isInt().withMessage('ID môn học không hợp lệ'),
    body('semester_id')
      .isInt().withMessage('ID học kỳ không hợp lệ'),
    body('attendance_score')
      .optional()
      .isFloat({ min: 0, max: 10 }).withMessage('Điểm chuyên cần phải từ 0-10'),
    body('middle_exam_score')
      .isFloat({ min: 0, max: 10 }).withMessage('Điểm giữa kỳ phải từ 0-10'),
    body('assignment_score')
      .optional()
      .isFloat({ min: 0, max: 10 }).withMessage('Điểm bài tập phải từ 0-10'),
    body('final_score')
      .isFloat({ min: 0, max: 10 }).withMessage('Điểm cuối kỳ phải từ 0-10'),
    body('is_improvement')
      .optional()
      .isInt({ min: 0, max: 1 }).withMessage('is_improvement phải là 0 hoặc 1'),
    handleValidationErrors
  ],
  gradeController.createGrade
);

// PUT /api/v1/admin/grades/:id
// UC10: Cập nhật bảng điểm
router.put('/grades/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('attendance_score')
      .optional()
      .isFloat({ min: 0, max: 10 }).withMessage('Điểm chuyên cần phải từ 0-10'),
    body('middle_exam_score')
      .optional()
      .isFloat({ min: 0, max: 10 }).withMessage('Điểm giữa kỳ phải từ 0-10'),
    body('assignment_score')
      .optional()
      .isFloat({ min: 0, max: 10 }).withMessage('Điểm bài tập phải từ 0-10'),
    body('final_score')
      .optional()
      .isFloat({ min: 0, max: 10 }).withMessage('Điểm cuối kỳ phải từ 0-10'),
    body('updated_reason')
      .notEmpty().withMessage('Lý do chỉnh sửa là bắt buộc'),
    handleValidationErrors
  ],
  gradeController.updateGrade
);

// DELETE /api/v1/admin/grades/:id
router.delete('/grades/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],
  gradeController.deleteGrade
);

// ==================== CLASSES ====================

// GET /api/v1/admin/classes
router.get('/classes', classController.getClasses);

// GET /api/v1/admin/classes/students/unassigned
router.get('/classes/students/unassigned', classController.getUnassignedStudents);

// GET /api/v1/admin/classes/:id
router.get('/classes/:id',
  [param('id').isInt().withMessage('ID không hợp lệ'), handleValidationErrors],
  classController.getClassById
);

// POST /api/v1/admin/classes
router.post('/classes',
  [
    body('class_name')
      .trim()
      .notEmpty().withMessage('Tên lớp là bắt buộc')
      .isLength({ max: 50 }),
    body('department_id').isInt().withMessage('ID khoa không hợp lệ'),
    body('lecturer_id').optional({ nullable: true }).isInt().withMessage('ID giảng viên không hợp lệ'),
    handleValidationErrors
  ],
  classController.createClass
);

// PUT /api/v1/admin/classes/:id
router.put('/classes/:id',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('class_name').optional().isLength({ max: 50 }),
    body('department_id').optional().isInt().withMessage('ID khoa không hợp lệ'),
    body('lecturer_id').optional({ nullable: true }).isInt().withMessage('ID giảng viên không hợp lệ'),
    handleValidationErrors
  ],
  classController.updateClass
);

// DELETE /api/v1/admin/classes/:id
router.delete('/classes/:id',
  [param('id').isInt().withMessage('ID không hợp lệ'), handleValidationErrors],
  classController.deleteClass
);

// PUT /api/v1/admin/classes/:id/homeroom — Phân công GVCN
router.put('/classes/:id/homeroom',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('lecturer_id').optional({ nullable: true }).isInt().withMessage('ID giảng viên không hợp lệ'),
    handleValidationErrors
  ],
  classController.assignHomeroom
);

// GET /api/v1/admin/classes/:id/students — Danh sách SV trong lớp
router.get('/classes/:id/students',
  [param('id').isInt().withMessage('ID không hợp lệ'), handleValidationErrors],
  classController.getClassStudents
);

// POST /api/v1/admin/classes/:id/students — Batch thêm SV vào lớp
router.post('/classes/:id/students',
  [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('student_ids').isArray({ min: 1 }).withMessage('Danh sách sinh viên không hợp lệ'),
    handleValidationErrors
  ],
  classController.addStudentsToClass
);

// DELETE /api/v1/admin/classes/:id/students/:studentId — Xóa SV khỏi lớp
router.delete('/classes/:id/students/:studentId',
  [
    param('id').isInt().withMessage('ID lớp không hợp lệ'),
    param('studentId').isInt().withMessage('ID sinh viên không hợp lệ'),
    handleValidationErrors
  ],
  classController.removeStudentFromClass
);

module.exports = router;
