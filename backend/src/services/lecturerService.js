const { Lecturer, User, Department } = require('../models');
const { hashPassword } = require('./authService');
const { Op } = require('sequelize');

/**
 * Get all lecturers with filters
 */
const getAllLecturers = async (filters = {}) => {
  const where = {};

  if (filters.department_id) {
    where.department_id = filters.department_id;
  }

  if (filters.search) {
    where[Op.or] = [
      { lecturer_code: { [Op.like]: `%${filters.search}%` } }
    ];
  }

  return await Lecturer.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name']
      },
      {
        model: Department,
        as: 'department'
      }
    ],
    order: [['lecturer_code', 'ASC']]
  });
};

/**
 * Get lecturer by ID
 */
const getLecturerById = async (id) => {
  const lecturer = await Lecturer.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name']
      },
      {
        model: Department,
        as: 'department'
      }
    ]
  });

  if (!lecturer) {
    throw new Error('Không tìm thấy giảng viên');
  }

  return lecturer;
};

/**
 * Create new lecturer
 */
const createLecturer = async (data) => {
  const {
    email,
    password,
    first_name,
    last_name,
    lecturer_code,
    degree,
    department_id
  } = data;

  // Check if email exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email đã tồn tại');
  }

  // Check if lecturer code exists
  const existingLecturer = await Lecturer.findOne({ where: { lecturer_code } });
  if (existingLecturer) {
    throw new Error('Mã giảng viên đã tồn tại');
  }

  // Validate department
  const department = await Department.findByPk(department_id);
  if (!department) {
    throw new Error('Không tìm thấy khoa');
  }

  // Hash password
  const hashedPassword = await hashPassword(password || '123456');

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    role: 'lecturer',
    first_name,
    last_name
  });

  // Create lecturer profile
  const lecturer = await Lecturer.create({
    user_id: user.id,
    lecturer_code,
    degree,
    department_id
  });

  return await getLecturerById(lecturer.id);
};

/**
 * Update lecturer
 */
const updateLecturer = async (id, data) => {
  const lecturer = await Lecturer.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!lecturer) {
    throw new Error('Không tìm thấy giảng viên');
  }

  const {
    email,
    first_name,
    last_name,
    lecturer_code,
    degree,
    department_id
  } = data;

  // Check if new lecturer code conflicts
  if (lecturer_code && lecturer_code !== lecturer.lecturer_code) {
    const existing = await Lecturer.findOne({
      where: {
        lecturer_code,
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      throw new Error('Mã giảng viên đã tồn tại');
    }
  }

  // Validate department if changed
  if (department_id && department_id !== lecturer.department_id) {
    const department = await Department.findByPk(department_id);
    if (!department) {
      throw new Error('Không tìm thấy khoa');
    }
  }

  // Update user info
  if (email || first_name || last_name) {
    // Check if new email conflicts
    if (email && email !== lecturer.user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: lecturer.user_id }
        }
      });
      if (existingUser) {
        throw new Error('Email đã tồn tại');
      }
    }

    await lecturer.user.update({
      email: email || lecturer.user.email,
      first_name: first_name || lecturer.user.first_name,
      last_name: last_name || lecturer.user.last_name
    });
  }

  // Update lecturer profile
  await lecturer.update({
    lecturer_code: lecturer_code || lecturer.lecturer_code,
    degree: degree || lecturer.degree,
    department_id: department_id || lecturer.department_id
  });

  return await getLecturerById(id);
};

/**
 * Delete lecturer
 */
const deleteLecturer = async (id) => {
  const lecturer = await Lecturer.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!lecturer) {
    throw new Error('Không tìm thấy giảng viên');
  }

  // Delete lecturer and user
  await lecturer.destroy();
  await lecturer.user.destroy();

  return true;
};

// ==================== UC22: AT-RISK STUDENTS ====================

/**
 * UC22: Get at-risk students with filters
 * @param {Object} filters - { semester_id, predicted_gpa_threshold, stress_level }
 * @returns {Promise<Array>} List of at-risk students
 */
const getAtRiskStudents = async (filters = {}) => {
  const { Student, PredictionHistory, BehaviorRecord, Semester, User } = require('../models');

  const where = {};
  const predictionWhere = {};
  const behaviorWhere = {};

  // Filter by semester
  if (filters.semester_id) {
    predictionWhere.semester_id = filters.semester_id;
    behaviorWhere.semester_id = filters.semester_id;
  }

  // Filter by predicted GPA threshold
  if (filters.predicted_gpa_threshold) {
    predictionWhere.predicted_gpa = {
      [Op.lte]: parseFloat(filters.predicted_gpa_threshold)
    };
  }

  // Get students with predictions
  const students = await Student.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name']
      },
      {
        model: PredictionHistory,
        as: 'predictions',
        where: predictionWhere,
        required: true,
        include: [{
          model: Semester,
          as: 'semester',
          attributes: ['id', 'name', 'academic_year']
        }],
        order: [['predicted_at', 'DESC']],
        limit: 1
      },
      {
        model: BehaviorRecord,
        as: 'behaviorRecords',
        where: behaviorWhere,
        required: false,
        include: [{
          model: Semester,
          as: 'semester',
          attributes: ['id', 'name', 'academic_year']
        }]
      }
    ]
  });

  // Format and filter results
  const results = students.map(student => {
    const latestPrediction = student.predictions[0];
    const behaviorRecord = student.behaviorRecords.find(
      b => b.semester_id === latestPrediction.semester_id
    );

    return {
      student_id: student.id,
      student_code: student.student_code,
      full_name: student.full_name,
      email: student.user.email,
      major: student.major,
      course_year: student.course_year,
      current_gpa: student.gpa_cumulative,
      predicted_gpa: latestPrediction.predicted_gpa,
      predicted_gpa4: latestPrediction.predicted_gpa4,
      risk_label: latestPrediction.risk_label,
      risk_score: latestPrediction.risk_score,
      stress_level: behaviorRecord ? behaviorRecord.mental_stress_level : null,
      semester: {
        id: latestPrediction.semester.id,
        name: latestPrediction.semester.name,
        academic_year: latestPrediction.semester.academic_year
      },
      predicted_at: latestPrediction.predicted_at
    };
  });

  // Filter by stress level if provided
  let filteredResults = results;
  if (filters.stress_level) {
    const stressThreshold = parseInt(filters.stress_level);
    filteredResults = results.filter(r =>
      r.stress_level !== null && r.stress_level >= stressThreshold
    );
  }

  // Sort by risk (danger > warning > safe) and then by predicted GPA
  const riskOrder = { danger: 0, warning: 1, safe: 2 };
  filteredResults.sort((a, b) => {
    if (riskOrder[a.risk_label] !== riskOrder[b.risk_label]) {
      return riskOrder[a.risk_label] - riskOrder[b.risk_label];
    }
    return a.predicted_gpa - b.predicted_gpa;
  });

  return filteredResults;
};

/**
 * Get detailed student report for lecturer
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Student detail report
 */
const getStudentDetailReport = async (studentId) => {
  const { Student, Grade, Course, Semester, PredictionHistory, BehaviorRecord, User } = require('../models');

  const student = await Student.findByPk(studentId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name']
      },
      {
        model: Grade,
        as: 'grades',
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'course_code', 'course_name', 'credits']
          },
          {
            model: Semester,
            as: 'semester',
            attributes: ['id', 'name', 'academic_year']
          }
        ],
        order: [['semester_id', 'ASC']]
      },
      {
        model: PredictionHistory,
        as: 'predictions',
        include: [{
          model: Semester,
          as: 'semester',
          attributes: ['id', 'name', 'academic_year']
        }],
        order: [['predicted_at', 'DESC']],
        limit: 5
      },
      {
        model: BehaviorRecord,
        as: 'behaviorRecords',
        include: [{
          model: Semester,
          as: 'semester',
          attributes: ['id', 'name', 'academic_year']
        }],
        order: [['semester_id', 'DESC']]
      }
    ]
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  return {
    student_info: {
      id: student.id,
      student_code: student.student_code,
      full_name: student.full_name,
      email: student.user.email,
      major: student.major,
      course_year: student.course_year,
      total_credits: student.total_credits,
      gpa_cumulative: student.gpa_cumulative
    },
    grades: student.grades.map(g => ({
      id: g.id,
      course_code: g.course.course_code,
      course_name: g.course.course_name,
      credits: g.course.credits,
      midterm_score: g.midterm_score,
      final_score: g.final_score,
      total_score: g.total_score,
      is_improvement: g.is_improvement,
      semester: g.semester
    })),
    predictions: student.predictions.map(p => ({
      id: p.id,
      predicted_gpa: p.predicted_gpa,
      predicted_gpa4: p.predicted_gpa4,
      risk_label: p.risk_label,
      risk_score: p.risk_score,
      semester: p.semester,
      predicted_at: p.predicted_at
    })),
    behavior_records: student.behaviorRecords.map(b => ({
      id: b.id,
      study_hours_per_day: b.study_hours_per_day,
      sleep_hours_per_day: b.sleep_hours_per_day,
      class_attendance: b.class_attendance,
      social_media_hours: b.social_media_hours,
      screen_time_hours: b.screen_time_hours,
      mental_stress_level: b.mental_stress_level,
      semester: b.semester,
      recorded_at: b.recorded_at
    }))
  };
};

// ==================== UC23: IMPROVEMENT EFFECTIVENESS REPORT ====================

/**
 * UC23: Get improvement effectiveness report
 * @param {Object} filters - { semester_id, student_id }
 * @returns {Promise<Object>} Improvement report
 */
const getImprovementReport = async (filters = {}) => {
  const { Student, Grade, Course, Semester, PredictionHistory, User } = require('../models');

  const whereStudent = {};
  const whereGrade = { is_improvement: 1 };

  if (filters.student_id) {
    whereStudent.id = filters.student_id;
  }

  if (filters.semester_id) {
    whereGrade.semester_id = filters.semester_id;
  }

  // Get students who have improvement records
  const students = await Student.findAll({
    where: whereStudent,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email']
      },
      {
        model: Grade,
        as: 'grades',
        where: whereGrade,
        required: true,
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'course_code', 'course_name', 'credits']
          },
          {
            model: Semester,
            as: 'semester',
            attributes: ['id', 'name', 'academic_year']
          }
        ]
      },
      {
        model: PredictionHistory,
        as: 'predictions',
        required: false,
        order: [['predicted_at', 'DESC']],
        limit: 2
      }
    ]
  });

  const report = [];

  for (const student of students) {
    const improvementGrades = student.grades;

    for (const improvementGrade of improvementGrades) {
      // Find original grade for the same course
      const originalGrade = await Grade.findOne({
        where: {
          student_id: student.id,
          course_id: improvementGrade.course_id,
          is_improvement: 0
        }
      });

      if (!originalGrade) continue;

      const oldScore = parseFloat(originalGrade.total_score);
      const newScore = parseFloat(improvementGrade.total_score);
      const credits = parseInt(improvementGrade.course.credits);

      // Calculate GPA gain
      const totalCredits = student.total_credits || 1;
      const gpaGain = ((newScore - oldScore) * credits) / totalCredits;

      report.push({
        student_id: student.id,
        student_code: student.student_code,
        full_name: student.full_name,
        email: student.user.email,
        course_code: improvementGrade.course.course_code,
        course_name: improvementGrade.course.course_name,
        credits,
        old_score: oldScore,
        improved_score: newScore,
        score_gain: Math.round((newScore - oldScore) * 100) / 100,
        actual_gpa_gain: Math.round(gpaGain * 1000) / 1000,
        semester: improvementGrade.semester,
        improvement_date: improvementGrade.created_at
      });
    }
  }

  // Sort by GPA gain descending
  report.sort((a, b) => b.actual_gpa_gain - a.actual_gpa_gain);

  // Calculate summary statistics
  const summary = {
    total_students: new Set(report.map(r => r.student_id)).size,
    total_improvements: report.length,
    average_score_gain: report.length > 0
      ? Math.round((report.reduce((sum, r) => sum + r.score_gain, 0) / report.length) * 100) / 100
      : 0,
    average_gpa_gain: report.length > 0
      ? Math.round((report.reduce((sum, r) => sum + r.actual_gpa_gain, 0) / report.length) * 1000) / 1000
      : 0
  };

  return {
    summary,
    improvements: report
  };
};

module.exports = {
  getAllLecturers,
  getLecturerById,
  createLecturer,
  updateLecturer,
  deleteLecturer,
  getAtRiskStudents,
  getStudentDetailReport,
  getImprovementReport
};
