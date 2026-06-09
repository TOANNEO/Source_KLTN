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

  // Lúc này behaviorData đang là instance của Sequelize, ta truyền trực tiếp vào
  const keyFactors = getKeyFactors(mlResult.feature_importance, behaviorData);

  // 7. Format response
  return {
    prediction_id: prediction.id,
    predicted_gpa: mlResult.predicted_gpa,        // Hệ 10 - hiển thị cho user
    predicted_gpa4: mlResult.predicted_gpa4,      // Hệ 4.0 - reference
    risk_label: mlResult.risk_label,
    risk_score: prediction.risk_score,
    risk_color: getRiskColor(mlResult.risk_label),
    risk_message: getRiskMessage(mlResult.risk_label, mlResult.predicted_gpa),
    //key_factors: getKeyFactors(mlResult.feature_importance),
    key_factors: keyFactors,
    actionable_advice: generateAdvice(keyFactors), // Tự động sinh mảng lời khuyên động hoàn chỉnh
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
  // Giải nén cục input_snapshot đã lưu trong quá khứ để lấy dữ liệu hành vi gốc
  const snapshot = JSON.parse(prediction.input_snapshot || '{}');
  const behaviorRecord = snapshot.behavior || {};

  // Truyền kèm behaviorRecord vào hàm phân tích
  const keyFactors = getKeyFactors(JSON.parse(prediction.feature_importance || '{}'), behaviorRecord);
  return {
    id: prediction.id,
    predicted_gpa: prediction.predicted_gpa,
    predicted_gpa4: prediction.predicted_gpa4,
    risk_label: prediction.risk_label,
    risk_score: prediction.risk_score,
    risk_color: getRiskColor(prediction.risk_label),
    risk_message: getRiskMessage(prediction.risk_label, prediction.predicted_gpa),
    //key_factors: getKeyFactors(JSON.parse(prediction.feature_importance || '{}')),
    key_factors: keyFactors,
    actionable_advice: generateAdvice(keyFactors),
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
  */
 function getKeyFactors(featureImportance, behaviorRecord = {}, topN = 3) {
  const factors = Object.entries(featureImportance)
    .map(([factor, importanceValue]) => {
      const val = parseFloat(importanceValue) || 0;
      
      // Lấy giá trị thực tế sinh viên nhập trong DB (Ví dụ: 4.5 giờ mạng xã hội, 65% đi học)
      let currentValue = 0;

      // Mapping ML feature -> DB field
      const fieldMapping = {
        class_attendance_percent: 'class_attendance',
        sleep_hours: 'sleep_hours_per_day'
      };

      const dbField = fieldMapping[factor] || factor;

      currentValue =
        behaviorRecord[dbField] !== undefined
          ? behaviorRecord[dbField]
          : 0;
  

      return {
        factor: translateFactor(factor),
        factor_key: factor,
        impact: getImpactLevel(val),
        direction: val >= 0 ? 'positive' : 'negative',
        importance: val,
        current_value: currentValue // Ép kèm giá trị thực tế vào đây
      };
    })
    // Sắp xếp theo trị tuyệt đối để tìm những nhân tố biến động mạnh nhất lên đầu
    .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
    .slice(0, topN);

  return factors;
}
/**
 * Translate factor names to Vietnamese
 */
function translateFactor(factor) {
  const translations = {
   'study_hours_per_day': 'Giờ tự học mỗi ngày',
    'class_attendance_percent': 'Tỷ lệ đi học',
    'sleep_hours': 'Giờ ngủ trung bình',
    'mental_stress_level': 'Mức độ stress tâm lý',
    'social_media_hours': 'Giờ dùng mạng xã hội',
    'screen_time_hours': 'Thời gian dùng màn hình',
    'extracurricular_hours_per_week': 'Giờ hoạt động ngoại khóa/tuần',
    'exercise_hours_per_week': 'Giờ tập thể dục/tuần',
  };
  return translations[factor] || factor;
}

/**
 * Get impact level from importance score
 */
function getImpactLevel(importance) {
  const absVal = Math.abs(importance);
  if (absVal >= 0.25) return 'high';   // Thay đổi GPA từ 0.25 điểm trở lên là rất lớn
  if (absVal >= 0.10) return 'medium'; // Thay đổi từ 0.1 đến 0.24 điểm
  return 'low';
}
/**
 * Tự động sinh lời khuyên dựa trên các SHAP mang giá trị âm
 */
function generateAdvice(keyFactors) {
  // Định nghĩa các hàm sinh chuỗi động sử dụng Template String của Javascript
  const adviceTemplates = {
    'social_media_hours': (cur, imp) => 
      `Lướt mạng xã hội đang làm điểm số của bạn giảm! Thời gian dùng mạng xã hội của bạn đang là ${cur} giờ/ngày. Thống kê từ mô hình cho thấy thói quen này đang kéo tụt GPA dự đoán của bạn đi ${imp} điểm. Hãy thử giảm thời gian lướt điện thoại mỗi ngày để thấy sự khác biệt nhé.`,
    
    'class_attendance_percent': (cur, imp) => 
      `Hãy đi học đều hơn, giảng đường đang nhớ bạn! Tỉ lệ lên lớp của bạn hiện chỉ đạt ${cur}%. Việc vắng mặt này chịu trách nhiệm cho việc làm giảm ${imp} điểm trong dự báo GPA cuối kỳ. Đi học đầy đủ tuần tới là cách nhanh nhất để cải thiện điểm số đó đấy!`,
    
    'study_hours_per_day': (cur, imp) => 
      `Thời gian tự học hơi "khiêm tốn" rồi nhé! Bạn mới chỉ dành ${cur} giờ/ngày để ôn tập. Sự thiếu hụt này đang trực tiếp lấy đi ${imp} điểm GPA của bạn. Tăng tốc lên một chút, thành quả sẽ xứng đáng!`,
    
    'sleep_hours': (cur, imp) => 
      `Giấc ngủ chưa chuẩn đang bào mòn năng lượng! Bạn đang ngủ ${cur} giờ/ngày. Thói quen này làm giảm đi ${imp} điểm GPA của bạn do ảnh hưởng đến sự tập trung. Hãy ngủ đủ 7-8 tiếng để não bộ hồi phục tốt nhất.`,
    
    'mental_stress_level': (cur, imp) => 
      `Tâm lý đang quá tải rồi, reset lại thôi! Mức độ stress của bạn đang chạm mốc ${cur}/10. Trạng thái căng thẳng này đang gián tiếp cướp đi ${imp} điểm GPA dự báo. Đừng ngại chia sẻ và dành thời gian nghỉ ngơi nhé.`,
    
    'screen_time_hours': (cur, imp) => 
      `Màn hình điện tử đang lấy đi sự tập trung của bạn! Thời gian sử dụng thiết bị lên tới ${cur} giờ/ngày, góp phần làm tụt ${imp} điểm GPA. Hãy đặt điện thoại xuống sau 10h tối để bảo vệ điểm số nào.`,
    
    'extracurricular_hours_per_week': (cur, imp) => 
      `Lịch trình ngoại khóa đang chiếm sóng hơi nhiều! Với ${cur} giờ/tuần, hoạt động này đang làm bạn phân tâm và giảm ${imp} điểm GPA. Hãy tạm thời cân bằng lại để ưu tiên việc học thi nhé.`,
    
    'exercise_hours_per_week': (cur, imp) => 
      `Cơ thể đang thiếu vận động trầm trọng! Bạn chỉ tập thể dục ${cur} giờ/tuần. Sự uể oải này làm giảm đi ${imp} điểm hiệu suất trí não. Dành 15 phút vận động mỗi ngày sẽ giúp bạn minh mẫn hơn.`
  };

  // Lọc lấy các yếu tố đang kéo tụt điểm (âm) để đưa ra giải pháp cải thiện
  return keyFactors
    .filter(f => f.direction === 'negative')
    .map(f => {
      const cur = f.current_value;
      // Định dạng giá trị SHAP lấy trị tuyệt đối làm tròn 2 chữ số sau dấu phẩy (Ví dụ: 0.35)
      const imp = Math.abs(f.importance).toFixed(2);
      const templateFn = adviceTemplates[f.factor_key];
      
      return {
        factor_key: f.factor_key,
        factor_name: f.factor,
        impact: f.impact,
        advice: templateFn 
          ? templateFn(cur, imp) 
          : `Chỉ số '${f.factor}' hiện tại là ${cur} đang làm giảm ${imp} điểm GPA của bạn. Hãy chú ý điều chỉnh.`
      };
    });
}

module.exports = {
  runPrediction,
  getPredictionHistory,
  getLatestPrediction
};