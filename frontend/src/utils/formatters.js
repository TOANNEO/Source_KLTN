/**
 * Format date to Vietnamese locale
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

/**
 * Format datetime to Vietnamese locale
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN');
};

/**
 * Format GPA score to 2 decimal places
 */
export const formatGPA = (value) => {
  if (value === null || value === undefined) return '-';
  return parseFloat(value).toFixed(2);
};

/**
 * Format percentage
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined) return '-';
  return `${parseFloat(value).toFixed(1)}%`;
};
