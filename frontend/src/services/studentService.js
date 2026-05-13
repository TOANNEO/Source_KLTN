import api from './api';

/**
 * Get student dashboard data
 */
export const getDashboard = async () => {
  return await api.get('/student/dashboard');
};

/**
 * Get student profile
 */
export const getProfile = async () => {
  return await api.get('/student/profile');
};

/**
 * Get student grades
 */
export const getGrades = async () => {
  return await api.get('/student/grades');
};

/**
 * Get GPA history for chart
 */
export const getGPAHistory = async () => {
  return await api.get('/student/gpa-history');
};

/**
 * Get current behavior
 */
export const getCurrentBehavior = async () => {
  return await api.get('/student/behavior/current');
};

/**
 * Get behavior records
 */
export const getBehaviorRecords = async () => {
  return await api.get('/student/behavior');
};

/**
 * Create or update behavior record
 */
export const createOrUpdateBehavior = async (data) => {
  return await api.post('/student/behavior', data);
};

/**
 * Get latest prediction
 */
export const getLatestPrediction = async () => {
  return await api.get('/student/prediction/latest');
};

/**
 * Run prediction
 */
export const runPrediction = async (data) => {
  return await api.post('/student/predict', data);
};

/**
 * Get prediction history
 */
export const getPredictionHistory = async () => {
  return await api.get('/student/prediction/history');
};

/**
 * Get improvement suggestions
 */
export const getImprovementSuggestions = async (targetGPA) => {
  return await api.post('/student/improvement-suggestions', { target_gpa: targetGPA });
};
