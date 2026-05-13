import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const LecturerSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/lecturer/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/lecturer/at-risk-students', icon: ExclamationTriangleIcon, label: 'Sinh viên nguy cơ' },
    { path: '/lecturer/improvement-report', icon: ChartBarIcon, label: 'Báo cáo cải thiện' },
    { path: '/lecturer/students', icon: UserGroupIcon, label: 'Danh sách sinh viên' },
    { path: '/lecturer/reports', icon: DocumentArrowDownIcon, label: 'Xuất báo cáo' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Giảng viên</h2>
        <p className="text-sm text-gray-500 mt-1">Theo dõi sinh viên</p>
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

export default LecturerSidebar;
