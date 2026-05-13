/**
 * Calculate total score for a course
 * Formula: total = 0.3 * middleExam + 0.7 * finalExam
 */
export const calculateTotalScore = (middleExam, finalExam) => {
  return (0.3 * middleExam + 0.7 * finalExam).toFixed(2);
};

/**
 * Calculate cumulative GPA
 * Formula: GPA = SUM(score_i * credits_i) / SUM(credits_i)
 */
export const calculateCumulativeGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;

  const totalWeighted = grades.reduce((sum, g) => sum + g.total_score * g.credits, 0);
  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);

  if (totalCredits === 0) return 0;
  return (totalWeighted / totalCredits).toFixed(2);
};

/**
 * Check if student is eligible for improvement exam
 * Condition: 4.0 <= total_score <= 5.6
 */
export const isEligibleForImprovement = (totalScore) => {
  return totalScore >= 4.0 && totalScore <= 5.6;
};

/**
 * Convert score to letter grade
 */
export const scoreToLetterGrade = (score) => {
  if (score >= 8.5) return 'A+';
  if (score >= 8.0) return 'A';
  if (score >= 7.0) return 'B+';
  if (score >= 6.5) return 'B';
  if (score >= 5.5) return 'C+';
  if (score >= 5.0) return 'C';
  if (score >= 4.0) return 'D+';
  if (score >= 3.5) return 'D';
  return 'F';
};
