import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/adminService';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, student: null });

  // Filters
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    search: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    student_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    major: '',
    course_year: '',
    class_name: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getStudents(filters);
      setStudents(response.data?.items || response.data || []);
      //bug
      console.log("RESPONSE:", response);
    } catch (error) {
      toast.error('Không thể tải danh sách sinh viên');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        student_code: student.student_code || '',
        first_name: student.user?.first_name || '',
        last_name: student.user?.last_name || '',
        email: student.user?.email || '',
        phone: student.user?.phone || '',
        department: student.department || '',
        major: student.major || '',
        course_year: student.course_year || '',
        class_name: student.class_name || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({
        student_code: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        major: '',
        course_year: '',
        class_name: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
        toast.success('Cập nhật sinh viên thành công');
      } else {
        /// BUG
        await createStudent(formData);
        toast.success('Thêm sinh viên thành công');
      }
      handleCloseModal();
      fetchStudents();
    } catch (error) {
      const serverError =
      error.message;
      const validationError =
      error.errors?.[0]?.message;
      toast.error(validationError || serverError || 'Lỗi khi tạo sinh viên');
    }
  };

  const handleDelete = (student) => {
    setConfirmDialog({ isOpen: true, student });
  };

  const confirmDelete = async () => {
    try {
      await deleteStudent(confirmDialog.student.id);
      toast.success('Xóa sinh viên thành công');
      setConfirmDialog({ isOpen: false, student: null });
      fetchStudents();
    } catch (error) {
      toast.error(error.message || 'Không thể xóa sinh viên');
    }
  };

  const columns = [
    { header: 'Mã SV', accessor: 'student_code' },
    { header: 'Họ và tên', 
      render: (row) =>
        `${row.user?.first_name || ''} ${row.user?.last_name || ''}`.trim()
    },
    { header: 'Email', 
      render: (row) =>
    `${row.user?.email|| ''}`.trim()
     },
     //// FIX TẠM THỜI: Hiện tại API chưa trả về thông tin khoa, ngành, khóa học nên tạm thời lấy từ trường tương ứng của student. Sau này có thể sửa lại khi API đã hoàn chỉnh
    { header: 'Khoa', accessor: 'major' },
    { header: 'Ngành', accessor: 'major' },
    { header: 'Khóa', accessor: 'course_year' },
    { header: 'Lớp', accessor: 'class_name' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sinh viên</h1>
        <p className="mt-1 text-sm text-gray-600">Quản lý danh sách sinh viên trong hệ thống</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Tìm kiếm theo tên, mã SV..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          >
            <option value="">Tất cả khoa</option>
            <option value="CNTT">Công nghệ thông tin</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filters.course_year}
            onChange={(e) => setFilters({ ...filters, course_year: e.target.value })}
          >
            <option value="">Tất cả khóa</option>
            <option value="2021">Khóa 2021</option>
            <option value="2022">Khóa 2022</option>
            <option value="2023">Khóa 2023</option>
            <option value="2024">Khóa 2024</option>
          </select>
          <Button onClick={() => handleOpenModal()}>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm sinh viên
            </span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          data={students}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="Không có sinh viên nào"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStudent ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã sinh viên"
              required
              value={formData.student_code}
              onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
              placeholder="VD: 2021603456"
            />
            <Input
              label="Họ"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Nguyễn"
            />
            <Input
              label="Tên"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Văn A"
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@tlu.edu.vn"
            />
            <Input
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0123456789"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khoa</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="">Chọn khoa</option>
                <option value="CNTT">Công nghệ thông tin</option>
                <option value="KTPM">Kỹ thuật phần mềm</option>
                <option value="HTTT">Hệ thống thông tin</option>
              </select>
            </div>
            <Input
              label="Ngành"
              required
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              placeholder="Công nghệ thông tin"
            />
            <Input
              label="Khóa"
              required
              value={formData.course_year}
              onChange={(e) => setFormData({ ...formData, course_year: e.target.value })}
              placeholder="2021"
            />
            <Input
              label="Lớp"
              value={formData.class_name}
              onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
              placeholder="CNTT01-K64"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">
              {editingStudent ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, student: null })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa sinh viên "${confirmDialog.student?.full_name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default StudentsPage;
