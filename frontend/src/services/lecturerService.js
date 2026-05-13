import api from './api';

/**
 * Get lecturer dashboard data
 */
export const getDashboard = async () => {
  return await api.get('/lecturer/dashboard');
};

/**
 * Get at-risk students
 */
export const getAtRiskStudents = async () => {
  return await api.get('/lecturer/at-risk-students');
};

/**
 * Get student report
 */
export const getStudentReport = async (studentId) => {
  return await api.get(`/lecturer/students/${studentId}/report`);
};

/**
 * Export report
 */
export const exportReport = async (data) => {
  return await api.post('/lecturer/reports/export', data);
};
