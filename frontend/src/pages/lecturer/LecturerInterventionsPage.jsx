import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PlusIcon, FunnelIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import * as svc from '../../services/lecturerService';

const STATUS_MAP = {
  not_contacted: { label: 'Chưa liên hệ',           cls: 'bg-gray-100 text-gray-700 border-gray-200' },
  consulting:    { label: 'Đang tham vấn',           cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  reminded:      { label: 'Đã nhắc nhở',             cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  need_family:   { label: 'Cần phối hợp gia đình',  cls: 'bg-red-100 text-red-700 border-red-200' },
};
const METHOD = { direct: '👤 Gặp trực tiếp', phone: '📞 Gọi điện', email: '📧 Gửi email' };

// Edit Modal
function EditModal({ intervention, onClose, onSaved }) {
  const [form, setForm] = useState({
    method: intervention.method,
    content: intervention.content,
    status: intervention.status,
    meeting_time:  intervention.meeting_time
  ? new Date(
      new Date(intervention.meeting_time).getTime() -
      new Date(intervention.meeting_time).getTimezoneOffset() * 60000
    ).toISOString().slice(0, 16)
  : ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await svc.updateIntervention(intervention.id, {
        method: form.method,
        content: form.content,
        status: form.status,
        ...(form.meeting_time ? { meeting_time: form.meeting_time } : { meeting_time: null })
      });
      if (res.success) { toast.success('Cập nhật thành công'); onSaved(); }
      else toast.error(res.message || 'Lỗi khi cập nhật');
    } catch (err) { toast.error(err?.message || 'Lỗi khi cập nhật'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Cập nhật nhật ký can thiệp</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Hình thức</label>
            <div className="grid grid-cols-3 gap-2">
              {[['direct','👤 Gặp trực tiếp'],['phone','📞 Gọi điện'],['email','📧 Gửi mail']].map(([v, l]) => (
                <label key={v} className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer text-xs transition-colors ${form.method === v ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="method" value={v} checked={form.method === v} onChange={e => setForm(p => ({ ...p, method: e.target.value }))} className="hidden" />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Trạng thái</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              {Object.entries(STATUS_MAP).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Thời gian hẹn gặp</label>
            <input
              type="datetime-local"
              value={form.meeting_time}
              onChange={e => setForm(p => ({ ...p, meeting_time: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nội dung</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={5} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" required />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">Hủy</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LecturerInterventionsPage() {
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });
  const [editing, setEditing] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await svc.getInterventions(filters.status ? { status: filters.status } : {});
      if (res.success) setInterventions(res.data);
      else toast.error(res.message || 'Không thể tải danh sách nhật ký');
    } catch { toast.error('Lỗi khi tải nhật ký can thiệp'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id) => {
    setApprovalLoading(id);
    try {
      const res = await svc.approveRejection(id);
      if (res.success) { toast.success('Đã chấp nhận từ chối của sinh viên'); fetchData(); }
      else toast.error(res.message || 'Lỗi khi phê duyệt');
    } catch { toast.error('Lỗi khi phê duyệt'); }
    finally { setApprovalLoading(null); }
  };

  const handleDeny = async (id) => {
    setApprovalLoading(id);
    try {
      const res = await svc.denyRejection(id);
      console.log(res);
      if (res.success) { toast.success('Đã yêu cầu sinh viên tham gia lại'); fetchData(); }
      else toast.error(res.message || 'Lỗi khi từ chối');
    } catch { toast.error('Lỗi khi từ chối'); }
    finally { setApprovalLoading(null); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Nhật ký can thiệp</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý các lần tư vấn, can thiệp sinh viên</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-600">
            <FunnelIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Lọc theo trạng thái:</span>
          </div>
          {[['', 'Tất cả'], ...Object.entries(STATUS_MAP).map(([v, { label }]) => [v, label])].map(([v, l]) => (
            <button key={v} onClick={() => setFilters(f => ({ ...f, status: v }))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${filters.status === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Đang tải...</p>
          </div>
        ) : interventions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <DocumentTextIcon className="w-14 h-14 mb-3" />
            <p className="text-sm font-medium">Chưa có nhật ký can thiệp nào</p>
            {filters.status && (
              <button onClick={() => setFilters({ status: '' })} className="mt-2 text-blue-500 text-xs underline">
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {interventions.map(iv => {
              const sm = STATUS_MAP[iv.status] || STATUS_MAP.not_contacted;
              const methodStr = METHOD[iv.method] || iv.method;
              return (
                <div key={iv.id} className="flex items-start gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {iv.student?.full_name?.charAt(0) || '?'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <button
                        onClick={() => navigate(`/lecturer/students/${iv.student?.id}/profile`)}
                        className="font-semibold text-slate-800 text-sm hover:text-blue-600 transition-colors"
                      >
                        {iv.student?.full_name}
                      </button>
                      <span className="text-xs text-slate-400 font-mono">
                        {iv.student?.student_code}
                      </span>
                      {iv.student?.class?.class_name && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {iv.student.class.class_name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${sm.cls}`}>{sm.label}</span>
                      <span className="text-xs text-slate-500">{methodStr}</span>
                      {iv.semester && <span className="text-xs text-slate-400">· {iv.semester.name}</span>}
                      {iv.meeting_time && (
                        <span className="text-xs text-slate-400">
                          · Thời gian: {new Date(iv.meeting_time).toLocaleString('vi-VN')}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-2">{iv.content}</p>

                    {/* Student Response Status */}
                    {iv.student_response && iv.student_response !== 'pending' && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-600">Phản hồi sinh viên:</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${iv.student_response === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {iv.student_response === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                          </span>
                        </div>
                        {iv.student_response === 'rejected' && iv.reject_reason && (
                          <p className="text-xs text-slate-500 italic">Lý do: {iv.reject_reason}</p>
                        )}
                        {iv.student_response === 'rejected' && iv.lecturer_approval === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleApprove(iv.id)}
                              disabled={approvalLoading === iv.id}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                            >
                              {approvalLoading === iv.id ? '...' : 'Chấp nhận từ chối'}
                            </button>
                            <button
                              onClick={() => handleDeny(iv.id)}
                              disabled={approvalLoading === iv.id}
                              className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
                            >
                              {approvalLoading === iv.id ? '...' : 'Yêu cầu tham gia lại'}
                            </button>
                          </div>
                        )}
                        {iv.student_response === 'rejected' && iv.lecturer_approval !== 'pending' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${iv.lecturer_approval === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {iv.lecturer_approval === 'approved' ? 'Giảng viên đã chấp nhận từ chối' : 'Giảng viên yêu cầu tham gia lại'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Edit */}
                  <button
                    onClick={() => setEditing(iv)}
                    className="shrink-0 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 font-medium mt-0.5"
                  >
                    Cập nhật
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditModal
          intervention={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchData(); }}
        />
      )}
    </div>
  );
}
