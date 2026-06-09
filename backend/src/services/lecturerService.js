const { Lecturer, User, Department, Class } = require('../models');
const { hashPassword } = require('./authService');
const { Op, Sequelize } = require('sequelize');
const { getLecturerByUserId } = require('./interventionService');
/**
 * Get all lecturers with filters
 * LEFT JOINs classes so we can show homeroom class(es)
 */
const lecturerIncludes = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name', 'is_active']
      },
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'code', 'name']
      },
      {
        model: Class,
        as: 'homeroom_classes',
        required: false,
        attributes: ['id', 'class_name']
      }
    ];
const getAllLecturers = async (filters = {}) => {
  const where = {};

  if (filters.department_id) {
    where.department_id = filters.department_id;
  }

  if (filters.degree) {
    where.degree = filters.degree;
  }

  if (filters.search) {
    where[Op.or] = [
      { lecturer_code: { [Op.like]: `%${filters.search}%` } },
      { '$user.last_name$': { [Op.like]: `%${filters.search}%` } },
      { '$user.first_name$': { [Op.like]: `%${filters.search}%` } },
       Sequelize.literal( `CONCAT(user.first_name, ' ', user.last_name) LIKE '%${filters.search}%'` )
    ];
  }

  return await Lecturer.findAll({
    where,
    include: lecturerIncludes,
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
        attributes: ['id', 'email', 'first_name', 'last_name', 'is_active']
      },
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'code', 'name']
      },
      {
        model: Class,
        as: 'homeroom_classes',
        required: false,
        attributes: ['id', 'class_name']
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
    department_id,
    phone
  } = data;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error('Email đã tồn tại');

  const existingLecturer = await Lecturer.findOne({ where: { lecturer_code } });
  if (existingLecturer) throw new Error('Mã giảng viên đã tồn tại');

  const department = await Department.findByPk(department_id);
  if (!department) throw new Error('Không tìm thấy khoa');

  const hashedPassword = await hashPassword(password || 'TLU@123456');

  const user = await User.create({
    email,
    password: hashedPassword,
    role: 'lecturer',
    first_name,
    last_name,
    is_active: true
  });

  const lecturer = await Lecturer.create({
    user_id: user.id,
    lecturer_code,
    degree,
    department_id,
    phone: phone || null,
  });

  return await getLecturerById(lecturer.id);
};

/**
 * Update lecturer — blocked if is_active = 0
 */
const updateLecturer = async (id, data) => {
  const lecturer = await Lecturer.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!lecturer) throw new Error('Không tìm thấy giảng viên');

  if (!lecturer.user.is_active) {
    const err = new Error('Tài khoản không hoạt động');
    err.status = 403;
    throw err;
  }

  const {
    email,
    first_name,
    last_name,
    lecturer_code,
    degree,
    department_id,
    phone
  } = data;

  if (lecturer_code && lecturer_code !== lecturer.lecturer_code) {
    const existing = await Lecturer.findOne({
      where: { lecturer_code, id: { [Op.ne]: id } }
    });
    if (existing) throw new Error('Mã giảng viên đã tồn tại');
  }

  if (department_id && department_id !== lecturer.department_id) {
    const department = await Department.findByPk(department_id);
    if (!department) throw new Error('Không tìm thấy khoa');
  }

  if (email || first_name || last_name || phone !== undefined) {
    if (email && email !== lecturer.user.email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Op.ne]: lecturer.user_id } }
      });
      if (existingUser) throw new Error('Email đã tồn tại');
    }

    await lecturer.user.update({
      ...(email      && { email }),
      ...(first_name && { first_name }),
      ...(last_name  && { last_name })
    });
  }

  await lecturer.update({
    ...(lecturer_code  && { lecturer_code }),
    ...(degree         && { degree }),
    ...(department_id  && { department_id }),
     ...(phone !== undefined && { phone: phone || null })
  });

  return await getLecturerById(id);
};

/**
 * Soft-delete: set is_active = 0
 */
const deleteLecturer = async (id) => {
  const lecturer = await Lecturer.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!lecturer) throw new Error('Không tìm thấy giảng viên');

  await lecturer.user.update({ is_active: false });

  return true;
};

/**
 * Toggle is_active 0 <-> 1
 */
const toggleLecturerActive = async (id) => {
  const lecturer = await Lecturer.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!lecturer) throw new Error('Không tìm thấy giảng viên');

  const newState = !lecturer.user.is_active;
  await lecturer.user.update({ is_active: newState });

  return { is_active: newState };
};

/**
 * Reset password
 */
const resetLecturerPassword = async (id, newPassword) => {
  const lecturer = await Lecturer.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!lecturer) throw new Error('Không tìm thấy giảng viên');

  const hashed = await hashPassword(newPassword);
  await lecturer.user.update({ password: hashed });

  return true;
};

// ====================  AT-RISK STUDENTS ====================

/**
 *  Get at-risk students with filters
 * @param {Object} filters - { semester_id, predicted_gpa_threshold, stress_level }
 * @returns {Promise<Array>} List of at-risk students
 */
const getAtRiskStudents = async (userId,filters = {}) => {
  const { Student, PredictionHistory, BehaviorRecord, Semester, User, InterventionLog } = require('../models');
  const lecturer = await getLecturerByUserId(userId);
  const lecturerClasses = await Class.findAll({
    where: { lecturer_id: lecturer.id },
    attributes: ['id']
  });
  const classIds = lecturerClasses.map(c => c.id);

  if (classIds.length === 0) {
    return [];
}
  const where = {
    class_id: {
    [Op.in]: classIds
  }};
  const predictionWhere = {};
  const behaviorWhere = {};

  // Filter by class
  if (filters.class_id) {
    where.class_id = filters.class_id;
  }

  // Filter by semester
  if (filters.semester_id) {
    predictionWhere.semester_id = filters.semester_id;
    behaviorWhere.semester_id = filters.semester_id;
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
        where: Object.keys(predictionWhere).length > 0 ? predictionWhere : undefined,
        required: Object.keys(predictionWhere).length > 0,
        include: [{
          model: Semester,
          as: 'semester',
          attributes: ['id', 'name', 'academic_year']
        }],
        order: [['predicted_at', 'DESC']],
        limit: 1,
        separate: true
      },
      {
        model: BehaviorRecord,
        as: 'behaviorRecords',
        where: Object.keys(behaviorWhere).length > 0 ? behaviorWhere : undefined,
        required: false,
        separate: true,
        include: [{
          model: Semester,
          as: 'semester',
          attributes: ['id', 'name', 'academic_year']
        }]
      },
      {
        model: Class,
        as: 'class',
        attributes: ['id', 'class_name']
      },
        {
        model: InterventionLog,
        as: 'interventionLogs',
        required: false,
        attributes: ['id']
        }
    ]
  });

  // Format and filter results — skip students with no prediction loaded
  const results = students
    .filter(student => student.predictions && student.predictions.length > 0)
    .map(student => {
    const latestPrediction = student.predictions[0];
    const behaviorRecord = student.behaviorRecords.find(
      b => b.semester_id === latestPrediction.semester_id
    );
  
    return {
      student_id: student.id,
      student_code: student.student_code,
      full_name: `${student.user.first_name} ${student.user.last_name}`,
      email: student.user.email,
      major: student.major,
      class_name: student.class?.class_name,
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
      predicted_at: latestPrediction.predicted_at,
      intervention_count: student.interventionLogs?.length || 0
    };
  });
  // Filter by risk label if provided
    let filteredResults = [...results];
    if (filters.risk_label) {
      filteredResults = filteredResults.filter(
        r => r.risk_label === filters.risk_label
      );
    }

  // Filter by stress level if provided
  if (filters.stress_level) {
    const stressThreshold = parseInt(filters.stress_level);
    filteredResults = results.filter(r =>
      r.stress_level !== null && r.stress_level >= stressThreshold
    );
  }

  
// Filter by predicted GPA threshold
if (filters.predicted_gpa_threshold) {
  const threshold = parseFloat(filters.predicted_gpa_threshold);

  filteredResults = filteredResults.filter(
    r =>
      r.predicted_gpa !== null &&
      parseFloat(r.predicted_gpa) <= threshold
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
      separate: true,
      limit: 5,
      order: [['predicted_at', 'DESC']],
      include: [{
        model: Semester,
        as: 'semester',
        attributes: ['id', 'name', 'academic_year']
      }]
},
          {
        model: BehaviorRecord,
        as: 'behaviorRecords',
        separate: true,
        order: [['semester_id', 'DESC']],
        include: [{
          model: Semester,
          as: 'semester',
          attributes: ['id', 'name', 'academic_year']
        }]
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
      full_name: `${student.user.first_name} ${student.user.last_name}`,
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
        full_name: `${student.user.first_name} ${student.user.last_name}`,
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
  toggleLecturerActive,
  resetLecturerPassword,
  getAtRiskStudents,
  getStudentDetailReport,
  getImprovementReport
};
