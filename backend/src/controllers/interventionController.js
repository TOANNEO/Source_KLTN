const interventionService = require('../services/interventionService');
const { getRiskRatio, getInterventionROI, exportLecturerReport } = require('../services/reportService');
const { Student, Lecturer, Class, PredictionHistory, Semester, User } = require('../models');
const { Op } = require('sequelize');

// ==================== UC31: Cảnh báo real-time ====================

/**
 * GET /lecturer/alerts
 * SV rơi vào danger trong 24h GẦN NHẤT hoặc GPA giảm > 1.0
 */
const getAlerts = async (req, res) => {
  try {
    const lecturer = await interventionService.getLecturerByUserId(req.user.id);

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Lấy SV thuộc lớp chủ nhiệm
    const classes = await Class.findAll({
      where: { lecturer_id: lecturer.id },
      attributes: ['id', 'class_name']
    });
    if (classes.length === 0) return res.json({ success: true, data: [] });

    const classIds = classes.map(c => c.id);
    const students = await Student.findAll({
      where: { class_id: { [Op.in]: classIds } },
      include: [
        { model: Class, as: 'class', attributes: ['class_name'] },
        { model: User,  as: 'user',  attributes: ['first_name', 'last_name'] }
      ],
      attributes: ['id', 'student_code', 'class_id']
    });
    if (students.length === 0) return res.json({ success: true, data: [] });

    const studentIds = students.map(s => s.id);
    // Helper to get display name
    const getName = (sv) => sv.user ? `${sv.user.first_name || ''} ${sv.user.last_name || ''}`.trim() : sv.student_code;

    // Dự báo danger trong 24h
    const recentDanger = await PredictionHistory.findAll({
      where: {
        student_id: { [Op.in]: studentIds },
        risk_label: 'danger',
        predicted_at: { [Op.gte]: cutoff }
      },
      order: [['predicted_at', 'DESC']]
    });

    // Tất cả predictions để tìm drop GPA
    const allPreds = await PredictionHistory.findAll({
      where: { student_id: { [Op.in]: studentIds } },
      order: [['student_id', 'ASC'], ['predicted_at', 'DESC']]
    });

    const alertMap = new Map();

    // Add danger alerts
    for (const pred of recentDanger) {
      const sv = students.find(s => s.id === pred.student_id);
      if (!sv) continue;
      if (!alertMap.has(pred.student_id)) {
        alertMap.set(pred.student_id, {
          student_id: pred.student_id,
          student_code: sv.student_code,
          full_name: getName(sv),
          class_name: sv.class?.class_name,
          predicted_gpa: parseFloat(pred.predicted_gpa),
          risk_label: pred.risk_label,
          gpa_change: null,
          predicted_at: pred.predicted_at,
          alert_type: 'danger'
        });
      }
    }

    // Add GPA-drop alerts
    const grouped = {};
    for (const p of allPreds) {
      if (!grouped[p.student_id]) grouped[p.student_id] = [];
      grouped[p.student_id].push(p);
    }

    for (const [sid, preds] of Object.entries(grouped)) {
      if (preds.length < 2) continue;
      const curr = preds[0];
      const prev = preds[1];
      const drop = parseFloat(prev.predicted_gpa) - parseFloat(curr.predicted_gpa);

      if (drop > 1.0 && new Date(curr.predicted_at) >= cutoff && !alertMap.has(parseInt(sid))) {
        const sv = students.find(s => s.id === parseInt(sid));
        if (!sv) continue;
        alertMap.set(parseInt(sid), {
          student_id: parseInt(sid),
          student_code: sv.student_code,
          full_name: getName(sv),
          class_name: sv.class?.class_name,
          predicted_gpa: parseFloat(curr.predicted_gpa),
          risk_label: curr.risk_label,
          gpa_change: -drop,
          predicted_at: curr.predicted_at,
          alert_type: 'gpa_drop'
        });
      }
    }

    const alerts = Array.from(alertMap.values())
      .sort((a, b) => new Date(b.predicted_at) - new Date(a.predicted_at));

    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('getAlerts error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy cảnh báo' });
  }
};

// ==================== UC30: Tìm kiếm sinh viên ====================

/**
 * GET /lecturer/students/search?q=
 */
const searchStudents = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json({ success: true, data: [] });
    }

    const lecturer = await interventionService.getLecturerByUserId(req.user.id);
    const classes = await Class.findAll({
      where: { lecturer_id: lecturer.id },
      attributes: ['id', 'class_name']
    });
    if (classes.length === 0) return res.json({ success: true, data: [] });

    const classIds = classes.map(c => c.id);
    const query = `%${q.trim()}%`;

    const students = await Student.findAll({
      where: {
        class_id: { [Op.in]: classIds },
        [Op.or]: [
          { student_code: { [Op.like]: query } },
          { full_name: { [Op.like]: query } }
        ]
      },
      include: [{ model: Class, as: 'class', attributes: ['class_name'] }],
      attributes: ['id', 'student_code', 'full_name', 'gpa_cumulative'],
      limit: 10
    });

    // Attach latest risk label
    const result = await Promise.all(students.map(async sv => {
      const latestPred = await PredictionHistory.findOne({
        where: { student_id: sv.id },
        order: [['predicted_at', 'DESC']]
      });
      return {
        id: sv.id,
        student_code: sv.student_code,
        full_name: sv.full_name,
        class_name: sv.class.class_name,
        gpa_cumulative: sv.gpa_cumulative,
        risk_label: latestPred?.risk_label || null
      };
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('searchStudents error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi tìm kiếm' });
  }
};

// ==================== UC32: Chi tiết SV ====================

/**
 * GET /lecturer/students/:id/detail
 */
const getStudentDetail = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    // Reuse existing lecturerService.getStudentDetailReport
    const lecturerService2 = require('../services/lecturerService');
    const report = await lecturerService2.getStudentDetailReport(studentId);

    // Also get intervention logs
    const lecturer = await interventionService.getLecturerByUserId(req.user.id);
    const interventions = await interventionService.getInterventions({
      userId: req.user.id,
      studentId
    });

    res.json({
      success: true,
      data: { ...report, interventions }
    });
  } catch (error) {
    console.error('getStudentDetail error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy hồ sơ sinh viên' });
  }
};

// ==================== UC33: Nhật ký can thiệp ====================

const getInterventions = async (req, res) => {
  try {
    const { student_id, semester_id, status } = req.query;
    const interventions = await interventionService.getInterventions({
      userId: req.user.id, studentId: student_id, semesterId: semester_id, status
    });
    res.json({ success: true, data: interventions });
  } catch (error) {
    console.error('getInterventions error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy nhật ký can thiệp' });
  }
};

const createIntervention = async (req, res) => {
  try {
    const { student_id, semester_id, method, content, status, meeting_time } = req.body;
    if (!student_id || !semester_id || !method || !content) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }
    const intervention = await interventionService.createIntervention({
      userId: req.user.id, studentId: student_id, semesterId: semester_id,
      method, content, status, meeting_time
    });
    res.status(201).json({ success: true, data: intervention, message: 'Tạo nhật ký can thiệp thành công' });
  } catch (error) {
    console.error('createIntervention error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi tạo nhật ký can thiệp' });
  }
};

const updateIntervention = async (req, res) => {
  try {
    const { id } = req.params;
    const { method, content, status, meeting_time } = req.body;
    const intervention = await interventionService.updateIntervention({
      id, userId: req.user.id, method, content, status, meeting_time
    });
    if (!intervention) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhật ký can thiệp' });
    }
    res.json({ success: true, data: intervention, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('updateIntervention error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi cập nhật nhật ký can thiệp' });
  }
};

const getInterventionTemplate = async (req, res) => {
  try {
    const { student_id, semester_id } = req.query;
    if (!student_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'Thiếu student_id hoặc semester_id' });
    }
    const template = await interventionService.generateTemplate(
      parseInt(student_id), parseInt(semester_id)
    );
    res.json({ success: true, data: { template } });
  } catch (error) {
    console.error('getInterventionTemplate error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi tạo mẫu nội dung' });
  }
};

// ==================== UC35: Báo cáo ====================

const getRiskRatioReport = async (req, res) => {
  try {
    const { semester_id, class_id } = req.query;
    const data = await getRiskRatio({
      userId: req.user.id,
      semesterId: semester_id ? parseInt(semester_id) : null,
      classId: class_id ? parseInt(class_id) : null
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('getRiskRatioReport error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy báo cáo tỷ lệ rủi ro' });
  }
};

const getInterventionROIReport = async (req, res) => {
  try {
    const { semester_id } = req.query;
    const data = await getInterventionROI({
      userId: req.user.id,
      semesterId: semester_id ? parseInt(semester_id) : null
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('getInterventionROIReport error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy báo cáo ROI' });
  }
};

const exportReport = async (req, res) => {
  try {
    const { semester_id, class_id, risk_label, format } = req.query;
    if (!format || !['excel', 'pdf'].includes(format)) {
      return res.status(400).json({ success: false, message: 'format phải là excel hoặc pdf' });
    }

    const buffer = await exportLecturerReport({
      userId: req.user.id,
      semesterId: semester_id ? parseInt(semester_id) : null,
      classId: class_id ? parseInt(class_id) : null,
      riskLabel: risk_label || null,
      format
    });

    const ext = format === 'excel' ? 'xlsx' : 'pdf';
    const mime = format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="bao-cao-sv-nguy-co-${Date.now()}.${ext}"`);
    res.send(buffer);
  } catch (error) {
    console.error('exportReport error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xuất báo cáo' });
  }
};

// ==================== UC30: Dashboard thống kê ====================

const getDashboardStats = async (req, res) => {
  try {
    const lecturer = await interventionService.getLecturerByUserId(req.user.id);

    const classes = await Class.findAll({
      where: { lecturer_id: lecturer.id },
      attributes: ['id', 'class_name']
    });

    const classIds = classes.map(c => c.id);
    const students = await Student.findAll({
      where: classIds.length > 0 ? { class_id: { [Op.in]: classIds } } : { id: { [Op.is]: null } },
      attributes: ['id']
    });

    const studentIds = students.map(s => s.id);

    let dangerCount = 0, warningCount = 0, safeCount = 0;

    if (studentIds.length > 0) {
      // Latest prediction per student
      const latestPreds = await PredictionHistory.findAll({
        where: { student_id: { [Op.in]: studentIds } },
        order: [['predicted_at', 'DESC']]
      });

      const seen = new Set();
      for (const p of latestPreds) {
        if (!seen.has(p.student_id)) {
          seen.add(p.student_id);
          if (p.risk_label === 'danger') dangerCount++;
          else if (p.risk_label === 'warning') warningCount++;
          else if (p.risk_label === 'safe') safeCount++;
        }
      }
    }

    // Count interventions for current students
    const { InterventionLog } = require('../models');
    let intervenedCount = 0;
    if (studentIds.length > 0) {
      const intervenedStudents = await InterventionLog.findAll({
        where: { lecturer_id: lecturer.id, student_id: { [Op.in]: studentIds } },
        attributes: ['student_id'],
        group: ['student_id']
      });
      intervenedCount = intervenedStudents.length;
    }

    res.json({
      success: true,
      data: {
        total_students: students.length,
        danger: dangerCount,
        warning: warningCount,
        safe: safeCount,
        not_intervened: Math.max(0, dangerCount - intervenedCount),
        intervened: intervenedCount,
        classes: classes.length
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy thống kê dashboard' });
  }
};

// ==================== Xác nhận lịch can thiệp ====================

/**
 * GET /api/v1/student/interventions/pending
 * Lấy danh sách lịch can thiệp của sinh viên đang đăng nhập
 */
const getStudentInterventions = async (req, res) => {
  try {
    const data = await interventionService.getStudentInterventions(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('getStudentInterventions error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách lịch can thiệp' });
  }
};

/**
 * POST /api/v1/interventions/:id/accept
 * Sinh viên chấp nhận lịch can thiệp
 */
const acceptIntervention = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await interventionService.acceptIntervention({ id, userId: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch can thiệp' });
    res.json({ success: true, message: 'Đã chấp nhận lịch can thiệp', data: result });
  } catch (error) {
    console.error('acceptIntervention error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi chấp nhận lịch can thiệp' });
  }
};

/**
 * POST /api/v1/interventions/:id/reject
 * Sinh viên từ chối lịch can thiệp
 */
const rejectIntervention = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    const result = await interventionService.rejectIntervention({ id, userId: req.user.id, reason });
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch can thiệp' });
    res.json({ success: true, message: 'Đã từ chối lịch can thiệp', data: result });
  } catch (error) {
    console.error('rejectIntervention error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi từ chối lịch can thiệp' });
  }
};

/**
 * POST /api/v1/interventions/:id/approve-rejection
 * Giảng viên phê duyệt từ chối của sinh viên
 */
const approveRejection = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await interventionService.approveRejection({ id, userId: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch can thiệp' });
    res.json({ success: true, message: 'Đã phê duyệt từ chối', data: result });
  } catch (error) {
    console.error('approveRejection error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi phê duyệt' });
  }
};

/**
 * POST /api/v1/interventions/:id/deny-rejection
 * Giảng viên từ chối yêu cầu của sinh viên
 */
const denyRejection = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await interventionService.denyRejection({ id, userId: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch can thiệp' });
    res.json({ success: true, message: 'Đã từ chối yêu cầu', data: result });
  } catch (error) {
    console.error('denyRejection error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi từ chối yêu cầu' });
  }
};

module.exports = {
  getAlerts,
  searchStudents,
  getStudentDetail,
  getInterventions,
  createIntervention,
  updateIntervention,
  getInterventionTemplate,
  getRiskRatioReport,
  getInterventionROIReport,
  exportReport,
  getDashboardStats,
  getStudentInterventions,
  acceptIntervention,
  rejectIntervention,
  approveRejection,
  denyRejection
};
