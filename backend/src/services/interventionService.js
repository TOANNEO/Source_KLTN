const { InterventionLog, Student, Lecturer, Semester, Class, PredictionHistory, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Lấy lecturer record từ user_id
 */
const getLecturerByUserId = async (userId) => {
  const lecturer = await Lecturer.findOne({ where: { user_id: userId } });
  if (!lecturer) throw new Error('Không tìm thấy hồ sơ giảng viên');
  return lecturer;
};

// Helper để build include Student với User (tránh lặp code)
const studentInclude = {
  model: Student,
  as: 'student',
  attributes: ['id', 'student_code'],
  include: [
    { model: User,  as: 'user',  attributes: ['first_name', 'last_name'] },
    { model: Class, as: 'class', attributes: ['class_name'] }
  ]
};

/**
 * Lấy danh sách nhật ký can thiệp
 */
const getInterventions = async ({ userId, studentId, semesterId, status }) => {
  const lecturer = await getLecturerByUserId(userId);

  const where = { lecturer_id: lecturer.id };
  if (studentId) where.student_id = studentId;
  if (semesterId) where.semester_id = semesterId;
  if (status) where.status = status;

  const logs = await InterventionLog.findAll({
    where,
    include: [
      studentInclude,
      { model: Semester, as: 'semester', attributes: ['id', 'name', 'academic_year'] }
    ],
    order: [['contacted_at', 'DESC']]
  });

  // Flatten student.user into student.full_name for frontend
  return logs.map(log => {
    const obj = log.toJSON();
    if (obj.student && obj.student.user) {
      obj.student.full_name = `${obj.student.user.first_name || ''} ${obj.student.user.last_name || ''}`.trim();
    }
    return obj;
  });
};

/**
 * Tạo nhật ký can thiệp mới
 */
const createIntervention = async ({ userId, studentId, semesterId, method, content, status, meeting_time }) => {
  const lecturer = await getLecturerByUserId(userId);

  const student = await Student.findOne({ where: { id: studentId } });
  if (!student) throw new Error('Không tìm thấy sinh viên');

  const createData = {
    student_id: studentId,
    lecturer_id: lecturer.id,
    semester_id: semesterId,
    method,
    content,
    status: status || 'not_contacted',
    contacted_at: new Date(),
    student_response: 'pending',
    lecturer_approval: 'pending'
  };
  if (meeting_time) createData.meeting_time = meeting_time;

  const intervention = await InterventionLog.create(createData);

  const log = await InterventionLog.findByPk(intervention.id, {
    include: [
      studentInclude,
      { model: Semester, as: 'semester', attributes: ['id', 'name'] }
    ]
  });

  const obj = log.toJSON();
  if (obj.student && obj.student.user) {
    obj.student.full_name = `${obj.student.user.first_name || ''} ${obj.student.user.last_name || ''}`.trim();
  }
  return obj;
};

/**
 * Cập nhật nhật ký can thiệp
 */
const updateIntervention = async ({ id, userId, method, content, status, meeting_time }) => {
  const lecturer = await getLecturerByUserId(userId);

  const intervention = await InterventionLog.findOne({
    where: { id, lecturer_id: lecturer.id }
  });
  if (!intervention) return null;

  const updates = {};
  if (method       !== undefined) updates.method       = method;
  if (content      !== undefined) updates.content      = content;
  if (status       !== undefined) updates.status       = status;
  if (meeting_time !== undefined) updates.meeting_time = meeting_time;

  await intervention.update(updates);

  const log = await InterventionLog.findByPk(id, {
    include: [
      studentInclude,
      { model: Semester, as: 'semester', attributes: ['id', 'name'] }
    ]
  });

  const obj = log.toJSON();
  if (obj.student && obj.student.user) {
    obj.student.full_name = `${obj.student.user.first_name || ''} ${obj.student.user.last_name || ''}`.trim();
  }
  return obj;
};

/**
 * Tự động sinh mẫu nội dung từ risk profile của SV
 */
const generateTemplate = async (studentId, semesterId) => {
  const prediction = await PredictionHistory.findOne({
    where: { student_id: studentId, semester_id: semesterId },
    order: [['predicted_at', 'DESC']]
  });
  if (!prediction) return 'Sinh viên cần được theo dõi và hỗ trợ.';

  const { risk_label, feature_importance } = prediction;
  let template = risk_label === 'danger'
    ? 'Sinh viên đang ở mức nguy cơ cao. '
    : risk_label === 'warning'
      ? 'Sinh viên có dấu hiệu cần quan tâm. '
      : '';

  if (feature_importance) {
    try {
      const features = Array.isArray(feature_importance)
        ? feature_importance
        : JSON.parse(feature_importance);
      const top = features[0];
      const messages = {
        social_media_hours:  'Thời gian sử dụng mạng xã hội cao bất thường. Đề nghị gặp trực tiếp để tư vấn quản lý thời gian.',
        study_hours_per_day: 'Thời gian tự học thấp. Cần hướng dẫn phương pháp học tập hiệu quả.',
        class_attendance:    'Tỷ lệ đi học thấp. Cần tìm hiểu nguyên nhân và nhắc nhở.',
        mental_stress_level: 'Mức độ căng thẳng cao. Đề nghị tư vấn tâm lý và hỗ trợ tinh thần.',
        sleep_hours_per_day: 'Thời gian ngủ không đủ. Cần tư vấn về sức khỏe và lối sống.',
        screen_time_hours:   'Thời gian sử dụng thiết bị điện tử quá nhiều. Cần điều chỉnh thói quen.'
      };
      if (top) template += messages[top.factor] || 'Cần theo dõi và hỗ trợ thêm.';
    } catch (_) { /* ignore */ }
  }

  return template || 'Sinh viên cần được theo dõi và hỗ trợ.';
};

/**
 * Lấy danh sách lịch can thiệp của sinh viên đang đăng nhập
 */
const getStudentInterventions = async (userId) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) throw new Error('Không tìm thấy hồ sơ sinh viên');

  const logs = await InterventionLog.findAll({
    where: { student_id: student.id},
    include: [
      { model: Semester, as: 'semester', attributes: ['id', 'name', 'academic_year'] }
    ],
    order: [['created_at', 'DESC']]
  });

  return logs.map(log => {
    const obj = log.toJSON();
    return {
      id: obj.id,
      content: obj.content,
      method: obj.method,
      meeting_time: obj.meeting_time,
      status: obj.status,
      student_response: obj.student_response,
      reject_reason: obj.reject_reason,
      lecturer_approval: obj.lecturer_approval,
      created_at: obj.created_at,
      semester: obj.semester
    };
  });
};

/**
 * Sinh viên chấp nhận lịch can thiệp
 */
const acceptIntervention = async ({ id, userId }) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) throw new Error('Không tìm thấy hồ sơ sinh viên');

  const intervention = await InterventionLog.findOne({
    where: { id, student_id: student.id }
  });
  if (!intervention) return null;

  await intervention.update({ student_response: 'accepted' });
  return intervention.toJSON();
};

/**
 * Sinh viên từ chối lịch can thiệp
 */
const rejectIntervention = async ({ id, userId, reason }) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) throw new Error('Không tìm thấy hồ sơ sinh viên');

  const intervention = await InterventionLog.findOne({
    where: { id, student_id: student.id }
  });
  if (!intervention) return null;

  await intervention.update({
    student_response: 'rejected',
    reject_reason: reason || null,
    lecturer_approval: 'pending'
  });
  return intervention.toJSON();
};

/**
 * Giảng viên phê duyệt từ chối của sinh viên
 */
const approveRejection = async ({ id, userId }) => {
  const lecturer = await getLecturerByUserId(userId);

  const intervention = await InterventionLog.findOne({
    where: { id, lecturer_id: lecturer.id }
  });
  if (!intervention) return null;

  await intervention.update({ lecturer_approval: 'approved' });
  return intervention.toJSON();
};

/**
 * Giảng viên từ chối yêu cầu của sinh viên
 */
const denyRejection = async ({ id, userId }) => {
  const lecturer = await getLecturerByUserId(userId);
  console.log('DENY REJECTION CALLED', id);
  const intervention = await InterventionLog.findOne({
    where: { id, lecturer_id: lecturer.id }
  });
  if (!intervention) return null;

  await intervention.update({ lecturer_approval: 'denied', student_response: 'pending' });
  console.log('AFTER UPDATE', intervention.student_response);
  return intervention.toJSON();
};

module.exports = {
  getInterventions,
  createIntervention,
  updateIntervention,
  generateTemplate,
  getLecturerByUserId,
  getStudentInterventions,
  acceptIntervention,
  rejectIntervention,
  approveRejection,
  denyRejection
};
