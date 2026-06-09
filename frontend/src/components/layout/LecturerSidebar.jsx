import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  BuildingLibraryIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

const LecturerSidebar = ({ alertCount = 0 }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/lecturer/dashboard',       icon: HomeIcon,                  label: 'Dashboard',            badge: alertCount },
    { path: '/lecturer/classes',         icon: BuildingLibraryIcon,       label: 'Lớp chủ nhiệm' },
    { path: '/lecturer/at-risk-students',icon: ExclamationTriangleIcon,   label: 'Sinh viên nguy cơ' },
    { path: '/lecturer/interventions',   icon: ClipboardDocumentListIcon, label: 'Nhật ký can thiệp' },
    // { path: '/lecturer/report',          icon: ChartBarIcon,              label: 'Báo cáo & Thống kê' },
    // { path: '/lecturer/students',        icon: UserGroupIcon,             label: 'Danh sách sinh viên' },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Giảng viên</h2>
        <p className="text-sm text-slate-500 mt-0.5">Cố vấn học tập</p>
      </div>

      <nav className="px-3 py-4 space-y-0.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-1">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default LecturerSidebar;
