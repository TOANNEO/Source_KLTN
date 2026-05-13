# ✅ Admin Grade Management - Hoàn thành

## Tổng kết

Đã implement đầy đủ chức năng Admin - Quản lý điểm (UC09, UC10) theo công thức TLU với audit log và tự động tính GPA.

---

## ✅ Services đã tạo

### gradeService.js

**Helper Functions:**
- `calculateTotalScore(middleExamScore, finalScore)` - **UC09: Tính điểm tổng kết theo công thức TLU**
  ```javascript
  total_score = 0.3 × GK + 0.7 × CK
  ```

- `calculateCumulativeGPA(studentId)` - **Tính GPA tích lũy theo công thức TLU**
  ```javascript
  GPA = Σ(total_score_i × credits_i) / Σ(credits_i)
  ```

- `updateStudentGPA(studentId)` - Cập nhật GPA và tổng tín chỉ của sinh viên

**CRUD Operations:**
- `getAllGrades(filters)` - Lấy tất cả điểm (filter: student, course, semester, is_improvement)
- `getGradeById(id)` - Lấy điểm theo ID với đầy đủ relations
- `createGrade(data)` - **UC09: Nhập điểm học phần**
  - Validate student, course, semester tồn tại
  - Check duplicate grade
  - Tự động tính `total_score` theo công thức TLU
  - Tự động cập nhật GPA tích lũy của sinh viên

- `updateGrade(id, data, updatedBy)` - **UC10: Cập nhật bảng điểm**
  - Bắt buộc nhập `updated_reason`
  - Lưu old values vào audit log
  - Tính lại `total_score` nếu GK hoặc CK thay đổi
  - Ghi audit log với user_id người sửa
  - Tính lại GPA tích lũy của sinh viên

- `deleteGrade(id)` - Xóa điểm và cập nhật lại GPA
- `getGradeAuditLog(gradeId)` - **UC10: Lấy lịch sử chỉnh sửa điểm**

---

## ✅ Controllers đã tạo

### gradeController.js

**Endpoints:**
- `getGrades` - GET /api/v1/admin/grades (with filters)
- `getGradeById` - GET /api/v1/admin/grades/:id
- `getStudentGrades` - GET /api/v1/admin/grades/student/:studentId
- `getGradeAuditLog` - GET /api/v1/admin/grades/audit-log/:gradeId
- `createGrade` - POST /api/v1/admin/grades (UC09)
- `updateGrade` - PUT /api/v1/admin/grades/:id (UC10)
- `deleteGrade` - DELETE /api/v1/admin/grades/:id

---

## ✅ Routes đã tạo

### admin.routes.js - Grade Management

```
GET    /api/v1/admin/grades
       Query params: student_id, course_id, semester_id, is_improvement

GET    /api/v1/admin/grades/:id

GET    /api/v1/admin/grades/student/:studentId

GET    /api/v1/admin/grades/audit-log/:gradeId

POST   /api/v1/admin/grades

PUT    /api/v1/admin/grades/:id

DELETE /api/v1/admin/grades/:id
```

---

## 🎯 Business Logic Implemented

### UC09 - Nhập điểm học phần

✅ **2 cột nhập: GK (giữa kỳ), CK (cuối kỳ)**
✅ **Backend tự tính: `total = 0.3*GK + 0.7*CK`**
✅ Validate: giá trị trong [0, 10]
✅ GPA tích lũy của SV tự cập nhật sau khi lưu
✅ Check duplicate grade (student + course + semester + is_improvement)
✅ Validate student, course, semester tồn tại

### UC10 - Cập nhật bảng điểm

✅ **Phải nhập lý do khi sửa (`updated_reason` required)**
✅ **Hệ thống ghi audit log: ai sửa, lúc nào, giá trị cũ → mới**
✅ **Tính lại GPA tích lũy sau khi sửa**
✅ Lưu `updated_by` (user_id của admin)
✅ Tự động tính lại `total_score` nếu GK hoặc CK thay đổi

### Công thức TLU

**Điểm học phần (thang 10):**
```
total_score = 0.3 × middle_exam_score + 0.7 × final_score
```

**GPA tích lũy (thang 10):**
```
GPA = Σ(total_score_i × credits_i) / Σ(credits_i)
```

**Điều kiện học cải thiện:**
```
4.0 ≤ total_score ≤ 5.6
```

---

## 🔒 Security & Validation

### Input Validation (express-validator)

**Create Grade:**
- `student_id`: required integer
- `course_id`: required integer
- `semester_id`: required integer
- `attendance_score`: optional float 0-10
- `middle_exam_score`: **required** float 0-10
- `assignment_score`: optional float 0-10
- `final_score`: **required** float 0-10
- `is_improvement`: optional integer 0 or 1

**Update Grade:**
- All score fields: optional float 0-10
- `updated_reason`: **required** string (không được rỗng)

### Authorization
- Tất cả grade endpoints yêu cầu `authenticateToken` + `requireAdmin`

---

## 📋 API Examples

### UC09: Nhập điểm học phần

```bash
POST /api/v1/admin/grades
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "student_id": 1,
  "course_id": 5,
  "semester_id": 2,
  "middle_exam_score": 7.0,
  "final_score": 6.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": 1,
    "course_id": 5,
    "semester_id": 2,
    "middle_exam_score": 7.0,
    "final_score": 6.5,
    "total_score": 6.65,
    "student": {
      "student_code": "A46644",
      "full_name": "Nguyễn Văn A",
      "gpa_cumulative": 3.25
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

**Backend tự động:**
- ✅ Tính `total_score = 0.3 × 7.0 + 0.7 × 6.5 = 6.65`
- ✅ Cập nhật GPA tích lũy của sinh viên

---

### UC10: Cập nhật bảng điểm

```bash
PUT /api/v1/admin/grades/1
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "middle_exam_score": 7.5,
  "final_score": 7.0,
  "updated_reason": "Chỉnh sửa điểm sau phúc khảo"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "middle_exam_score": 7.5,
    "final_score": 7.0,
    "total_score": 7.15,
    "updated_by": 1,
    "updated_reason": "Chỉnh sửa điểm sau phúc khảo",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Cập nhật điểm thành công. GPA tích lũy đã được tính lại."
}
```

**Backend tự động:**
- ✅ Lưu old values vào `grade_audit_logs`
- ✅ Tính lại `total_score = 0.3 × 7.5 + 0.7 × 7.0 = 7.15`
- ✅ Tính lại GPA tích lũy của sinh viên

---

### Lịch sử chỉnh sửa điểm

```bash
GET /api/v1/admin/grades/audit-log/1
Authorization: Bearer <admin-token>
```

**Response:**
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
        "final_score": 6.5,
        "total_score": 6.65
      },
      "new_values": {
        "middle_exam_score": 7.5,
        "final_score": 7.0,
        "total_score": 7.15
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

## 📊 Database Updates

### Automatic GPA Calculation

Khi tạo hoặc cập nhật điểm, hệ thống tự động:

1. **Tính điểm tổng kết:**
   ```javascript
   total_score = Math.round((0.3 * GK + 0.7 * CK) * 100) / 100
   ```

2. **Tính GPA tích lũy:**
   ```javascript
   // Lấy tất cả điểm của sinh viên (is_improvement = 0)
   grades = await Grade.findAll({ where: { student_id, is_improvement: 0 } })

   // Tính GPA
   totalWeighted = Σ(grade.total_score × course.credits)
   totalCredits = Σ(course.credits)
   GPA = totalWeighted / totalCredits
   ```

3. **Cập nhật bảng students:**
   ```sql
   UPDATE students
   SET gpa_cumulative = <calculated_gpa>,
       total_credits = <calculated_credits>
   WHERE id = <student_id>
   ```

### Audit Log Structure

Bảng `grade_audit_logs`:
```sql
{
  id: 1,
  grade_id: 1,
  changed_by: 1,  -- user_id của admin
  old_values: JSON,
  new_values: JSON,
  reason: "Lý do chỉnh sửa",
  changed_at: TIMESTAMP
}
```

---

## 🧪 Testing Scenarios

### Test UC09: Nhập điểm

1. **Happy path:**
   - Nhập GK=7.0, CK=6.5
   - Expect: total_score=6.65, GPA updated

2. **Validation errors:**
   - GK > 10 → Error: "Điểm giữa kỳ phải từ 0-10"
   - Missing final_score → Error: "Điểm cuối kỳ phải từ 0-10"

3. **Duplicate grade:**
   - Nhập điểm cho môn đã có
   - Expect: Error: "Điểm môn học này đã tồn tại"

### Test UC10: Cập nhật điểm

1. **Happy path:**
   - Update GK=7.5, CK=7.0, reason="Phúc khảo"
   - Expect: total_score=7.15, audit log created, GPA updated

2. **Missing reason:**
   - Update without updated_reason
   - Expect: Error: "Vui lòng nhập lý do chỉnh sửa điểm"

3. **Audit log:**
   - Check old_values and new_values are correct
   - Check changed_by is current admin user

---

## 📁 Files Created/Modified

### New Files
- ✅ `services/gradeService.js`
- ✅ `controllers/gradeController.js`

### Modified Files
- ✅ `routes/admin.routes.js` (added grade endpoints)

---

## ✅ Status: COMPLETE

Hệ thống quản lý điểm đã hoàn chỉnh với:
- ✅ Tự động tính điểm theo công thức TLU
- ✅ Tự động cập nhật GPA tích lũy
- ✅ Audit log đầy đủ
- ✅ Validation chặt chẽ
- ✅ Sẵn sàng để test!
