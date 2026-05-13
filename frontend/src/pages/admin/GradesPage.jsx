import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  getGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradeAuditLog,
  getStudents,
  getCourses,
  getSemesters,
  exportGradesToExcel,
  exportGradesToPDF
} from '../../services/adminService';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, grade: null });
  const [auditLogModal, setAuditLogModal] = useState({ isOpen: false, gradeId: null, logs: [] });

  // Filters
  const [filters, setFilters] = useState({
    semester_id: '',
    student_id: '',
    course_id: '',
    is_improvement: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    semester_id: '',
    attendance_score: '',
    middle_exam_score: '',
    assignment_score: '',
    final_score: '',
    updated_reason: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (filters.semester_id) {
      fetchGrades();
    }
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [studentsRes, coursesRes, semestersRes] = await Promise.all([
        getStudents(),
        getCourses(),
        getSemesters()
      ]);
      setStudents(studentsRes.data?.items || studentsRes.data || []);
      setCourses(coursesRes.data?.items || coursesRes.data || []);
      setSemesters(semestersRes.data?.items || semestersRes.data || []);

      // Set default semester to current
      const currentSemester = (semestersRes.data?.items || semestersRes.data || []).find(s => s.is_current);
      if (currentSemester) {
        setFilters(prev => ({ ...prev, semester_id: currentSemester.id.toString() }));
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu khởi tạo');
      console.error(error);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await getGrades(filters);
      setGrades(response.data?.items || response.data || []);
      console.log('Fetched grades:', response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách điểm');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total score in real-time
  const calculateTotalScore = (midterm, final) => {
    const gk = parseFloat(midterm) || 0;
    const ck = parseFloat(final) || 0;
    return (0.3 * gk + 0.7 * ck).toFixed(2);
  };

  const totalScore = calculateTotalScore(formData.middle_exam_score, formData.final_score);

  const handleOpenModal = (grade = null) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        student_id: grade.student_id?.toString() || '',
        course_id: grade.course_id?.toString() || '',
        semester_id: grade.semester_id?.toString() || '',
        attendance_score: grade.attendance_score?.toString() || '',
        middle_exam_score: grade.middle_exam_score?.toString() || '',
        assignment_score: grade.assignment_score?.toString() || '',
        final_score: grade.final_score?.toString() || '',
        updated_reason: ''
      });
    } else {
      setEditingGrade(null);
      setFormData({
        student_id: '',
        course_id: '',
        semester_id: filters.semester_id || '',
        attendance_score: '',
        middle_exam_score: '',
        assignment_score: '',
        final_score: '',
        updated_reason: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGrade(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.student_id || !formData.course_id || !formData.semester_id) {
      toast.error('Vui lòng chọn sinh viên, học phần và học kỳ');
      return;
    }

    if (!formData.middle_exam_score || !formData.final_score) {
      toast.error('Vui lòng nhập điểm giữa kỳ và cuối kỳ');
      return;
    }

    if (editingGrade && !formData.updated_reason) {
      toast.error('Vui lòng nhập lý do chỉnh sửa điểm');
      return;
    }

    try {
      const submitData = {
        ...formData,
        student_id: parseInt(formData.student_id),
        course_id: parseInt(formData.course_id),
        semester_id: parseInt(formData.semester_id),
        attendance_score: formData.attendance_score ? parseFloat(formData.attendance_score) : null,
        middle_exam_score: parseFloat(formData.middle_exam_score),
        assignment_score: formData.assignment_score ? parseFloat(formData.assignment_score) : null,
        final_score: parseFloat(formData.final_score)
      };

      if (editingGrade) {
        await updateGrade(editingGrade.id, submitData);
        toast.success('Cập nhật điểm thành công');
      } else {
        delete submitData.updated_reason;
        await createGrade(submitData);
        toast.success('Thêm điểm thành công');
      }
      handleCloseModal();
      fetchGrades();
    } catch (error) {
      const serverError = error.message;
      const validationError = error.errors?.[0]?.message;
      toast.error(validationError || serverError || 'Lỗi khi lưu điểm');
    }
  };

  const handleDelete = (grade) => {
    setConfirmDialog({ isOpen: true, grade });
  };

  const confirmDelete = async () => {
    try {
      await deleteGrade(confirmDialog.grade.id);
      toast.success('Xóa điểm thành công');
      setConfirmDialog({ isOpen: false, grade: null });
      fetchGrades();
    } catch (error) {
      toast.error(error.message || 'Không thể xóa điểm');
    }
  };

  const handleViewAuditLog = async (gradeId) => {
    try {
      const response = await getGradeAuditLog(gradeId);
      setAuditLogModal({
        isOpen: true,
        gradeId,
        logs: response.data || []
      });
    } catch (error) {
      toast.error('Không thể tải lịch sử chỉnh sửa');
    }
  };

  const clearFilters = () => {
    setFilters({
      semester_id: '',
      student_id: '',
      course_id: '',
      is_improvement: ''
    });
  };

  /**
   * Download file from blob response
   * @param {Blob} blob - File blob
   * @param {string} filename - File name
   */
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Export grades to Excel
   */
  const handleExportExcel = async () => {
    try {
      setExportLoading(true);

      // Build filters for export (only include non-empty values)
      const exportFilters = {};
      if (filters.semester_id) exportFilters.semester_id = filters.semester_id;
      if (filters.student_id) exportFilters.student_id = filters.student_id;
      if (filters.course_id) exportFilters.course_id = filters.course_id;

      // Call API to get Excel file
      const response = await exportGradesToExcel(exportFilters);

      // Download file
      const filename = `BangDiem_${new Date().getTime()}.xlsx`;
      downloadFile(response.data, filename);

      toast.success('Xuất Excel thành công!');
    } catch (error) {
      const serverError =
      error.message;
      const validationError =
      error.errors?.[0]?.message;
      toast.error(validationError || serverError || 'Lỗi khi tạo sinh viên');
     console.error('Export Excel error:', error);
      //toast.error(error.message || 'Không thể xuất file Excel');
    } finally {
      setExportLoading(false);
    }
  };

  /**
   * Export grades to PDF
   */
  const handleExportPDF = async () => {
    try {
      setExportLoading(true);

      // Build filters for export (only include non-empty values)
      const exportFilters = {};
      if (filters.semester_id) exportFilters.semester_id = filters.semester_id;
      if (filters.student_id) exportFilters.student_id = filters.student_id;
      if (filters.course_id) exportFilters.course_id = filters.course_id;

      // Call API to get PDF file
      const response = await exportGradesToPDF(exportFilters);

      // Download file
      const filename = `BangDiem_${new Date().getTime()}.pdf`;
      downloadFile(response.data, filename);

      toast.success('Xuất PDF thành công!');
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error(error.message || 'Không thể xuất file PDF');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with academic styling */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Quản lý điểm
          </h1>
        </div>
        <p className="ml-7 text-slate-600">Nhập và quản lý điểm học phần của sinh viên</p>
      </div>

      {/* Filter Bar with elegant design */}
      <div className="mb-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Semester Filter - Required */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Học kỳ <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              value={filters.semester_id}
              onChange={(e) => setFilters({ ...filters, semester_id: e.target.value })}
            >
              <option value="">Chọn học kỳ</option>
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name} {sem.is_current ? '(Hiện tại)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sinh viên</label>
            <select
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              value={filters.student_id}
              onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
            >
              <option value="">Tất cả sinh viên</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.student_code} - {student.user?.first_name} {student.user?.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Học phần</label>
            <select
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              value={filters.course_id}
              onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}
            >
              <option value="">Tất cả học phần</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>

          {/* Is Improvement Filter */}
          <div className="lg:col-span-1 flex items-end">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                checked={filters.is_improvement === '1'}
                onChange={(e) => setFilters({ ...filters, is_improvement: e.target.checked ? '1' : '' })}
              />
              <span className="text-sm font-medium text-slate-700">Học cải thiện</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-1 flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Add Grade Button and Export Buttons */}
        <div className="flex justify-between items-center gap-4">
          {/* Export Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleExportExcel}
              disabled={exportLoading || !filters.semester_id}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                {exportLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {exportLoading ? 'Đang xuất...' : 'Xuất Excel'}
              </span>
            </Button>

            <Button
              onClick={handleExportPDF}
              disabled={exportLoading || !filters.semester_id}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                {exportLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
                {exportLoading ? 'Đang xuất...' : 'Xuất PDF'}
              </span>
            </Button>
          </div>

          {/* Add Grade Button */}
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm điểm mới
            </span>
          </Button>
        </div>
      </div>

      {/* Grades Table with academic styling */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0 left-0"></div>
            </div>
          </div>
        ) : !filters.semester_id ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-500 text-lg font-medium">Vui lòng chọn học kỳ để xem điểm</p>
          </div>
        ) : grades.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-500 text-lg font-medium">Chưa có điểm nào</p>
            <p className="text-slate-400 text-sm mt-2">Nhấn "Thêm điểm mới" để bắt đầu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Mã SV</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Sinh viên</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Mã HP</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Học phần</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">CC</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">GK</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">CK</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Tổng</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {grades.map((grade, index) => (
                  <tr
                    key={grade.id}
                    className="hover:bg-blue-50/50 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {grade.student?.student_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {grade.student?.user?.first_name} {grade.student?.user?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {grade.course?.course_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                      {grade.course?.course_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600">
                      {grade.attendance_score !== null && grade.attendance_score !== undefined
                        ? parseFloat(grade.attendance_score).toFixed(1)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-blue-600">
                      {parseFloat(grade.middle_exam_score).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-indigo-600">
                      {parseFloat(grade.final_score).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 cursor-help"
                        title={`Công thức: 0.3 × ${parseFloat(grade.middle_exam_score).toFixed(1)} + 0.7 × ${parseFloat(grade.final_score).toFixed(1)} = ${parseFloat(grade.total_score).toFixed(2)}`}
                      >
                        {parseFloat(grade.total_score).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {grade.is_improvement ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                          Cải thiện
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                          Bình thường
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewAuditLog(grade.id)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem lịch sử"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenModal(grade)}
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(grade)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Grade Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingGrade ? 'Chỉnh sửa điểm' : 'Thêm điểm mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sinh viên <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              disabled={editingGrade}
              required
            >
              <option value="">Chọn sinh viên</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.student_code} - {student.user?.first_name} {student.user?.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Học phần <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              disabled={editingGrade}
              required
            >
              <option value="">Chọn học phần</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Học kỳ <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.semester_id}
              onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
              disabled={editingGrade}
              required
            >
              <option value="">Chọn học kỳ</option>
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name} {sem.is_current ? '(Hiện tại)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Score Inputs Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Attendance Score (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Điểm chuyên cần (CC)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.attendance_score}
                onChange={(e) => setFormData({ ...formData, attendance_score: e.target.value })}
                placeholder="0.0 - 10.0"
              />
            </div>

            {/* Assignment Score (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Điểm bài tập
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.assignment_score}
                onChange={(e) => setFormData({ ...formData, assignment_score: e.target.value })}
                placeholder="0.0 - 10.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Midterm Score (Required) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Điểm giữa kỳ (GK) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.middle_exam_score}
                onChange={(e) => setFormData({ ...formData, middle_exam_score: e.target.value })}
                placeholder="0.0 - 10.0"
                required
              />
            </div>

            {/* Final Score (Required) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Điểm cuối kỳ (CK) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.final_score}
                onChange={(e) => setFormData({ ...formData, final_score: e.target.value })}
                placeholder="0.0 - 10.0"
                required
              />
            </div>
          </div>

          {/* Edit Reason (Required for editing) */}
          {editingGrade && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lý do chỉnh sửa <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                rows="3"
                value={formData.updated_reason}
                onChange={(e) => setFormData({ ...formData, updated_reason: e.target.value })}
                placeholder="Nhập lý do chỉnh sửa điểm..."
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Lý do chỉnh sửa sẽ được lưu vào lịch sử và không thể xóa
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              {editingGrade ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Audit Log Modal */}
      <Modal
        isOpen={auditLogModal.isOpen}
        onClose={() => setAuditLogModal({ isOpen: false, gradeId: null, logs: [] })}
        title="Lịch sử chỉnh sửa điểm"
      >
        <div className="space-y-4">
          {auditLogModal.logs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Chưa có lịch sử chỉnh sửa</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {auditLogModal.logs.map((log, index) => (
                <div
                  key={log.id}
                  className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {log.changedBy?.first_name} {log.changedBy?.last_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(log.changed_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Changes */}
                  <div className="space-y-2 mb-3">
                    {Object.keys(log.old_values || {}).map((key) => {
                      const oldVal = log.old_values[key];
                      const newVal = log.new_values[key];
                      if (oldVal === newVal) return null;

                      const fieldNames = {
                        attendance_score: 'Điểm chuyên cần',
                        middle_exam_score: 'Điểm giữa kỳ',
                        assignment_score: 'Điểm bài tập',
                        final_score: 'Điểm cuối kỳ',
                        total_score: 'Điểm tổng kết'
                      };

                      return (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600 font-medium">{fieldNames[key] || key}:</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-semibold">
                            {oldVal !== null ? oldVal : '-'}
                          </span>
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-semibold">
                            {newVal !== null ? newVal : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reason */}
                  {log.reason && (
                    <div className="bg-white/70 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Lý do:</p>
                      <p className="text-sm text-slate-700">{log.reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, grade: null })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa điểm"
        message={`Bạn có chắc chắn muốn xóa điểm của sinh viên "${confirmDialog.grade?.student?.user?.first_name} ${confirmDialog.grade?.student?.user?.last_name}" môn "${confirmDialog.grade?.course?.course_name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default GradesPage;

