# API_ENDPOINTS.md — Danh sách REST API

## Base URL: `/api/v1`
## Auth: Bearer JWT token trong header `Authorization`

---

## 🔐 Authentication

| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| POST | `/auth/login` | Public | Đăng nhập, trả về JWT token |
| POST | `/auth/logout` | Any | Đăng xuất |
| PUT | `/auth/change-password` | Any | Đổi mật khẩu |

**POST /auth/login — Request:**
```json
{ "email": "sv@tlu.edu.vn", "password": "123456" }
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { "id": 1, "role": "student", "email": "..." }
  }
}
```

---

## 👤 User Management (Admin only)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/users` | Danh sách tất cả users (có filter, paginate) |
| POST | `/admin/users` | Tạo tài khoản mới |
| PUT | `/admin/users/:id` | Cập nhật thông tin |
| PUT | `/admin/users/:id/toggle` | Vô hiệu hóa / kích hoạt tài khoản |
| DELETE | `/admin/users/:id` | Xóa tài khoản |
| PUT | `/admin/users/:id/role` | Thay đổi vai trò |

---

## 📚 Catalog Management (Admin only)

### Sinh viên
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/students` | Danh sách sinh viên (filter: department, year) |
| POST | `/admin/students` | Thêm sinh viên mới |
| PUT | `/admin/students/:id` | Cập nhật thông tin |
| DELETE | `/admin/students/:id` | Xóa sinh viên |
### Giảng viên
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/lecturers` | Danh sách giảng viên (filter: department, degree) |
| POST | `/admin/lecturers` | Thêm giảng viên mới |
| PUT | `/admin/lecturers/:id` | Cập nhật thông tin |
| DELETE | `/admin/lecturers/:id` | Xóa giảng viên |
### Học phần
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/courses` | Danh sách học phần |
| POST | `/admin/courses` | Thêm học phần |
| PUT | `/admin/courses/:id` | Cập nhật |
| DELETE | `/admin/courses/:id` | Xóa |

### Học kỳ
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/semesters` | Danh sách học kỳ |
| GET | `/semesters/current` | Học kỳ hiện hành |
| POST | `/admin/semesters` | Tạo học kỳ mới |
| PUT | `/admin/semesters/:id` | Cập nhật |
| PUT | `/admin/semesters/:id/set-current` | Đặt làm học kỳ hiện hành |

---

## 📊 Grade Management (Admin only)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/grades` | Danh sách điểm (filter: student, course, semester) |
| POST | `/admin/grades` | Nhập điểm học phần |
| PUT | `/admin/grades/:id` | Cập nhật điểm + ghi log |
| GET | `/admin/grades/audit-log/:gradeId` | Lịch sử chỉnh sửa điểm |
| GET | `/admin/grades/export` | Xuất Excel/PDF (`?format=excel&semester_id=1`) |

## 
**POST /admin/grades — Request:**
```json
{
  "student_id": 1,
  "course_id": 5,
  "semester_id": 2,
  "midterm_score": 7.0,
  "final_score": 6.5
}
```
*Backend tự tính: total_score =  0.3×7.0 + 0.7×6.5 = 6.65

---

## 🎓 Student Features

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/student/profile` | Xem hồ sơ bản thân + GPA tích lũy |
| GET | `/student/grades` | Bảng điểm toàn khóa |
| GET | `/student/grades/semester/:id` | Điểm theo học kỳ |

### Nhập hành vi
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/student/behavior/current` | Xem chỉ số hành vi học kỳ hiện tại |
| POST | `/student/behavior` | Tạo/cập nhật chỉ số hành vi |

**POST /student/behavior — Request:**
```json
{
  "semester_id": 3,
  "study_hours_per_day": 5.0,
  "sleep_hours_per_day": 7.5,
  "class_attendance": 85.0,
  "social_media_hours": 2.0,
  "screen_time_hours": 3.0,
  "middle_exam_score": 6,
  "assignment_score": 6.7
}
```

### Mục tiêu GPA
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/student/target` | Xem mục tiêu GPA hiện tại |
| POST | `/student/target` | Đặt mục tiêu GPA |

### Dự báo & Tối ưu
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/student/predict` | Chạy dự báo GPA + phân loại nguy cơ |
| GET | `/student/predict/history` | Lịch sử dự báo |
| GET | `/student/improvement` | Danh sách môn có thể học cải thiện + gợi ý ưu tiên |
| POST | `/student/goal-seek` | Tính điểm cần đạt để đạt GPA mục tiêu |

**POST /student/predict — Response:**
```json
{
  "success": true,
  "data": {
    "predicted_gpa": 2.85,
    "risk_label": "warning",
    "risk_score": 0.6234,
    "risk_color": "yellow",
    "key_factors": [
      { "factor": "mental_stress_level", "impact": "high", "value": 8 },
      { "factor": "study_hours_per_day", "impact": "medium", "value": 3.0 }
    ]
  }
}
```

**POST /student/goal-seek — Request:**
```json
{
  "target_gpa": 3.2,
  "courses_to_improve": [1, 5]
}
```

---

## 👨‍🏫 Lecturer Features

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/lecturer/students/at-risk` | Danh sách sinh viên nguy cơ (filter: semester, threshold) |
| GET | `/lecturer/students/:id/detail` | Chi tiết hồ sơ học tập 1 sinh viên |
| GET | `/lecturer/report/improvement` | Báo cáo hiệu quả cải thiện GPA |
| GET | `/lecturer/report/export` | Xuất báo cáo Excel/PDF |

---

## 🔧 Admin System

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/admin/backup` | Tạo bản sao lưu CSDL |
| GET | `/admin/backup/list` | Danh sách file sao lưu |
| GET | `/admin/backup/download/:filename` | Tải xuống file `.sql` |
| DELETE | `/admin/backup/:filename` | Xóa file sao lưu |
| POST | `/admin/restore` | Khôi phục từ file sao lưu (body: `{ filename }`) |
| GET | `/admin/dashboard` | Thống kê tổng quan hệ thống |

**POST /admin/backup — Response:**
```json
{
  "filename":    "backup_2025-01-15_10-30-00.sql",
  "file_size":   204800,        // bytes
  "backup_type": "full",        // full | incremental
  "status":      "success",     // success | failed
  "created_by":  1,             // user_id của admin
  "created_at":  "2025-01-15T10:30:00Z"
}
```
**POST /admin/restore — Request:**
```json
{ "filename": "backup_2025-01-15_10-30-00.sql" }
```
---

## Response Format chuẩn

```json
// Success
{ "success": true, "data": { ... }, "message": "OK" }

// Error
{ "success": false, "error": "VALIDATION_ERROR", "message": "Email không hợp lệ" }

// Paginated list
{
  "success": true,
  "data": { "items": [...], "total": 100, "page": 1, "limit": 20 }
}
```

## HTTP Status Codes
- `200` OK
- `201` Created
- `400` Bad Request (validation error)
- `401` Unauthorized (no/invalid token)
- `403` Forbidden (wrong role)
- `404` Not Found
- `500` Internal Server Error
