import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const StudentSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/student/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/student/profile', icon: UserCircleIcon, label: 'Hồ sơ học tập' },
    { path: '/student/grades', icon: ClipboardDocumentListIcon, label: 'Bảng điểm' },
    { path: '/student/behavior', icon: ChartBarIcon, label: 'Chỉ số hành vi' },
    { path: '/student/prediction', icon: LightBulbIcon, label: 'Dự báo kết quả' },
    { path: '/student/improvement', icon: ArrowTrendingUpIcon, label: 'Gợi ý cải thiện' },
    { path: '/student/goal-seek', icon: AcademicCapIcon, label: 'Tính điểm mục tiêu' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Sinh viên</h2>
        <p className="text-sm text-gray-500 mt-1">Theo dõi học tập</p>
      </div>

      <nav className="px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default StudentSidebar;
