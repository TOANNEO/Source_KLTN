import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin pages
import AdminDashboard from './pages/admin/DashboardPage';
import StudentsPage from './pages/admin/StudentsPage';
import LecturersPage from './pages/admin/LecturersPage';
import CoursesPage from './pages/admin/CoursesPage';
import SemestersPage from './pages/admin/SemestersPage';
import GradesPage from './pages/admin/GradesPage';
import BackupPage from './pages/admin/BackupPage';
import ClassesPage from './pages/admin/ClassesPage';
import ClassDetailPage from './pages/admin/ClassDetailPage';

// Student pages
import StudentDashboard from './pages/student/DashboardPage';
import StudentGradesPage from './pages/student/GradesPage';
import BehaviorPage from './pages/student/BehaviorPage';
import PredictionPage from './pages/student/PredictionPage';
import ImprovementPage from './pages/student/ImprovementPage';
import PredictionDashboard from './pages/student/ImprovementDashboard';
// Lecturer pages
import LecturerDashboard from './pages/lecturer/DashboardPage';
import LecturerClassesPage from './pages/lecturer/LecturerClassesPage';
import LecturerClassDetailPage from './pages/lecturer/LecturerClassDetailPage';
import LecturerStudentProfilePage from './pages/lecturer/LecturerStudentProfilePage';
import LecturerInterventionsPage from './pages/lecturer/LecturerInterventionsPage';
import LecturerAtRiskPage from './pages/lecturer/LecturerAtRiskPage';
import LecturerReportPage from './pages/lecturer/LecturerReportPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="lecturers" element={<LecturersPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="semesters" element={<SemestersPage />} />
              <Route path="grades" element={<GradesPage />} />
              <Route path="backup" element={<BackupPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="classes/:id" element={<ClassDetailPage />} />
            </Route>

            {/* Student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="grades" element={<StudentGradesPage />} />
              <Route path="behavior" element={<BehaviorPage />} />
              <Route path="prediction" element={<PredictionPage />} />
              <Route path="improvement" element={<ImprovementPage />} />
              <Route path="prediction-dashboard" element={<PredictionDashboard />} />
            </Route>

            {/* Lecturer routes */}
            <Route
              path="/lecturer"
              element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/lecturer/dashboard" replace />} />
              <Route path="dashboard"         element={<LecturerDashboard />} />
              <Route path="classes"           element={<LecturerClassesPage />} />
              <Route path="classes/:id"       element={<LecturerClassDetailPage />} />
              <Route path="at-risk-students"  element={<LecturerAtRiskPage />} />
              <Route path="interventions"     element={<LecturerInterventionsPage />} />
              <Route path="report"            element={<LecturerReportPage />} />
              <Route path="students/:id/profile" element={<LecturerStudentProfilePage />} />
              <Route path="students" element={<div className="p-8 text-center text-slate-400">Danh sách sinh viên</div>} />
            </Route>

            {/* Default redirect based on role */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 */}
            <Route path="*" element={<div className="p-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <p className="mt-4 text-gray-600">Trang không tồn tại</p>
            </div>} />
          </Routes>

          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
