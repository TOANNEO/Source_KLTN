import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../services/adminService';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, course: null });

  // Form state
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    credits: '',
    department_id: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourses();
      setCourses(response.data?.items || response.data || []);
      console.log('Fetched courses:', response);
    } catch (error) {
      toast.error('Không thể tải danh sách học phần');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        course_code: course.course_code || '',
        course_name: course.course_name || '',
        credits: course.credits || '',
        department_id: course.department_id || ''
      });
    } else {
      setEditingCourse(null);
      setFormData({
        course_code: '',
        course_name: '',
        credits: '',
        department_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        toast.success('Cập nhật học phần thành công');
      } else {
        await createCourse(formData);
        toast.success('Thêm học phần thành công');
      }
      handleCloseModal();
      fetchCourses();
    } catch (error) {
      const serverError =
      error.message;
      const validationError =
      error.errors?.[0]?.message;
      toast.error(validationError || serverError || 'Lỗi khi tạo khóa học');
    }
  };

  const handleDelete = (course) => {
    setConfirmDialog({ isOpen: true, course });
  };

  const confirmDelete = async () => {
    try {
      await deleteCourse(confirmDialog.course.id);
      toast.success('Xóa học phần thành công');
      setConfirmDialog({ isOpen: false, course: null });
      fetchCourses();
    } catch (error) {
      toast.error(error.message || 'Không thể xóa học phần');
    }
  };

  const columns = [
    { header: 'Mã HP', accessor: 'course_code' },
    { header: 'Tên học phần', accessor: 'course_name' },
    { header: 'Tín chỉ', accessor: 'credits' },
    { header: 'Khoa', 
      render: (row) => {
        return row.department?.name || '';
      }
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý học phần</h1>
        <p className="mt-1 text-sm text-gray-600">Quản lý danh sách học phần trong hệ thống</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex justify-end">
        <Button onClick={() => handleOpenModal()}>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm học phần
          </span>
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          data={courses}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="Không có học phần nào"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCourse ? 'Chỉnh sửa học phần' : 'Thêm học phần mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mã học phần"
            required
            value={formData.course_code}
            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
            placeholder="VD: IT101"
          />
          <Input
            label="Tên học phần"
            required
            value={formData.course_name}
            onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
            placeholder="Nhập vào môn học"
          />
          <Input
            label="Số tín chỉ"
            type="number"
            required
            min="1"
            max="10"
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
            placeholder="3"
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
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">
              {editingCourse ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, course: null })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa học phần "${confirmDialog.course?.course_name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default CoursesPage;
