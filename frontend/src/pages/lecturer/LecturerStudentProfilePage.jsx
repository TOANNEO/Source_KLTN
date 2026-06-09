import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon, PlusIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import * as svc from '../../services/lecturerService';

const RISK = {
  danger:  { label: 'Nguy hiểm', bg: 'bg-red-100 text-red-700 border-red-200' },
  warning: { label: 'Cảnh báo',  bg: 'bg-amber-100 text-amber-700 border-amber-200' },
  safe:    { label: 'An toàn',   bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const STATUS_MAP = {
  not_contacted: { label: 'Chưa liên hệ',            cls: 'bg-gray-100 text-gray-700' },
  consulting:    { label: 'Đang tham vấn',            cls: 'bg-blue-100 text-blue-700' },
  reminded:      { label: 'Đã nhắc nhở',              cls: 'bg-amber-100 text-amber-700' },
  need_family:   { label: 'Cần phối hợp gia đình',   cls: 'bg-red-100 text-red-700' },
};

const METHOD_ICON = { direct: '👤', phone: '📞', email: '📧' };

// Ngưỡng bất thường
const THRESHOLDS = {
  social_media_hours:  { max: 2 },
  sleep_hours_per_day: { min: 7 },
  class_attendance:    { min: 75 },
  study_hours_per_day: { min: 2 },
  mental_stress_level: { max: 4 },
};

function isAbnormal(key, val) {
  const t = THRESHOLDS[key];
  if (!t) return false;
  if (t.max !== undefined && val > t.max) return true;
  if (t.min !== undefined && val < t.min) return true;
  return false;
}

const BEHAVIOR_LABELS = {
  study_hours_per_day:  'Giờ tự học / ngày',
  sleep_hours_per_day:  'Giờ ngủ / ngày',
  class_attendance:     'Tỷ lệ đi học (%)',
  social_media_hours:   'Giờ MXH / ngày',
  screen_time_hours:    'Screen time / ngày',
  mental_stress_level:  'Mức stress',
};

// ===== Intervention Modal =====
function InterventionModal({ studentId, studentName, onClose, onSaved }) {
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({ semester_id: '', method: 'direct', content: '', status: 'not_contacted', meeting_time: '' });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/v1/semesters', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setSemesters(d.data);
          const cur = d.data.find(s => s.is_current);
          if (cur) {
            setForm(prev => ({ ...prev, semester_id: String(cur.id) }));
            loadTemplate(studentId, cur.id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const loadTemplate = async (sid, semId) => {
    setGenerating(true);
    try {
      const res = await svc.getInterventionTemplate(sid, semId);
      if (res.success) setForm(prev => ({ ...prev, content: res.data.template }));
    } catch { /* silent */ } finally {
      setGenerating(false);
    }
  };

  const handleSemesterChange = (e) => {
    const semId = e.target.value;
    setForm(prev => ({ ...prev, semester_id: semId }));
    if (semId) loadTemplate(studentId, parseInt(semId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.semester_id || !form.content.trim()) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    setLoading(true);
    try {
      const res = await svc.createIntervention({
        student_id: studentId, semester_id: parseInt(form.semester_id),
        method: form.method, content: form.content, status: form.status,
        ...(form.meeting_time && { meeting_time: form.meeting_time })
      });
      if (res.success) { toast.success('Tạo nhật ký thành công'); onSaved(); }
      else toast.error(res.message || 'Lỗi khi tạo nhật ký');
    } catch (err) {
      toast.error(err?.message || 'Không thể tạo nhật ký can thiệp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg">Tạo nhật ký can thiệp</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium">Sinh viên</p>
            <p className="font-semibold text-slate-800 mt-0.5">{studentName}</p>
          </div>

          {/* Semester */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Học kỳ <span className="text-red-500">*</span></label>
            <select value={form.semester_id} onChange={handleSemesterChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.name}{s.is_current ? ' (Hiện tại)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Hình thức <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {[['direct','👤 Gặp trực tiếp'],['phone','📞 Gọi điện'],['email','📧 Gửi mail']].map(([v, l]) => (
                <label key={v} className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer text-sm transition-colors ${form.method === v ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="method" value={v} checked={form.method === v} onChange={e => setForm(p => ({ ...p, method: e.target.value }))} className="hidden" />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Trạng thái</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="not_contacted">Chưa liên hệ</option>
              <option value="consulting">Đang tham vấn</option>
              <option value="reminded">Đã nhắc nhở</option>
              <option value="need_family">Cần phối hợp gia đình</option>
            </select>
          </div>

          {/* Meeting Time */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Thời gian hẹn gặp</label>
            <input
              type="datetime-local"
              value={form.meeting_time}
              onChange={e => setForm(p => ({ ...p, meeting_time: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">Tùy chọn: thời gian hẹn sinh viên gặp mặt</p>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Nội dung <span className="text-red-500">*</span></label>
              {generating && <span className="text-xs text-blue-500 animate-pulse">Đang tạo mẫu...</span>}
            </div>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={5} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Nội dung buổi gặp, tình trạng sinh viên, kế hoạch theo dõi..." required />
            <p className="text-xs text-slate-400 mt-1">Mẫu được tạo tự động từ hồ sơ nguy cơ. Bạn có thể chỉnh sửa trước khi lưu.</p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">Hủy</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {loading ? 'Đang lưu...' : 'Tạo nhật ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Main Page =====
export default function LecturerStudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await svc.getStudentDetail(parseInt(id));
      if (res.success) setData(res.data);
      else toast.error(res.message || 'Không thể tải hồ sơ sinh viên');
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi tải hồ sơ sinh viên');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Đang tải hồ sơ sinh viên...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-6 text-center text-slate-500">Không tìm thấy hồ sơ sinh viên</div>
  );

  const info = data.student_info;
  const latestPred = data.predictions?.[0];
  const rc = latestPred ? RISK[latestPred.risk_label] : null;

  // Build GPA history for chart
  const gpaHistory = [...(data.predictions || [])]
    .reverse()
    .map(p => ({
      name: p.semester?.name || '—',
      gpa: parseFloat(p.predicted_gpa) || 0
    }));

  // Latest behavior
  const latestBehavior = data.behavior_records?.[0];

  // Feature importance from latest prediction
  let featureImportance = [];
  if (latestPred?.feature_importance) {
    try {
      featureImportance = Array.isArray(latestPred.feature_importance)
        ? latestPred.feature_importance
        : JSON.parse(latestPred.feature_importance);
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Quay lại
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 text-xl font-bold flex items-center justify-center">
            {info.full_name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{info.full_name}</h1>
            <p className="text-sm text-slate-500 font-mono mt-0.5">
              {info.student_code} · {info.major} · K{info.course_year}
            </p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          <PlusIcon className="w-4 h-4" /> Thêm nhật ký can thiệp
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500 font-medium">GPA tích lũy</p>
          <p className="text-3xl font-bold font-mono text-slate-800 mt-1">
            {info.gpa_cumulative != null ? parseFloat(info.gpa_cumulative).toFixed(2) : '—'}
          </p>
        </div>
        {latestPred && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 font-medium">GPA dự báo</p>
            <p className="text-3xl font-bold font-mono text-blue-700 mt-1">
              {parseFloat(latestPred.predicted_gpa).toFixed(2)}
            </p>
          </div>
        )}
        {rc && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 font-medium">Mức nguy cơ</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full border text-sm font-semibold ${rc.bg}`}>{rc.label}</span>
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500 font-medium">Số can thiệp</p>
          <p className="text-3xl font-bold font-mono text-slate-800 mt-1">
            {data.interventions?.length || 0}
          </p>
        </div>
      </div>

      <div className="native-scrollbar">
        {/* GPA Trend */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 text-sm">Xu hướng GPA dự báo</h2>
          </div>
          <div className="p-4">
            {gpaHistory.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Chưa có dữ liệu dự báo</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={gpaHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="GPA dự báo" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Behavior Records */}
      {latestBehavior && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 text-sm">
              Chỉ số hành vi thô — {latestBehavior.semester?.name}
              <span className="ml-2 text-xs font-normal text-slate-400">
                (ô đỏ = bất thường)
              </span>
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(BEHAVIOR_LABELS).map(key => {
              const val = latestBehavior[key];
              if (val === undefined || val === null) return null;
              const abnormal = isAbnormal(key, parseFloat(val));
              return (
                <div key={key}
                  className={`rounded-xl p-4 border ${abnormal ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-slate-500">{BEHAVIOR_LABELS[key]}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-2xl font-bold font-mono ${abnormal ? 'text-red-600' : 'text-slate-800'}`}>
                      {parseFloat(val).toFixed(1)}
                    </p>
                    {abnormal && <ExclamationCircleIcon className="w-5 h-5 text-red-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Intervention Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">Lịch sử nhật ký can thiệp</h2>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium">
            <PlusIcon className="w-3.5 h-3.5" /> Thêm mới
          </button>
        </div>
        {!data.interventions || data.interventions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <p className="text-sm">Chưa có nhật ký can thiệp nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data.interventions.map(iv => {
              const sm = STATUS_MAP[iv.status] || STATUS_MAP.not_contacted;
              return (
                <div key={iv.id} className="flex gap-4 px-5 py-4 hover:bg-slate-50/60">
                  <div className="text-2xl mt-0.5">{METHOD_ICON[iv.method] || '📝'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sm.cls}`}>{sm.label}</span>
                      <span className="text-xs text-slate-500">{new Date(iv.contacted_at).toLocaleDateString('vi-VN')}</span>
                      {iv.semester && <span className="text-xs text-slate-500">· {iv.semester.name}</span>}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{iv.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <InterventionModal
          studentId={parseInt(id)}
          studentName={info.full_name}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
        />
      )}
    </div>
  );
}
