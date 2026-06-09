import api from './api';

/**
 * Get lecturer dashboard data
 */
export const getDashboard = async () => {
  return await api.get('/lecturer/dashboard');
};

/**
 * UC30: Get dashboard stats
 */
export const getDashboardStats = async () => {
  return await api.get('/lecturer/dashboard/stats');
};

/**
 * Get at-risk students
 */
export const getAtRiskStudents = async (params = {}) => {
  return await api.get('/lecturer/at-risk-students', { params });
};

/**
 * Get student report
 */
export const getStudentReport = async (studentId) => {
  return await api.get(`/lecturer/students/${studentId}/report`);
};

/**
 * UC32: Get detailed student profile (read-only for lecturer)
 */
export const getStudentDetail = async (studentId) => {
  return await api.get(`/lecturer/students/${studentId}/detail`);
};

/**
 * Export report (legacy)
 */
export const exportReport = async (data) => {
  return await api.post('/lecturer/reports/export', data);
};

// ==================== CLASSES (UC28) ====================
export const getLecturerClasses = async () =>
  api.get('/lecturer/classes');

export const getLecturerClassDetail = async (id) =>
  api.get(`/lecturer/classes/${id}`);

// ==================== UC30+UC31: ALERTS & SEARCH ====================

/**
 * UC31: Get real-time alerts (polling every 30s)
 */
export const getAlerts = async () =>
  api.get('/lecturer/alerts');

/**
 * UC30: Quick search students
 */
export const searchStudents = async (q) =>
  api.get('/lecturer/students/search', { params: { q } });

// ==================== UC33: Nhật ký can thiệp ====================

/**
 * Get intervention logs with filters
 */
export const getInterventions = async (params = {}) =>
  api.get('/lecturer/interventions', { params });

/**
 * Create new intervention log
 */
export const createIntervention = async (data) =>
  api.post('/lecturer/interventions', data);

/**
 * Update intervention log
 */
export const updateIntervention = async (id, data) =>
  api.put(`/lecturer/interventions/${id}`, data);

/**
 * UC33: Auto-generate intervention content template
 */
export const getInterventionTemplate = async (studentId, semesterId) =>
  api.get('/lecturer/interventions/template', {
    params: { student_id: studentId, semester_id: semesterId }
  });

// ==================== UC35: Báo cáo ====================

/**
 * Risk ratio report per class/semester
 */
export const getRiskRatio = async (params = {}) =>
  api.get('/lecturer/report/risk-ratio', { params });

/**
 * Intervention ROI report
 */
export const getInterventionROI = async (semesterId) =>
  api.get('/lecturer/report/intervention-roi', { params: { semester_id: semesterId } });

/**
 * Export at-risk report (Excel/PDF)
 */
export const exportLecturerReport = async (params) => {
  const response = await api.get('/lecturer/report/export', {
    params,
    responseType: 'blob'
  });

  return response.data;
};

// ==================== UC23 ====================
export const getImprovementReport = async (params = {}) =>
  api.get('/lecturer/improvement-report', { params });

// ==================== INTERVENTION CONFIRMATION ====================

/**
 * Giảng viên phê duyệt từ chối của sinh viên
 */
export const approveRejection = async (id) =>
  api.post(`/lecturer/interventions/${id}/approve-rejection`);

/**
 * Giảng viên từ chối yêu cầu của sinh viên
 */
export const denyRejection = async (id) =>
  api.post(`/lecturer/interventions/${id}/deny-rejection`);
