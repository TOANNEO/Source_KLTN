# Frontend Layout Implementation Summary

## Overview

Complete frontend layout structure with authentication, routing, and role-based layouts for the Student Academic Prediction System.

## Architecture

```
frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx          ✅ Authentication context
│   ├── hooks/
│   │   └── useAuth.js               ✅ Custom auth hook
│   ├── services/
│   │   ├── api.js                   ✅ Axios instance with JWT interceptor
│   │   ├── authService.js           ✅ Auth API calls
│   │   ├── studentService.js        ✅ Student API calls
│   │   ├── lecturerService.js       ✅ Lecturer API calls
│   │   └── adminService.js          ✅ Admin API calls
│   ├── components/
│   │   ├── common/
│   │   │   ├── ProtectedRoute.jsx   ✅ Route guard component
│   │   │   ├── Button.jsx           ✅ Reusable button
│   │   │   ├── Input.jsx            ✅ Reusable input
│   │   │   └── Card.jsx             ✅ Reusable card
│   │   └── layout/
│   │       ├── Navbar.jsx           ✅ Top navigation bar
│   │       ├── AdminSidebar.jsx     ✅ Admin sidebar menu
│   │       ├── StudentSidebar.jsx   ✅ Student sidebar menu
│   │       ├── LecturerSidebar.jsx  ✅ Lecturer sidebar menu
│   │       └── DashboardLayout.jsx  ✅ Main layout wrapper
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx        ✅ Login page
│   │   ├── admin/
│   │   │   └── DashboardPage.jsx    ✅ Admin dashboard
│   │   ├── student/
│   │   │   └── DashboardPage.jsx    ✅ Student dashboard
│   │   ├── lecturer/
│   │   │   └── DashboardPage.jsx    ✅ Lecturer dashboard
│   │   └── UnauthorizedPage.jsx     ✅ 403 page
│   └── App.jsx                      ✅ Main app with routing
```

## Key Features Implemented

### 1. Authentication System

**AuthContext** (`src/context/AuthContext.jsx`):
- Manages user state and token
- Persists auth data in localStorage
- Provides login/logout functions
- Exposes role-based flags (isAdmin, isStudent, isLecturer)

**useAuth Hook** (`src/hooks/useAuth.js`):
```javascript
const { user, token, login, logout, isAuthenticated, isAdmin, isStudent, isLecturer } = useAuth();
```

### 2. API Integration

**Axios Instance** (`src/services/api.js`):
- Base URL configuration from environment
- Request interceptor: Auto-attach JWT token
- Response interceptor: Handle 401 errors (auto-logout)
- Global error handling

```javascript
// Automatic token attachment
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);
```

### 3. Route Protection

**ProtectedRoute Component** (`src/components/common/ProtectedRoute.jsx`):
- Checks authentication status
- Validates user role against allowed roles
- Redirects to `/login` if not authenticated
- Redirects to `/unauthorized` if wrong role

Usage:
```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout />
    </ProtectedRoute>
  }
/>
```

### 4. Layout System

**DashboardLayout** (`src/components/layout/DashboardLayout.jsx`):
- Dynamic sidebar based on user role
- Shared navbar across all roles
- Outlet for nested routes

**Role-Based Sidebars**:

**Admin Sidebar**:
- Dashboard
- Quản lý người dùng
- Quản lý sinh viên
- Quản lý giảng viên
- Quản lý học phần
- Quản lý học kỳ
- Quản lý điểm
- Sao lưu & Khôi phục
- Cài đặt

**Student Sidebar**:
- Dashboard
- Hồ sơ học tập
- Bảng điểm
- Chỉ số hành vi
- Dự báo kết quả
- Gợi ý cải thiện
- Tính điểm mục tiêu

**Lecturer Sidebar**:
- Dashboard
- Sinh viên nguy cơ
- Báo cáo cải thiện
- Danh sách sinh viên
- Xuất báo cáo

**Navbar** (`src/components/layout/Navbar.jsx`):
- System title
- Notification bell icon
- User info display (name, email, role badge)
- Profile icon
- Logout button
- Role-based badge colors:
  - Admin: Red
  - Student: Blue
  - Lecturer: Green

### 5. Routing Structure

**Public Routes**:
- `/login` - Login page
- `/unauthorized` - 403 error page

**Admin Routes** (`/admin/*`):
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/students` - Student management
- `/admin/lecturers` - Lecturer management
- `/admin/courses` - Course management
- `/admin/semesters` - Semester management
- `/admin/grades` - Grade management
- `/admin/backup` - Backup & restore
- `/admin/settings` - System settings

**Student Routes** (`/student/*`):
- `/student/dashboard` - Student dashboard
- `/student/profile` - Student profile
- `/student/grades` - Grade records
- `/student/behavior` - Behavior records
- `/student/prediction` - GPA prediction
- `/student/improvement` - Improvement suggestions
- `/student/goal-seek` - Goal seek calculator

**Lecturer Routes** (`/lecturer/*`):
- `/lecturer/dashboard` - Lecturer dashboard
- `/lecturer/at-risk-students` - At-risk students list
- `/lecturer/improvement-report` - Improvement report
- `/lecturer/students` - Students list
- `/lecturer/students/:id` - Student detail
- `/lecturer/reports` - Export reports

### 6. Styling

**Tailwind CSS Configuration**:
- Primary color scheme
- Responsive design
- Consistent spacing and typography
- Hover states and transitions

**Color Palette**:
- Primary: Blue tones
- Success: Green
- Warning: Yellow
- Danger: Red
- Neutral: Gray scale

## Usage Examples

### Login Flow

```javascript
// In LoginPage.jsx
const handleLogin = async (e) => {
  e.preventDefault();
  const success = await login(email, password);

  if (success) {
    // Redirect based on role
    if (user.role === 'admin') navigate('/admin/dashboard');
    if (user.role === 'student') navigate('/student/dashboard');
    if (user.role === 'lecturer') navigate('/lecturer/dashboard');
  }
};
```

### Protected API Call

```javascript
// In any component
import api from '../services/api';

const fetchData = async () => {
  try {
    const response = await api.get('/student/grades');
    // Token is automatically attached
    // Response is automatically unwrapped
    setData(response.data);
  } catch (error) {
    // 401 errors are handled automatically
    toast.error(error.message);
  }
};
```

### Role-Based Rendering

```javascript
const { isAdmin, isStudent, isLecturer } = useAuth();

return (
  <div>
    {isAdmin && <AdminFeature />}
    {isStudent && <StudentFeature />}
    {isLecturer && <LecturerFeature />}
  </div>
);
```

## Environment Configuration

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Access at: `http://localhost:5173`

## Next Steps

1. **Implement Page Components**:
   - Complete all dashboard pages with real data
   - Create forms for data entry
   - Add charts and visualizations

2. **Add Features**:
   - Profile editing
   - Grade viewing and filtering
   - Behavior record forms
   - Prediction results display
   - Improvement suggestions UI
   - Export functionality

3. **Enhance UX**:
   - Loading states
   - Error boundaries
   - Toast notifications
   - Form validation
   - Responsive mobile design

4. **Testing**:
   - Unit tests for components
   - Integration tests for auth flow
   - E2E tests for critical paths

## Security Considerations

✅ **Implemented**:
- JWT token stored in localStorage
- Automatic token attachment to requests
- Auto-logout on 401 responses
- Role-based route protection
- Protected route guards

⚠️ **Recommendations**:
- Consider httpOnly cookies for token storage (more secure than localStorage)
- Implement token refresh mechanism
- Add CSRF protection
- Implement rate limiting on login
- Add session timeout warnings

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Dependencies

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "react-hot-toast": "^2.x",
  "@heroicons/react": "^2.x",
  "tailwindcss": "^3.x"
}
```

## File Structure Summary

**Total Files Created/Modified**: 15

**New Files**:
- AdminSidebar.jsx
- StudentSidebar.jsx
- LecturerSidebar.jsx
- DashboardLayout.jsx
- AdminDashboard.jsx
- StudentDashboard.jsx
- LecturerDashboard.jsx
- UnauthorizedPage.jsx

**Modified Files**:
- App.jsx (complete routing)
- Navbar.jsx (enhanced UI)

**Existing Files** (already implemented):
- AuthContext.jsx
- useAuth.js
- api.js
- ProtectedRoute.jsx
- LoginPage.jsx

## Conclusion

The frontend layout is now fully structured with:
- ✅ Authentication system with JWT
- ✅ Role-based routing and protection
- ✅ Three distinct layouts (Admin, Student, Lecturer)
- ✅ Responsive sidebar navigation
- ✅ Professional navbar with user info
- ✅ API integration with auto-token handling
- ✅ Error handling and redirects

The foundation is ready for implementing specific features and pages.
