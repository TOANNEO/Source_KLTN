import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  BellIcon, MagnifyingGlassIcon, ExclamationTriangleIcon,
  UsersIcon, ClipboardDocumentListIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import * as svc from '../../services/lecturerService';

const RISK = {
  danger:  { label: 'Nguy hiểm', bg: 'bg-red-100 text-red-700 border-red-200',  dot: 'bg-red-500' },
  warning: { label: 'Cảnh báo',  bg: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  safe:    { label: 'An toàn',   bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 60) return `${m} phút trước`;
  if (h < 24) return `${h} giờ trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_students: 0, danger: 0, warning: 0, safe: 0, not_intervened: 0, intervened: 0 });
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [riskChart, setRiskChart] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Load stats + chart once
  useEffect(() => {
    (async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          svc.getDashboardStats(),
          svc.getRiskRatio({})
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (chartRes.success) setRiskChart(chartRes.data);
      } catch {
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoadingStats(false);
      }
    })();
  }, []);

  // UC31: polling alerts every 30s
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await svc.getAlerts();
        if (res.success) {
          setAlerts(res.data);
          setUnread(res.data.length);
        }
      } catch { /* silent */ }
    };
    fetchAlerts();
    const id = setInterval(fetchAlerts, 30000);
    return () => clearInterval(id);
  }, []);

  // UC30: debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (search.trim().length < 2) { setSearchResults([]); setShowDrop(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await svc.searchStudents(search.trim());
        if (res.success) { setSearchResults(res.data); setShowDrop(true); }
      } catch { /* silent */ }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statCards = [
    { label: 'Tổng sinh viên',   value: stats.total_students, color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    Icon: UsersIcon },
    { label: 'Đang nguy hiểm',   value: stats.danger,         color: 'text-red-700',     bg: 'bg-red-50 border-red-200',      Icon: ExclamationTriangleIcon },
    { label: 'Chưa can thiệp',   value: stats.not_intervened, color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',  Icon: ExclamationTriangleIcon },
    { label: 'Đã can thiệp',     value: stats.intervened,     color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', Icon: CheckCircleIcon },
  ];

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Cố vấn học tập</h1>
          <p className="text-sm text-slate-500 mt-0.5">Theo dõi toàn bộ sinh viên phụ trách</p>
        </div>
        <div className="relative">
          <button className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm relative hover:bg-slate-50 transition-colors">
            <BellIcon className="w-5 h-5 text-slate-600" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, color, bg, Icon }) => (
          <div key={label} className={`rounded-xl border shadow-sm p-5 ${bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">{label}</p>
                <p className={`text-3xl font-bold font-mono mt-1 ${color}`}>{loadingStats ? '—' : value}</p>
              </div>
              <Icon className={`w-8 h-8 opacity-40 ${color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar — UC30 */}
      <div className="relative" ref={searchRef}>
        {showDrop && searchResults.length > 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
            {searchResults.map(s => {
              const rc = RISK[s.risk_label];
              return (
                <button
                  key={s.id}
                  onClick={() => { navigate(`/lecturer/students/${s.id}/profile`); setShowDrop(false); setSearch(''); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-50 last:border-b-0"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{s.full_name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{s.student_code} · {s.class_name}</p>
                  </div>
                  {rc && (
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${rc.bg}`}>{rc.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {showDrop && searchResults.length === 0 && search.length >= 2 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center text-sm text-slate-500">
            Không tìm thấy sinh viên nào
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* UC31: Alerts Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 text-sm">Cảnh báo mới (24h)</h2>
            {unread > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{unread}</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto max-h-80 divide-y divide-slate-50">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <BellIcon className="w-10 h-10 mb-2" />
                <p className="text-sm">Không có cảnh báo mới</p>
              </div>
            ) : (
              alerts.map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/lecturer/students/${a.student_id}/profile`)}
                  className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-red-50/50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {a.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.full_name}</p>
                    <p className="text-xs text-slate-500 font-mono truncate">{a.student_code} · {a.class_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-700">GPA: <b>{parseFloat(a.predicted_gpa).toFixed(2)}</b></span>
                      {a.gpa_change != null && (
                        <span className="text-xs font-mono text-red-600">▼ {Math.abs(a.gpa_change).toFixed(2)}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(a.predicted_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 text-sm">Phân bố nguy cơ theo lớp (học kỳ hiện tại)</h2>
          </div>
          <div className="p-4">
            {riskChart.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={riskChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="class_name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="safe"    fill="#10b981" name="An toàn"   radius={[3,3,0,0]} />
                  <Bar dataKey="warning" fill="#f59e0b" name="Cảnh báo" radius={[3,3,0,0]} />
                  <Bar dataKey="danger"  fill="#ef4444" name="Nguy hiểm" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Lớp chủ nhiệm',   path: '/lecturer/classes',       color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200' },
          { label: 'SV nguy cơ',       path: '/lecturer/at-risk-students', color: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200' },
          { label: 'Nhật ký can thiệp', path: '/lecturer/interventions',  color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200' },
          // { label: 'Báo cáo',         path: '/lecturer/report',         color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
        ].map(({ label, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${color}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
