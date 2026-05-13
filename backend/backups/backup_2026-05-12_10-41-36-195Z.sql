-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 103.149.170.20    Database: db_A46644
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `behavior_records`
--

DROP TABLE IF EXISTS `behavior_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `behavior_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `study_hours_per_day` decimal(4,2) NOT NULL COMMENT 'Số giờ tự học mỗi ngày',
  `sleep_hours_per_day` decimal(4,2) NOT NULL COMMENT 'Số giờ ngủ mỗi ngày',
  `class_attendance` decimal(5,2) NOT NULL COMMENT 'Tỷ lệ đi học (0-100%)',
  `social_media_hours` decimal(4,2) DEFAULT '0.00' COMMENT 'Số giờ dùng mạng xã hội mỗi ngày',
  `screen_time_hours` decimal(4,2) DEFAULT '0.00' COMMENT 'Tổng thời gian sử dụng màn hình',
  `mental_stress_level` int DEFAULT NULL COMMENT 'Mức độ căng thẳng (1-10)',
  `recorded_at` datetime DEFAULT NULL COMMENT 'Thời điểm ghi nhận',
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_behavior` (`student_id`,`semester_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `behavior_records_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `behavior_records_ibfk_4` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `behavior_records`
--

LOCK TABLES `behavior_records` WRITE;
/*!40000 ALTER TABLE `behavior_records` DISABLE KEYS */;
INSERT INTO `behavior_records` VALUES (1,1,1,6.50,8.00,90.00,1.50,3.50,5,'2026-05-09 03:29:01','2026-05-09 03:29:01');
/*!40000 ALTER TABLE `behavior_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã môn học, VD: CTDLGT, HQTCSDL',
  `course_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên môn học',
  `credits` int NOT NULL COMMENT 'Số tín chỉ',
  `course_type` enum('required','elective') COLLATE utf8mb4_unicode_ci DEFAULT 'required' COMMENT 'Bắt buộc hoặc tự chọn',
  `department_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  UNIQUE KEY `course_code_2` (`course_code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'IT101','Lập trình căn bản',3,'required',1,'2026-05-09 03:18:15','2026-05-09 03:18:15'),(2,'IT102','Cấu trúc dữ liệu',4,'required',1,'2026-05-09 03:18:16','2026-05-09 03:18:16'),(3,'IT103','Cơ sở dữ liệu',3,'required',1,'2026-05-09 03:18:16','2026-05-09 03:18:16'),(9,'IT105','CSDL',1,'required',1,'2026-05-11 16:06:21','2026-05-11 16:06:21');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa, VD: CNTT',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên khoa',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'CNTT','Khoa Công nghệ Thông tin','2026-05-09 03:17:37','2026-05-09 03:17:37');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gpa_targets`
--

DROP TABLE IF EXISTS `gpa_targets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gpa_targets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `target_gpa` decimal(3,2) NOT NULL COMMENT 'GPA mục tiêu (hệ 4.0)',
  `target_type` enum('semester','cumulative') COLLATE utf8mb4_unicode_ci DEFAULT 'semester' COMMENT 'Loại mục tiêu: học kỳ hoặc tích lũy',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_target` (`student_id`,`semester_id`,`target_type`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `gpa_targets_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gpa_targets_ibfk_4` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gpa_targets`
--

LOCK TABLES `gpa_targets` WRITE;
/*!40000 ALTER TABLE `gpa_targets` DISABLE KEYS */;
/*!40000 ALTER TABLE `gpa_targets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grade_audit_logs`
--

DROP TABLE IF EXISTS `grade_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grade_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grade_id` int NOT NULL,
  `changed_by` int NOT NULL COMMENT 'user_id của người thay đổi',
  `old_values` json DEFAULT NULL COMMENT 'Giá trị cũ trước khi thay đổi',
  `new_values` json DEFAULT NULL COMMENT 'Giá trị mới sau khi thay đổi',
  `reason` text COLLATE utf8mb4_unicode_ci COMMENT 'Lý do thay đổi',
  `changed_at` datetime DEFAULT NULL COMMENT 'Thời điểm thay đổi',
  PRIMARY KEY (`id`),
  KEY `grade_id` (`grade_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `grade_audit_logs_ibfk_3` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grade_audit_logs_ibfk_4` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade_audit_logs`
--

LOCK TABLES `grade_audit_logs` WRITE;
/*!40000 ALTER TABLE `grade_audit_logs` DISABLE KEYS */;
INSERT INTO `grade_audit_logs` VALUES (1,4,2,'{\"final_score\": \"10.00\", \"total_score\": \"10.00\", \"assignment_score\": \"10.00\", \"attendance_score\": \"8.00\", \"middle_exam_score\": \"6.50\"}','{\"final_score\": 10, \"total_score\": 8.95, \"assignment_score\": 10, \"attendance_score\": 8, \"middle_exam_score\": 6.5}','Thích','2026-05-12 03:44:20');
/*!40000 ALTER TABLE `grade_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `attendance_score` decimal(4,2) DEFAULT NULL COMMENT 'Điểm chuyên cần (CC) /10',
  `middle_exam_score` decimal(4,2) DEFAULT NULL COMMENT 'Điểm giữa kỳ (GK) /10',
  `assignment_score` decimal(4,2) DEFAULT NULL COMMENT 'Điểm bài tập',
  `final_score` decimal(4,2) DEFAULT NULL COMMENT 'Điểm cuối kỳ (CK) /10',
  `total_score` decimal(4,2) DEFAULT NULL COMMENT 'Điểm tổng kết = 0.1*CC + 0.3*GK + 0.6*CK',
  `grade_4` decimal(3,2) DEFAULT NULL COMMENT 'Điểm quy đổi hệ 4',
  `is_improvement` tinyint DEFAULT '0' COMMENT '1 = học cải thiện',
  `updated_by` int DEFAULT NULL COMMENT 'user_id của người sửa điểm',
  `updated_reason` text COLLATE utf8mb4_unicode_ci COMMENT 'Lý do chỉnh sửa điểm',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_grade` (`student_id`,`course_id`,`semester_id`,`is_improvement`),
  KEY `course_id` (`course_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `grades_ibfk_4` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grades_ibfk_5` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grades_ibfk_6` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (1,1,1,2,8.00,6.50,10.00,8.00,7.70,NULL,0,NULL,NULL,'2026-05-09 03:18:17','2026-05-09 03:18:17'),(2,1,2,2,7.00,7.50,8.00,7.50,7.20,NULL,0,NULL,NULL,'2026-05-09 03:18:18','2026-05-09 03:18:18'),(3,1,3,2,10.00,9.50,10.00,8.50,8.35,NULL,0,NULL,NULL,'2026-05-09 03:18:18','2026-05-09 03:18:18'),(4,1,1,1,8.00,6.50,10.00,10.00,8.95,NULL,0,2,'Thích','2026-05-12 03:05:00','2026-05-12 03:44:20');
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `improvement_suggestions`
--

DROP TABLE IF EXISTS `improvement_suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `improvement_suggestions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `course_id` int NOT NULL,
  `current_score` decimal(4,2) DEFAULT NULL COMMENT 'Điểm hiện tại (4.0-5.6)',
  `target_score` decimal(4,2) DEFAULT NULL COMMENT 'Điểm cần đạt để cải thiện',
  `gpa_gain` decimal(4,3) DEFAULT NULL COMMENT 'Mức tăng GPA dự kiến',
  `priority_rank` int DEFAULT NULL COMMENT 'Thứ tự ưu tiên (1=cao nhất)',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `semester_id` (`semester_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `improvement_suggestions_ibfk_4` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `improvement_suggestions_ibfk_5` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `improvement_suggestions_ibfk_6` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `improvement_suggestions`
--

LOCK TABLES `improvement_suggestions` WRITE;
/*!40000 ALTER TABLE `improvement_suggestions` DISABLE KEYS */;
/*!40000 ALTER TABLE `improvement_suggestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lecturers`
--

DROP TABLE IF EXISTS `lecturers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecturers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `lecturer_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã giảng viên',
  `degree` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Học vị: Thạc sĩ, Tiến sĩ, etc.',
  `department_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `lecturer_code` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_2` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_3` (`lecturer_code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `lecturers_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lecturers_ibfk_4` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecturers`
--

LOCK TABLES `lecturers` WRITE;
/*!40000 ALTER TABLE `lecturers` DISABLE KEYS */;
INSERT INTO `lecturers` VALUES (1,3,'GV001','Tiến sĩ',1,'2026-05-09 09:35:47','2026-05-09 09:35:47'),(2,14,'100072','Thạc sĩ',1,'2026-05-11 08:52:39','2026-05-11 08:53:09');
/*!40000 ALTER TABLE `lecturers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prediction_history`
--

DROP TABLE IF EXISTS `prediction_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prediction_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `predicted_gpa` decimal(4,2) DEFAULT NULL COMMENT 'GPA dự báo hệ 10 (hiển thị cho user)',
  `risk_label` enum('safe','warning','danger') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mức độ nguy cơ học tập',
  `risk_score` decimal(5,4) DEFAULT NULL COMMENT 'Xác suất nguy cơ (0-1)',
  `input_snapshot` json DEFAULT NULL COMMENT 'Dữ liệu đầu vào lúc dự báo',
  `feature_importance` json DEFAULT NULL COMMENT 'Các nhân tố ảnh hưởng chính',
  `predicted_at` datetime DEFAULT NULL COMMENT 'Thời điểm dự báo',
  `predicted_gpa4` decimal(3,2) DEFAULT NULL COMMENT 'GPA dự báo hệ 4.0 (raw từ model)',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `prediction_history_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prediction_history_ibfk_4` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prediction_history`
--

LOCK TABLES `prediction_history` WRITE;
/*!40000 ALTER TABLE `prediction_history` DISABLE KEYS */;
INSERT INTO `prediction_history` VALUES (1,1,1,5.15,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.50\\\",\\\"sleep_hours_per_day\\\":\\\"8.00\\\",\\\"class_attendance\\\":\\\"90.00\\\",\\\"social_media_hours\\\":\\\"1.50\\\",\\\"screen_time_hours\\\":\\\"3.50\\\",\\\"mental_stress_level\\\":5,\\\"recorded_at\\\":\\\"2026-05-09T03:29:01.000Z\\\",\\\"updated_at\\\":\\\"2026-05-09T03:29:01.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":null,\\\"assignment_score\\\":null}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-09 03:53:53',NULL),(2,1,1,5.15,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.50\\\",\\\"sleep_hours_per_day\\\":\\\"8.00\\\",\\\"class_attendance\\\":\\\"90.00\\\",\\\"social_media_hours\\\":\\\"1.50\\\",\\\"screen_time_hours\\\":\\\"3.50\\\",\\\"mental_stress_level\\\":5,\\\"recorded_at\\\":\\\"2026-05-09T03:29:01.000Z\\\",\\\"updated_at\\\":\\\"2026-05-09T03:29:01.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":null,\\\"assignment_score\\\":null}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-09 03:55:43',1.79);
/*!40000 ALTER TABLE `prediction_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semesters`
--

DROP TABLE IF EXISTS `semesters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semesters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên học kỳ, VD: HK1 2024-2025',
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Năm học, VD: 2024-2025',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint DEFAULT '0' COMMENT '1 = học kỳ đang hoạt động',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_semester_name_year` (`name`,`academic_year`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semesters`
--

LOCK TABLES `semesters` WRITE;
/*!40000 ALTER TABLE `semesters` DISABLE KEYS */;
INSERT INTO `semesters` VALUES (1,'HK1 2024-2025','2024-2025','2024-09-01','2025-01-15',1,'2026-05-09 03:17:37','2026-05-11 16:07:14'),(2,'HK2 2023-2024','2023-2024','2024-02-01','2024-06-30',0,'2026-05-09 03:17:37','2026-05-11 16:07:14'),(3,'Học kì 2','2024-2025','2023-10-14','2025-05-09',0,'2026-05-11 16:11:33','2026-05-11 16:13:48');
/*!40000 ALTER TABLE `semesters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `student_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên, VD: A46644',
  `major` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Chuyên ngành',
  `course_year` int NOT NULL COMMENT 'Khóa học, VD: 2022, 2023',
  `total_credits` int DEFAULT '0' COMMENT 'Tổng tín chỉ đã tích lũy',
  `gpa_cumulative` decimal(4,2) DEFAULT '0.00' COMMENT 'GPA tích lũy hệ 10',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `class_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `student_code` (`student_code`),
  UNIQUE KEY `student_code_2` (`student_code`),
  UNIQUE KEY `student_code_3` (`student_code`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,1,'A46644','Công nghệ Thông tin',2023,13,8.23,'2026-05-09 03:18:17','2026-05-12 03:44:21','TT35CL07');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_backups`
--

DROP TABLE IF EXISTS `system_backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_backups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên file backup',
  `file_size` bigint DEFAULT NULL COMMENT 'Kích thước file (bytes)',
  `backup_type` enum('full','incremental') COLLATE utf8mb4_unicode_ci DEFAULT 'full' COMMENT 'Loại backup',
  `status` enum('success','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'success' COMMENT 'Trạng thái backup',
  `created_by` int DEFAULT NULL COMMENT 'user_id người tạo backup',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `system_backups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_backups`
--

LOCK TABLES `system_backups` WRITE;
/*!40000 ALTER TABLE `system_backups` DISABLE KEYS */;
INSERT INTO `system_backups` VALUES (1,'backup_2026-05-12_10-18-50-733Z.sql',0,'full','failed',2,'2026-05-12 10:18:50'),(2,'backup_2026-05-12_10-19-14-067Z.sql',0,'full','failed',2,'2026-05-12 10:19:14'),(3,'backup_2026-05-12_10-21-04-380Z.sql',0,'full','failed',2,'2026-05-12 10:21:04');
/*!40000 ALTER TABLE `system_backups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','student','lecturer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'student@tlu.edu.vn','$2a$10$VbkaaJi/6SFo3ztVn1992eXSadThbiMnYNQH7Idq.kbpPK/TnKJfO','student','Nguyễn','Văn A','2026-05-09 03:18:17','2026-05-09 10:21:11'),(2,'admin@tlu.edu.vn','$2a$10$uQfP/cYwQRO/icrhwF78qegwLRi5DdojuHW1lap6mawQJMHdlFzZO','admin','Admin','System','2026-05-09 09:14:11','2026-05-09 09:14:11'),(3,'lecturer@tlu.edu.vn','$2a$10$DZ9cieWgWV83Xz0fpvKbnuurW0kHsECTHY3DGUkZK9F4tDlw3knoG','lecturer','ToA','Toàn','2026-05-09 09:35:47','2026-05-11 03:14:59'),(11,'student11@tlu.edu.vn','$2a$10$MOFc0wsSvmZbemhYiJmTE.GjbN56R3FltccS4Oi2iNhr4HkR0fhIi','student','Nguyễn','Văn B','2026-05-11 07:31:29','2026-05-11 07:31:29'),(14,'nhunglt@tlu.edu.vn','$2a$10$qqKX5TFdSJ9V6FOT636ZyeScrkK/J/PMfqxKljFFvjDY5sa51Ks0K','lecturer','Nguyễn','Thị Nhung','2026-05-11 08:52:38','2026-05-11 08:52:38');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_A46644'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-12 17:41:53
