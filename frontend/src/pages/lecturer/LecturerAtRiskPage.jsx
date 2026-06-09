import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FunnelIcon, ArrowDownTrayIcon, ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import * as svc from '../../services/lecturerService';

const RISK_CONFIG = {
  danger:  { label: 'Nguy hiểm', row: 'bg-red-50',    badge: 'bg-red-100 text-red-700 border-red-200' },
  warning: { label: 'Cảnh báo',  row: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  safe:    { label: 'An toàn',   row: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

export default function LecturerAtRiskPage() {
  const navigate = useNavigate();
  const [students, setStudents]   = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch]       = useState('');

  const [filters, setFilters] = useState({
    semester_id: '',
    class_id: '',
    risk_label: '',
    min_gpa: '',
  });

  // Load semesters + lecturer classes for filter dropdowns
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/v1/semesters', { headers }).then(r => r.json()),
      svc.getLecturerClasses(),
    ]).then(([semRes, clsRes]) => {
      if (semRes.success) {
        setSemesters(semRes.data);
        const cur = semRes.data.find(s => s.is_current);
        if (cur) setFilters(f => ({ ...f, semester_id: String(cur.id) }));
      }
      if (clsRes.success) setClasses(clsRes.data || []);
    }).catch(() => {});
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.semester_id) params.semester_id = filters.semester_id;
      if (filters.class_id)    params.class_id    = filters.class_id;
      if (filters.risk_label)  params.risk_label  = filters.risk_label;
      if (filters.min_gpa)     params.predicted_gpa_threshold = filters.min_gpa;

      const res = await svc.getAtRiskStudents(params);
      if (res.success) setStudents(res.data || []);
      else toast.error(res.message || 'Không thể tải danh sách sinh viên');
    } catch {
      toast.error('Lỗi khi tải dữ liệu sinh viên nguy cơ');
    } finally {
     
      setLoading(false);
    }
  }, [filters]);
  console.log(filters);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleExport = async (format) => {
    if (!filters.semester_id) { toast.error('Vui lòng chọn học kỳ trước khi xuất'); return; }
    setExporting(true);
    try {
      const blob = await svc.exportLecturerReport({
        semester_id: filters.semester_id,
        format,
        ...(filters.class_id   && { class_id:    filters.class_id }),
        ...(filters.risk_label && { risk_label:  filters.risk_label }),
      });
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `sv-nguy-co-${filters.semester_id}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Xuất báo cáo thất bại');
    } finally {
      setExporting(false);
    }
  };

  const filtered = students.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.full_name    || '').toLowerCase().includes(q) ||
      (s.student_code || '').toLowerCase().includes(q)
    );
  });
  const counts = {
    danger:  students.filter(s => s.risk_label === 'danger').length,
    warning: students.filter(s => s.risk_label === 'warning').length,
    safe:    students.filter(s => s.risk_label === 'safe').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sinh viên nguy cơ</h1>
          <p className="text-sm text-slate-500 mt-0.5">Theo dõi sinh viên có nguy cơ học tập thấp</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting || !filters.semester_id}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting || !filters.semester_id}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && students.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-red-600">Nguy hiểm</p>
            <p className="text-3xl font-bold font-mono text-red-700 mt-1">{counts.danger}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-amber-600">Cảnh báo</p>
            <p className="text-3xl font-bold font-mono text-amber-700 mt-1">{counts.warning}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-emerald-600">An toàn</p>
            <p className="text-3xl font-bold font-mono text-emerald-700 mt-1">{counts.safe}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-1.5 text-slate-600 mb-3">
          <FunnelIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Bộ lọc</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Semester */}
          <select
            value={filters.semester_id}
            onChange={e => setFilters(f => ({ ...f, semester_id: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả học kỳ</option>
            {semesters.map(s => (
              <option key={s.id} value={s.id}>{s.name}{s.is_current ? ' ★' : ''}</option>
            ))}
          </select>

          {/* Class */}
          <select
            value={filters.class_id}
            onChange={e => setFilters(f => ({ ...f, class_id: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả lớp</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.class_name}</option>
            ))}
          </select>

          {/* Risk level */}
          <select
            value={filters.risk_label}
            onChange={e => setFilters(f => ({ ...f, risk_label: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả mức nguy cơ</option>
            <option value="danger">Nguy hiểm</option>
            <option value="warning">Cảnh báo</option>
            <option value="safe">An toàn</option>
          </select>

          {/* Min GPA */}
          <input
            type="number"
            min="0" max="10" step="0.1"
            placeholder="GPA tối thiểu (vd: 5.0)"
            value={filters.min_gpa}
            onChange={e => setFilters(f => ({ ...f, min_gpa: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header with search */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">
            Danh sách sinh viên
            {!loading && (
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({filtered.length} / {students.length} sinh viên)
              </span>
            )}
          </p>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm MSSV, họ tên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ExclamationTriangleIcon className="w-14 h-14 mb-3" />
            <p className="text-sm font-medium">
              {students.length === 0 ? 'Không có sinh viên nguy cơ nào' : 'Không tìm thấy kết quả'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 w-10">STT</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Mã SV</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Họ và tên</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Lớp</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">GPA tích lũy</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">GPA dự báo</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Nguy cơ</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Can thiệp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  const rc = RISK_CONFIG[s.risk_label];
                  return (
                    <tr
                      key={s.student_id}
                      className={`border-b border-slate-50 hover:brightness-95 cursor-pointer transition-colors ${rc?.row || ''}`}
                      onClick={() => navigate(`/lecturer/students/${s.student_id}/profile`)}
                    >
                      <td className="px-4 py-3 text-center text-xs text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.student_code}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{s.full_name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{s.class_name || '—'}</td>
                      <td className="px-4 py-3 text-center font-semibold font-mono text-slate-700">
                        {s.current_gpa != null ? parseFloat(s.current_gpa).toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold font-mono text-blue-700">
                        {s.predicted_gpa != null ? parseFloat(s.predicted_gpa).toFixed(2) : (
                          <span className="text-slate-400 font-normal text-xs">Chưa dự báo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rc ? (
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${rc.badge}`}>
                            {rc.label}
                          </span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.intervention_count > 0 ? (
                          <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                            {s.intervention_count} lần
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
                            Chưa
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
