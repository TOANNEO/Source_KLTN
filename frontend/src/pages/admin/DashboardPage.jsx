import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboard, getRecentLogins } from '../../services/adminService';

const ROLE_LABELS = { admin: 'Admin', student: 'Sinh viên', lecturer: 'Giảng viên' };
const CHART_COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#65a30d', '#ea580c', '#0284c7'
];

/* ── Helpers ─────────────────────────────────────────────────── */

const buildChartData = (gradeTrends = []) => {
  if (!gradeTrends.length) return { chartData: [], allCourses: [] };

  // Collect unique semesters ordered by start_date
  const semMap = new Map();
  gradeTrends.forEach(g => {
    const s = g.Semester;
    if (s && !semMap.has(s.id)) semMap.set(s.id, s);
  });
  const semesters = [...semMap.values()].sort(
    (a, b) => new Date(a.start_date) - new Date(b.start_date)
  );

  // Collect unique courses
  const courseMap = new Map();
  gradeTrends.forEach(g => {
    if (g.Course && !courseMap.has(g.course_id)) courseMap.set(g.course_id, g.Course);
  });
  const allCourses = [...courseMap.values()];

  // Build data points
  const chartData = semesters.map(sem => {
    const point = { semester: `${sem.name} ${sem.academic_year || ''}`.trim() };
    allCourses.forEach(course => {
      const match = gradeTrends.find(
        g => g.semester_id === sem.id && g.course_id === course.id
      );
      point[course.course_code] = match ? parseFloat(Number(match.avg_score).toFixed(2)) : null;
    });
    return point;
  });

  return { chartData, allCourses };
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const roleBadge = (role) => {
  const map = {
    admin: 'bg-purple-100 text-purple-700',
    student: 'bg-blue-100 text-blue-700',
    lecturer: 'bg-green-100 text-green-700'
  };
  return map[role] || 'bg-slate-100 text-slate-600';
};

/* ── Sub-components ──────────────────────────────────────────── */

function AccountCard({ role, active = 0, inactive = 0 }) {
  const iconMap = {
    admin: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    student: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    lecturer: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  };
  const colorMap = {
    admin: { icon: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
    student: { icon: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
    lecturer: { icon: 'bg-green-100 text-green-700', border: 'border-green-200' }
  };
  const c = colorMap[role] || colorMap.student;
  const total = active + inactive;

  return (
    <div className={`bg-white rounded-xl border ${c.border} shadow-sm p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            {ROLE_LABELS[role]}
          </p>
          <p className="text-3xl font-bold text-slate-800">{total}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${c.icon}`}>{iconMap[role]}</div>
      </div>
      <div className="flex gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          <span className="text-xs text-slate-600">{active} hoạt động</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          <span className="text-xs text-slate-600">{inactive} vô hiệu</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */

export default function AdminDashboard() {
  const [statsLoading, setStatsLoading] = useState(true);
  const [accountStats, setAccountStats] = useState(null);
  const [gradeTrends, setGradeTrends] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const [recentLogins, setRecentLogins] = useState([]);
  const [loginsLoading, setLoginsLoading] = useState(true);
  const pollingRef = useRef(null);

  // Fetch stats once on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await getDashboard();
        const data = res.data?.data || res.data || {};
        setAccountStats(data.accountStats || null);
        const trends = data.gradeTrends || [];
        setGradeTrends(trends);
        const { chartData: cd, allCourses: ac } = buildChartData(trends);
        setChartData(cd);
        setAllCourses(ac);
        // Default: select first 5 courses
        setSelectedCourses(ac.slice(0, 5).map(c => c.course_code));
      } catch {
        // silent
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Poll recent logins every 30 seconds
  useEffect(() => {
    const fetchLogins = async () => {
      try {
        setLoginsLoading(true);
        const res = await getRecentLogins(20);
        setRecentLogins(res.data?.data || res.data || []);
      } catch {
        // silent
      } finally {
        setLoginsLoading(false);
      }
    };
    fetchLogins();
    pollingRef.current = setInterval(fetchLogins, 30000);
    return () => clearInterval(pollingRef.current);
  }, []);

  const toggleCourse = (code) => {
    setSelectedCourses(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const stats = accountStats || {};

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-slate-500 text-sm mt-1">Theo dõi tài khoản, biến động điểm và hoạt động đăng nhập</p>
      </div>

      {/* Section A: Account Stats */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Thống kê tài khoản</h2>
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-8 bg-slate-200 rounded w-1/2 mb-4" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AccountCard role="admin"
              active={stats.admin?.active ?? 0}
              inactive={stats.admin?.inactive ?? 0}
            />
            <AccountCard role="student"
              active={stats.student?.active ?? 0}
              inactive={stats.student?.inactive ?? 0}
            />
            <AccountCard role="lecturer"
              active={stats.lecturer?.active ?? 0}
              inactive={stats.lecturer?.inactive ?? 0}
            />
          </div>
        )}
      </div>

      {/* Section B: Grade Trend Chart */}
      <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Biến động điểm trung bình theo học kỳ</h2>
            <p className="text-xs text-slate-400 mt-0.5">Điểm trung bình theo môn học qua các học kỳ</p>
          </div>
          {/* Course filter chips */}
          {allCourses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-w-xl">
              {allCourses.map((course, i) => {
                const active = selectedCourses.includes(course.course_code);
                return (
                  <button
                    key={course.id}
                    onClick={() => toggleCourse(course.course_code)}
                    style={active ? { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + '20', borderColor: CHART_COLORS[i % CHART_COLORS.length], color: CHART_COLORS[i % CHART_COLORS.length] } : {}}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors font-medium ${active ? '' : 'border-slate-200 text-slate-400 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {course.course_code}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {statsLoading ? (
          <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            Chưa có dữ liệu điểm
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="semester"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v.toFixed(0)}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value, name) => [value !== null ? Number(value).toFixed(2) : '—', name]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                formatter={(value) => {
                  const course = allCourses.find(c => c.course_code === value);
                  return course?.course_name ? `${value} – ${course.course_name}` : value;
                }}
              />
              {allCourses.map((course, i) =>
                selectedCourses.includes(course.course_code) ? (
                  <Line
                    key={course.id}
                    type="monotone"
                    dataKey={course.course_code}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Section C: Recent Logins */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Đăng nhập gần đây</h2>
            <p className="text-xs text-slate-400 mt-0.5">Cập nhật mỗi 30 giây</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live
          </span>
        </div>

        {loginsLoading && recentLogins.length === 0 ? (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-200 rounded w-1/4" />
                </div>
                <div className="h-2.5 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : recentLogins.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">Chưa có lịch sử đăng nhập</div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {recentLogins.map(user => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${roleBadge(user.role)}`}>
                  {(user.first_name?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(user.role)}`}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(user.last_login_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
