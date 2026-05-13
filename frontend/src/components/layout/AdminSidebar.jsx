import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/admin/users', icon: UsersIcon, label: 'Quản lý người dùng' },
    { path: '/admin/students', icon: AcademicCapIcon, label: 'Quản lý sinh viên' },
    { path: '/admin/lecturers', icon: UsersIcon, label: 'Quản lý giảng viên' },
    { path: '/admin/courses', icon: BookOpenIcon, label: 'Quản lý học phần' },
    { path: '/admin/semesters', icon: CalendarIcon, label: 'Quản lý học kỳ' },
    { path: '/admin/grades', icon: ChartBarIcon, label: 'Quản lý điểm' },
    { path: '/admin/backup', icon: CircleStackIcon, label: 'Sao lưu & Khôi phục' },
    { path: '/admin/settings', icon: CogIcon, label: 'Cài đặt' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <p className="text-sm text-gray-500 mt-1">Quản trị hệ thống</p>
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

export default AdminSidebar;
