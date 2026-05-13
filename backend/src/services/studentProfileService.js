const { Student, User, Grade, Course, Semester } = require('../models');
const { Op } = require('sequelize');

/**
 * Get student profile by user_id
 * UC14: Hiển thị GPA tích lũy hiện tại
 */
const getStudentProfile = async (userId) => {
  const student = await Student.findOne({
    where: { user_id: userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name']
      }
    ]
  });

  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  return student;
};

/**
 * Get all grades for a student
 * UC14: Xem bảng điểm toàn khóa
 */
const getStudentGrades = async (userId, filters = {}) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  const where = {
    student_id: student.id,
    is_improvement: 0 // Only show non-improvement grades by default
  };

  if (filters.semester_id) {
    where.semester_id = filters.semester_id;
  }

  const grades = await Grade.findAll({
    where,
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'course_code', 'course_name', 'credits', 'course_type']
      },
      {
        model: Semester,
        as: 'semester',
        attributes: ['id', 'name', 'academic_year']
      }
    ],
    order: [
      ['semester_id', 'DESC'],
      ['created_at', 'DESC']
    ]
  });

  return grades;
};

/**
 * Get grades by semester for a student
 * UC14: Điểm theo học kỳ
 */
const getGradesBySemester = async (userId, semesterId) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  const grades = await Grade.findAll({
    where: {
      student_id: student.id,
      semester_id: semesterId,
      is_improvement: 0
    },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'course_code', 'course_name', 'credits', 'course_type']
      },
      {
        model: Semester,
        as: 'semester',
        attributes: ['id', 'name', 'academic_year']
      }
    ],
    order: [['created_at', 'DESC']]
  });

  // Calculate semester GPA
  let totalWeighted = 0;
  let totalCredits = 0;

  for (const grade of grades) {
    if (grade.total_score !== null) {
      totalWeighted += grade.total_score * grade.course.credits;
      totalCredits += grade.course.credits;
    }
  }

  const semesterGPA = totalCredits > 0
    ? Math.round((totalWeighted / totalCredits) * 100) / 100
    : 0.00;

  return {
    grades,
    semester_gpa: semesterGPA,
    total_credits: totalCredits
  };
};

/**
 * Get GPA history by semester
 * For dashboard chart
 */
const getGPAHistory = async (userId) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  // Get all semesters with grades
  const grades = await Grade.findAll({
    where: {
      student_id: student.id,
      is_improvement: 0
    },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['credits']
      },
      {
        model: Semester,
        as: 'semester',
        attributes: ['id', 'name', 'academic_year']
      }
    ],
    order: [['semester_id', 'ASC']]
  });

  // Group by semester and calculate GPA
  const semesterMap = new Map();

  for (const grade of grades) {
    const semesterId = grade.semester_id;

    if (!semesterMap.has(semesterId)) {
      semesterMap.set(semesterId, {
        semester_id: semesterId,
        semester_name: grade.semester.name,
        academic_year: grade.semester.academic_year,
        total_weighted: 0,
        total_credits: 0
      });
    }

    const semesterData = semesterMap.get(semesterId);
    if (grade.total_score !== null) {
      semesterData.total_weighted += grade.total_score * grade.course.credits;
      semesterData.total_credits += grade.course.credits;
    }
  }

  // Calculate GPA for each semester
  const history = Array.from(semesterMap.values()).map(data => ({
    semester_id: data.semester_id,
    semester_name: data.semester_name,
    academic_year: data.academic_year,
    gpa: data.total_credits > 0
      ? Math.round((data.total_weighted / data.total_credits) * 100) / 100
      : 0.00,
    total_credits: data.total_credits
  }));

  return history;
};

/**
 * Get student dashboard data
 * UC14: Dashboard với GPA, biểu đồ, thống kê
 */
const getStudentDashboard = async (userId) => {
  const student = await getStudentProfile(userId);
  const gpaHistory = await getGPAHistory(userId);

  // Get current semester grades
  const currentSemester = await Semester.findOne({ where: { is_current: 1 } });
  let currentSemesterGrades = null;

  if (currentSemester) {
    currentSemesterGrades = await getGradesBySemester(userId, currentSemester.id);
  }

  return {
    profile: {
      student_code: student.student_code,
      full_name: student.full_name,
      major: student.major,
      course_year: student.course_year,
      total_credits: student.total_credits,
      gpa_cumulative: student.gpa_cumulative
    },
    gpa_history: gpaHistory,
    current_semester: currentSemesterGrades
  };
};

module.exports = {
  getStudentProfile,
  getStudentGrades,
  getGradesBySemester,
  getGPAHistory,
  getStudentDashboard
};
