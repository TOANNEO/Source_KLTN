const { Student, BehaviorRecord, PredictionHistory, Semester, Grade, Course } = require('../models');
const mlService = require('./mlService');
const { Op } = require('sequelize');

/**
 * Run GPA prediction for a student
 * UC17: Dự báo kết quả học tập
 * UC18: Phân loại nguy cơ
 */
const runPrediction = async (userId, semesterId = null) => {
  // 1. Get student
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  // 2. Get semester (current if not specified)
  let semester;
  if (semesterId) {
    semester = await Semester.findByPk(semesterId);
  } else {
    semester = await Semester.findOne({ where: { is_current: 1 } });
  }

  if (!semester) {
    throw new Error('Không tìm thấy học kỳ');
  }

  // 3. Get behavior data for the semester
  const behaviorData = await BehaviorRecord.findOne({
    where: {
      student_id: student.id,
      semester_id: semester.id
    }
  });

  if (!behaviorData) {
    throw new Error('Chưa có dữ liệu hành vi cho học kỳ này. Vui lòng nhập chỉ số hành vi trước.');
  }

  // 4. Get all grades and calculate average middle_exam_score and assignment_score
  const grades = await Grade.findAll({
    where: {
      student_id: student.id,
      middle_exam_score: { [Op.ne]: null }  // Only grades with middle_exam_score
    },
    attributes: ['middle_exam_score', 'assignment_score']
  });

  let gradeData = {};

  if (grades && grades.length > 0) {
    // Calculate average middle_exam_score
    const totalMiddleExam = grades.reduce((sum, grade) => {
      return sum + (parseFloat(grade.middle_exam_score) || 0);
    }, 0);
    const avgMiddleExam = totalMiddleExam / grades.length;

    // Calculate average assignment_score
    const gradesWithAssignment = grades.filter(g => g.assignment_score !== null);
    let avgAssignment = 0;
    if (gradesWithAssignment.length > 0) {
      const totalAssignment = gradesWithAssignment.reduce((sum, grade) => {
        return sum + (parseFloat(grade.assignment_score) || 0);
      }, 0);
      avgAssignment = totalAssignment / gradesWithAssignment.length;
    }

    gradeData = {
      middle_exam_score: parseFloat(avgMiddleExam.toFixed(2)),
      assignment_score: parseFloat(avgAssignment.toFixed(2))
    };
  }

  // 5. Call ML model
  const mlResult = await mlService.predictGPA(behaviorData, gradeData);

  // 6. Save prediction to history
  const prediction = await PredictionHistory.create({
    student_id: student.id,
    semester_id: semester.id,
    predicted_gpa4: mlResult.predicted_gpa4,      // Hệ 4.0 - lưu DB
    predicted_gpa: mlResult.predicted_gpa,        // Hệ 10 - hiển thị
    risk_label: mlResult.risk_label,
    risk_score: calculateRiskScore(mlResult.risk_label),
    input_snapshot: JSON.stringify({
      behavior: behaviorData.toJSON(),
      grade: gradeData
    }),
    feature_importance: JSON.stringify(mlResult.feature_importance),
    predicted_at: new Date()
  });

  // 7. Format response
  return {
    prediction_id: prediction.id,
    predicted_gpa: mlResult.predicted_gpa,        // Hệ 10 - hiển thị cho user
    predicted_gpa4: mlResult.predicted_gpa4,      // Hệ 4.0 - reference
    risk_label: mlResult.risk_label,
    risk_score: prediction.risk_score,
    risk_color: getRiskColor(mlResult.risk_label),
    risk_message: getRiskMessage(mlResult.risk_label, mlResult.predicted_gpa),
    key_factors: getKeyFactors(mlResult.feature_importance),
    semester: {
      id: semester.id,
      name: semester.name,
      academic_year: semester.academic_year
    },
    predicted_at: prediction.predicted_at
  };
};

/**
 * Get prediction history for a student
 */
const getPredictionHistory = async (userId, limit = 10) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  const history = await PredictionHistory.findAll({
    where: { student_id: student.id },
    include: [
      {
        model: Semester,
        as: 'semester',
        attributes: ['id', 'name', 'academic_year']
      }
    ],
    order: [['predicted_at', 'DESC']],
    limit
  });

  return history.map(h => ({
    id: h.id,
    predicted_gpa: h.predicted_gpa,
    predicted_gpa4: h.predicted_gpa4,
    risk_label: h.risk_label,
    risk_score: h.risk_score,
    risk_color: getRiskColor(h.risk_label),
    semester: h.semester,
    predicted_at: h.predicted_at
  }));
};

/**
 * Get latest prediction for a student
 */
const getLatestPrediction = async (userId) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  const prediction = await PredictionHistory.findOne({
    where: { student_id: student.id },
    include: [
      {
        model: Semester,
        as: 'semester',
        attributes: ['id', 'name', 'academic_year']
      }
    ],
    order: [['predicted_at', 'DESC']]
  });

  if (!prediction) {
    return null;
  }

  return {
    id: prediction.id,
    predicted_gpa: prediction.predicted_gpa,
    predicted_gpa4: prediction.predicted_gpa4,
    risk_label: prediction.risk_label,
    risk_score: prediction.risk_score,
    risk_color: getRiskColor(prediction.risk_label),
    risk_message: getRiskMessage(prediction.risk_label, prediction.predicted_gpa),
    key_factors: getKeyFactors(JSON.parse(prediction.feature_importance || '{}')),
    semester: prediction.semester,
    predicted_at: prediction.predicted_at
  };
};

// ==================== Helper Functions ====================

/**
 * Calculate risk score from risk label
 */
function calculateRiskScore(riskLabel) {
  const scores = {
    'safe': 0.2,
    'warning': 0.6,
    'danger': 0.9
  };
  return scores[riskLabel] || 0.5;
}

/**
 * Get risk color for UI
 */
function getRiskColor(riskLabel) {
  const colors = {
    'safe': 'green',
    'warning': 'yellow',
    'danger': 'red'
  };
  return colors[riskLabel] || 'gray';
}

/**
 * Get risk message
 */
function getRiskMessage(riskLabel, predictedGPA) {
  const messages = {
    'safe': `GPA dự báo ${predictedGPA} - Kết quả học tập tốt. Hãy duy trì!`,
    'warning': `GPA dự báo ${predictedGPA} - Cần cải thiện. Hãy tăng cường học tập.`,
    'danger': `GPA dự báo ${predictedGPA} - Nguy cơ cao. Cần hành động ngay!`
  };
  return messages[riskLabel] || 'Không xác định';
}

/**
 * Get top key factors affecting GPA
 */
function getKeyFactors(featureImportance, topN = 3) {
  const factors = Object.entries(featureImportance)
    .map(([factor, importance]) => ({
      factor: translateFactor(factor),
      factor_key: factor,
      impact: getImpactLevel(importance),
      importance: importance
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, topN);

  return factors;
}

/**
 * Translate factor names to Vietnamese
 */
function translateFactor(factor) {
  const translations = {
    'final_exam_score': 'Điểm thi cuối kỳ',
    'class_attendance_percent': 'Tỷ lệ đi học',
    'study_hours_per_day': 'Giờ tự học mỗi ngày',
    'assignment_score': 'Điểm bài tập',
    'sleep_hours': 'Giờ ngủ',
    'social_media_hours': 'Giờ dùng mạng xã hội',
    'screen_time_hours': 'Thời gian sử dụng màn hình'
  };
  return translations[factor] || factor;
}

/**
 * Get impact level from importance score
 */
function getImpactLevel(importance) {
  if (importance >= 0.3) return 'high';
  if (importance >= 0.15) return 'medium';
  return 'low';
}

module.exports = {
  runPrediction,
  getPredictionHistory,
  getLatestPrediction
};