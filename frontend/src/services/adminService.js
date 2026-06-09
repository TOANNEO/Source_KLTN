import api from './api';

/**
 * Get admin dashboard data (account stats + grade trends)
 */
export const getDashboard = async () => {
  return await api.get('/admin/dashboard');
};

/**
 * Get recent login list (for real-time panel)
 */
export const getRecentLogins = async (limit = 20) => {
  return await api.get('/admin/dashboard/recent-logins', { params: { limit } });
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

export const toggleStudentActive = async (id) => {
  return api.put(`/admin/students/${id}/toggle-active`);
};

export const resetStudentPassword = async (id, new_password) => {
  return api.put(`/admin/students/${id}/reset-password`, { new_password });
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

export const toggleLecturerActive = async (id) => {
  return api.put(`/admin/lecturers/${id}/toggle-active`);
};

export const resetLecturerPassword = async (id, new_password) => {
  return api.put(`/admin/lecturers/${id}/reset-password`, { new_password });
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

// ==================== DEPARTMENTS ====================
export const getDepartments = async () => {
  return api.get('/admin/departments');
};

// ==================== CLASSES MANAGEMENT ====================
export const getClasses = async (params = {}) =>
  api.get('/admin/classes', { params });

export const getClassById = async (id) =>
  api.get(`/admin/classes/${id}`);

export const createClass = async (data) =>
  api.post('/admin/classes', data);

export const updateClass = async (id, data) =>
  api.put(`/admin/classes/${id}`, data);

export const deleteClass = async (id) =>
  api.delete(`/admin/classes/${id}`);

export const assignHomeroom = async (classId, data) =>
  api.put(`/admin/classes/${classId}/homeroom`, data);

export const getClassStudents = async (classId) =>
  api.get(`/admin/classes/${classId}/students`);

export const getUnassignedStudents = async (search = '') =>
  api.get('/admin/classes/students/unassigned', { params: { search } });

export const addStudentsToClass = async (classId, student_ids) =>
  api.post(`/admin/classes/${classId}/students`, { student_ids });

export const removeStudentFromClass = async (classId, studentId) =>
  api.delete(`/admin/classes/${classId}/students/${studentId}`);
