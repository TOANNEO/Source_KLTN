const classService = require('../services/classService');

// ==================== ADMIN ====================

const getClasses = async (req, res) => {
  try {
    const filters = {
      department_id: req.query.department_id,
      search: req.query.search
    };
    const classes = await classService.getClasses(filters);
    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('getClasses error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách lớp' });
  }
};

const getClassById = async (req, res) => {
  try {
    const cls = await classService.getClassById(req.params.id);
    res.json({ success: true, data: cls });
  } catch (error) {
    console.error('getClassById error:', error);
    res.status(404).json({ success: false, message: error.message || 'Không tìm thấy lớp' });
  }
};

const createClass = async (req, res) => {
  try {
    const cls = await classService.createClass(req.body);
    res.status(201).json({ success: true, data: cls, message: 'Tạo lớp thành công' });
  } catch (error) {
    console.error('createClass error:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi tạo lớp' });
  }
};

const updateClass = async (req, res) => {
  try {
    const cls = await classService.updateClass(req.params.id, req.body);
    res.json({ success: true, data: cls, message: 'Cập nhật lớp thành công' });
  } catch (error) {
    console.error('updateClass error:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi cập nhật lớp' });
  }
};

const deleteClass = async (req, res) => {
  try {
    await classService.deleteClass(req.params.id);
    res.json({ success: true, message: 'Xóa lớp thành công' });
  } catch (error) {
    console.error('deleteClass error:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi xóa lớp' });
  }
};

const assignHomeroom = async (req, res) => {
  try {
    const cls = await classService.assignHomeroom(req.params.id, req.body.lecturer_id);
    res.json({ success: true, data: cls, message: 'Phân công GVCN thành công' });
  } catch (error) {
    console.error('assignHomeroom error:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi phân công GVCN' });
  }
};

const getClassStudents = async (req, res) => {
  try {
    const students = await classService.getClassStudents(req.params.id);
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('getClassStudents error:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách sinh viên' });
  }
};

const getUnassignedStudents = async (req, res) => {
  try {
    const students = await classService.getUnassignedStudents(req.query.search || '');
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('getUnassignedStudents error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách sinh viên' });
  }
};

const addStudentsToClass = async (req, res) => {
  try {
    const { student_ids } = req.body;
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách sinh viên không hợp lệ' });
    }
    const result = await classService.addStudentsToClass(req.params.id, student_ids);
    res.json({ success: true, data: result, message: `Đã thêm ${result.added.length} sinh viên vào lớp` });
  } catch (error) {
    console.error('addStudentsToClass error:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi thêm sinh viên vào lớp' });
  }
};

const removeStudentFromClass = async (req, res) => {
  try {
    await classService.removeStudentFromClass(req.params.id, req.params.studentId);
    res.json({ success: true, message: 'Đã xóa sinh viên khỏi lớp' });
  } catch (error) {
    console.error('removeStudentFromClass error:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi xóa sinh viên khỏi lớp' });
  }
};

// ==================== LECTURER ====================

const getLecturerClasses = async (req, res) => {
  try {
    const classes = await classService.getLecturerClasses(req.user.id);
    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('getLecturerClasses error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách lớp chủ nhiệm' });
  }
};

const getLecturerClassDetail = async (req, res) => {
  try {
    const data = await classService.getLecturerClassDetail(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('getLecturerClassDetail error:', error);
    res.status(403).json({ success: false, message: error.message || 'Lỗi khi lấy chi tiết lớp' });
  }
};

// ==================== STUDENT ====================

const getStudentClassInfo = async (req, res) => {
  try {
    const data = await classService.getStudentClassInfo(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('getStudentClassInfo error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy thông tin lớp' });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignHomeroom,
  getClassStudents,
  getUnassignedStudents,
  addStudentsToClass,
  removeStudentFromClass,
  getLecturerClasses,
  getLecturerClassDetail,
  getStudentClassInfo
};
