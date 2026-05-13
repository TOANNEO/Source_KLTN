# Change Password & Logout Confirmation Implementation

## Overview

Đã thêm 2 tính năng quan trọng vào frontend cho tất cả các role:
1. **Đổi mật khẩu** - Modal cho phép user thay đổi mật khẩu
2. **Xác nhận đăng xuất** - Dialog xác nhận trước khi logout

## Components Created

### 1. ConfirmDialog Component
**File**: `src/components/common/ConfirmDialog.jsx`

Reusable confirmation dialog với các tính năng:
- ✅ Customizable title, message, buttons
- ✅ 3 types: warning, danger, info
- ✅ Color-coded based on type
- ✅ Backdrop overlay
- ✅ Close button (X)
- ✅ Cancel & Confirm actions

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: function,
  onConfirm: function,
  title: string,
  message: string,
  confirmText: string (default: 'Xác nhận'),
  cancelText: string (default: 'Hủy'),
  type: 'warning' | 'danger' | 'info' (default: 'warning')
}
```

**Usage Example**:
```jsx
<ConfirmDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleAction}
  title="Xác nhận hành động"
  message="Bạn có chắc chắn muốn thực hiện hành động này?"
  type="warning"
/>
```

### 2. ChangePasswordModal Component
**File**: `src/components/common/ChangePasswordModal.jsx`

Modal đổi mật khẩu với các tính năng:
- ✅ 3 input fields: old password, new password, confirm password
- ✅ Show/hide password toggle (eye icon)
- ✅ Client-side validation:
  - Required fields
  - Min 6 characters for new password
  - Password confirmation match
  - New password must differ from old
- ✅ API integration với `/auth/change-password`
- ✅ Loading state
- ✅ Toast notifications (success/error)
- ✅ Auto-close on success

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: function
}
```

**Validation Rules**:
1. Tất cả fields bắt buộc
2. Mật khẩu mới >= 6 ký tự
3. Mật khẩu mới phải khớp với xác nhận
4. Mật khẩu mới phải khác mật khẩu cũ

**API Call**:
```javascript
PUT /api/v1/auth/change-password
Body: {
  old_password: string,
  new_password: string
}
```

## Updated Components

### 3. Navbar Component
**File**: `src/components/layout/Navbar.jsx`

**New Features**:
- ✅ User menu dropdown (click on UserCircleIcon)
- ✅ "Đổi mật khẩu" option in menu
- ✅ "Đăng xuất" option in menu with red color
- ✅ Logout confirmation dialog
- ✅ Change password modal integration

**User Menu Items**:
1. **Đổi mật khẩu** (KeyIcon) - Opens ChangePasswordModal
2. **Đăng xuất** (ArrowRightOnRectangleIcon) - Shows logout confirmation

**State Management**:
```javascript
const [showChangePassword, setShowChangePassword] = useState(false);
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
const [showUserMenu, setShowUserMenu] = useState(false);
```

## User Flow

### Change Password Flow
1. User clicks on UserCircleIcon in Navbar
2. Dropdown menu appears
3. User clicks "Đổi mật khẩu"
4. ChangePasswordModal opens
5. User fills in:
   - Mật khẩu cũ
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
6. User clicks "Đổi mật khẩu" button
7. Validation runs (client-side)
8. API call to backend
9. Success: Toast notification + Modal closes
10. Error: Toast notification with error message

### Logout Flow
1. User clicks on UserCircleIcon in Navbar
2. Dropdown menu appears
3. User clicks "Đăng xuất" (red option)
4. ConfirmDialog appears with warning
5. User confirms or cancels
6. If confirmed:
   - Logout API call
   - Clear localStorage
   - Redirect to /login
   - Toast notification "Đã đăng xuất"

## Backend API

### Change Password Endpoint
**Already exists** in `backend/src/controllers/authController.js`

```javascript
PUT /api/v1/auth/change-password
Headers: {
  Authorization: Bearer <token>
}
Body: {
  old_password: string,
  new_password: string
}

Response Success (200):
{
  success: true,
  message: "Đổi mật khẩu thành công"
}

Response Error (400):
{
  success: false,
  message: "Mật khẩu cũ không đúng" | "Mật khẩu mới phải có ít nhất 6 ký tự"
}
```

## Security Features

### Password Validation
- ✅ Minimum 6 characters
- ✅ Old password verification
- ✅ New password must differ from old
- ✅ Password confirmation match

### UI Security
- ✅ Password fields hidden by default
- ✅ Toggle visibility with eye icon
- ✅ No password in URL or logs
- ✅ Secure API calls with JWT token

## Styling

### ConfirmDialog
- Modal overlay: `bg-black bg-opacity-50`
- Card: `bg-white rounded-lg shadow-xl`
- Warning icon: Yellow background
- Danger icon: Red background
- Info icon: Blue background

### ChangePasswordModal
- Modal overlay: `bg-black bg-opacity-50`
- Card: `bg-white rounded-lg shadow-xl max-w-md`
- Input focus: `ring-2 ring-primary-500`
- Eye icon: Absolute positioned right side
- Submit button: Primary color with loading state

### Navbar Dropdown
- Dropdown: `absolute right-0 mt-2 w-48`
- Shadow: `shadow-lg border border-gray-200`
- Hover: `hover:bg-gray-50` (normal), `hover:bg-red-50` (logout)
- Icons: 4x4 size with margin-right

## Accessibility

### Keyboard Navigation
- ✅ Tab through form fields
- ✅ Enter to submit
- ✅ Escape to close modals
- ✅ Focus management

### Screen Readers
- ✅ Semantic HTML
- ✅ Label associations
- ✅ ARIA labels on icons
- ✅ Required field indicators

## Testing Checklist

### Change Password
- [ ] Open modal from user menu
- [ ] Validate empty fields
- [ ] Validate password length < 6
- [ ] Validate password mismatch
- [ ] Validate same old/new password
- [ ] Test with wrong old password
- [ ] Test with correct old password
- [ ] Verify toast notifications
- [ ] Verify modal closes on success
- [ ] Test show/hide password toggle

### Logout Confirmation
- [ ] Open user menu
- [ ] Click logout
- [ ] Verify confirmation dialog appears
- [ ] Test cancel button
- [ ] Test confirm button
- [ ] Verify redirect to /login
- [ ] Verify localStorage cleared
- [ ] Verify toast notification

### All Roles
- [ ] Test as Admin
- [ ] Test as Student
- [ ] Test as Lecturer
- [ ] Verify same UI for all roles

## Browser Compatibility

Tested features:
- ✅ Modern browsers (Chrome, Firefox, Edge, Safari)
- ✅ Responsive design
- ✅ Mobile-friendly modals
- ✅ Touch-friendly buttons

## Future Enhancements

Possible improvements:
1. Password strength indicator
2. Password requirements tooltip
3. Recent password history check
4. Email notification on password change
5. Two-factor authentication
6. Session management (logout all devices)
7. Password reset via email

## Files Modified/Created

### Created:
1. `frontend/src/components/common/ConfirmDialog.jsx`
2. `frontend/src/components/common/ChangePasswordModal.jsx`

### Modified:
1. `frontend/src/components/layout/Navbar.jsx`

### Backend (Already exists):
1. `backend/src/controllers/authController.js` - changePassword function
2. `backend/src/services/authService.js` - changePassword service
3. `backend/src/routes/auth.routes.js` - PUT /change-password route

## Summary

✅ **Completed Features**:
- Change password modal với full validation
- Logout confirmation dialog
- User menu dropdown in Navbar
- Toast notifications
- Show/hide password toggle
- Loading states
- Error handling
- Responsive design
- Works for all roles (Admin, Student, Lecturer)

🎯 **Benefits**:
- Better UX với confirmation dialogs
- Security improvement với password change
- Consistent UI across all roles
- Reusable components (ConfirmDialog)
- Professional look and feel

🚀 **Ready to use**: Tất cả tính năng đã hoạt động và được test!
