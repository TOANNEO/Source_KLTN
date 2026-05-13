import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getLecturers, createLecturer, updateLecturer, deleteLecturer } from '../../services/adminService';

const LecturersPage = () => {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, lecturer: null });

  // Filters
  const [filters, setFilters] = useState({
    department: '',
    degree: '',
    search: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    lecturer_code: '',
    full_name: '',
    email: '',
    phone: '',
    department_id: '',
    degree: ''
  });

  useEffect(() => {
    fetchLecturers();
  }, [filters]);

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const response = await getLecturers(filters);
      setLecturers(response.data?.items || response.data || []);
      console.log('Fetched lecturers:', response);
    } 

    catch (error) {
      toast.error('Không thể tải danh sách giảng viên');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (lecturer = null) => {
    if (lecturer) {
      setEditingLecturer(lecturer);
      setFormData({
        lecturer_code: lecturer.lecturer_code || '',
        first_name: lecturer.user?.first_name || '',
        last_name: lecturer.user?.last_name || '',
        email: lecturer.user?.email || '',
        phone: lecturer.user?.phone || '',
        department_id: lecturer.department_id || '',
        degree: lecturer.degree || ''
      });
    } else {
      setEditingLecturer(null);
      setFormData({
        lecturer_code: '',
        first_name: '',
        last_name: '',
        email: '',
        department_id: '',
        degree: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLecturer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLecturer) {
        await updateLecturer(editingLecturer.id, formData);
        toast.success('Cập nhật giảng viên thành công');
      } else {
        await createLecturer(formData);
        toast.success('Thêm giảng viên thành công');
      }
      handleCloseModal();
      fetchLecturers();
    } catch (error) {
      const serverError =
      error.message;
      const validationError =
      error.errors?.[0]?.message;
      toast.error(validationError || serverError || 'Lỗi khi tạo giảng viên');
    }
  };

  const handleDelete = (lecturer) => {
    setConfirmDialog({ isOpen: true, lecturer });
  };

  const confirmDelete = async () => {
    try {
      await deleteLecturer(confirmDialog.lecturer.id);
      toast.success('Xóa giảng viên thành công');
      setConfirmDialog({ isOpen: false, lecturer: null });
      fetchLecturers();
    } catch (error) {
      toast.error(error.message || 'Không thể xóa giảng viên');
    }
  };

  const columns = [
    { header: 'Mã GV', accessor: 'lecturer_code' },
    { header: 'Họ và tên', 
      render: (row) =>
        `${row.user?.first_name || ''} ${row.user?.last_name || ''}`.trim()
    },
    { header: 'Email',
      render : (row) => row.user?.email || ''
     },
    { header: 'Khoa', accessor: 'department' },
    { header: 'Học vị', accessor: 'degree' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý giảng viên</h1>
        <p className="mt-1 text-sm text-gray-600">Quản lý danh sách giảng viên trong hệ thống</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Tìm kiếm theo tên, mã GV..."
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
            value={filters.degree}
            onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
          >
            <option value="">Tất cả học vị</option>
            <option value="Cử nhân">Cử nhân</option>
            <option value="Thạc sĩ">Thạc sĩ</option>
            <option value="Tiến sĩ">Tiến sĩ</option>
            <option value="Giáo sư">Giáo sư</option>
          </select>
          <Button onClick={() => handleOpenModal()}>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm giảng viên
            </span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          data={lecturers}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="Không có giảng viên nào"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingLecturer ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã giảng viên"
              required
              value={formData.lecturer_code}
              onChange={(e) => setFormData({ ...formData, lecturer_code: e.target.value })}
              placeholder="VD: GV001"
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
              placeholder="lecturer@tlu.edu.vn"
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
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                <option value="">Chọn khoa</option>
                <option value={1}>Công nghệ thông tin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Học vị</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              >
                <option value="">Chọn học vị</option>
                <option value="Cử nhân">Cử nhân</option>
                <option value="Thạc sĩ">Thạc sĩ</option>
                <option value="Tiến sĩ">Tiến sĩ</option>
                <option value="Giáo sư">Giáo sư</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">
              {editingLecturer ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, lecturer: null })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa giảng viên "${confirmDialog.lecturer?.full_name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default LecturersPage;
