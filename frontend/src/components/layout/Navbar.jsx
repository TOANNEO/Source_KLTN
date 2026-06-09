import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BellIcon, UserCircleIcon, KeyIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import ChangePasswordModal from '../common/ChangePasswordModal';
import ConfirmDialog from '../common/ConfirmDialog';
import * as studentSvc from '../../services/studentService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInterventions, setShowInterventions] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [interventionCount, setInterventionCount] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch interventions for students
  useEffect(() => {
    if (user?.role !== 'student') return;

    const fetchInterventions = async () => {
      try {
        const res = await studentSvc.getStudentInterventions();
        if (res.success) {
          setInterventions(res.data || []);
          setInterventionCount(res.data?.length || 0);
        }
      } catch {
        // silently ignore
      }
    };

    fetchInterventions();
    const interval = setInterval(fetchInterventions, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, [user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'lecturer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'student':
        return 'Sinh viên';
      case 'lecturer':
        return 'Giảng viên';
      default:
        return role;
    }
  };

  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      const res = await studentSvc.acceptIntervention(id);
      if (res.success) {
        const updatedRes = await studentSvc.getStudentInterventions();
        if (updatedRes.success) {
          setInterventions(updatedRes.data || []);
          setInterventionCount(updatedRes.data?.length || 0);
        }
      }
    } catch (err) {
      console.error('Accept error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId) return;
    setActionLoading(true);
    try {
      const res = await studentSvc.rejectIntervention(rejectingId, rejectReason);
      if (res.success) {
        const updatedRes = await studentSvc.getStudentInterventions();
        if (updatedRes.success) {
          setInterventions(updatedRes.data || []);
          setInterventionCount(updatedRes.data?.length || 0);
        }
        setShowRejectModal(false);
        setRejectingId(null);
        setRejectReason('');
      }
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-800">
                Hệ thống Dự đoán & Hỗ trợ Cải thiện Kết quả Học tập
              </h1>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowInterventions(!showInterventions)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative"
                  >
                    <BellIcon className="w-6 h-6" />
                    {user?.role === 'student' && interventionCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {interventionCount > 9 ? '9+' : interventionCount}
                      </span>
                    )}
                  </button>

                  {showInterventions && user?.role === 'student' && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-800">Lịch can thiệp chờ phản hồi</h3>
                        <button onClick={() => setShowInterventions(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {interventions.length === 0 ? (
                          <p className="px-4 py-6 text-sm text-gray-500 text-center">Không có lịch can thiệp nào</p>
                        ) : (
                          interventions.map((inv) => (
                            <div key={inv.id} className="px-4 py-3 border-b border-gray-100 last:border-0">
                              <p className="text-sm font-medium text-gray-800 mb-1">{inv.content}</p>
                              <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 mb-2">
                                <span>Phương thức: <span className="font-medium">{inv.method === 'direct' ? 'Trực tiếp' : inv.method === 'phone' ? 'Điện thoại' : 'Email'}</span></span>
                                {inv.meeting_time && (
                                  <span>Thời gian: <span className="font-medium">{new Date(inv.meeting_time).toLocaleString('vi-VN')}</span></span>
                                )}
                              </div>
                              {inv.student_response === 'pending' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAccept(inv.id)}
                                    disabled={actionLoading}
                                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                                  >
                                    Chấp nhận
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(inv.id)}
                                    disabled={actionLoading}
                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              ) : (
                                <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${inv.student_response === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {inv.student_response === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                {/* User menu dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <UserCircleIcon className="w-6 h-6" />
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowChangePassword(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <KeyIcon className="w-4 h-4 mr-2" />
                        Đổi mật khẩu
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        type="warning"
      />

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Lý do từ chối lịch can thiệp</h3>
            </div>
            <div className="px-6 py-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối (không bắt buộc)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
                disabled={actionLoading}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId(null);
                  setRejectReason('');
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
