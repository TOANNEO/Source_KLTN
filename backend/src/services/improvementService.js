
const { Student, Grade, Course, Semester } = require('../models');

// ==================== CONSTANTS ====================

// Điều kiện đủ điều kiện học cải thiện (theo quy chế)
const ELIGIBLE_MIN_SCORE = 4.0;
const ELIGIBLE_MAX_SCORE = 5.6;

// Điểm giả định cho tín chỉ mới khi tính extra credits
const ASSUMED_NEW_GRADE = 8.5;

// Cảnh báo mục tiêu quá cao
const HIGH_AMBITION_THRESHOLD = 2.0;

// Greedy constraints
const MIN_GPA_GAIN = 0.02;
const MAX_IMPROVEMENT_COURSES = 4;

// ==================== GPA UTILITY FUNCTIONS ====================

/**
 * Tính GPA tích lũy từ danh sách điểm
 */
function calcCumulativeGPA(grades) {
  let totalWeighted = 0;
  let totalCredits = 0;

  for (const g of grades) {
    const score = parseFloat(g.total_score);
    const credits = parseInt(g.credits, 10);

    if (!isNaN(score) && !isNaN(credits) && credits > 0) {
      totalWeighted += score * credits;
      totalCredits += credits;
    }
  }

  const gpa = totalCredits > 0
    ? Math.round((totalWeighted / totalCredits) * 100) / 100
    : 0;

  return { gpa, totalCredits, totalWeighted };
}

/**
 * Tính điểm tối thiểu cần đạt cho một môn để đạt GPA mục tiêu
 */
function calcRequiredScore(targetGPA, currentGPA, totalCredits, oldScore, credits) {
  if (credits <= 0) return Infinity;

  const dTarget = oldScore + ((targetGPA - currentGPA) * totalCredits) / credits;
  return Math.round(dTarget * 100) / 100;
}

/**
 * Tính mức tăng GPA khi cải thiện một môn
 */
function calcGPAGain(oldScore, newScore, credits, totalCredits) {
  if (totalCredits <= 0 || credits <= 0) return 0;

  const gain = ((newScore - oldScore) * credits) / totalCredits;
  return Math.round(gain * 1000) / 1000;
}

/**
 * Tính số tín chỉ mới cần học thêm
 */
function calcExtraCreditsNeeded(targetGPA, maxGPAAfterImprove, totalCredits, assumedGrade = ASSUMED_NEW_GRADE) {
  if (maxGPAAfterImprove >= targetGPA) return null;
  if (assumedGrade <= targetGPA) return Infinity;

  const pointsMissing = (targetGPA - maxGPAAfterImprove) * totalCredits;
  return Math.ceil(pointsMissing / (assumedGrade - targetGPA));
}

// ==================== MAIN SERVICE ====================

/**Phân tích và gợi ý học cải thiện GPA
 */
const getImprovementPlan = async (userId, targetGPA) => {
  // ── 1. Validate target GPA ─────────────────────────────────────────────
  const parsedTarget = parseFloat(targetGPA);

  if (isNaN(parsedTarget) || parsedTarget < 0 || parsedTarget > 10) {
    throw Object.assign(new Error('Điểm mục tiêu không hợp lệ'), {
      code: 'INVALID_TARGET'
    });
  }

  // ── 2. Lấy thông tin sinh viên ─────────────────────────────────────────
  const student = await Student.findOne({
    where: { user_id: userId }
  });

  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  // ── 3. Lấy toàn bộ điểm tích lũy ───────────────────────────────────────
  const allGrades = await Grade.findAll({
    where: {
      student_id: student.id,
      is_improvement: 0
    },
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
  });

  if (allGrades.length === 0) {
    throw new Error('Chưa có dữ liệu điểm tích lũy');
  }

  // ── 4. Tính GPA hiện tại ───────────────────────────────────────────────
  const gradesForCalc = allGrades
    .filter(g => g.total_score !== null && g.course)
    .map(g => ({
      total_score: g.total_score,
      credits: g.course.credits
    }));

  const {
    gpa: currentGPA,
    totalCredits,
    totalWeighted
  } = calcCumulativeGPA(gradesForCalc);

  // GPA mục tiêu phải lớn hơn GPA hiện tại
    if (parsedTarget <= currentGPA) {
      throw Object.assign(
        new Error(
          `GPA mục tiêu phải lớn hơn GPA hiện tại (${currentGPA})`
        ),
        {
          code: 'INVALID_TARGET_GPA'
        }
      );
    }

  // ── 5. Cảnh báo mục tiêu cao ───────────────────────────────────────────
  const warnings = [];

  if (parsedTarget - currentGPA > HIGH_AMBITION_THRESHOLD) {
    warnings.push({
      code: 'HIGH_AMBITION',
      message: 'Mục tiêu này rất cao, đòi hỏi sự bứt phá lớn trong học tập'
    });
  }

  // ── 6. Lọc môn đủ điều kiện học cải thiện ──────────────────────────────
  const eligibleGrades = allGrades.filter(g => {
    const score = parseFloat(g.total_score);

    return (
      !isNaN(score) &&
      score >= ELIGIBLE_MIN_SCORE &&
      score <= ELIGIBLE_MAX_SCORE
    );
  });

  if (eligibleGrades.length === 0) {
    return {
      success: false,
      message: 'Hiện tại bạn không có môn học nào đủ điều kiện để đăng ký học cải thiện theo quy chế',
      current_gpa: currentGPA,
      target_gpa: parsedTarget,
      total_credits: totalCredits,
      eligible_courses: [],
      warnings
    };
  }

  // ── 7. Tính recommendation cho từng môn ────────────────────────────────
  const recommendations = [];

  for (const gradeRecord of eligibleGrades) {
    const oldScore = parseFloat(gradeRecord.total_score);
    const credits = parseInt(gradeRecord.course.credits, 10);

    const requiredScore = calcRequiredScore(
      parsedTarget,
      currentGPA,
      totalCredits,
      oldScore,
      credits
    );

    const recommendedScore = Math.min(10.0, requiredScore);

    const gpaGain = calcGPAGain(
      oldScore,
      recommendedScore,
      credits,
      totalCredits
    );

    // Priority score cho greedy
    const priorityScore = Math.round(
      ((gpaGain * 0.7) + (credits * 0.3)) * 1000
    ) / 1000;

    recommendations.push({
      grade_id: gradeRecord.id,
      course_code: gradeRecord.course.course_code,
      course_name: gradeRecord.course.course_name,
      credits,
      old_score: oldScore,
      required_score: requiredScore,
      recommended_score: recommendedScore,
      predicted_gpa_gain: gpaGain,
      priority_score: priorityScore,
      eligibility_status: requiredScore > 10 ? 'unrealistic' : 'eligible',
      semester: {
        id: gradeRecord.semester.id,
        name: gradeRecord.semester.name,
        academic_year: gradeRecord.semester.academic_year
      }
    });
  }

  // ── 8. Sort theo priority score ────────────────────────────────────────
  recommendations.sort((a, b) => b.priority_score - a.priority_score);

  // ── 9. Greedy selection algorithm ──────────────────────────────────────
  const selectedCourses = [];

  let predictedFinalGPA = currentGPA;
  let remainingGap = parsedTarget - currentGPA;

  for (const course of recommendations) {
    // Đạt giới hạn số môn
    if (selectedCourses.length >= MAX_IMPROVEMENT_COURSES) {
      break;
    }

    // Gain quá nhỏ
    if (course.predicted_gpa_gain < MIN_GPA_GAIN) {
      continue;
    }

    // Tính required score động theo remaining gap
    const dynamicRequiredScore = calcRequiredScore(
      parsedTarget,
      predictedFinalGPA,
      totalCredits,
      course.old_score,
      course.credits
    );

    // Không khả thi nếu vượt quá thang điểm 10
    if (dynamicRequiredScore > 10) {
      continue;
    }

    const dynamicRecommendedScore = Math.min(10, dynamicRequiredScore);

    const dynamicGain = calcGPAGain(
      course.old_score,
      dynamicRecommendedScore,
      course.credits,
      totalCredits
    );

    const updatedCourse = {
      ...course,
      required_score: dynamicRequiredScore,
      recommended_score: dynamicRecommendedScore,
      predicted_gpa_gain: dynamicGain
    };

    selectedCourses.push(updatedCourse);

    predictedFinalGPA += dynamicGain;
    predictedFinalGPA = Math.round(predictedFinalGPA * 1000) / 1000;

    remainingGap = Math.max(0, parsedTarget - predictedFinalGPA);

    // Đã đạt target
    if (predictedFinalGPA >= parsedTarget) {
      break;
    }
  }

  // ── 10. Tính GPA tối đa có thể đạt ─────────────────────────────────────
  let totalMaxGain = 0;

for (const gradeRecord of eligibleGrades) {
  const oldScore = parseFloat(gradeRecord.total_score);
  const credits = parseInt(gradeRecord.course.credits, 10);

  totalMaxGain += calcGPAGain(
    oldScore,
    10.0,
    credits,
    totalCredits
  );
}

const maxGPAAfterImprove =
  Math.round((currentGPA + totalMaxGain) * 100) / 100;

  // ── 11. Tính extra credits nếu cần ─────────────────────────────────────
  let extraCreditsNeeded = null;
  let extraCreditsMessage = null;

  if (maxGPAAfterImprove < parsedTarget) {
    extraCreditsNeeded = calcExtraCreditsNeeded(
      parsedTarget,
      maxGPAAfterImprove,
      totalCredits
    );

    if (extraCreditsNeeded === Infinity) {
      extraCreditsMessage = `Ngay cả khi cải thiện tất cả môn đủ điều kiện lên 10.0, GPA tối đa chỉ đạt ${maxGPAAfterImprove}. Mục tiêu ${parsedTarget} không khả thi với điểm giả định ${ASSUMED_NEW_GRADE} cho tín chỉ mới.`;
    } else {
      extraCreditsMessage = `Để đạt GPA ${parsedTarget}, bạn cần học thêm khoảng ${extraCreditsNeeded} tín chỉ mới với điểm trung bình ${ASSUMED_NEW_GRADE}, ngoài việc cải thiện các môn đủ điều kiện.`;
    }
  }

  // ── 12. Trả kết quả ────────────────────────────────────────────────────
  return {
    success: true,
    message: 'Phân tích thành công',

    current_gpa: currentGPA,
    target_gpa: parsedTarget,
    total_credits: totalCredits,

    max_gpa_after_improvement: maxGPAAfterImprove,
    gap_to_target: Math.max(0, parsedTarget - maxGPAAfterImprove),

    // Giữ response cũ
    eligible_courses: recommendations,

    // Kế hoạch greedy mới
    recommended_plan: {
      selected_courses: selectedCourses,
      predicted_final_gpa: Math.round(predictedFinalGPA * 100) / 100,
      total_selected_courses: selectedCourses.length,
      achieved_target: predictedFinalGPA >= parsedTarget,
      remaining_gap: Math.round(remainingGap * 100) / 100
    },

    extra_credits_needed: extraCreditsNeeded,
    extra_credits_message: extraCreditsMessage,

    warnings,

    summary: {
      total_eligible_courses: recommendations.length,
      total_selected_courses: selectedCourses.length,
      total_potential_gain: Math.round(totalMaxGain * 100) / 100,
      is_target_achievable: maxGPAAfterImprove >= parsedTarget
    }
  };
};

module.exports = {
  getImprovementPlan,

  // Export utilities for testing
  calcCumulativeGPA,
  calcRequiredScore,
  calcGPAGain,
  calcExtraCreditsNeeded
};
















// const { Student, Grade, Course, Semester } = require('../models');

// // ==================== CONSTANTS ====================

// // Điều kiện đủ điều kiện học cải thiện (theo quy chế)
// const ELIGIBLE_MIN_SCORE = 4.0;
// const ELIGIBLE_MAX_SCORE = 5.6;

// // Điểm giả định cho tín chỉ mới khi tính extra credits
// const ASSUMED_NEW_GRADE = 8.5;

// // Cảnh báo mục tiêu quá cao
// const HIGH_AMBITION_THRESHOLD = 2.0;

// // ==================== GPA UTILITY FUNCTIONS ====================

// /**
//  * Tính GPA tích lũy từ danh sách điểm
//  * GPA = Σ(điểm_i × tín_chỉ_i) / Σ(tín_chỉ_i)
//  *
//  * @param {Array} grades - [{ total_score, credits }, ...]
//  * @returns {{ gpa: number, totalCredits: number, totalWeighted: number }}
//  */
// function calcCumulativeGPA(grades) {
//   let totalWeighted = 0;
//   let totalCredits = 0;

//   for (const g of grades) {
//     const score = parseFloat(g.total_score);
//     const credits = parseInt(g.credits, 10);

//     if (!isNaN(score) && !isNaN(credits) && credits > 0) {
//       totalWeighted += score * credits;
//       totalCredits += credits;
//     }
//   }

//   const gpa = totalCredits > 0
//     ? Math.round((totalWeighted / totalCredits) * 100) / 100
//     : 0;

//   return { gpa, totalCredits, totalWeighted };
// }

// /**
//  * Tính điểm tối thiểu cần đạt cho một môn để đạt GPA mục tiêu
//  *
//  * Công thức (từ GPA_FORMULA.md):
//  *   d_target = ((gpa_target × total_credits) - (gpa_current × total_credits) + (credits × old_score)) / credits
//  *
//  * Rút gọn:
//  *   d_target = old_score + (gpa_target - gpa_current) × total_credits / credits
//  *
//  * @param {number} targetGPA     - GPA mục tiêu (hệ 10)
//  * @param {number} currentGPA    - GPA tích lũy hiện tại
//  * @param {number} totalCredits  - Tổng tín chỉ tích lũy
//  * @param {number} oldScore      - Điểm hiện tại của môn
//  * @param {number} credits       - Số tín chỉ môn học
//  * @returns {number}             - Điểm cần đạt (có thể > 10 nếu không khả thi)
//  */
// function calcRequiredScore(targetGPA, currentGPA, totalCredits, oldScore, credits) {
//   if (credits <= 0) return Infinity;

//   // d_target = old_score + (target - current) × total_credits / credits
//   const dTarget = oldScore + ((targetGPA - currentGPA) * totalCredits) / credits;
//   return Math.round(dTarget * 100) / 100;
// }

// /**
//  * Tính mức tăng GPA khi cải thiện một môn từ old_score lên new_score
//  *
//  * Công thức (từ GPA_FORMULA.md):
//  *   gpa_gain = (new_total × credits - old_total × credits) / total_credits
//  *            = (new_score - old_score) × credits / total_credits
//  *
//  * @param {number} oldScore      - Điểm cũ
//  * @param {number} newScore      - Điểm mới đề xuất
//  * @param {number} credits       - Số tín chỉ môn học
//  * @param {number} totalCredits  - Tổng tín chỉ tích lũy
//  * @returns {number}             - Mức tăng GPA
//  */
// function calcGPAGain(oldScore, newScore, credits, totalCredits) {
//   if (totalCredits <= 0 || credits <= 0) return 0;
//   const gain = ((newScore - oldScore) * credits) / totalCredits;
//   return Math.round(gain * 1000) / 1000;
// }

// /**
//  * Tính số tín chỉ mới cần học thêm để bù đắp khoảng GPA còn thiếu
//  * Sau khi đã tối ưu hết các môn cải thiện
//  *
//  * Công thức (từ GPA_FORMULA.md):
//  *   extra_credits = ceil(points_missing / (assumed_grade - target_gpa))
//  *   points_missing = (target_gpa - max_gpa_after_improvement) × total_credits
//  *
//  * @param {number} targetGPA             - GPA mục tiêu
//  * @param {number} maxGPAAfterImprove    - GPA cao nhất có thể đạt sau cải thiện tất cả môn
//  * @param {number} totalCredits          - Tổng tín chỉ hiện tại
//  * @param {number} assumedGrade          - Điểm giả định cho môn mới (mặc định 8.5)
//  * @returns {number|null}                - Số tín chỉ cần học thêm, hoặc null nếu không áp dụng
//  */
// function calcExtraCreditsNeeded(targetGPA, maxGPAAfterImprove, totalCredits, assumedGrade = ASSUMED_NEW_GRADE) {
//   if (maxGPAAfterImprove >= targetGPA) return null; // Đã đạt, không cần
//   if (assumedGrade <= targetGPA) return Infinity;   // Điểm giả định thấp hơn mục tiêu → không tưởng

//   const pointsMissing = (targetGPA - maxGPAAfterImprove) * totalCredits;
//   return Math.ceil(pointsMissing / (assumedGrade - targetGPA));
// }

// // ==================== MAIN SERVICE ====================

// /**
//  * UC19: Phân tích và gợi ý học cải thiện GPA
//  *
//  * @param {number} userId    - ID của user (student)
//  * @param {number} targetGPA - GPA mục tiêu (hệ 10, 0.0–10.0)
//  * @returns {Object}         - Kết quả phân tích và danh sách gợi ý
//  */
// const getImprovementPlan = async (userId, targetGPA) => {
//   // ── 1. Validate target GPA ─────────────────────────────────────────────
//   const parsedTarget = parseFloat(targetGPA);
//   if (isNaN(parsedTarget) || parsedTarget < 0 || parsedTarget > 10) {
//     throw Object.assign(new Error('Điểm mục tiêu không hợp lệ'), { code: 'INVALID_TARGET' });
//   }

//   // ── 2. Lấy thông tin sinh viên ─────────────────────────────────────────
//   const student = await Student.findOne({ where: { user_id: userId } });
//   if (!student) {
//     throw new Error('Không tìm thấy hồ sơ sinh viên');
//   }

//   // ── 3. Lấy toàn bộ điểm tích lũy (không tính bản ghi cải thiện) ────────
//   const allGrades = await Grade.findAll({
//     where: { student_id: student.id, is_improvement: 0 },
//     include: [{
//       model: Course,
//       as: 'course',
//       attributes: ['id', 'course_code', 'course_name', 'credits']
//     }, {
//       model: Semester,
//       as: 'semester',
//       attributes: ['id', 'name', 'academic_year']
//     }]
//   });

//   if (allGrades.length === 0) {
//     throw new Error('Chưa có dữ liệu điểm tích lũy');
//   }

//   // ── 4. Tính GPA tích lũy hiện tại ──────────────────────────────────────
//   const gradesForCalc = allGrades
//     .filter(g => g.total_score !== null && g.course)
//     .map(g => ({ total_score: g.total_score, credits: g.course.credits }));

//   const { gpa: currentGPA, totalCredits, totalWeighted } = calcCumulativeGPA(gradesForCalc);

//   // ── 5. Cảnh báo mục tiêu cao ─────────────────────────────────────────────
//   const warnings = [];
//   if (parsedTarget - currentGPA > HIGH_AMBITION_THRESHOLD) {
//     warnings.push({
//       code: 'HIGH_AMBITION',
//       message: 'Mục tiêu này rất cao, đòi hỏi sự bứt phá lớn trong học tập'
//     });
//   }

//   // ── 6. Lọc môn đủ điều kiện học cải thiện ──────────────────────────────
//   const eligibleGrades = allGrades.filter(g => {
//     const score = parseFloat(g.total_score);
//     return !isNaN(score) && score >= ELIGIBLE_MIN_SCORE && score <= ELIGIBLE_MAX_SCORE;
//   });

//   if (eligibleGrades.length === 0) {
//     return {
//       success: false,
//       message: 'Hiện tại bạn không có môn học nào đủ điều kiện để đăng ký học cải thiện theo quy chế',
//       current_gpa: currentGPA,
//       target_gpa: parsedTarget,
//       total_credits: totalCredits,
//       eligible_courses: [],
//       warnings
//     };
//   }

//   // ── 7. Tính toán cho từng môn ───────────────────────────────────────────
//   const recommendations = [];

//   for (const gradeRecord of eligibleGrades) {
//     const oldScore = parseFloat(gradeRecord.total_score);
//     const credits = parseInt(gradeRecord.course.credits, 10);

//     // Tính điểm cần đạt để đạt GPA mục tiêu
//     const requiredScore = calcRequiredScore(parsedTarget, currentGPA, totalCredits, oldScore, credits);

//     // Điểm đề xuất: min(10.0, requiredScore)
//     const recommendedScore = Math.min(10.0, requiredScore);

//     // Tính mức tăng GPA nếu đạt điểm đề xuất
//     const gpaGain = calcGPAGain(oldScore, recommendedScore, credits, totalCredits);

//     recommendations.push({
//       grade_id: gradeRecord.id,
//       course_code: gradeRecord.course.course_code,
//       course_name: gradeRecord.course.course_name,
//       credits,
//       old_score: oldScore,
//       required_score: requiredScore,
//       recommended_score: recommendedScore,
//       predicted_gpa_gain: gpaGain,
//       eligibility_status: 'eligible',
//       semester: {
//         id: gradeRecord.semester.id,
//         name: gradeRecord.semester.name,
//         academic_year: gradeRecord.semester.academic_year
//       }
//     });
//   }

//   // ── 8. Sắp xếp theo gpa_gain giảm dần ──────────────────────────────────
//   recommendations.sort((a, b) => b.predicted_gpa_gain - a.predicted_gpa_gain);

//   // ── 9. Tính GPA tối đa có thể đạt sau khi cải thiện tất cả môn ─────────
//   let maxGPAAfterImprove = currentGPA;
//   let totalGainIfAll = 0;

//   for (const rec of recommendations) {
//     totalGainIfAll += rec.predicted_gpa_gain;
//   }
//   maxGPAAfterImprove = currentGPA + totalGainIfAll;
//   maxGPAAfterImprove = Math.round(maxGPAAfterImprove * 100) / 100;

//   // ── 10. Tính extra credits nếu cần ─────────────────────────────────────
//   let extraCreditsNeeded = null;
//   let extraCreditsMessage = null;

//   if (maxGPAAfterImprove < parsedTarget) {
//     extraCreditsNeeded = calcExtraCreditsNeeded(parsedTarget, maxGPAAfterImprove, totalCredits);

//     if (extraCreditsNeeded === Infinity) {
//       extraCreditsMessage = `Ngay cả khi cải thiện tất cả môn đủ điều kiện lên 10.0, GPA tối đa chỉ đạt ${maxGPAAfterImprove}. Mục tiêu ${parsedTarget} không khả thi với điểm giả định ${ASSUMED_NEW_GRADE} cho tín chỉ mới.`;
//     } else {
//       extraCreditsMessage = `Để đạt GPA ${parsedTarget}, bạn cần học thêm khoảng ${extraCreditsNeeded} tín chỉ mới với điểm trung bình ${ASSUMED_NEW_GRADE}, ngoài việc cải thiện các môn đủ điều kiện.`;
//     }
//   }

//   // ── 11. Trả về kết quả ──────────────────────────────────────────────────
//   return {
//     success: true,
//     message: 'Phân tích thành công',
//     current_gpa: currentGPA,
//     target_gpa: parsedTarget,
//     total_credits: totalCredits,
//     max_gpa_after_improvement: maxGPAAfterImprove,
//     gap_to_target: Math.max(0, parsedTarget - maxGPAAfterImprove),
//     eligible_courses: recommendations,
//     extra_credits_needed: extraCreditsNeeded,
//     extra_credits_message: extraCreditsMessage,
//     warnings,
//     summary: {
//       total_eligible_courses: recommendations.length,
//       total_potential_gain: Math.round(totalGainIfAll * 100) / 100,
//       is_target_achievable: maxGPAAfterImprove >= parsedTarget
//     }
//   };
// };

// module.exports = {
//   getImprovementPlan,
//   // Export utilities for testing
//   calcCumulativeGPA,
//   calcRequiredScore,
//   calcGPAGain,
//   calcExtraCreditsNeeded
// };
