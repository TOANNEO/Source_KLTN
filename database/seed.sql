-- Seed data for testing authentication
-- Run after creating tables with schema.sql

USE student_prediction_db;

-- Insert test users (password: 123456 for all)
-- Password hash for '123456': $2a$10$rKZvVqVqVqVqVqVqVqVqVuO7xKZvVqVqVqVqVqVqVqVqVqVqVqVqV
-- Note: You need to generate actual bcrypt hashes using the hashPassword function

-- Admin user
INSERT INTO users (email, password, role, first_name, last_name) VALUES
('admin@tlu.edu.vn', '$2a$10$rKZvVqVqVqVqVqVqVqVqVuO7xKZvVqVqVqVqVqVqVqVqVqVqVqVqV', 'admin', 'Admin', 'System');

-- Department
INSERT INTO departments (code, name) VALUES
('CNTT', 'Khoa Công nghệ thông tin');

-- Student users
INSERT INTO users (email, password, role, first_name, last_name) VALUES
('student1@tlu.edu.vn', '$2a$10$rKZvVqVqVqVqVqVqVqVqVuO7xKZvVqVqVqVqVqVqVqVqVqVqVqVqV', 'student', 'Nguyễn', 'Văn A'),
('student2@tlu.edu.vn', '$2a$10$rKZvVqVqVqVqVqVqVqVqVuO7xKZvVqVqVqVqVqVqVqVqVqVqVqVqV', 'student', 'Trần', 'Thị B');

-- Student profiles
INSERT INTO students (user_id, student_code, full_name, major, course_year, total_credits, gpa_cumulative) VALUES
(2, 'A46644', 'Nguyễn Văn A', 'Công nghệ thông tin', 2022, 60, 3.25),
(3, 'A46645', 'Trần Thị B', 'Công nghệ thông tin', 2022, 55, 2.85);

-- Lecturer user
INSERT INTO users (email, password, role, first_name, last_name) VALUES
('lecturer1@tlu.edu.vn', '$2a$10$rKZvVqVqVqVqVqVqVqVqVuO7xKZvVqVqVqVqVqVqVqVqVqVqVqVqV', 'lecturer', 'Phạm', 'Văn C');

-- Lecturer profile
INSERT INTO lecturers (user_id, lecturer_code, degree, department_id) VALUES
(4, 'GV001', 'Tiến sĩ', 1);

-- Current semester
INSERT INTO semesters (name, academic_year, start_date, end_date, is_current) VALUES
('HK1 2024-2025', '2024-2025', '2024-09-01', '2025-01-15', 1);

-- Sample courses
INSERT INTO courses (course_code, course_name, credits, course_type, department_id) VALUES
('CTDLGT', 'Cấu trúc dữ liệu và giải thuật', 3, 'required', 1),
('HQTCSDL', 'Hệ quản trị cơ sở dữ liệu', 3, 'required', 1),
('LTWNC', 'Lập trình web nâng cao', 3, 'required', 1);

-- Sample grades for student 1
INSERT INTO grades (student_id, course_id, semester_id, attendance_score, middle_exam_score, assignment_score, final_score, total_score, grade_4, is_improvement) VALUES
(1, 1, 1, 9.0, 7.5, 8.0, 8.0, 7.85, 3.0, 0),
(1, 2, 1, 8.5, 6.0, 7.0, 7.5, 7.15, 2.5, 0);

-- Sample behavior record for student 1
INSERT INTO behavior_records (student_id, semester_id, study_hours_per_day, sleep_hours_per_day, class_attendance, social_media_hours, screen_time_hours, mental_stress_level) VALUES
(1, 1, 5.0, 7.5, 85.0, 2.0, 3.0, 6);

-- Sample GPA target for student 1
INSERT INTO gpa_targets (student_id, semester_id, target_gpa, target_type) VALUES
(1, 1, 3.50, 'cumulative');

-- Note: Password hashes above are placeholders
-- To generate real hashes, use the hashPassword function from authService:
-- const { hashPassword } = require('./services/authService');
-- const hash = await hashPassword('123456');
