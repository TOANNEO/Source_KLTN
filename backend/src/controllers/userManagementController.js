const studentService = require('../services/studentService');
const lecturerService = require('../services/lecturerService');

// ==================== STUDENTS ====================

const getStudents = async (req, res) => {
  try {
    const filters = {
      course_year: req.query.course_year,
      major: req.query.major,
      search: req.query.search
    };
    const students = await studentService.getAllStudents(filters);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách sinh viên' });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message || 'Không tìm thấy sinh viên' });
  }
};

const createStudent = async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({ success: true, data: student, message: 'Tạo sinh viên thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi tạo sinh viên' });
  }
};

const updateStudent = async (req, res) => {
   console.log('controller');
  try {
    const result = await studentService.updateStudent(req.params.id, req.body);
    res.json({
      success: true,
      data: result.student,
      hasGrades: result.hasGrades,
      message: 'Cập nhật sinh viên thành công',
      ...(result.hasGrades && { warning: 'Sinh viên này đã có điểm trong hệ thống' })
    });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message || 'Lỗi khi cập nhật sinh viên' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.json({ success: true, message: 'Đã vô hiệu hóa tài khoản sinh viên' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi xóa sinh viên' });
  }
};

const toggleStudentActive = async (req, res) => {
  try {
    const result = await studentService.toggleStudentActive(req.params.id);
    res.json({
      success: true,
      data: result,
      message: result.is_active ? 'Đã kích hoạt tài khoản sinh viên' : 'Đã vô hiệu hóa tài khoản sinh viên'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi thay đổi trạng thái' });
  }
};

const resetStudentPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    await studentService.resetStudentPassword(req.params.id, new_password);
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi đặt lại mật khẩu' });
  }
};

// ==================== LECTURERS ====================

const getLecturers = async (req, res) => {
  try {
    const filters = {
      department_id: req.query.department_id,
      degree: req.query.degree,
      search: req.query.search
    };
    const lecturers = await lecturerService.getAllLecturers(filters);
    res.json({ success: true, data: lecturers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách giảng viên' });
  }
};

const getLecturerById = async (req, res) => {
  try {
    const lecturer = await lecturerService.getLecturerById(req.params.id);
    res.json({ success: true, data: lecturer });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message || 'Không tìm thấy giảng viên' });
  }
};

const createLecturer = async (req, res) => {
  try {
    const lecturer = await lecturerService.createLecturer(req.body);
    res.status(201).json({ success: true, data: lecturer, message: 'Tạo giảng viên thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi tạo giảng viên' });
  }
};

const updateLecturer = async (req, res) => {
  try {
    const lecturer = await lecturerService.updateLecturer(req.params.id, req.body);
    res.json({ success: true, data: lecturer, message: 'Cập nhật giảng viên thành công' });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message || 'Lỗi khi cập nhật giảng viên' });
  }
};

const deleteLecturer = async (req, res) => {
  try {
    await lecturerService.deleteLecturer(req.params.id);
    res.json({ success: true, message: 'Đã vô hiệu hóa tài khoản giảng viên' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi xóa giảng viên' });
  }
};

const toggleLecturerActive = async (req, res) => {
  try {
    const result = await lecturerService.toggleLecturerActive(req.params.id);
    res.json({
      success: true,
      data: result,
      message: result.is_active ? 'Đã kích hoạt tài khoản giảng viên' : 'Đã vô hiệu hóa tài khoản giảng viên'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi thay đổi trạng thái' });
  }
};

const resetLecturerPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    await lecturerService.resetLecturerPassword(req.params.id, new_password);
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi đặt lại mật khẩu' });
  }
};

module.exports = {
  // Students
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentActive,
  resetStudentPassword,
  // Lecturers
  getLecturers,
  getLecturerById,
  createLecturer,
  updateLecturer,
  deleteLecturer,
  toggleLecturerActive,
  resetLecturerPassword
};
