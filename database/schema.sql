-- ============================================
-- Student Academic Prediction System Database
-- MySQL 8.x
-- Charset: utf8mb4
-- ============================================

-- Drop database if exists (use with caution)
-- DROP DATABASE IF EXISTS student_prediction_db;

-- Create database
CREATE DATABASE IF NOT EXISTS student_prediction_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE student_prediction_db;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  role ENUM('admin','student','lecturer') NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: departments
-- ============================================
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL COMMENT 'e.g., CNTT',
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: students
-- ============================================
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  student_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'e.g., A46644',
  full_name VARCHAR(255) NOT NULL,
  major VARCHAR(255),
  course_year INT NOT NULL COMMENT 'e.g., 2022, 2023',
  total_credits INT DEFAULT 0 COMMENT 'Total accumulated credits',
  gpa_cumulative DECIMAL(4,2) DEFAULT 0.00 COMMENT 'Cumulative GPA (scale 10)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_code (student_code),
  INDEX idx_course_year (course_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: lecturers
-- ============================================
CREATE TABLE lecturers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  lecturer_code VARCHAR(20) UNIQUE NOT NULL,
  degree VARCHAR(255) NOT NULL COMMENT 'e.g., Thạc sĩ, Tiến sĩ',
  department_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  INDEX idx_lecturer_code (lecturer_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: semesters
-- ============================================
CREATE TABLE semesters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT 'e.g., HK1 2024-2025',
  academic_year VARCHAR(20) NOT NULL COMMENT 'e.g., 2024-2025',
  start_date DATE,
  end_date DATE,
  is_current TINYINT(1) DEFAULT 0 COMMENT 'Current active semester',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_semester_name_year (name, academic_year),
  INDEX idx_is_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: courses
-- ============================================
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'e.g., CTDLGT, HQTCSDL',
  course_name VARCHAR(255) NOT NULL,
  credits INT NOT NULL,
  department_id INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  INDEX idx_course_code (course_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: grades
-- ============================================
CREATE TABLE grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  semester_id INT NOT NULL,
  attendance_score DECIMAL(4,2) COMMENT 'Điểm chuyên cần',
  middle_exam_score DECIMAL(4,2) COMMENT 'Điểm giữa kỳ',
  final_exam_score DECIMAL(4,2) COMMENT 'Điểm cuối kỳ',
  total_score DECIMAL(4,2) COMMENT 'Điểm tổng kết = 0.3*GK + 0.7*CK',
  letter_grade VARCHAR(5) COMMENT 'A+, A, B+, etc.',
  is_passed TINYINT(1) DEFAULT 0,
  is_improvement TINYINT(1) DEFAULT 0 COMMENT 'Học cải thiện',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  UNIQUE KEY uq_student_course_semester (student_id, course_id, semester_id),
  INDEX idx_student_id (student_id),
  INDEX idx_semester_id (semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: behavior_records
-- ============================================
CREATE TABLE behavior_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  semester_id INT NOT NULL,
  study_hours_per_day DECIMAL(4,2) COMMENT 'Hours per day',
  sleep_duration DECIMAL(4,2) COMMENT 'Hours per night',
  exercise_frequency INT COMMENT 'Times per week',
  part_time_job TINYINT(1) DEFAULT 0,
  family_support_level ENUM('low','medium','high'),
  stress_level ENUM('low','medium','high'),
  health_status ENUM('poor','fair','good','excellent'),
  notes TEXT,
  recorded_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  INDEX idx_student_id (student_id),
  INDEX idx_semester_id (semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: gpa_targets
-- ============================================
CREATE TABLE gpa_targets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  semester_id INT NOT NULL,
  target_gpa DECIMAL(4,2) NOT NULL COMMENT 'Target GPA for semester',
  current_gpa DECIMAL(4,2) COMMENT 'Current GPA',
  status ENUM('pending','in_progress','achieved','not_achieved') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  INDEX idx_student_id (student_id),
  INDEX idx_semester_id (semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: prediction_history
-- ============================================
CREATE TABLE prediction_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  semester_id INT NOT NULL,
  predicted_gpa DECIMAL(4,2) NOT NULL,
  actual_gpa DECIMAL(4,2) COMMENT 'Actual GPA after semester ends',
  confidence_score DECIMAL(5,4) COMMENT 'Model confidence 0-1',
  risk_level ENUM('low','medium','high') COMMENT 'Risk of academic failure',
  input_data JSON COMMENT 'Input features used for prediction',
  predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  INDEX idx_student_id (student_id),
  INDEX idx_semester_id (semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: improvement_suggestions
-- ============================================
CREATE TABLE improvement_suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  semester_id INT NOT NULL,
  suggestion_type ENUM('study_hours','sleep','exercise','stress','course_focus') NOT NULL,
  current_value VARCHAR(100),
  suggested_value VARCHAR(100),
  priority ENUM('low','medium','high') DEFAULT 'medium',
  description TEXT,
  is_applied TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  INDEX idx_student_id (student_id),
  INDEX idx_semester_id (semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- End of schema
-- ============================================
