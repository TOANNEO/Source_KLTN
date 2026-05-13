// GPA Service - Calculate GPA based on TLU formula
/**
 * Calculate total score for a course
 * Formula: total = 0.3 * middle_exam + 0.7 * final_exam
 */
const calculateTotalScore = (middleExam, finalExam) => {
  // TODO: Implement calculation
  return 0.3 * middleExam + 0.7 * finalExam;
};

/**
 * Calculate cumulative GPA
 * Formula: GPA = SUM(score_i * credits_i) / SUM(credits_i)
 */
const calculateCumulativeGPA = (grades) => {
  // TODO: Implement calculation
  return 0;
};

/**
 * Check if student is eligible for improvement exam
 * Condition: 4.0 <= total_score <= 5.6
 */
const isEligibleForImprovement = (totalScore) => {
  return totalScore >= 4.0 && totalScore <= 5.6;
};

module.exports = {
  calculateTotalScore,
  calculateCumulativeGPA,
  isEligibleForImprovement
};
