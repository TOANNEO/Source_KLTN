import { useState, useEffect } from 'react';
import { getDashboard } from '../../services/adminService';
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const { overview, accounts, atRisk } = dashboardData || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Thống kê tổng quan */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Thống kê tổng quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng số sinh viên"
            value={overview?.totalStudents || 0}
            icon={<AcademicCapIcon className="w-8 h-8" />}
            color="blue"
          />
          <StatCard
            title="Tổng số giảng viên"
            value={overview?.totalLecturers || 0}
            icon={<UserGroupIcon className="w-8 h-8" />}
            color="green"
          />
          <StatCard
            title="Tổng số học phần"
            value={overview?.totalCourses || 0}
            icon={<BookOpenIcon className="w-8 h-8" />}
            color="purple"
          />
          <StatCard
            title="Học kỳ hiện tại"
            value={overview?.currentSemester?.name || 'Chưa có'}
            subtitle={overview?.currentSemester?.year}
            icon={<CalendarIcon className="w-8 h-8" />}
            color="orange"
          />
        </div>
      </div>

      {/* Tài khoản */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Thống kê tài khoản theo vai trò</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Tổng tài khoản"
            value={accounts?.total || 0}
            icon={<UserGroupIcon className="w-8 h-8" />}
            color="gray"
          />
          <StatCard
            title="Admin"
            value={accounts?.admin || 0}
            icon={<ShieldCheckIcon className="w-8 h-8" />}
            color="purple"
          />
          <StatCard
            title="Sinh viên"
            value={accounts?.student || 0}
            icon={<AcademicCapIcon className="w-8 h-8" />}
            color="blue"
          />
          <StatCard
            title="Giảng viên"
            value={accounts?.lecturer || 0}
            icon={<UserGroupIcon className="w-8 h-8" />}
            color="green"
          />
        </div>
      </div>

      {/* Sinh viên nguy cơ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Sinh viên nguy cơ (Học kỳ hiện tại)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RiskCard
            title="An toàn"
            value={atRisk?.safe || 0}
            icon={<ShieldCheckIcon className="w-8 h-8" />}
            color="green"
            description="GPA ≥ 2.5"
          />
          <RiskCard
            title="Cảnh báo"
            value={atRisk?.warning || 0}
            icon={<ExclamationCircleIcon className="w-8 h-8" />}
            color="yellow"
            description="GPA 2.0-2.49"
          />
          <RiskCard
            title="Nguy hiểm"
            value={atRisk?.danger || 0}
            icon={<ExclamationTriangleIcon className="w-8 h-8" />}
            color="red"
            description="GPA < 2.0"
          />
        </div>
      </div>
    </div>
  );
};

// Component StatCard
const StatCard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Component RiskCard
const RiskCard = ({ title, value, icon, color, description }) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      iconBg: 'bg-green-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      iconBg: 'bg-red-100'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} p-6 rounded-lg shadow border-l-4 ${classes.border} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-700 font-semibold">{title}</h3>
        <div className={`p-3 rounded-full ${classes.iconBg} ${classes.text}`}>
          {icon}
        </div>
      </div>
      <p className={`text-4xl font-bold ${classes.text} mb-2`}>{value}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default AdminDashboard;
