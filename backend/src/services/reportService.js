// Report Service - Generate and export reports
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Grade, Student, Course, Semester, User } = require('../models');
const { Op } = require('sequelize');

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

module.exports = {
  fetchGradesForExport,
  exportToExcel,
  exportToPDF
};
