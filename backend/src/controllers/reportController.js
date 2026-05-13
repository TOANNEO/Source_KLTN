const reportService = require('../services/reportService');

/**
 * GET /api/v1/admin/grades/export
 * Export grades to Excel or PDF
 * Query params:
 *   - format: 'excel' or 'pdf' (required)
 *   - semester_id: filter by semester (optional)
 *   - student_id: filter by student (optional)
 *   - course_id: filter by course (optional)
 */
const exportGrades = async (req, res) => {
  try {
    const { format, semester_id, student_id, course_id } = req.query;

    // Validate format parameter
    if (!format || !['excel', 'pdf'].includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Tham số format không hợp lệ. Chỉ chấp nhận "excel" hoặc "pdf"'
      });
    }

    // Build filters object
    const filters = {};
    if (semester_id) filters.semester_id = parseInt(semester_id);
    if (student_id) filters.student_id = parseInt(student_id);
    if (course_id) filters.course_id = parseInt(course_id);

    let buffer;
    let filename;
    let contentType;

    // Generate export based on format
    if (format.toLowerCase() === 'excel') {
      buffer = await reportService.exportToExcel(filters);
      filename = `BangDiem_${Date.now()}.xlsx`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      buffer = await reportService.exportToPDF(filters);
      filename = `BangDiem_${Date.now()}.pdf`;
      contentType = 'application/pdf';
    }

    // Set response headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    // Send file buffer
    res.send(buffer);
  } catch (error) {
    console.error('Export grades error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xuất báo cáo'
    });
  }
};

module.exports = {
  exportGrades
};
