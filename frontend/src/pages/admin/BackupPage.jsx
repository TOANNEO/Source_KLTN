import { useState, useEffect } from 'react';
import {
  createBackup,
  listBackups,
  downloadBackup,
  deleteBackup,
  restoreBackup
} from '../../services/backupService';
import {
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const BackupPage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Modals
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await listBackups();
      if (response.success) {
        setBackups(response.data);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Không thể tải danh sách sao lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const response = await createBackup();
      if (response.success) {
        toast.success('Tạo sao lưu thành công');
        fetchBackups();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error(error.message || 'Lỗi khi tạo sao lưu');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      toast.loading('Đang tải xuống...', { id: 'download' });
      const response = await downloadBackup(backup.id);

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Tải xuống thành công', { id: 'download' });
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error('Lỗi khi tải xuống', { id: 'download' });
    }
  };

  const handleRestore = async () => {
    if (confirmText !== 'KHÔI PHỤC') {
      toast.error('Vui lòng nhập chính xác "KHÔI PHỤC" để xác nhận');
      return;
    }

    try {
      toast.loading('Đang khôi phục cơ sở dữ liệu...', { id: 'restore' });
      const response = await restoreBackup(selectedBackup.id);
      if (response.success) {
        toast.success('Khôi phục thành công', { id: 'restore' });
        setShowRestoreModal(false);
        setSelectedBackup(null);
        setConfirmText('');
        fetchBackups();
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error(error.message || 'Lỗi khi khôi phục', { id: 'restore' });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteBackup(selectedBackup.id);
      if (response.success) {
        toast.success('Xóa sao lưu thành công');
        setShowDeleteModal(false);
        setSelectedBackup(null);
        fetchBackups();
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error(error.message || 'Lỗi khi xóa sao lưu');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'success') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
          Thành công
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Thất bại
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sao lưu & Khôi phục</h1>
        <p className="text-gray-600 mt-2">Quản lý sao lưu cơ sở dữ liệu</p>
      </div>

      {/* Create Backup Button */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CircleStackIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Tạo sao lưu mới</h3>
              <p className="text-sm text-gray-600">Sao lưu toàn bộ cơ sở dữ liệu hiện tại</p>
            </div>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5" />
                Tạo sao lưu
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backups Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12">
            <CircleStackIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chưa có bản sao lưu nào</p>
            <p className="text-gray-400 text-sm mt-2">Nhấn "Tạo sao lưu" để tạo bản sao lưu đầu tiên</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên file
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kích thước
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CircleStackIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{backup.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(backup.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.backup_type === 'full' ? 'Toàn bộ' : 'Tăng dần'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(backup.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.creator ? `${backup.creator.first_name} ${backup.creator.last_name}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(backup.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(backup)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Tải xuống"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Khôi phục"
                          disabled={backup.status !== 'success'}
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Xóa"
                        >
                          <TrashIcon className="h-5 w-5" />
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

      {/* Restore Modal */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setSelectedBackup(null);
          setConfirmText('');
        }}
        title="Khôi phục cơ sở dữ liệu"
        size="md"
      >
        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-800 font-semibold mb-2">CẢNH BÁO NGUY HIỂM</h4>
                <p className="text-red-700 text-sm">
                  Thao tác này sẽ <strong>THAY THẾ HOÀN TOÀN</strong> toàn bộ dữ liệu hiện tại bằng dữ liệu từ bản sao lưu.
                </p>
                <p className="text-red-700 text-sm mt-2">
                  Mọi thay đổi sau thời điểm sao lưu sẽ bị <strong>MẤT VĨNH VIỄN</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Backup Info */}
          {selectedBackup && (
            <div className="bg-gray-50 p-4 rounded">
              <h5 className="font-semibold text-gray-800 mb-2">Thông tin bản sao lưu:</h5>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Tên file:</span> <span className="font-medium">{selectedBackup.filename}</span></p>
                <p><span className="text-gray-600">Kích thước:</span> <span className="font-medium">{formatFileSize(selectedBackup.file_size)}</span></p>
                <p><span className="text-gray-600">Thời gian tạo:</span> <span className="font-medium">{formatDate(selectedBackup.created_at)}</span></p>
              </div>
            </div>
          )}

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Để xác nhận, vui lòng nhập chính xác: <span className="font-bold text-red-600">KHÔI PHỤC</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Nhập KHÔI PHỤC"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setShowRestoreModal(false);
                setSelectedBackup(null);
                setConfirmText('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleRestore}
              disabled={confirmText !== 'KHÔI PHỤC'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Khôi phục ngay
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBackup(null);
        }}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa bản sao lưu <strong>{selectedBackup?.filename}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Thao tác này không thể hoàn tác.
          </p>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedBackup(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BackupPage;