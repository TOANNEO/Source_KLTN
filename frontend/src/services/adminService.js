import api from './api';

/**
 * Get admin dashboard data
 */
export const getDashboard = async () => {
  return await api.get('/admin/dashboard');
};

/**
 * Get all users with filters
 */
export const getUsers = async (params) => {
  return await api.get('/admin/users', { params });
};

/**
 * Create new user
 */
export const createUser = async (userData) => {
  return await api.post('/admin/users', userData);
};

/**
 * Update user
 */
export const updateUser = async (id, userData) => {
  return await api.put(`/admin/users/${id}`, userData);
};

/**
 * Delete user
 */
export const deleteUser = async (id) => {
  return await api.delete(`/admin/users/${id}`);
};

// Students Management
export const getStudents = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/admin/students${params ? `?${params}` : ''}`);
};

export const createStudent = async (studentData) => {
  return api.post('/admin/students', studentData);
};

export const updateStudent = async (id, studentData) => {
  return api.put(`/admin/students/${id}`, studentData);
};

export const deleteStudent = async (id) => {
  return api.delete(`/admin/students/${id}`);
};

// Lecturers Management
export const getLecturers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/admin/lecturers${params ? `?${params}` : ''}`);
};

export const createLecturer = async (lecturerData) => {
  return api.post('/admin/lecturers', lecturerData);
};

export const updateLecturer = async (id, lecturerData) => {
  return api.put(`/admin/lecturers/${id}`, lecturerData);
};

export const deleteLecturer = async (id) => {
  return api.delete(`/admin/lecturers/${id}`);
};

// Courses Management
export const getCourses = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/courses${params ? `?${params}` : ''}`);
};

export const createCourse = async (courseData) => {
  return api.post('/admin/courses', courseData);
};

export const updateCourse = async (id, courseData) => {
  return api.put(`/admin/courses/${id}`, courseData);
};

export const deleteCourse = async (id) => {
  return api.delete(`/admin/courses/${id}`);
};

// Semesters Management
export const getSemesters = async () => {
  return api.get('/semesters');
};

export const getCurrentSemester = async () => {
  return api.get('/semesters/current');
};

export const createSemester = async (semesterData) => {
  return api.post('/admin/semesters', semesterData);
};

export const updateSemester = async (id, semesterData) => {
  return api.put(`/admin/semesters/${id}`, semesterData);
};

export const setCurrentSemester = async (id) => {
  return api.put(`/admin/semesters/${id}/set-current`);
};

// Grades Management
export const getGrades = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/admin/grades${params ? `?${params}` : ''}`);
};

export const createGrade = async (gradeData) => {
  return api.post('/admin/grades', gradeData);
};

export const updateGrade = async (id, gradeData) => {
  return api.put(`/admin/grades/${id}`, gradeData);
};

export const deleteGrade = async (id) => {
  return api.delete(`/admin/grades/${id}`);
};

export const getStudentGrades = async (studentId) => {
  return api.get(`/admin/grades/student/${studentId}`);
};

export const getGradeAuditLog = async (gradeId) => {
  return api.get(`/admin/grades/audit-log/${gradeId}`);
};

/**
 * Export grades to Excel
 * @param {Object} filters - Filter options (semester_id, student_id, course_id)
 * @returns {Promise<Blob>} Excel file blob
 */
export const exportGradesToExcel = async (filters = {}) => {
  const params = new URLSearchParams({
    format: 'excel',
    ...filters
  }).toString();

  const response = await api.get(`/admin/grades/export?${params}`, {
    responseType: 'blob'
  });

  return response;
};

/**
 * Export grades to PDF
 * @param {Object} filters - Filter options (semester_id, student_id, course_id)
 * @returns {Promise<Blob>} PDF file blob
 */
export const exportGradesToPDF = async (filters = {}) => {
  const params = new URLSearchParams({
    format: 'pdf',
    ...filters
  }).toString();

  const response = await api.get(`/admin/grades/export?${params}`, {
    responseType: 'blob'
  });

  return response;
};

