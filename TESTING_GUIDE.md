# Testing Guide - Grade Management System

## Bước 1: Chuẩn bị môi trường

### 1.1. Tạo database và chạy schema
```bash
mysql -u root -p
CREATE DATABASE student_prediction_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_prediction_db;
source database/schema.sql
```

### 1.2. Generate password hash
```bash
cd backend
node scripts/generateHash.js 123456
```

Copy hash output để dùng trong seed data.

---

## Bước 2: Tạo test data

### 2.1. Insert test data vào database

```sql
USE student_prediction_db;

-- 1. Admin user (password: 123456)
INSERT INTO users (email, password, role, first_name, last_name) VALUES
('admin@tlu.edu.vn', '$2a$10$YourHashHere', 'admin', 'Admin', 'System');

-- 2. Department
INSERT INTO departments (code, name) VALUES
('CNTT', 'Khoa Công nghệ thông tin');

-- 3. Student user (password: 123456)
INSERT INTO users (email, password, role, first_name, last_name) VALUES
('student1@tlu.edu.vn', '$2a$10$YourHashHere', 'student', 'Nguyễn', 'Văn A');

-- 4. Student profile
INSERT INTO students (user_id, student_code, full_name, major, course_year, total_credits, gpa_cumulative) VALUES
(2, 'A46644', 'Nguyễn Văn A', 'Công nghệ thông tin', 2022, 0, 0.00);

-- 5. Current semester
INSERT INTO semesters (name, academic_year, start_date, end_date, is_current) VALUES
('HK1 2024-2025', '2024-2025', '2024-09-01', '2025-01-15', 1);

-- 6. Courses
INSERT INTO courses (course_code, course_name, credits, course_type, department_id) VALUES
('CTDLGT', 'Cấu trúc dữ liệu và giải thuật', 3, 'required', 1),
('HQTCSDL', 'Hệ quản trị cơ sở dữ liệu', 3, 'required', 1),
('LTWNC', 'Lập trình web nâng cao', 3, 'required', 1),
('TTNT', 'Trí tuệ nhân tạo', 3, 'elective', 1);
```

---

## Bước 3: Start server

```bash
cd backend

# Copy .env
cp .env.example .env

# Edit .env với database credentials
# DB_HOST=103.149.170.20
# DB_NAME=db_A46644
# DB_USER=A46644
# DB_PASSWORD=A46644@thanglong

# Install dependencies (nếu chưa)
npm install

# Start server
npm run dev
```

**Expected output:**
```
✓ Database connected successfully
✓ Database models synchronized
✓ Server is running on port 5000
✓ Environment: development
✓ API available at http://localhost:5000/api/v1
```

---

## Bước 4: Test Authentication

### 4.1. Login as Admin

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tlu.edu.vn",
    "password": "123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@tlu.edu.vn",
      "role": "admin",
      "first_name": "Admin",
      "last_name": "System"
    }
  },
  "message": "Đăng nhập thành công"
}
```

**Save the token** để dùng cho các requests tiếp theo.

---

## Bước 5: Test UC09 - Nhập điểm học phần

### 5.1. Nhập điểm môn CTDLGT

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/admin/grades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "student_id": 1,
    "course_id": 1,
    "semester_id": 1,
    "middle_exam_score": 7.0,
    "final_score": 8.0
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": 1,
    "course_id": 1,
    "semester_id": 1,
    "middle_exam_score": 7.0,
    "final_score": 8.0,
    "total_score": 7.7,
    "student": {
      "student_code": "A46644",
      "full_name": "Nguyễn Văn A",
      "gpa_cumulative": 7.7
    },
    "course": {
      "course_code": "CTDLGT",
      "course_name": "Cấu trúc dữ liệu và giải thuật",
      "credits": 3
    }
  },
  "message": "Nhập điểm thành công. GPA tích lũy đã được cập nhật."
}
```

**Verify calculation:**
- total_score = 0.3 × 7.0 + 0.7 × 8.0 = 2.1 + 5.6 = **7.7** ✓
- GPA = (7.7 × 3) / 3 = **7.7** ✓

### 5.2. Nhập điểm môn HQTCSDL

```bash
curl -X POST http://localhost:5000/api/v1/admin/grades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "student_id": 1,
    "course_id": 2,
    "semester_id": 1,
    "middle_exam_score": 6.0,
    "final_score": 7.0
  }'
```

**Expected:**
- total_score = 0.3 × 6.0 + 0.7 × 7.0 = 1.8 + 4.9 = **6.7** ✓
- GPA = (7.7×3 + 6.7×3) / 6 = 43.2 / 6 = **7.2** ✓

### 5.3. Nhập điểm môn LTWNC

```bash
curl -X POST http://localhost:5000/api/v1/admin/grades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "student_id": 1,
    "course_id": 3,
    "semester_id": 1,
    "middle_exam_score": 8.0,
    "final_score": 9.0
  }'
```

**Expected:**
- total_score = 0.3 × 8.0 + 0.7 × 9.0 = 2.4 + 6.3 = **8.7** ✓
- GPA = (7.7×3 + 6.7×3 + 8.7×3) / 9 = 69.3 / 9 = **7.7** ✓

---

## Bước 6: Test UC10 - Cập nhật bảng điểm

### 6.1. Cập nhật điểm môn CTDLGT (không có lý do - should fail)

```bash
curl -X PUT http://localhost:5000/api/v1/admin/grades/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "middle_exam_score": 7.5,
    "final_score": 8.5
  }'
```

**Expected Response (Error):**
```json
{
  "success": false,
  "message": "Vui lòng nhập lý do chỉnh sửa điểm"
}
```

### 6.2. Cập nhật điểm với lý do (should succeed)

```bash
curl -X PUT http://localhost:5000/api/v1/admin/grades/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "middle_exam_score": 7.5,
    "final_score": 8.5,
    "updated_reason": "Chỉnh sửa điểm sau phúc khảo"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "middle_exam_score": 7.5,
    "final_score": 8.5,
    "total_score": 8.2,
    "updated_by": 1,
    "updated_reason": "Chỉnh sửa điểm sau phúc khảo"
  },
  "message": "Cập nhật điểm thành công. GPA tích lũy đã được tính lại."
}
```

**Verify calculation:**
- New total_score = 0.3 × 7.5 + 0.7 × 8.5 = 2.25 + 5.95 = **8.2** ✓
- New GPA = (8.2×3 + 6.7×3 + 8.7×3) / 9 = 70.8 / 9 = **7.87** ✓

### 6.3. Xem lịch sử chỉnh sửa (Audit Log)

```bash
curl -X GET http://localhost:5000/api/v1/admin/grades/audit-log/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "grade_id": 1,
      "changed_by": 1,
      "old_values": {
        "middle_exam_score": 7.0,
        "final_score": 8.0,
        "total_score": 7.7
      },
      "new_values": {
        "middle_exam_score": 7.5,
        "final_score": 8.5,
        "total_score": 8.2
      },
      "reason": "Chỉnh sửa điểm sau phúc khảo",
      "changed_at": "2024-01-15T10:30:00.000Z",
      "changedBy": {
        "id": 1,
        "email": "admin@tlu.edu.vn",
        "first_name": "Admin",
        "last_name": "System"
      }
    }
  ]
}
```

---

## Bước 7: Test Validation

### 7.1. Điểm ngoài khoảng [0-10] (should fail)

```bash
curl -X POST http://localhost:5000/api/v1/admin/grades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "student_id": 1,
    "course_id": 4,
    "semester_id": 1,
    "middle_exam_score": 11.0,
    "final_score": 8.0
  }'
```

**Expected Response (Error):**
```json
{
  "success": false,
  "errors": [
    {
      "field": "middle_exam_score",
      "message": "Điểm giữa kỳ phải từ 0-10"
    }
  ]
}
```

### 7.2. Duplicate grade (should fail)

```bash
curl -X POST http://localhost:5000/api/v1/admin/grades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "student_id": 1,
    "course_id": 1,
    "semester_id": 1,
    "middle_exam_score": 8.0,
    "final_score": 9.0
  }'
```

**Expected Response (Error):**
```json
{
  "success": false,
  "message": "Điểm môn học này đã tồn tại"
}
```

---

## Bước 8: Test Query & Filters

### 8.1. Lấy tất cả điểm của sinh viên

```bash
curl -X GET "http://localhost:5000/api/v1/admin/grades?student_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8.2. Lấy điểm theo học kỳ

```bash
curl -X GET "http://localhost:5000/api/v1/admin/grades?semester_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8.3. Lấy điểm của sinh viên theo endpoint riêng

```bash
curl -X GET http://localhost:5000/api/v1/admin/grades/student/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Bước 9: Verify GPA trong database

```sql
USE student_prediction_db;

-- Check student GPA
SELECT
  s.student_code,
  s.full_name,
  s.gpa_cumulative,
  s.total_credits
FROM students s
WHERE s.id = 1;

-- Check all grades
SELECT
  g.id,
  c.course_code,
  c.course_name,
  c.credits,
  g.middle_exam_score,
  g.final_score,
  g.total_score
FROM grades g
JOIN courses c ON g.course_id = c.id
WHERE g.student_id = 1;

-- Manual GPA calculation
SELECT
  SUM(g.total_score * c.credits) / SUM(c.credits) as calculated_gpa
FROM grades g
JOIN courses c ON g.course_id = c.id
WHERE g.student_id = 1 AND g.is_improvement = 0;
```

---

## Bước 10: Test Authorization

### 10.1. Access without token (should fail)

```bash
curl -X GET http://localhost:5000/api/v1/admin/grades
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Token không được cung cấp"
}
```

### 10.2. Access with student token (should fail)

Login as student first, then try to access admin endpoint:

```bash
# Login as student
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@tlu.edu.vn",
    "password": "123456"
  }'

# Try to access admin endpoint with student token
curl -X GET http://localhost:5000/api/v1/admin/grades \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE"
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập tài nguyên này"
}
```

---

## Test Checklist

### UC09 - Nhập điểm
- [ ] Nhập điểm thành công với GK và CK
- [ ] total_score được tính đúng theo công thức 0.3*GK + 0.7*CK
- [ ] GPA tích lũy được cập nhật tự động
- [ ] Validate điểm trong khoảng [0-10]
- [ ] Không cho phép duplicate grade
- [ ] Validate student, course, semester tồn tại

### UC10 - Cập nhật điểm
- [ ] Cập nhật điểm thành công với lý do
- [ ] Không cho phép cập nhật không có lý do
- [ ] Audit log được ghi đúng (old values, new values, user, reason)
- [ ] total_score được tính lại đúng
- [ ] GPA tích lũy được tính lại đúng
- [ ] Lấy lịch sử chỉnh sửa thành công

### Authorization
- [ ] Không cho phép access không có token
- [ ] Không cho phép student access admin endpoints
- [ ] Admin có thể access tất cả endpoints

### GPA Calculation
- [ ] GPA = Σ(total_score × credits) / Σ(credits)
- [ ] GPA được làm tròn 2 chữ số thập phân
- [ ] total_credits được cập nhật đúng

---

## Expected Results Summary

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Nhập điểm CTDLGT | GK=7.0, CK=8.0 | total=7.7, GPA=7.7 |
| Nhập điểm HQTCSDL | GK=6.0, CK=7.0 | total=6.7, GPA=7.2 |
| Nhập điểm LTWNC | GK=8.0, CK=9.0 | total=8.7, GPA=7.7 |
| Update CTDLGT | GK=7.5, CK=8.5 | total=8.2, GPA=7.87 |
| Điểm > 10 | GK=11.0 | Validation error |
| Duplicate grade | Same student+course+semester | Error |
| No reason | Update without reason | Error |
| No token | Access admin endpoint | 401 Unauthorized |
| Student token | Access admin endpoint | 403 Forbidden |

---

## Troubleshooting

### Server không start
```bash
# Check database connection
mysql -u A46644 -p -h 103.149.170.20 db_A46644

# Check .env file
cat .env

# Check logs
npm run dev
```

### GPA không đúng
```sql
-- Check grades
SELECT * FROM grades WHERE student_id = 1;

-- Check student
SELECT * FROM students WHERE id = 1;

-- Manual calculation
SELECT
  SUM(g.total_score * c.credits) as total_weighted,
  SUM(c.credits) as total_credits,
  SUM(g.total_score * c.credits) / SUM(c.credits) as gpa
FROM grades g
JOIN courses c ON g.course_id = c.id
WHERE g.student_id = 1;
```

### Token expired
```bash
# Login again to get new token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tlu.edu.vn","password":"123456"}'
```

---

## Next Steps

Sau khi test thành công:
1. Test với nhiều sinh viên khác nhau
2. Test với nhiều học kỳ
3. Test delete grade và verify GPA được cập nhật
4. Test học cải thiện (is_improvement = 1)
5. Test export grades (sẽ implement sau)
