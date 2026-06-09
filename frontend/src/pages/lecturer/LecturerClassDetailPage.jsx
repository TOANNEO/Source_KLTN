import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getLecturerClassDetail } from '../../services/lecturerService';

const fullName = (u) => u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '—';

const RISK_CONFIG = {
  danger:  { label: 'Nguy hiểm', cls: 'bg-red-100 text-red-700 border-red-200' },
  warning: { label: 'Cảnh báo',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  safe:    { label: 'An toàn',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const IV_STATUS = {
  not_contacted: { label: 'Chưa liên hệ',          cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  consulting:    { label: 'Đang tham vấn',          cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  reminded:      { label: 'Đã nhắc nhở',            cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  need_family:   { label: 'Cần phối hợp GĐ',       cls: 'bg-red-100 text-red-700 border-red-200' },
};

export default function LecturerClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    getLecturerClassDetail(id)
      .then(res => {
        if (res.success) setData(res.data);
        else toast.error(res.message || 'Không thể tải thông tin lớp');
      })
      .catch(err => toast.error(err?.message || 'Lỗi khi tải dữ liệu lớp'))
      .finally(() => setLoading(false));
  }, [id]);

  const students = data?.students || [];

  const sorted = useMemo(() => {
    const order = { danger: 0, warning: 1, safe: 2 };
    return [...students].sort((a, b) => {
      const ra = a.latest_prediction?.risk_label;
      const rb = b.latest_prediction?.risk_label;
      const oa = ra != null ? (order[ra] ?? 3) : 3;
      const ob = rb != null ? (order[rb] ?? 3) : 3;
      if (oa !== ob) return oa - ob;
      return (parseFloat(a.gpa_cumulative) || 0) - (parseFloat(b.gpa_cumulative) || 0);
    });
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return sorted;
    return sorted.filter(s =>
      fullName(s.user).toLowerCase().includes(q) ||
      (s.student_code || '').toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const stats = useMemo(() => ({
    total:   students.length,
    danger:  students.filter(s => s.latest_prediction?.risk_label === 'danger').length,
    warning: students.filter(s => s.latest_prediction?.risk_label === 'warning').length,
    safe:    students.filter(s => s.latest_prediction?.risk_label === 'safe').length,
  }), [students]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Đang tải dữ liệu lớp...</p>
      </div>
    </div>
  );

  const cls = data?.class;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate('/lecturer/classes')}
        className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Quay lại danh sách lớp
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{cls?.class_name}</h1>
        {cls?.department && (
          <span className="inline-block mt-1.5 bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200">
            {cls.department.code} — {cls.department.name}
          </span>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-500">Tổng sinh viên</p>
          <p className="text-2xl font-bold font-mono text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-4">
          <p className="text-xs font-medium text-red-600">Nguy hiểm</p>
          <p className="text-2xl font-bold font-mono text-red-700 mt-1">{stats.danger}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-4">
          <p className="text-xs font-medium text-amber-600">Cảnh báo</p>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{stats.warning}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm p-4">
          <p className="text-xs font-medium text-emerald-600">An toàn</p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{stats.safe}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-700 text-sm">
            Danh sách sinh viên
            <span className="ml-2 text-xs font-normal text-slate-400">(sắp xếp theo mức độ nguy cơ)</span>
          </h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text" placeholder="Tìm sinh viên..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 w-10">STT</th>
                <th className="text-left   px-4 py-3 text-xs font-semibold text-slate-500">Mã SV</th>
                <th className="text-left   px-4 py-3 text-xs font-semibold text-slate-500">Họ và tên</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">GPA tích lũy</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">GPA dự báo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Nguy cơ</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Can thiệp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-slate-400 text-xs">
                    {students.length === 0 ? 'Lớp chưa có sinh viên nào' : 'Không tìm thấy sinh viên'}
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => {
                  const risk  = s.latest_prediction?.risk_label;
                  const rc    = RISK_CONFIG[risk];
                  const ivSt  = s.intervention_status;
                  const ivCfg = IV_STATUS[ivSt];
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/lecturer/students/${s.id}/profile`)}
                    >
                      <td className="px-4 py-3 text-center text-xs text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.student_code}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 hover:text-blue-600">
                        {fullName(s.user)}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold font-mono text-slate-700">
                        {s.gpa_cumulative != null ? parseFloat(s.gpa_cumulative).toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold font-mono text-blue-700">
                        {s.latest_prediction?.predicted_gpa != null
                          ? parseFloat(s.latest_prediction.predicted_gpa).toFixed(2)
                          : <span className="text-slate-400 font-normal text-xs">Chưa dự báo</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rc
                          ? <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${rc.cls}`}>{rc.label}</span>
                          : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {ivCfg
                          ? <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${ivCfg.cls}`}>{ivCfg.label}</span>
                          : <span className="text-xs bg-slate-100 text-slate-400 border border-slate-200 px-2.5 py-0.5 rounded-full">Chưa can thiệp</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
