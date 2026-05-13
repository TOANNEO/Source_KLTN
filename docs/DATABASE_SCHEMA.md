# DATABASE_SCHEMA.md — Thiết kế CSDL MySQL

## Tổng quan

Database: MySQL 8.x  
Charset: utf8mb4  
Tất cả bảng có `created_at`, `updated_at` (TIMESTAMP).

---

## Danh sách bảng

### 1. `users` — Tài khoản người dùng
```sql
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,           -- bcrypt hash
  role        ENUM('admin','student','lecturer') NOT NULL,
  first_name      VARCHAR(255) UNIQUE NOT NULL,
  last_name    VARCHAR(255) NOT NULL, 
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);
```

### 2. `departments` — Khoa
```sql
CREATE TABLE departments (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  code  VARCHAR(20) UNIQUE NOT NULL,         -- VD: 'CNTT'
  name  VARCHAR(255) NOT NULL
);
```

### 3. `students` — Hồ sơ sinh viên
```sql
CREATE TABLE students (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL UNIQUE,
  student_code  VARCHAR(20) UNIQUE NOT NULL,  -- Mã SV: A46644
  full_name     VARCHAR(255) NOT NULL,
  major           VARCHAR(255),
  course_year   INT NOT NULL,                 -- Khóa: 2022, 2023,...
  total_credits INT DEFAULT 0,               -- Tín chỉ đã tích lũy
  gpa_cumulative DECIMAL(4,2) DEFAULT 0.00,  -- GPA tích lũy hệ 10
  FOREIGN KEY (user_id) REFERENCES users(id),
);
```

### 4. `lecturers` — Hồ sơ giảng viên
```sql
CREATE TABLE lecturers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL UNIQUE,
  lecturer_code VARCHAR(20) UNIQUE NOT NULL,
  degree        VARCHAR(255) NOT NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

### 5. `semesters` — Học kỳ
```sql
CREATE TABLE semesters (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,            -- VD: 'HK1 2024-2025'
  academic_year VARCHAR(20) NOT NULL,          -- '2024-2025'
  start_date DATE,
  end_date   DATE,
  is_current TINYINT(1) DEFAULT 0,            -- Học kỳ đang hoạt động
  UNIQUE KEY uq_semester_name_year (name, academic_year)
);
```

### 6. `courses` — Học phần / Môn học
```sql
CREATE TABLE courses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  course_code   VARCHAR(20) UNIQUE NOT NULL,   -- 'CTDLGT', 'HQTCSDL'
  course_name   VARCHAR(255) NOT NULL,
  credits       INT NOT NULL,                  -- Số tín chỉ
  course_type   ENUM('required','elective') DEFAULT 'required',
  department_id INT,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

### 7. `grades` — Bảng điểm
```sql
CREATE TABLE grades (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  course_id       INT NOT NULL,
  semester_id     INT NOT NULL,
  attendance_score DECIMAL(4,2),              -- Điểm chuyên cần (CC) /10
  middle_exam_score   DECIMAL(4,2),               -- Điểm giữa kỳ (GK) /10
   assignment_score  DECIMAL(4,2),             -- Điểm bài tập
  final_score     DECIMAL(4,2),               -- Điểm cuối kỳ (CK) /10
  total_score     DECIMAL(4,2),               -- = 0.1*CC + 0.3*GK + 0.6*CK
  grade_4         DECIMAL(3,2),               -- Quy đổi hệ 4
  is_improvement  TINYINT(1) DEFAULT 0,       -- 1 = học cải thiện
  updated_by      INT,                         -- user_id của người sửa
  updated_reason  TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_grade (student_id, course_id, semester_id, is_improvement),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
```

### 8. `grade_audit_logs` — Lịch sử chỉnh sửa điểm
```sql
CREATE TABLE grade_audit_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  grade_id     INT NOT NULL,
  changed_by   INT NOT NULL,                   -- user_id
  old_values   JSON,
  new_values   JSON,
  reason       TEXT,
  changed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grade_id) REFERENCES grades(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);
```

### 9. `behavior_records` — Chỉ số hành vi học tập
```sql
CREATE TABLE behavior_records (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  student_id          INT NOT NULL,
  semester_id         INT NOT NULL,
  study_hours_per_day DECIMAL(4,2) NOT NULL,   -- Giờ tự học/ngày
  sleep_hours_per_day DECIMAL(4,2) NOT NULL,   -- Giờ ngủ/ngày
  class_attendance    DECIMAL(5,2) NOT NULL,   -- Tỷ lệ đi học (0-100%)
  social_media_hours  DECIMAL(4,2) DEFAULT 0, -- Giờ dùng MXH/ngày
  screen_time_hours   DECIMAL(4,2) DEFAULT 0,
  mental_stress_level INT,                     -- 1-10
  recorded_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_behavior (student_id, semester_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
```

### 10. `gpa_targets` — Mục tiêu GPA của sinh viên
```sql
CREATE TABLE gpa_targets (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  semester_id     INT NOT NULL,
  target_gpa      DECIMAL(3,2) NOT NULL,       -- Hệ 4.0
  target_type     ENUM('semester','cumulative') DEFAULT 'semester',
  UNIQUE KEY uq_target (student_id, semester_id, target_type),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
```

### 11. `prediction_history` — Lịch sử dự báo AI
```sql
CREATE TABLE prediction_history (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  student_id        INT NOT NULL,
  semester_id       INT NOT NULL,
  predicted_gpa     DECIMAL(3,2),              -- GPA dự báo hệ 4.0
  risk_label        ENUM('safe','warning','danger') NOT NULL,
  risk_score        DECIMAL(5,4),              -- Xác suất nguy cơ (0-1)
  input_snapshot    JSON,                       -- Dữ liệu đầu vào lúc dự báo
  feature_importance JSON,                     -- Nhân tố ảnh hưởng chính
  predicted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
```

### 12. `improvement_suggestions` — Gợi ý học cải thiện
```sql
CREATE TABLE improvement_suggestions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  semester_id     INT NOT NULL,
  course_id       INT NOT NULL,
  current_score   DECIMAL(4,2),               -- Điểm hiện tại (4.0-5.6)
  target_score    DECIMAL(4,2),               -- Điểm cần đạt để cải thiện
  gpa_gain        DECIMAL(4,3),               -- Mức tăng GPA dự kiến
  priority_rank   INT,                         -- Thứ tự ưu tiên (1=cao nhất)
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

### 13. `system_backups` — Log sao lưu
```sql
CREATE TABLE system_backups (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  filename    VARCHAR(255) NOT NULL,
  file_size   BIGINT,
  backup_type ENUM('full','incremental') DEFAULT 'full',
  status      ENUM('success','failed') DEFAULT 'success',
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## Quan hệ chính

```
users (1) ──── (1) students
users (1) ──── (1) lecturers
students (1) ── (N) grades
students (1) ── (N) behavior_records
students (1) ── (N) gpa_targets
students (1) ── (N) prediction_history
students (1) ── (N) improvement_suggestions
courses (1) ─── (N) grades
semesters (1) ─ (N) grades, behavior_records, gpa_targets, prediction_history
departments (1) (N) students, lecturers, courses
```

---

## Công thức tính GPA (TLU)

```
// Điểm học phần (thang 10):
total_score = 0.3 * middle_exam_score + 0.7 * final_score

// GPA tích lũy (thang 10):
gpa_cumulative = SUM(total_score_i * credits_i) / SUM(credits_i)

// Điều kiện học cải thiện:
4.0 <= total_score <= 5.6

// Đủ điều kiện thi: chuyên cần >= ngưỡng + điểm GK >= 3.0
```
