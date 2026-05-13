const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const catalogRoutes = require('./catalog.routes');
const adminRoutes = require('./admin.routes');
const studentRoutes = require('./student.routes');
const lecturerRoutes = require('./lecturer.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/', catalogRoutes); // Public catalog routes (courses, semesters)
router.use('/admin', adminRoutes);
router.use('/student', studentRoutes);
router.use('/lecturer', lecturerRoutes);

module.exports = router;
