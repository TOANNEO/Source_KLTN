# Authentication System Documentation

## Tổng quan

Hệ thống authentication sử dụng JWT (JSON Web Token) để xác thực và phân quyền người dùng.

---

## Components

### 1. authService.js
Service layer xử lý logic authentication:
- `hashPassword()` - Hash password với bcrypt
- `comparePassword()` - So sánh password với hash
- `generateToken()` - Tạo JWT token
- `verifyToken()` - Verify JWT token
- `login()` - Xử lý đăng nhập
- `changePassword()` - Đổi mật khẩu
- `getUserById()` - Lấy thông tin user

### 2. authController.js
Controller xử lý HTTP requests:
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/logout` - Đăng xuất
- `GET /api/v1/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/v1/auth/change-password` - Đổi mật khẩu

### 3. authenticate.js (Middleware)
Middleware xác thực JWT token:
- `authenticateToken` - Verify JWT và attach user vào req.user
- `optionalAuth` - Optional authentication (không fail nếu không có token)

### 4. authorize.js (Middleware)
Middleware phân quyền theo role:
- `requireRole(...roles)` - Kiểm tra role của user
- `requireAdmin` - Chỉ admin
- `requireStudent` - Chỉ student
- `requireLecturer` - Chỉ lecturer
- `requireAdminOrLecturer` - Admin hoặc lecturer

---

## API Endpoints

### POST /api/v1/auth/login
Đăng nhập và nhận JWT token.

**Request:**
```json
{
  "email": "student@tlu.edu.vn",
  "password": "123456"
}
```

**Response (Success):**
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
        "major": "Công nghệ thông tin",
        "course_year": 2022,
        "gpa_cumulative": "3.25"
      }
    }
  },
  "message": "Đăng nhập thành công"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng"
}
```

---

### POST /api/v1/auth/logout
Đăng xuất (client xóa token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

### GET /api/v1/auth/me
Lấy thông tin user hiện tại.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@tlu.edu.vn",
    "role": "student",
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "student": {
      "id": 1,
      "student_code": "A46644",
      "full_name": "Nguyễn Văn A",
      "gpa_cumulative": "3.25"
    }
  }
}
```

---

### PUT /api/v1/auth/change-password
Đổi mật khẩu.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "old_password": "123456",
  "new_password": "newpass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Mật khẩu cũ không đúng"
}
```

---

## Sử dụng Middleware

### Protect routes với authentication

```javascript
const { authenticateToken } = require('../middleware/authenticate');

// Route yêu cầu authentication
router.get('/protected', authenticateToken, (req, res) => {
  // req.user chứa thông tin user: { id, email, role }
  res.json({ user: req.user });
});
```

### Protect routes với role-based authorization

```javascript
const { authenticateToken } = require('../middleware/authenticate');
const { requireRole, requireAdmin } = require('../middleware/authorize');

// Chỉ admin mới truy cập được
router.get('/admin/users', authenticateToken, requireAdmin, controller);

// Admin hoặc lecturer
router.get('/reports', authenticateToken, requireRole('admin', 'lecturer'), controller);

// Chỉ student
router.get('/student/grades', authenticateToken, requireRole('student'), controller);
```

### Apply middleware cho toàn bộ router

```javascript
const router = express.Router();

// Tất cả routes trong router này đều yêu cầu authentication và admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/users', controller.getUsers);
router.post('/users', controller.createUser);
// ... các routes khác
```

---

## JWT Token Structure

**Payload:**
```json
{
  "id": 1,
  "email": "user@tlu.edu.vn",
  "role": "student",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Expiration:** 7 days (configurable via `JWT_EXPIRES_IN` env variable)

---

## Security Features

1. **Password Hashing**: Sử dụng bcrypt với salt rounds = 10
2. **JWT Secret**: Lưu trong environment variable `JWT_SECRET`
3. **Token Expiration**: Token tự động hết hạn sau 7 ngày
4. **Input Validation**: Sử dụng express-validator
5. **Password Requirements**: Tối thiểu 6 ký tự
6. **Role-based Access Control**: Phân quyền theo role (admin, student, lecturer)

---

## Error Codes

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | Validation error | Dữ liệu đầu vào không hợp lệ |
| 401 | Token không được cung cấp | Không có token trong header |
| 401 | Token không hợp lệ hoặc đã hết hạn | Token invalid hoặc expired |
| 401 | Email hoặc mật khẩu không đúng | Login failed |
| 403 | Bạn không có quyền truy cập | Không đủ quyền (wrong role) |
| 404 | Người dùng không tồn tại | User not found |
| 500 | Internal server error | Lỗi server |

---

## Testing với Postman/Thunder Client

### 1. Login
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@tlu.edu.vn",
  "password": "admin123"
}
```

### 2. Sử dụng token
Copy token từ response và thêm vào header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Test protected route
```
GET http://localhost:5000/api/v1/auth/me
Authorization: Bearer <your-token>
```

### 4. Change password
```
PUT http://localhost:5000/api/v1/auth/change-password
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "old_password": "admin123",
  "new_password": "newpass123"
}
```

---

## Environment Variables

```env
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d
```

**⚠️ QUAN TRỌNG**: Đổi `JWT_SECRET` trong production!

---

## Next Steps

1. ✅ Authentication system hoàn thành
2. ⏳ Implement controllers cho admin, student, lecturer
3. ⏳ Thêm refresh token mechanism (optional)
4. ⏳ Implement password reset via email (optional)
5. ⏳ Add rate limiting cho login endpoint
6. ⏳ Add login attempt tracking
