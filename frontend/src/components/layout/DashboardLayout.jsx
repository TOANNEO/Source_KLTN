import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import StudentSidebar from './StudentSidebar';
import LecturerSidebar from './LecturerSidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const { user } = useAuth();

  // Select sidebar based on user role
  const renderSidebar = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminSidebar />;
      case 'student':
        return <StudentSidebar />;
      case 'lecturer':
        return <LecturerSidebar />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
