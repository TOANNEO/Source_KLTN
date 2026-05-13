import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getSemesters, createSemester, updateSemester, setCurrentSemester } from '../../services/adminService';

const SemestersPage = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, semester: null, action: null });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    academic_year: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await getSemesters();
      setSemesters(response.data?.items || response.data || []);
      console.log('Fetched semesters:', response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách học kỳ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (semester = null) => {
    if (semester) {
      setEditingSemester(semester);
      setFormData({
        name: semester.name || '',
        academic_year: semester.academic_year || '',
        start_date: semester.start_date?.split('T')[0] || '',
        end_date: semester.end_date?.split('T')[0] || ''
      });
    } else {
      setEditingSemester(null);
      setFormData({
        name: '',
        academic_year: '',
        start_date: '',
        end_date: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSemester(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSemester) {
        await updateSemester(editingSemester.id, formData);
        toast.success('Cập nhật học kỳ thành công');
      } else {
        await createSemester(formData);
        toast.success('Thêm học kỳ thành công');
      }
      handleCloseModal();
      fetchSemesters();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleSetCurrent = (semester) => {
    setConfirmDialog({ isOpen: true, semester, action: 'setCurrent' });
  };

  const confirmSetCurrent = async () => {
    try {
      await setCurrentSemester(confirmDialog.semester.id);
      toast.success('Đã đặt học kỳ hiện hành');
      setConfirmDialog({ isOpen: false, semester: null, action: null });
      fetchSemesters();
    } catch (error) {
      toast.error(error.message || 'Không thể đặt học kỳ hiện hành');
    }
  };

  const columns = [
    { header: 'Tên học kỳ', accessor: 'name' },
    { header: 'Năm học', accessor: 'academic_year' },
    {
      header: 'Ngày bắt đầu',
      render: (row) => new Date(row.start_date).toLocaleDateString('vi-VN')
    },
    {
      header: 'Ngày kết thúc',
      render: (row) => new Date(row.end_date).toLocaleDateString('vi-VN')
    },
    {
      header: 'Trạng thái',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.is_current
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.is_current ? 'Hiện hành' : 'Không hoạt động'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div className="flex gap-2">
          {!row.is_current && (
            <button
              onClick={() => handleSetCurrent(row)}
              className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              title="Đặt làm học kỳ hiện hành"
            >
              Đặt hiện hành
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý học kỳ</h1>
        <p className="mt-1 text-sm text-gray-600">Quản lý danh sách học kỳ và đặt học kỳ hiện hành</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex justify-end">
        <Button onClick={() => handleOpenModal()}>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm học kỳ
          </span>
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          data={semesters}
          loading={loading}
          onEdit={handleOpenModal}
          emptyMessage="Không có học kỳ nào"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSemester ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên học kỳ"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="VD: Học kỳ 1"
          />
          <Input
            label="Năm học"
            required
            value={formData.academic_year}
            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            placeholder="VD: 2024-2025"
          />
          <Input
            label="Ngày bắt đầu"
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
          <Input
            label="Ngày kết thúc"
            type="date"
            required
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">
              {editingSemester ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, semester: null, action: null })}
        onConfirm={confirmSetCurrent}
        title="Xác nhận đặt học kỳ hiện hành"
        message={`Bạn có chắc chắn muốn đặt "${confirmDialog.semester?.semester_name}" làm học kỳ hiện hành? Học kỳ hiện hành cũ sẽ tự động bị tắt.`}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  );
};

export default SemestersPage;
