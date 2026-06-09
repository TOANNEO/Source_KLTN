import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import StudentSidebar from './StudentSidebar';
import LecturerSidebar from './LecturerSidebar';
import Navbar from './Navbar';
import * as lecturerSvc from '../../services/lecturerService';

const DashboardLayout = () => {
  const { user } = useAuth();
  const [alertCount, setAlertCount] = useState(0);

  // Poll alerts every 60s for lecturers
  useEffect(() => {
    if (user?.role !== 'lecturer') return;

    const fetchAlerts = async () => {
      try {
        const res = await lecturerSvc.getAlerts();
        if (res.success) setAlertCount(res.data?.length ?? 0);
      } catch {
        // silently ignore network errors
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(interval);
  }, [user?.role]);

  // Select sidebar based on user role
  const renderSidebar = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminSidebar />;
      case 'student':
        return <StudentSidebar />;
      case 'lecturer':
        return <LecturerSidebar alertCount={alertCount} />;
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
