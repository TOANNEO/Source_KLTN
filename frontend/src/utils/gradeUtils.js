/**
 * Convert grade from scale 10 to scale 4
 * Based on TLU grading system
 */
export const convertTo4Scale = (grade10) => {
  const score = parseFloat(grade10);
  if (isNaN(score)) return 0;

  if (score >= 9.0) return 4.0;
  if (score >= 8.5) return 3.5;
  if (score >= 8.0) return 3.2;
  if (score >= 7.5) return 3.1;
  if (score >= 7.0) return 3.0;
  if (score >= 6.5) return 2.7;
  if (score >= 6.0) return 2.5;
  if (score >= 5.5) return 2.3;
  if (score >= 5.0) return 2.0;
  if (score >= 4.5) return 1.7;
  if (score >= 4.0) return 1.5;
  if (score >= 3.5) return 1.3;
  if (score >= 3.0) return 1.0;
  if (score >= 2.0) return 0.7;
  if (score >= 1.0) return 0.5;
  return 0;
};

/**
 * Convert grade from scale 10 to letter grade
 */
export const convertToLetterGrade = (grade10) => {
  const score = parseFloat(grade10);
  if (isNaN(score)) return 'F';

  if (score >= 9.0) return 'A+';
  if (score >= 8.0) return 'A';
  if (score >= 7.5) return 'B+';
  if (score >= 7.0) return 'B';
  if (score >= 6.5) return 'C+';
  if (score >= 6.0) return 'C';
  if (score >= 5.5) return 'D+';
  if (score >= 4.0) return 'D';
  return 'F';
};

/**
 * Check if grade is passing
 */
export const isPassing = (grade10) => {
  const score = parseFloat(grade10);
  return !isNaN(score) && score >= 4.0;
};

/**
 * Get grade color class based on score
 */
export const getGradeColorClass = (grade10) => {
  const score = parseFloat(grade10);
  if (isNaN(score)) return 'text-gray-500';

  if (score < 4.0) return 'text-red-600 font-bold'; // Không đạt
  if (score <= 5.6) return 'text-yellow-600 font-semibold'; // Học cải thiện
  return 'text-green-600'; // Đạt
};

/**
 * Get grade background color class
 */
export const getGradeBgClass = (grade10) => {
  const score = parseFloat(grade10);
  if (isNaN(score)) return 'bg-gray-50';

  if (score < 4.0) return 'bg-red-50';
  if (score <= 5.6) return 'bg-yellow-50';
  return 'bg-green-50';
};

/**
 * Check if course is conditional (điều kiện)
 */
export const isConditionalCourse = (courseName) => {
  return courseName && courseName.includes('*');
};

/**
 * Calculate semester GPA (both scale 10 and scale 4)
 */

export const calculateSemesterGPA = (grades) => {
  let totalWeighted10 = 0;
  let totalWeighted4 = 0;
  let totalCredits = 0;
  let passedCredits = 0;
  let failedCredits = 0;

  grades.forEach(grade => {
      const credits =
      parseFloat(
        grade.credits ||
        grade.subject?.credits ||
        grade.course?.credits
      ) || 0;
    // Lấy điểm tổng kết
    const score10 =
      parseFloat(
        grade.total_score ||
        grade.final_score ||
        grade.score
      ) || 0;
    const score4 = convertTo4Scale(score10);

    totalWeighted10 += score10 * credits;
    totalWeighted4 += score4 * credits;
    totalCredits += credits;

    if (isPassing(score10)) {
      passedCredits += credits;
    } else {
      failedCredits += credits;
    }
  });

  return {
    gpa10: totalCredits > 0 ? (totalWeighted10 / totalCredits).toFixed(2) : '0.00',
    gpa4: totalCredits > 0 ? (totalWeighted4 / totalCredits).toFixed(2) : '0.00',
    totalCredits,
    passedCredits,
    failedCredits
  };
};

/**
 * Group grades by academic year and semester
 */
export const groupGradesByYearAndSemester = (grades) => {
  const grouped = {};

  grades.forEach(grade => {
    const year = grade.semester?.academic_year || 'Unknown';
    const semesterName = grade.semester?.name || 'Unknown';

    if (!grouped[year]) {
      grouped[year] = {};
    }

    if (!grouped[year][semesterName]) {
      grouped[year][semesterName] = [];
    }

    grouped[year][semesterName].push(grade);
  });

  return grouped;
};
