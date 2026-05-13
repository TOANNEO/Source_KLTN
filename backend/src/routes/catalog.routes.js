const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const semesterController = require('../controllers/semesterController');

// Public routes - no authentication required

// GET /api/v1/courses - Danh sách môn học
router.get('/courses', catalogController.getCourses);

// GET /api/v1/courses/:id - Chi tiết môn học
router.get('/courses/:id', catalogController.getCourseById);

// GET /api/v1/semesters - Danh sách học kỳ
router.get('/semesters', semesterController.getSemesters);

// GET /api/v1/semesters/current - Học kỳ hiện hành
router.get('/semesters/current', semesterController.getCurrentSemester);

// GET /api/v1/semesters/:id - Chi tiết học kỳ
router.get('/semesters/:id', semesterController.getSemesterById);

module.exports = router;
