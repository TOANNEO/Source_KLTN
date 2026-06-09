const { sequelize } = require('../config/database');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Grade, Student, Course, Semester, User,  PredictionHistory, BehaviorRecord, InterventionLog, Class, } = require('../models');
const { Op } = require('sequelize');
const { getLecturerByUserId } = require('./interventionService');// Report Service - Generate and export reports
/**
 * Fetch grades data with all necessary joins for export
 * @param {Object} filters - Filter options (semester_id, student_id, course_id)
 * @returns {Array} Array of grade records with student, course, semester info
 */
const fetchGradesForExport = async (filters = {}) => {
  const whereClause = {};

  if (filters.semester_id) {
    whereClause.semester_id = filters.semester_id;
  }
  if (filters.student_id) {
    whereClause.student_id = filters.student_id;
  }
  if (filters.course_id) {
    whereClause.course_id = filters.course_id;
  }

  const grades = await Grade.findAll({
    where: whereClause,
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'student_code', 'user_id'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['first_name', 'last_name']
          }
        ]
      },
      {
        model: Course,
        as: 'course',
        attributes: ['course_code', 'course_name', 'credits']
      },
      {
        model: Semester,
        as: 'semester',
        attributes: ['name', 'academic_year']
      }
    ],
    order: [
      ['semester_id', 'ASC'],
      [{ model: Student, as: 'student' }, 'student_code', 'ASC']
    ]
  });

  return grades;
};

/**
 * Export grades data to Excel format
 * @param {Object} filters - Filter options
 * @returns {Buffer} Excel file buffer
 */
const exportToExcel = async (filters = {}) => {
  // Fetch data from database
  const grades = await fetchGradesForExport(filters);

  if (grades.length === 0) {
    throw new Error('Không có dữ liệu để xuất');
  }

  // Transform data to Excel format
  const excelData = grades.map((grade, index) => {
    // Count improvement attempts for this student-course combination
    const improvementCount = grade.is_improvement ? 1 : 0;

    return {
      'STT': index + 1,
      'Mã sinh viên': grade.student?.student_code || 'N/A',
      'Họ tên sinh viên': grade.student?.user
        ? `${grade.student.user.first_name} ${grade.student.user.last_name}`
        : 'N/A',
      'Mã học phần': grade.course?.course_code || 'N/A',
      'Tên học phần': grade.course?.course_name || 'N/A',
      'Số tín chỉ': grade.course?.credits || 0,
      'Học kỳ': grade.semester
        ? `${grade.semester.name} - ${grade.semester.academic_year}`
        : 'N/A',
      'Điểm chuyên cần': grade.attendance_score !== null ? grade.attendance_score : '',
      'Điểm giữa kỳ': grade.middle_exam_score !== null ? grade.middle_exam_score : '',
      'Điểm cuối kỳ': grade.final_score !== null ? grade.final_score : '',
      'Điểm tổng kết': grade.total_score !== null ? grade.total_score : '',
      'Học cải thiện': grade.is_improvement ? 'Có' : 'Không'
    };
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // STT
    { wch: 15 }, // Mã sinh viên
    { wch: 25 }, // Họ tên
    { wch: 15 }, // Mã học phần
    { wch: 35 }, // Tên học phần
    { wch: 10 }, // Số tín chỉ
    { wch: 20 }, // Học kỳ
    { wch: 15 }, // Điểm CC
    { wch: 15 }, // Điểm GK
    { wch: 15 }, // Điểm CK
    { wch: 15 }, // Điểm TK
    { wch: 15 }  // Học cải thiện
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bảng điểm');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
};

/**
 * Export grades data to PDF format
 * @param {Object} filters - Filter options
 * @returns {Promise<Buffer>} PDF file buffer
 */
const exportToPDF = async (filters = {}) => {
  // Fetch data from database
  const grades = await fetchGradesForExport(filters);

  if (grades.length === 0) {
    throw new Error('Không có dữ liệu để xuất');
  }

  return new Promise((resolve, reject) => {
    try {
      // Register Unicode font for Vietnamese support
      const fontPath = path.join(__dirname, '../../fonts/Roboto-Regular.ttf');

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 30
      });

      // Collect PDF data in buffer
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Register and set font for Vietnamese support
      doc.registerFont('Roboto', fontPath);
      doc.font('Roboto');

      // Title
      doc.fontSize(18)
         .text('BÁO CÁO BẢNG ĐIỂM SINH VIÊN', { align: 'center' })
         .moveDown(0.5);

      // Report metadata
      doc.fontSize(10)
         .text(`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`, { align: 'center' })
         .moveDown(1);

      // Filter info
      if (filters.semester_id || filters.student_id || filters.course_id) {
        doc.fontSize(9).text('Bộ lọc áp dụng:', { underline: true });
        if (filters.semester_id) doc.text(`- Học kỳ ID: ${filters.semester_id}`);
        if (filters.student_id) doc.text(`- Sinh viên ID: ${filters.student_id}`);
        if (filters.course_id) doc.text(`- Học phần ID: ${filters.course_id}`);
        doc.moveDown(1);
      }

      // Table header
      const tableTop = doc.y;
      const rowHeight = 20;
      const colWidths = [30, 70, 120, 70, 150, 80, 60, 60, 60];
      let currentY = tableTop;

      // Draw header
      doc.fontSize(8).fillColor('black');
      const headers = ['STT', 'Mã SV', 'Họ tên', 'Mã HP', 'Tên HP', 'Học kỳ', 'Đ.GK', 'Đ.CK', 'Đ.TK'];
      let currentX = 30;

      headers.forEach((header, i) => {
        doc.rect(currentX, currentY, colWidths[i], rowHeight).stroke();
        doc.text(header, currentX + 5, currentY + 5, {
          width: colWidths[i] - 10,
          align: 'center'
        });
        currentX += colWidths[i];
      });

      currentY += rowHeight;

      // Draw rows
      grades.forEach((grade, index) => {
        // Check if we need a new page
        if (currentY > 500) {
          doc.addPage({ layout: 'landscape' });
          doc.font('Roboto'); // Re-apply font for new page
          currentY = 30;
        }

        currentX = 30;
        const rowData = [
          String(index + 1),
          grade.student?.student_code || 'N/A',
          grade.student?.user
            ? `${grade.student.user.first_name} ${grade.student.user.last_name}`
            : 'N/A',
          grade.course?.course_code || 'N/A',
          grade.course?.course_name || 'N/A',
          grade.semester
            ? `${grade.semester.name}-${grade.semester.academic_year}`
            : 'N/A',
          grade.middle_exam_score !== null ? String(grade.middle_exam_score) : '',
          grade.final_score !== null ? String(grade.final_score) : '',
          grade.total_score !== null ? String(grade.total_score) : ''
        ];

        rowData.forEach((data, i) => {
          doc.rect(currentX, currentY, colWidths[i], rowHeight).stroke();
          doc.fontSize(7).text(data, currentX + 3, currentY + 5, {
            width: colWidths[i] - 6,
            height: rowHeight - 10,
            ellipsis: true
          });
          currentX += colWidths[i];
        });

        currentY += rowHeight;
      });

      // Footer
      doc.fontSize(8)
         .text(`Tổng số bản ghi: ${grades.length}`, 30, currentY + 20);

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// ==================== UC35: LECTURER REPORTS ====================



/**
 * UC35: Tỷ lệ rủi ro an toàn/cảnh báo/nguy hiểm theo lớp & học kỳ
 */
const getRiskRatio = async ({ userId, semesterId, classId }) => {
  const lecturer = await getLecturerByUserId(userId);

  const classWhere = { lecturer_id: lecturer.id };
  if (classId) classWhere.id = classId;

  const classes = await Class.findAll({ where: classWhere, attributes: ['id', 'class_name'] });
  if (classes.length === 0) return [];

  const classIds = classes.map(c => c.id);

  const allStudents = await Student.findAll({
    where: { class_id: { [Op.in]: classIds } },
    attributes: ['id', 'class_id']
  });
  if (allStudents.length === 0) return [];

  const studentIds = allStudents.map(s => s.id);

  const semesters = semesterId
    ? await Semester.findAll({ where: { id: semesterId } })
    : await Semester.findAll({ order: [['id', 'DESC']], limit: 4 });

  const result = [];

  for (const cls of classes) {
    const clsIds = allStudents.filter(s => s.class_id === cls.id).map(s => s.id);
    if (clsIds.length === 0) continue;

    for (const sem of semesters) {
      const preds = await sequelize.query(`
        SELECT ph.risk_label, COUNT(*) as cnt
        FROM prediction_history ph
        INNER JOIN (
          SELECT student_id, MAX(predicted_at) as mx
          FROM prediction_history
          WHERE student_id IN (:ids) AND semester_id = :sid
          GROUP BY student_id
        ) latest ON ph.student_id = latest.student_id AND ph.predicted_at = latest.mx
        WHERE ph.student_id IN (:ids) AND ph.semester_id = :sid
        GROUP BY ph.risk_label
      `, { replacements: { ids: clsIds, sid: sem.id }, type: sequelize.QueryTypes.SELECT });

      if (preds.length === 0) continue;

      const counts = { safe: 0, warning: 0, danger: 0 };
      preds.forEach(p => { counts[p.risk_label] = parseInt(p.cnt); });
      const total = counts.safe + counts.warning + counts.danger;

      result.push({
        class_id: cls.id, class_name: cls.class_name,
        semester_id: sem.id, semester_name: sem.name,
        ...counts, total,
        safe_percent: total > 0 ? +((counts.safe / total) * 100).toFixed(1) : 0,
        warning_percent: total > 0 ? +((counts.warning / total) * 100).toFixed(1) : 0,
        danger_percent: total > 0 ? +((counts.danger / total) * 100).toFixed(1) : 0
      });
    }
  }

  return result;
};

/**
 *  Intervention ROI — SV tiến bộ sau can thiệp
 */
const getInterventionROI = async ({ userId, semesterId }) => {
  if (!semesterId) throw new Error('Vui lòng chọn học kỳ');

  const lecturer = await getLecturerByUserId(userId);

  const currentSem = await Semester.findByPk(semesterId);
  if (!currentSem) throw new Error('Không tìm thấy học kỳ');

  const prevSem = await Semester.findOne({
    where: { id: { [Op.lt]: semesterId } },
    order: [['id', 'DESC']]
  });

  if (!prevSem) return { total_intervened: 0, improved: 0, improvement_rate: 0, details: [] };

  const interventions = await InterventionLog.findAll({
    where: 
    { lecturer_id: lecturer.id, 
      semester_id: prevSem.id },
    attributes: ['student_id'],
    group: ['student_id']
  });

  const intervenedIds = interventions.map(i => i.student_id);
  if (intervenedIds.length === 0)
    return { total_intervened: 0, improved: 0, improvement_rate: 0, details: [] };

  const students = await Student.findAll({
    where: { id: { [Op.in]: intervenedIds } },
    attributes: ['id', 'student_code'],
    include: [
        { model: User,
           as: 'user', 
           attributes: ['first_name', 'last_name'] }
    ]
  });

  const getPred = async (sid, semId) => {
    const row = await PredictionHistory.findOne({
      where: { student_id: sid, semester_id: semId },
      order: [['predicted_at', 'DESC']]
    });
    
        return row
          ? {
              risk: row.risk_label,
              gpa: row.predicted_gpa
            }
          : null;
          };

  const riskLevel = { safe: 3, warning: 2, danger: 1 };
  const details = [];

  for (const sv of students) {
    const prevRisk = await getPred(sv.id, prevSem.id);
    const currRisk = await getPred(sv.id, semesterId);
    const intCount = await InterventionLog.count({
      where: { student_id: sv.id, semester_id: prevSem.id, lecturer_id: lecturer.id }
    });
    details.push({
      student_id: sv.id, 
      student_code: sv.student_code, 
      full_name: `${sv.user ? sv.user.first_name + ' ' + sv.user.last_name : 'N/A'}`,
      previous_risk: prevRisk, 
      current_risk: currRisk, 
      intervention_count: intCount,
      gpa_change: currRisk && prevRisk && currRisk.gpa != null && prevRisk.gpa != null ? currRisk.gpa - prevRisk.gpa : null,
      improved: (riskLevel[currRisk] || 0) > (riskLevel[prevRisk] || 0)
    });
  }

  const improved = details.filter(d => d.improved).length;
  return {
    total_intervened: details.length, improved,
    improvement_rate: details.length > 0 ? +((improved / details.length) * 100).toFixed(1) : 0,
    details 
  };
};

/**
 * Xuất báo cáo danh sách SV nguy cơ + hành vi
 */
const exportLecturerReport = async ({ userId, semesterId, classId, riskLabel, format }) => {
  if (!semesterId) throw new Error('Vui lòng chọn học kỳ');

  const lecturer = await getLecturerByUserId(userId);

  const classWhere = { lecturer_id: lecturer.id };
  if (classId) classWhere.id = classId;

  const classes = await Class.findAll({ where: classWhere, attributes: ['id', 'class_name'] });
  const classIds = classes.map(c => c.id);
  if (classIds.length === 0) throw new Error('Không có lớp nào');

  const students = await Student.findAll({
    where: { class_id: { [Op.in]: classIds } },
    include: 
    [
      { model: Class, 
        as: 'class', 
        attributes: ['class_name'] 
      },
      { 
        model: User, 
        as: 'user', 
        attributes: ['first_name', 'last_name'] }
    ],
    attributes: ['id', 'student_code', 'gpa_cumulative', 'class_id']
  });

  const studentIds = students.map(s => s.id);
  if (studentIds.length === 0) throw new Error('Không có sinh viên');

  // let predQuery = `
  //   SELECT ph.student_id, ph.predicted_gpa, ph.risk_label
  //   FROM prediction_history ph
  //   INNER JOIN (
  //     SELECT student_id, MAX(predicted_at) as mx
  //     FROM prediction_history
  //     WHERE student_id IN (:ids) AND semester_id = :sid
  //     GROUP BY student_id
  //   ) latest ON ph.student_id = latest.student_id AND ph.predicted_at = latest.mx
  //   WHERE ph.student_id IN (:ids) AND ph.semester_id = :sid
  // `;
  let predQuery = `
  SELECT ph.student_id, ph.predicted_gpa, ph.risk_label
  FROM prediction_history ph
  INNER JOIN (
    SELECT student_id, semester_id, MAX(predicted_at) as mx
    FROM prediction_history
    WHERE student_id IN (:ids)
      AND semester_id = :sid
    GROUP BY student_id, semester_id
  ) latest
    ON ph.student_id = latest.student_id
    AND ph.semester_id = latest.semester_id
    AND ph.predicted_at = latest.mx
  WHERE ph.student_id IN (:ids)
    AND ph.semester_id = :sid
`;
  if (riskLabel) predQuery += ` AND ph.risk_label = :rl`;

  const predRows = await sequelize.query(predQuery, {
    replacements: { ids: studentIds, sid: semesterId, rl: riskLabel },
    type: sequelize.QueryTypes.SELECT
  });

  const behaviors = await BehaviorRecord.findAll({
    where: { student_id: { [Op.in]: studentIds }, semester_id: semesterId }
  });

  const rows = students.map(sv => {
    const pred = predRows.find(p => p.student_id === sv.id);
    if (!pred) return null;
    const beh = behaviors.find(b => b.student_id === sv.id);
    return {
      student_code: sv.student_code,
      full_name: `${sv.user ? sv.user.first_name + ' ' + sv.user.last_name : 'N/A'}`,
      class_name: sv.class?.class_name,
      gpa_cumulative: sv.gpa_cumulative != null ? parseFloat(sv.gpa_cumulative).toFixed(2) : '—',
      predicted_gpa: pred.predicted_gpa != null ? parseFloat(pred.predicted_gpa).toFixed(2) : '—',
      risk_label: pred.risk_label,
      study_hours: beh?.study_hours_per_day ?? '—',
      sleep_hours: beh?.sleep_hours_per_day ?? '—',
      attendance: beh?.class_attendance ?? '—',
      social_media: beh?.social_media_hours ?? '—',
      stress: beh?.mental_stress_level ?? '—'
    };
  }).filter(Boolean);

  if (format === 'excel') return buildLecturerExcel(rows);
  if (format === 'pdf') return buildLecturerPDF(rows);
  throw new Error('Format phải là excel hoặc pdf');
};

function buildLecturerExcel(rows) {
  const headers = ['Mã SV', 'Họ và tên', 'Lớp', 'GPA tích lũy', 'GPA dự báo', 'Nguy cơ',
    'Giờ học/ngày', 'Giờ ngủ/ngày', 'Tỷ lệ đi học (%)', 'Giờ MXH/ngày', 'Mức stress'];
  const data = [headers, ...rows.map(r => [
    r.student_code, r.full_name, r.class_name, r.gpa_cumulative,
    r.predicted_gpa, r.risk_label, r.study_hours, r.sleep_hours,
    r.attendance, r.social_media, r.stress
  ])];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SV nguy co');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function buildLecturerPDF(rows) {
  const fontPath = path.join(__dirname, '../../fonts/Roboto-Regular.ttf');
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
       // register unicode font
    doc.registerFont('Roboto', fontPath);

    doc.font('Roboto');
    doc.fontSize(14).text('BÁO CÁO SINH VIÊN NGUY CƠ', { align: 'center' });
    doc.fontSize(9).text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, { align: 'center' });
    doc.moveDown(2);

    const cols = [60, 115, 60, 55, 55, 55, 50, 50, 60, 50, 45];
    const hdrs = ['Mã SV','Họ tên','Lớp','GPA','Dự báo','Nguy cơ','Học','Ngủ','Đi học%','MXH','Stress'];
    let x = 40;
    doc.fontSize(8);
    const hY = doc.y;
    hdrs.forEach((h, i) => { doc.text(h, x, hY, { width: cols[i], align: 'center', lineBreak: false }); x += cols[i]; });
    doc.moveDown(0.4);
    doc.moveTo(40, doc.y).lineTo(795, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(7.5);

    rows.forEach(r => {
      if (doc.y > 560) {  
        doc.addPage({ layout: 'landscape' }); 
        doc.font('Roboto');
        doc.y = 40; }
      const rY = doc.y; x = 40;
      [r.student_code, r.full_name, r.class_name, r.gpa_cumulative, r.predicted_gpa,
        r.risk_label, r.study_hours, r.sleep_hours, r.attendance, r.social_media, r.stress
      ].forEach((v, i) => { doc.text(String(v), x, rY, { width: cols[i], align: 'center', lineBreak: false }); x += cols[i]; });
      doc.moveDown(0.9);
    });

    doc.end();
  });
}

module.exports = {
  fetchGradesForExport,
  exportToExcel,
  exportToPDF,
  getRiskRatio,
  getInterventionROI,
  exportLecturerReport
};
