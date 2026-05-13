const { Grade, Student, Course, Semester, User, GradeAuditLog } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Calculate total score according to TLU formula
 * UC09: total = 0.3 * GK + 0.7 * CK
 */
const calculateTotalScore = (middleExamScore, finalScore) => {
  if (middleExamScore === null || finalScore === null) {
    return null;
  }
  return Math.round((0.3 * middleExamScore + 0.7 * finalScore) * 100) / 100;
};

/**
 * Calculate cumulative GPA for a student
 * GPA = Σ(total_score_i × credits_i) / Σ(credits_i)
 */
const calculateCumulativeGPA = async (studentId) => {
  const grades = await Grade.findAll({
    where: {
      student_id: studentId,
      is_improvement: 0 // Only count non-improvement grades
    },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['credits']
      }
    ]
  });

  if (grades.length === 0) {
    return 0.00;
  }

  let totalWeighted = 0;
  let totalCredits = 0;

  for (const grade of grades) {
    if (grade.total_score !== null) {
      totalWeighted += grade.total_score * grade.course.credits;
      totalCredits += grade.course.credits;
    }
  }

  return totalCredits > 0 ? Math.round((totalWeighted / totalCredits) * 100) / 100 : 0.00;
};

/**
 * Update student's cumulative GPA and total credits
 */
const updateStudentGPA = async (studentId) => {
  const student = await Student.findByPk(studentId);
  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  // Calculate new GPA
  const newGPA = await calculateCumulativeGPA(studentId);

  // Calculate total credits
  const grades = await Grade.findAll({
    where: {
      student_id: studentId,
      is_improvement: 0
    },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['credits']
      }
    ]
  });

  const totalCredits = grades.reduce((sum, grade) => sum + grade.course.credits, 0);

  // Update student
  await student.update({
    gpa_cumulative: newGPA,
    total_credits: totalCredits
  });

  return { gpa_cumulative: newGPA, total_credits: totalCredits };
};

/**
 * Get all grades with filters
 */
const getAllGrades = async (filters = {}) => {
  const where = {};

  if (filters.student_id) {
    where.student_id = filters.student_id;
  }

  if (filters.course_id) {
    where.course_id = filters.course_id;
  }

  if (filters.semester_id) {
    where.semester_id = filters.semester_id;
  }

  if (filters.is_improvement !== undefined) {
    where.is_improvement = filters.is_improvement;
  }

  return await Grade.findAll({
    where,
    include: [
      {
        model: Student,
        as: 'student',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['first_name', 'last_name']
          }
        ]
      },
      {
        model: Course,
        as: 'course'
      },
      {
        model: Semester,
        as: 'semester'
      }
    ],
    order: [['created_at', 'DESC']]
  });
};

/**
 * Get grade by ID
 */
const getGradeById = async (id) => {
  const grade = await Grade.findByPk(id, {
    include: [
      {
        model: Student,
        as: 'student',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['first_name', 'last_name']
          }
        ]
      },
      {
        model: Course,
        as: 'course'
      },
      {
        model: Semester,
        as: 'semester'
      }
    ]
  });

  if (!grade) {
    throw new Error('Không tìm thấy điểm');
  }

  return grade;
};

/**
 * Create new grade
 * UC09: Nhập điểm học phần - tự tính total_score
 */
const createGrade = async (data) => {
  const {
    student_id,
    course_id,
    semester_id,
    attendance_score,
    middle_exam_score,
    assignment_score,
    final_score,
    is_improvement
  } = data;

  // Validate student exists
  const student = await Student.findByPk(student_id);
  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  // Validate course exists
  const course = await Course.findByPk(course_id);
  if (!course) {
    throw new Error('Không tìm thấy môn học');
  }

  // Validate semester exists
  const semester = await Semester.findByPk(semester_id);
  if (!semester) {
    throw new Error('Không tìm thấy học kỳ');
  }

  // Check if grade already exists
  const existingGrade = await Grade.findOne({
    where: {
      student_id,
      course_id,
      semester_id,
      is_improvement: is_improvement || 0
    }
  });

  if (existingGrade) {
    throw new Error('Điểm môn học này đã tồn tại');
  }

  // Calculate total score according to TLU formula
  const totalScore = calculateTotalScore(middle_exam_score, final_score);

  // Create grade
  const grade = await Grade.create({
    student_id,
    course_id,
    semester_id,
    attendance_score,
    middle_exam_score,
    assignment_score,
    final_score,
    total_score: totalScore,
    grade_4: null, // TODO: Convert to 4.0 scale if needed
    is_improvement: is_improvement || 0
  });

  // Update student's cumulative GPA
  await updateStudentGPA(student_id);

  return await getGradeById(grade.id);
};

/**
 * Update grade
 * UC10: Cập nhật bảng điểm - ghi audit log, tính lại GPA
 */
const updateGrade = async (id, data, updatedBy) => {
  const grade = await Grade.findByPk(id);
  if (!grade) {
    throw new Error('Không tìm thấy điểm');
  }

  const {
    attendance_score,
    middle_exam_score,
    assignment_score,
    final_score,
    updated_reason
  } = data;

  // UC10: Phải nhập lý do khi sửa
  if (!updated_reason || updated_reason.trim() === '') {
    throw new Error('Vui lòng nhập lý do chỉnh sửa điểm');
  }

  // Store old values for audit log
  const oldValues = {
    attendance_score: grade.attendance_score,
    middle_exam_score: grade.middle_exam_score,
    assignment_score: grade.assignment_score,
    final_score: grade.final_score,
    total_score: grade.total_score
  };

  // Calculate new total score
  const newMiddleScore = middle_exam_score !== undefined ? middle_exam_score : grade.middle_exam_score;
  const newFinalScore = final_score !== undefined ? final_score : grade.final_score;
  const newTotalScore = calculateTotalScore(newMiddleScore, newFinalScore);

  const newValues = {
    attendance_score: attendance_score !== undefined ? attendance_score : grade.attendance_score,
    middle_exam_score: newMiddleScore,
    assignment_score: assignment_score !== undefined ? assignment_score : grade.assignment_score,
    final_score: newFinalScore,
    total_score: newTotalScore
  };

  // Use transaction to ensure data consistency
  const result = await sequelize.transaction(async (t) => {
    // Update grade
    await grade.update({
      ...newValues,
      updated_by: updatedBy,
      updated_reason
    }, { transaction: t });

    // Create audit log
    await GradeAuditLog.create({
      grade_id: id,
      changed_by: updatedBy,
      old_values: oldValues,
      new_values: newValues,
      reason: updated_reason
    }, { transaction: t });

    // Update student's cumulative GPA
    await updateStudentGPA(grade.student_id);

    return await getGradeById(id);
  });

  return result;
};

/**
 * Delete grade
 */
const deleteGrade = async (id) => {
  const grade = await Grade.findByPk(id);
  if (!grade) {
    throw new Error('Không tìm thấy điểm');
  }

  const studentId = grade.student_id;

  await grade.destroy();

  // Recalculate student's GPA after deletion
  await updateStudentGPA(studentId);

  return true;
};

/**
 * Get audit log for a grade
 */
const getGradeAuditLog = async (gradeId) => {
  const grade = await Grade.findByPk(gradeId);
  if (!grade) {
    throw new Error('Không tìm thấy điểm');
  }

  return await GradeAuditLog.findAll({
    where: { grade_id: gradeId },
    include: [
      {
        model: User,
        as: 'changedBy',
        attributes: ['id', 'email', 'first_name', 'last_name']
      }
    ],
    order: [['changed_at', 'DESC']]
  });
};

module.exports = {
  calculateTotalScore,
  calculateCumulativeGPA,
  updateStudentGPA,
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradeAuditLog
};
