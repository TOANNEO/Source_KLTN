# ✅ Authentication System - Hoàn thành

## Tổng kết

Đã implement đầy đủ hệ thống authentication với JWT và role-based authorization.

---

## ✅ Components đã tạo

### Services
- ✅ **authService.js** - Business logic cho authentication
  - `hashPassword()` - Hash password với bcrypt (salt rounds = 10)
  - `comparePassword()` - Verify password
  - `generateToken()` - Tạo JWT token (expires in 7 days)
  - `verifyToken()` - Verify JWT token
  - `login()` - Xử lý đăng nhập, trả về token + user info
  - `changePassword()` - Đổi mật khẩu
  - `getUserById()` - Lấy user với profile (student/lecturer)

### Controllers
- ✅ **authController.js** - HTTP request handlers
  - `login` - POST /api/v1/auth/login
  - `logout` - POST /api/v1/auth/logout
  - `getCurrentUser` - GET /api/v1/auth/me
  - `changePassword` - PUT /api/v1/auth/change-password

### Middleware
- ✅ **authenticate.js** - JWT verification
  - `authenticateToken` - Verify JWT và attach user vào req.user
  - `optionalAuth` - Optional authentication (không fail nếu không có token)

- ✅ **authorize.js** - Role-based access control
  - `requireRole(...roles)` - Kiểm tra role của user
  - `requireAdmin` - Shortcut cho admin only
  - `requireStudent` - Shortcut cho student only
  - `requireLecturer` - Shortcut cho lecturer only
  - `requireAdminOrLecturer` - Admin hoặc lecturer

### Routes
- ✅ **auth.routes.js** - Authentication endpoints với validation
  - POST /login - Public endpoint
  - POST /logout - Requires authentication
  - GET /me - Requires authentication
  - PUT /change-password - Requires authentication + validation

### Configuration
- ✅ **app.js** - Routes đã được enable
- ✅ Tất cả routes (admin, student, lecturer) đã có middleware protection

---

## 📋 API Endpoints

### POST /api/v1/auth/login
**Request:**
```json
{
  "email": "student@tlu.edu.vn",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "student@tlu.edu.vn",
      "role": "student",
      "first_name": "Nguyễn",
      "last_name": "Văn A",
      "profile": {
        "student_id": 1,
        "student_code": "A46644",
        "full_name": "Nguyễn Văn A",
        "gpa_cumulative": "3.25"
      }
    }
  }
}
```

### GET /api/v1/auth/me
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@tlu.edu.vn",
    "role": "student",
    "student": { ... }
  }
}
```

### PUT /api/v1/auth/change-password
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "old_password": "123456",
  "new_password": "newpass123"
}
```

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt với salt rounds = 10
2. **JWT Secret**: Lưu trong environment variable
3. **Token Expiration**: 7 days (configurable)
4. **Input Validation**: express-validator
5. **Password Requirements**: Min 6 characters
6. **Role-based Access Control**: admin, student, lecturer
7. **Error Messages**: Generic messages để tránh information disclosure

---

## 🎯 Middleware Usage

### Protect single route
```javascript
router.get('/protected', authenticateToken, controller);
```

### Protect with role
```javascript
router.get('/admin/users', authenticateToken, requireAdmin, controller);
router.get('/reports', authenticateToken, requireRole('admin', 'lecturer'), controller);
```

### Protect entire router
```javascript
router.use(authenticateToken);
router.use(requireRole('admin'));
// All routes below require admin
```

---

## 📁 Files Created/Modified

### New Files
- ✅ `services/authService.js`
- ✅ `scripts/generateHash.js`
- ✅ `database/seed.sql`
- ✅ `AUTHENTICATION.md`

### Modified Files
- ✅ `controllers/authController.js`
- ✅ `middleware/authenticate.js`
- ✅ `middleware/authorize.js`
- ✅ `routes/auth.routes.js`
- ✅ `app.js` (enabled routes)

### Already Had Middleware
- ✅ `routes/admin.routes.js`
- ✅ `routes/student.routes.js`
- ✅ `routes/lecturer.routes.js`

---

## 🧪 Testing

### 1. Generate password hash
```bash
cd backend
node scripts/generateHash.js 123456
```

### 2. Create test users
Update `database/seed.sql` với hash thật, sau đó:
```bash
mysql -u root -p student_prediction_db < database/seed.sql
```

### 3. Test login
```bash
# Using curl
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tlu.edu.vn","password":"123456"}'

# Using Postman/Thunder Client
POST http://localhost:5000/api/v1/auth/login
Body: {"email":"admin@tlu.edu.vn","password":"123456"}
```

### 4. Test protected route
```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <your-token>"
```

### 5. Test role-based access
```bash
# Admin endpoint (should work with admin token)
curl http://localhost:5000/api/v1/admin/dashboard \
  -H "Authorization: Bearer <admin-token>"

# Admin endpoint (should fail with student token)
curl http://localhost:5000/api/v1/admin/dashboard \
  -H "Authorization: Bearer <student-token>"
# Expected: 403 Forbidden
```

---

## 🚀 Next Steps

### Cần implement tiếp:
1. ⏳ Admin controllers (user management, CRUD operations)
2. ⏳ Student controllers (grades, behavior, predictions)
3. ⏳ Lecturer controllers (reports, at-risk students)
4. ⏳ Validation rules cho các endpoints khác
5. ⏳ Error handling improvements
6. ⏳ Rate limiting (prevent brute force)
7. ⏳ Refresh token mechanism (optional)
8. ⏳ Password reset functionality (optional)

### Khuyến nghị:
- Thêm rate limiting cho login endpoint
- Implement refresh token để tăng security
- Add password reset via email
- Log failed login attempts
- Add account lockout after X failed attempts
- Implement 2FA (optional)

---

## 📚 Documentation

Chi tiết đầy đủ xem file `AUTHENTICATION.md`

---

## ✅ Status: COMPLETE

Hệ thống authentication đã hoàn chỉnh và sẵn sàng sử dụng!
