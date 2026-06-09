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
  `extracurricular_hours_per_week` decimal(4,2) DEFAULT '0.00' COMMENT 'Số giờ tham gia hoạt động ngoại khóa mỗi tuần',
  `exercise_hours_per_week` decimal(4,2) DEFAULT '0.00' COMMENT 'Số giờ tập thể dục mỗi tuần',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_behavior` (`student_id`,`semester_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `behavior_records_ibfk_15` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `behavior_records_ibfk_16` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `behavior_records`
--

LOCK TABLES `behavior_records` WRITE;
/*!40000 ALTER TABLE `behavior_records` DISABLE KEYS */;
INSERT INTO `behavior_records` VALUES (1,1,1,0.00,0.00,0.00,0.00,0.00,0,'2026-05-23 07:33:17','2026-05-23 07:33:17',0.00,0.00),(2,6,1,1.00,7.00,80.00,2.00,4.00,3,'2026-05-23 03:06:55','2026-05-23 03:06:55',5.00,3.00),(3,1,3,1.00,6.00,70.00,4.00,6.00,6,'2026-05-25 02:02:47','2026-05-25 02:02:47',9.00,5.00);
/*!40000 ALTER TABLE `behavior_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `lecturer_id` int DEFAULT NULL,
  `class_name` varchar(50) NOT NULL COMMENT 'Tên lớp hành chính, VD: CNTT2022A',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_name` (`class_name`),
  UNIQUE KEY `class_name_2` (`class_name`),
  UNIQUE KEY `class_name_3` (`class_name`),
  UNIQUE KEY `class_name_4` (`class_name`),
  UNIQUE KEY `class_name_5` (`class_name`),
  UNIQUE KEY `class_name_6` (`class_name`),
  UNIQUE KEY `class_name_7` (`class_name`),
  KEY `department_id` (`department_id`),
  KEY `lecturer_id` (`lecturer_id`),
  CONSTRAINT `classes_ibfk_13` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `classes_ibfk_14` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,1,2,'TT35CL07','2026-05-19 02:39:39','2026-05-19 02:39:39'),(2,1,1,'TT35CL01','2026-05-20 02:27:47','2026-05-20 02:28:32'),(3,1,2,'TI35CL01','2026-05-22 09:25:01','2026-05-22 09:25:01');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã môn học, VD: CTDLGT, HQTCSDL',
  `course_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên môn học',
  `credits` int NOT NULL COMMENT 'Số tín chỉ',
  `course_type` enum('required','elective') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'required' COMMENT 'Bắt buộc hoặc tự chọn',
  `department_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  UNIQUE KEY `course_code_2` (`course_code`),
  UNIQUE KEY `course_code_3` (`course_code`),
  UNIQUE KEY `course_code_4` (`course_code`),
  UNIQUE KEY `course_code_5` (`course_code`),
  UNIQUE KEY `course_code_6` (`course_code`),
  UNIQUE KEY `course_code_7` (`course_code`),
  UNIQUE KEY `course_code_8` (`course_code`),
  UNIQUE KEY `course_code_9` (`course_code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'IT101','Lập trình căn bản',3,'required',1,'2026-05-09 03:18:15','2026-05-09 03:18:15'),(2,'IT102','Cấu trúc dữ liệu',4,'required',1,'2026-05-09 03:18:16','2026-05-09 03:18:16'),(3,'IT103','Cơ sở dữ liệu',3,'required',1,'2026-05-09 03:18:16','2026-05-09 03:18:16'),(9,'IT105','CSDL',1,'required',1,'2026-05-11 16:06:21','2026-05-11 16:06:21'),(10,'IT380','Công nghệ web',3,'required',1,'2026-05-13 14:09:07','2026-05-13 14:09:07'),(11,'IT332','Blochain',3,'required',1,'2026-05-13 14:10:54','2026-05-13 14:10:54'),(12,'IS320','Dữ liệu lớn',2,'required',1,'2026-05-13 14:14:39','2026-05-13 14:14:39');
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa, VD: CNTT',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên khoa',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`),
  UNIQUE KEY `code_5` (`code`),
  UNIQUE KEY `code_6` (`code`),
  UNIQUE KEY `code_7` (`code`),
  UNIQUE KEY `code_8` (`code`),
  UNIQUE KEY `code_9` (`code`),
  UNIQUE KEY `code_10` (`code`),
  UNIQUE KEY `code_11` (`code`)
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
  `target_type` enum('semester','cumulative') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'semester' COMMENT 'Loại mục tiêu: học kỳ hoặc tích lũy',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_target` (`student_id`,`semester_id`,`target_type`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `gpa_targets_ibfk_15` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gpa_targets_ibfk_16` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
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
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Lý do thay đổi',
  `changed_at` datetime DEFAULT NULL COMMENT 'Thời điểm thay đổi',
  PRIMARY KEY (`id`),
  KEY `grade_id` (`grade_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `grade_audit_logs_ibfk_17` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grade_audit_logs_ibfk_18` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade_audit_logs`
--

LOCK TABLES `grade_audit_logs` WRITE;
/*!40000 ALTER TABLE `grade_audit_logs` DISABLE KEYS */;
INSERT INTO `grade_audit_logs` VALUES (1,4,2,'{\"final_score\": \"10.00\", \"total_score\": \"10.00\", \"assignment_score\": \"10.00\", \"attendance_score\": \"8.00\", \"middle_exam_score\": \"6.50\"}','{\"final_score\": 10, \"total_score\": 8.95, \"assignment_score\": 10, \"attendance_score\": 8, \"middle_exam_score\": 6.5}','Thích','2026-05-12 03:44:20'),(2,2,2,'{\"final_score\": \"7.50\", \"total_score\": \"7.20\", \"assignment_score\": \"8.00\", \"attendance_score\": \"7.00\", \"middle_exam_score\": \"7.50\"}','{\"final_score\": 7.5, \"total_score\": 8.1, \"assignment_score\": 8, \"attendance_score\": 7, \"middle_exam_score\": 9.5}','test','2026-05-13 10:37:56');
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
  `updated_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Lý do chỉnh sửa điểm',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_grade` (`student_id`,`course_id`,`semester_id`,`is_improvement`),
  KEY `course_id` (`course_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `grades_ibfk_25` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grades_ibfk_26` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grades_ibfk_27` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (1,1,1,2,8.00,6.50,10.00,8.00,7.70,NULL,0,NULL,NULL,'2026-05-09 03:18:17','2026-05-09 03:18:17'),(2,1,2,2,7.00,9.50,8.00,7.50,8.10,NULL,0,2,'test','2026-05-09 03:18:18','2026-05-13 10:37:55'),(3,1,3,2,10.00,9.50,10.00,8.50,8.35,NULL,0,NULL,NULL,'2026-05-09 03:18:18','2026-05-09 03:18:18'),(4,1,1,1,8.00,6.50,10.00,10.00,8.95,NULL,0,2,'Thích','2026-05-12 03:05:00','2026-05-12 03:44:20'),(6,1,11,1,10.00,7.00,10.00,4.50,5.25,NULL,0,NULL,NULL,'2026-05-13 14:12:33','2026-05-13 14:12:33'),(9,4,12,1,10.00,7.00,10.00,8.00,7.70,NULL,0,NULL,NULL,'2026-05-20 02:29:37','2026-05-20 02:29:37');
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
  CONSTRAINT `improvement_suggestions_ibfk_22` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `improvement_suggestions_ibfk_23` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `improvement_suggestions_ibfk_24` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
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
-- Table structure for table `intervention_logs`
--

DROP TABLE IF EXISTS `intervention_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `intervention_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `lecturer_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `method` enum('direct','phone','email') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('not_contacted','consulting','reminded','need_family') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'not_contacted',
  `contacted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `intervention_logs`
--

LOCK TABLES `intervention_logs` WRITE;
/*!40000 ALTER TABLE `intervention_logs` DISABLE KEYS */;
INSERT INTO `intervention_logs` VALUES (1,1,2,1,'direct','Sinh viên cần được theo dõi và hỗ trợ.','reminded','2026-05-20 14:47:21','2026-05-20 14:47:21','2026-05-20 14:48:00'),(2,6,2,1,'direct','Sinh viên có dấu hiệu cần quan tâm. ','reminded','2026-05-23 03:01:20','2026-05-23 03:01:20','2026-05-23 03:05:09');
/*!40000 ALTER TABLE `intervention_logs` ENABLE KEYS */;
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
  `lecturer_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã giảng viên',
  `degree` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Học vị: Thạc sĩ, Tiến sĩ, etc.',
  `department_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Số điện thoại',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `lecturer_code` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_2` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_3` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_4` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_5` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_6` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_7` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_8` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_9` (`lecturer_code`),
  UNIQUE KEY `lecturer_code_10` (`lecturer_code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `lecturers_ibfk_17` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lecturers_ibfk_18` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecturers`
--

LOCK TABLES `lecturers` WRITE;
/*!40000 ALTER TABLE `lecturers` DISABLE KEYS */;
INSERT INTO `lecturers` VALUES (1,3,'100001','Thạc sĩ',1,'2026-05-09 09:35:47','2026-05-21 07:40:11','0123456789'),(2,14,'100072','Thạc sĩ',1,'2026-05-11 08:52:39','2026-05-21 09:14:49','0123456789'),(3,17,'100081','Thạc sĩ',1,'2026-05-21 07:41:12','2026-05-21 07:41:12','0123456789'),(4,19,'100002','Thạc sĩ',1,'2026-05-21 09:30:01','2026-05-21 09:34:04','0123456789');
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
  `risk_label` enum('safe','warning','danger') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mức độ nguy cơ học tập',
  `risk_score` decimal(5,4) DEFAULT NULL COMMENT 'Xác suất nguy cơ (0-1)',
  `input_snapshot` json DEFAULT NULL COMMENT 'Dữ liệu đầu vào lúc dự báo',
  `feature_importance` json DEFAULT NULL COMMENT 'Các nhân tố ảnh hưởng chính',
  `predicted_at` datetime DEFAULT NULL COMMENT 'Thời điểm dự báo',
  `predicted_gpa4` decimal(3,2) DEFAULT NULL COMMENT 'GPA dự báo hệ 4.0 (raw từ model)',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `prediction_history_ibfk_15` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prediction_history_ibfk_16` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prediction_history`
--

LOCK TABLES `prediction_history` WRITE;
/*!40000 ALTER TABLE `prediction_history` DISABLE KEYS */;
INSERT INTO `prediction_history` VALUES (1,1,1,5.15,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.50\\\",\\\"sleep_hours_per_day\\\":\\\"8.00\\\",\\\"class_attendance\\\":\\\"90.00\\\",\\\"social_media_hours\\\":\\\"1.50\\\",\\\"screen_time_hours\\\":\\\"3.50\\\",\\\"mental_stress_level\\\":5,\\\"recorded_at\\\":\\\"2026-05-09T03:29:01.000Z\\\",\\\"updated_at\\\":\\\"2026-05-09T03:29:01.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":null,\\\"assignment_score\\\":null}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-09 03:53:53',NULL),(2,1,1,5.15,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.50\\\",\\\"sleep_hours_per_day\\\":\\\"8.00\\\",\\\"class_attendance\\\":\\\"90.00\\\",\\\"social_media_hours\\\":\\\"1.50\\\",\\\"screen_time_hours\\\":\\\"3.50\\\",\\\"mental_stress_level\\\":5,\\\"recorded_at\\\":\\\"2026-05-09T03:29:01.000Z\\\",\\\"updated_at\\\":\\\"2026-05-09T03:29:01.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":null,\\\"assignment_score\\\":null}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-09 03:55:43',1.79),(3,1,1,5.22,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.00\\\",\\\"sleep_hours_per_day\\\":\\\"12.00\\\",\\\"class_attendance\\\":\\\"80.00\\\",\\\"social_media_hours\\\":\\\"7.00\\\",\\\"screen_time_hours\\\":\\\"7.00\\\",\\\"mental_stress_level\\\":9,\\\"recorded_at\\\":\\\"2026-05-13T08:54:39.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T08:54:39.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":\\\"6.50\\\",\\\"assignment_score\\\":\\\"10.00\\\"}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 08:56:32',1.83),(4,1,1,5.22,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.00\\\",\\\"sleep_hours_per_day\\\":\\\"12.00\\\",\\\"class_attendance\\\":\\\"80.00\\\",\\\"social_media_hours\\\":\\\"7.00\\\",\\\"screen_time_hours\\\":\\\"7.00\\\",\\\"mental_stress_level\\\":9,\\\"recorded_at\\\":\\\"2026-05-13T08:54:39.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T08:54:39.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":\\\"6.50\\\",\\\"assignment_score\\\":\\\"10.00\\\"}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 08:56:52',1.83),(5,1,1,5.22,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.00\\\",\\\"sleep_hours_per_day\\\":\\\"12.00\\\",\\\"class_attendance\\\":\\\"80.00\\\",\\\"social_media_hours\\\":\\\"7.00\\\",\\\"screen_time_hours\\\":\\\"7.00\\\",\\\"mental_stress_level\\\":9,\\\"recorded_at\\\":\\\"2026-05-13T08:54:39.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T08:54:39.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":\\\"6.50\\\",\\\"assignment_score\\\":\\\"10.00\\\"}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 09:02:36',1.83),(6,1,1,5.22,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.00\\\",\\\"sleep_hours_per_day\\\":\\\"12.00\\\",\\\"class_attendance\\\":\\\"80.00\\\",\\\"social_media_hours\\\":\\\"7.00\\\",\\\"screen_time_hours\\\":\\\"7.00\\\",\\\"mental_stress_level\\\":9,\\\"recorded_at\\\":\\\"2026-05-13T08:54:39.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T08:54:39.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":\\\"6.50\\\",\\\"assignment_score\\\":\\\"10.00\\\"}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 09:43:40',1.83),(7,1,1,5.23,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.00\\\",\\\"sleep_hours_per_day\\\":\\\"12.00\\\",\\\"class_attendance\\\":\\\"80.00\\\",\\\"social_media_hours\\\":\\\"7.00\\\",\\\"screen_time_hours\\\":\\\"7.00\\\",\\\"mental_stress_level\\\":9,\\\"recorded_at\\\":\\\"2026-05-13T08:54:39.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T08:54:39.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.5,\\\"assignment_score\\\":9.5}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 10:15:23',1.84),(8,1,1,5.23,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"6.00\\\",\\\"sleep_hours_per_day\\\":\\\"12.00\\\",\\\"class_attendance\\\":\\\"80.00\\\",\\\"social_media_hours\\\":\\\"7.00\\\",\\\"screen_time_hours\\\":\\\"7.00\\\",\\\"mental_stress_level\\\":9,\\\"recorded_at\\\":\\\"2026-05-13T08:54:39.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T08:54:39.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.5,\\\"assignment_score\\\":9.5}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 10:15:34',1.84),(9,1,1,5.13,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"4.50\\\",\\\"sleep_hours_per_day\\\":\\\"7.00\\\",\\\"class_attendance\\\":\\\"98.00\\\",\\\"social_media_hours\\\":\\\"1.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"recorded_at\\\":\\\"2026-05-13T10:18:47.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T10:18:47.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.5,\\\"assignment_score\\\":9.5}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 10:19:48',1.78),(10,1,1,8.77,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"4.50\\\",\\\"sleep_hours_per_day\\\":\\\"7.00\\\",\\\"class_attendance\\\":\\\"98.00\\\",\\\"social_media_hours\\\":\\\"1.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"recorded_at\\\":\\\"2026-05-13T10:18:47.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T10:18:47.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":8,\\\"assignment_score\\\":9.5}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 10:53:22',3.61),(11,1,1,8.77,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"4.50\\\",\\\"sleep_hours_per_day\\\":\\\"7.00\\\",\\\"class_attendance\\\":\\\"98.00\\\",\\\"social_media_hours\\\":\\\"1.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":9,\\\"recorded_at\\\":\\\"2026-05-13T10:58:15.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T10:58:15.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":8,\\\"assignment_score\\\":9.5}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 10:58:27',3.61),(12,1,1,6.95,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"5.50\\\",\\\"sleep_hours_per_day\\\":\\\"1.50\\\",\\\"class_attendance\\\":\\\"3.00\\\",\\\"social_media_hours\\\":\\\"2.50\\\",\\\"screen_time_hours\\\":\\\"1.50\\\",\\\"mental_stress_level\\\":3,\\\"recorded_at\\\":\\\"2026-05-13T11:04:43.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T11:04:43.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":8,\\\"assignment_score\\\":9.5}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 11:07:01',2.77),(13,1,1,6.95,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"5.50\\\",\\\"sleep_hours_per_day\\\":\\\"1.50\\\",\\\"class_attendance\\\":\\\"3.00\\\",\\\"social_media_hours\\\":\\\"2.50\\\",\\\"screen_time_hours\\\":\\\"1.50\\\",\\\"mental_stress_level\\\":3,\\\"recorded_at\\\":\\\"2026-05-13T11:04:43.000Z\\\",\\\"updated_at\\\":\\\"2026-05-13T11:04:43.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":8,\\\"assignment_score\\\":9.5}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-13 12:37:57',2.77),(14,1,1,8.38,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"5.00\\\",\\\"sleep_hours_per_day\\\":\\\"8.00\\\",\\\"class_attendance\\\":\\\"100.00\\\",\\\"social_media_hours\\\":\\\"7.00\\\",\\\"screen_time_hours\\\":\\\"8.00\\\",\\\"mental_stress_level\\\":6,\\\"recorded_at\\\":\\\"2026-05-14T03:39:59.000Z\\\",\\\"updated_at\\\":\\\"2026-05-14T03:39:59.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-14 03:40:16',3.43),(15,1,1,6.70,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.50\\\",\\\"sleep_hours_per_day\\\":\\\"6.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"9.00\\\",\\\"screen_time_hours\\\":\\\"14.00\\\",\\\"mental_stress_level\\\":1,\\\"recorded_at\\\":\\\"2026-05-14T03:42:35.000Z\\\",\\\"updated_at\\\":\\\"2026-05-14T03:42:35.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"final_exam_score\\\":0.187,\\\"class_attendance_percent\\\":0.112,\\\"study_hours_per_day\\\":0.2804,\\\"assignment_score\\\":0.128,\\\"sleep_hours\\\":0.1309,\\\"social_media_hours\\\":0.1442,\\\"screen_time_hours\\\":0.0175}\"','2026-05-14 03:42:39',2.62),(16,1,1,5.40,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"0.00\\\",\\\"class_attendance\\\":\\\"0.00\\\",\\\"social_media_hours\\\":\\\"0.00\\\",\\\"screen_time_hours\\\":\\\"0.00\\\",\\\"mental_stress_level\\\":0,\\\"extracurricular_hours_per_week\\\":null,\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T02:41:29.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T02:41:29.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 02:41:54',1.94),(17,1,1,9.10,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.50\\\",\\\"sleep_hours_per_day\\\":\\\"8.00\\\",\\\"class_attendance\\\":\\\"100.00\\\",\\\"social_media_hours\\\":\\\"2.50\\\",\\\"screen_time_hours\\\":\\\"4.50\\\",\\\"mental_stress_level\\\":2,\\\"extracurricular_hours_per_week\\\":null,\\\"exercise_hours_per_week\\\":\\\"1.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T02:43:53.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T02:43:53.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 02:44:20',3.73),(18,1,1,9.10,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.50\\\",\\\"sleep_hours_per_day\\\":\\\"8.00\\\",\\\"class_attendance\\\":\\\"100.00\\\",\\\"social_media_hours\\\":\\\"2.50\\\",\\\"screen_time_hours\\\":\\\"4.50\\\",\\\"mental_stress_level\\\":2,\\\"extracurricular_hours_per_week\\\":null,\\\"exercise_hours_per_week\\\":\\\"1.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T02:43:53.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T02:43:53.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 02:56:36',3.73),(19,1,1,6.95,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"3.00\\\",\\\"class_attendance\\\":\\\"85.00\\\",\\\"social_media_hours\\\":\\\"1.50\\\",\\\"screen_time_hours\\\":\\\"5.50\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"0.50\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T02:57:36.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T02:57:36.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 02:57:50',2.77),(20,1,1,6.95,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"3.00\\\",\\\"class_attendance\\\":\\\"85.00\\\",\\\"social_media_hours\\\":\\\"1.50\\\",\\\"screen_time_hours\\\":\\\"5.50\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"0.50\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T02:57:36.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T02:57:36.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 09:41:54',2.77),(21,1,1,8.55,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.00\\\",\\\"sleep_hours_per_day\\\":\\\"9.00\\\",\\\"class_attendance\\\":\\\"100.00\\\",\\\"social_media_hours\\\":\\\"2.00\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T09:44:38.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T09:44:38.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 09:47:10',3.52),(22,1,1,8.43,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.00\\\",\\\"sleep_hours_per_day\\\":\\\"9.00\\\",\\\"class_attendance\\\":\\\"95.00\\\",\\\"social_media_hours\\\":\\\"2.00\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T09:48:49.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T09:48:49.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 09:49:04',3.46),(23,1,1,7.92,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.00\\\",\\\"sleep_hours_per_day\\\":\\\"9.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"2.00\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T09:57:23.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T09:57:23.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 09:57:34',3.17),(24,1,1,7.62,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.00\\\",\\\"sleep_hours_per_day\\\":\\\"9.00\\\",\\\"class_attendance\\\":\\\"60.00\\\",\\\"social_media_hours\\\":\\\"2.00\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T09:58:45.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T09:58:45.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 09:58:50',3.05),(25,1,1,6.98,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"7.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"2.00\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T09:59:46.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T09:59:46.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 09:59:54',2.79),(26,1,1,6.80,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"2.00\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T10:00:53.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T10:00:53.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 10:00:57',2.68),(27,1,1,7.40,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"9.00\\\",\\\"class_attendance\\\":\\\"50.00\\\",\\\"social_media_hours\\\":\\\"2.00\\\",\\\"screen_time_hours\\\":\\\"7.00\\\",\\\"mental_stress_level\\\":0,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.50\\\",\\\"recorded_at\\\":\\\"2026-05-16T10:02:15.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T10:02:15.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 10:02:20',2.96),(28,1,1,6.73,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"9.00\\\",\\\"class_attendance\\\":\\\"50.00\\\",\\\"social_media_hours\\\":\\\"3.00\\\",\\\"screen_time_hours\\\":\\\"7.00\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"6.00\\\",\\\"exercise_hours_per_week\\\":\\\"10.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T10:04:31.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T10:04:31.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 10:04:35',2.64),(29,1,1,6.75,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"1.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"55.00\\\",\\\"social_media_hours\\\":\\\"4.00\\\",\\\"screen_time_hours\\\":\\\"6.00\\\",\\\"mental_stress_level\\\":6,\\\"extracurricular_hours_per_week\\\":\\\"5.50\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-16T10:11:57.000Z\\\",\\\"updated_at\\\":\\\"2026-05-16T10:11:57.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-16 10:12:04',2.65),(30,1,1,7.03,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"7.00\\\",\\\"class_attendance\\\":\\\"50.00\\\",\\\"social_media_hours\\\":\\\"3.00\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":0,\\\"extracurricular_hours_per_week\\\":\\\"3.00\\\",\\\"exercise_hours_per_week\\\":\\\"9.00\\\",\\\"recorded_at\\\":\\\"2026-05-17T03:06:59.000Z\\\",\\\"updated_at\\\":\\\"2026-05-17T03:06:59.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-17 03:07:09',2.81),(31,1,1,7.20,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"4.00\\\",\\\"screen_time_hours\\\":\\\"6.00\\\",\\\"mental_stress_level\\\":0,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-17T03:13:40.000Z\\\",\\\"updated_at\\\":\\\"2026-05-17T03:13:40.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-17 03:13:47',2.88),(32,1,1,6.70,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"50.00\\\",\\\"social_media_hours\\\":\\\"4.00\\\",\\\"screen_time_hours\\\":\\\"6.00\\\",\\\"mental_stress_level\\\":1,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-17T03:15:17.000Z\\\",\\\"updated_at\\\":\\\"2026-05-17T03:15:17.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.3965,\\\"class_attendance_percent\\\":0.2362,\\\"sleep_hours\\\":0.1352,\\\"mental_stress_level\\\":0.0841,\\\"social_media_hours\\\":0.1296,\\\"screen_time_hours\\\":0.0096,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":0.0057}\"','2026-05-17 03:15:21',2.62),(33,1,1,6.70,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"50.00\\\",\\\"social_media_hours\\\":\\\"4.00\\\",\\\"screen_time_hours\\\":\\\"6.00\\\",\\\"mental_stress_level\\\":1,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-17T03:15:17.000Z\\\",\\\"updated_at\\\":\\\"2026-05-17T03:15:17.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.4747,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":0.0967,\\\"social_media_hours\\\":-0.0539,\\\"screen_time_hours\\\":0.0005,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":-0.0046}\"','2026-05-17 09:00:31',2.62),(34,1,1,7.10,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.00\\\",\\\"sleep_hours_per_day\\\":\\\"6.00\\\",\\\"class_attendance\\\":\\\"65.00\\\",\\\"social_media_hours\\\":\\\"4.50\\\",\\\"screen_time_hours\\\":\\\"5.50\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"6.00\\\",\\\"exercise_hours_per_week\\\":\\\"6.00\\\",\\\"recorded_at\\\":\\\"2026-05-17T09:04:58.000Z\\\",\\\"updated_at\\\":\\\"2026-05-17T09:04:58.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.2011,\\\"class_attendance_percent\\\":-0.2996,\\\"sleep_hours\\\":-0.0577,\\\"mental_stress_level\\\":-0.159,\\\"social_media_hours\\\":-0.0757,\\\"screen_time_hours\\\":-0.0007,\\\"extracurricular_hours_per_week\\\":-0.0015,\\\"exercise_hours_per_week\\\":0.0042}\"','2026-05-17 09:05:05',2.84),(35,1,1,7.10,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.00\\\",\\\"sleep_hours_per_day\\\":\\\"6.00\\\",\\\"class_attendance\\\":\\\"65.00\\\",\\\"social_media_hours\\\":\\\"4.50\\\",\\\"screen_time_hours\\\":\\\"5.50\\\",\\\"mental_stress_level\\\":9,\\\"extracurricular_hours_per_week\\\":\\\"6.00\\\",\\\"exercise_hours_per_week\\\":\\\"6.00\\\",\\\"recorded_at\\\":\\\"2026-05-17T09:04:58.000Z\\\",\\\"updated_at\\\":\\\"2026-05-17T09:04:58.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.2011,\\\"class_attendance_percent\\\":-0.2996,\\\"sleep_hours\\\":-0.0577,\\\"mental_stress_level\\\":-0.159,\\\"social_media_hours\\\":-0.0757,\\\"screen_time_hours\\\":-0.0007,\\\"extracurricular_hours_per_week\\\":-0.0015,\\\"exercise_hours_per_week\\\":0.0042}\"','2026-05-17 14:32:35',2.84),(36,1,1,7.55,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.00\\\",\\\"sleep_hours_per_day\\\":\\\"6.00\\\",\\\"class_attendance\\\":\\\"65.00\\\",\\\"social_media_hours\\\":\\\"2.50\\\",\\\"screen_time_hours\\\":\\\"4.00\\\",\\\"mental_stress_level\\\":6,\\\"extracurricular_hours_per_week\\\":\\\"6.00\\\",\\\"exercise_hours_per_week\\\":\\\"6.00\\\",\\\"recorded_at\\\":\\\"2026-05-17T14:39:45.000Z\\\",\\\"updated_at\\\":\\\"2026-05-17T14:39:45.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.2011,\\\"class_attendance_percent\\\":-0.2996,\\\"sleep_hours\\\":-0.0577,\\\"mental_stress_level\\\":-0.0631,\\\"social_media_hours\\\":0.0113,\\\"screen_time_hours\\\":-0.0044,\\\"extracurricular_hours_per_week\\\":-0.0015,\\\"exercise_hours_per_week\\\":0.0042}\"','2026-05-17 14:39:52',3.02),(37,1,1,7.55,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.00\\\",\\\"sleep_hours_per_day\\\":\\\"6.00\\\",\\\"class_attendance\\\":\\\"65.00\\\",\\\"social_media_hours\\\":\\\"2.50\\\",\\\"screen_time_hours\\\":\\\"4.00\\\",\\\"mental_stress_level\\\":6,\\\"extracurricular_hours_per_week\\\":\\\"6.00\\\",\\\"exercise_hours_per_week\\\":\\\"6.00\\\",\\\"recorded_at\\\":\\\"2026-05-17T14:39:45.000Z\\\",\\\"updated_at\\\":\\\"2026-05-17T14:39:45.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.2011,\\\"class_attendance_percent\\\":-0.2996,\\\"sleep_hours\\\":-0.0577,\\\"mental_stress_level\\\":-0.0631,\\\"social_media_hours\\\":0.0113,\\\"screen_time_hours\\\":-0.0044,\\\"extracurricular_hours_per_week\\\":-0.0015,\\\"exercise_hours_per_week\\\":0.0042}\"','2026-05-17 16:28:53',3.02),(38,1,1,8.60,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"2.00\\\",\\\"sleep_hours_per_day\\\":\\\"6.00\\\",\\\"class_attendance\\\":\\\"95.00\\\",\\\"social_media_hours\\\":\\\"3.00\\\",\\\"screen_time_hours\\\":\\\"6.00\\\",\\\"mental_stress_level\\\":0,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"1.00\\\",\\\"recorded_at\\\":\\\"2026-05-18T00:42:11.000Z\\\",\\\"updated_at\\\":\\\"2026-05-18T00:42:11.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.2011,\\\"class_attendance_percent\\\":0.0506,\\\"sleep_hours\\\":-0.0577,\\\"mental_stress_level\\\":0.1286,\\\"social_media_hours\\\":-0.0104,\\\"screen_time_hours\\\":0.0005,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0031}\"','2026-05-18 00:42:27',3.54),(39,1,1,9.80,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"4.00\\\",\\\"sleep_hours_per_day\\\":\\\"7.00\\\",\\\"class_attendance\\\":\\\"100.00\\\",\\\"social_media_hours\\\":\\\"1.00\\\",\\\"screen_time_hours\\\":\\\"3.00\\\",\\\"mental_stress_level\\\":2,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.50\\\",\\\"recorded_at\\\":\\\"2026-05-18T00:44:16.000Z\\\",\\\"updated_at\\\":\\\"2026-05-18T00:44:16.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":0.0658,\\\"class_attendance_percent\\\":0.109,\\\"sleep_hours\\\":-0.0016,\\\"mental_stress_level\\\":0.0647,\\\"social_media_hours\\\":0.0766,\\\"screen_time_hours\\\":-0.0069,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":0.0005}\"','2026-05-18 00:44:25',3.94),(40,1,1,7.33,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"7.00\\\",\\\"class_attendance\\\":\\\"60.00\\\",\\\"social_media_hours\\\":\\\"3.00\\\",\\\"screen_time_hours\\\":\\\"6.00\\\",\\\"mental_stress_level\\\":0,\\\"extracurricular_hours_per_week\\\":\\\"2.00\\\",\\\"exercise_hours_per_week\\\":\\\"4.00\\\",\\\"recorded_at\\\":\\\"2026-05-18T00:46:14.000Z\\\",\\\"updated_at\\\":\\\"2026-05-18T00:46:14.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.3579,\\\"sleep_hours\\\":-0.0016,\\\"mental_stress_level\\\":0.1286,\\\"social_media_hours\\\":-0.0104,\\\"screen_time_hours\\\":0.0005,\\\"extracurricular_hours_per_week\\\":0.0016,\\\"exercise_hours_per_week\\\":0.0013}\"','2026-05-18 00:46:22',2.93),(41,1,1,7.20,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":1,\\\"student_id\\\":1,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"1.00\\\",\\\"sleep_hours_per_day\\\":\\\"4.00\\\",\\\"class_attendance\\\":\\\"80.00\\\",\\\"social_media_hours\\\":\\\"5.00\\\",\\\"screen_time_hours\\\":\\\"7.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"1.00\\\",\\\"recorded_at\\\":\\\"2026-05-18T01:35:34.000Z\\\",\\\"updated_at\\\":\\\"2026-05-18T01:35:34.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.3346,\\\"class_attendance_percent\\\":-0.1245,\\\"sleep_hours\\\":-0.1699,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0974,\\\"screen_time_hours\\\":0.003,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0031}\"','2026-05-18 01:35:44',2.88),(42,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 01:57:36',2.75),(43,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:11:25',2.75),(44,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:12:48',2.75),(45,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:13:09',2.75),(46,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:18:42',2.75),(47,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:19:05',2.75),(48,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:27:57',2.75),(49,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:33:07',2.75),(50,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:39:59',2.75),(51,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:40:20',2.75),(52,6,1,6.92,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"5.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"3.50\\\",\\\"screen_time_hours\\\":\\\"5.00\\\",\\\"mental_stress_level\\\":5,\\\"extracurricular_hours_per_week\\\":\\\"1.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-22T01:57:18.000Z\\\",\\\"updated_at\\\":\\\"2026-05-22T01:57:18.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.1138,\\\"mental_stress_level\\\":-0.0312,\\\"social_media_hours\\\":-0.0322,\\\"screen_time_hours\\\":-0.0019,\\\"extracurricular_hours_per_week\\\":0.0024,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-22 02:41:16',2.75),(53,6,1,8.05,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":2,\\\"student_id\\\":6,\\\"semester_id\\\":1,\\\"study_hours_per_day\\\":\\\"1.00\\\",\\\"sleep_hours_per_day\\\":\\\"7.00\\\",\\\"class_attendance\\\":\\\"80.00\\\",\\\"social_media_hours\\\":\\\"2.00\\\",\\\"screen_time_hours\\\":\\\"4.00\\\",\\\"mental_stress_level\\\":3,\\\"extracurricular_hours_per_week\\\":\\\"5.00\\\",\\\"exercise_hours_per_week\\\":\\\"3.00\\\",\\\"recorded_at\\\":\\\"2026-05-23T03:06:55.000Z\\\",\\\"updated_at\\\":\\\"2026-05-23T03:06:55.000Z\\\"},\\\"grade\\\":{}}\"','\"{\\\"study_hours_per_day\\\":-0.3346,\\\"class_attendance_percent\\\":-0.1245,\\\"sleep_hours\\\":-0.0016,\\\"mental_stress_level\\\":0.0327,\\\"social_media_hours\\\":0.0331,\\\"screen_time_hours\\\":-0.0044,\\\"extracurricular_hours_per_week\\\":-0.0008,\\\"exercise_hours_per_week\\\":-0.0002}\"','2026-05-23 03:07:13',3.23),(54,1,3,5.40,'warning',0.6000,'\"{\\\"behavior\\\":{\\\"id\\\":3,\\\"student_id\\\":1,\\\"semester_id\\\":3,\\\"study_hours_per_day\\\":\\\"0.00\\\",\\\"sleep_hours_per_day\\\":\\\"0.00\\\",\\\"class_attendance\\\":\\\"0.00\\\",\\\"social_media_hours\\\":\\\"0.00\\\",\\\"screen_time_hours\\\":\\\"0.00\\\",\\\"mental_stress_level\\\":0,\\\"extracurricular_hours_per_week\\\":\\\"0.00\\\",\\\"exercise_hours_per_week\\\":\\\"0.00\\\",\\\"recorded_at\\\":\\\"2026-05-23T08:15:01.000Z\\\",\\\"updated_at\\\":\\\"2026-05-23T08:15:01.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.468,\\\"class_attendance_percent\\\":-1.0584,\\\"sleep_hours\\\":-0.3943,\\\"mental_stress_level\\\":0.1286,\\\"social_media_hours\\\":0.12,\\\"screen_time_hours\\\":-0.0143,\\\"extracurricular_hours_per_week\\\":0.0031,\\\"exercise_hours_per_week\\\":-0.0046}\"','2026-05-23 08:15:31',1.94),(55,1,3,7.20,'safe',0.2000,'\"{\\\"behavior\\\":{\\\"id\\\":3,\\\"student_id\\\":1,\\\"semester_id\\\":3,\\\"study_hours_per_day\\\":\\\"1.00\\\",\\\"sleep_hours_per_day\\\":\\\"6.00\\\",\\\"class_attendance\\\":\\\"70.00\\\",\\\"social_media_hours\\\":\\\"4.00\\\",\\\"screen_time_hours\\\":\\\"6.00\\\",\\\"mental_stress_level\\\":6,\\\"extracurricular_hours_per_week\\\":\\\"9.00\\\",\\\"exercise_hours_per_week\\\":\\\"5.00\\\",\\\"recorded_at\\\":\\\"2026-05-25T02:02:47.000Z\\\",\\\"updated_at\\\":\\\"2026-05-25T02:02:47.000Z\\\"},\\\"grade\\\":{\\\"middle_exam_score\\\":7.67,\\\"assignment_score\\\":9.67}}\"','\"{\\\"study_hours_per_day\\\":-0.3346,\\\"class_attendance_percent\\\":-0.2412,\\\"sleep_hours\\\":-0.0577,\\\"mental_stress_level\\\":-0.0631,\\\"social_media_hours\\\":-0.0539,\\\"screen_time_hours\\\":0.0005,\\\"extracurricular_hours_per_week\\\":-0.0039,\\\"exercise_hours_per_week\\\":0.0027}\"','2026-05-25 02:03:05',2.88);
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên học kỳ, VD: HK1 2024-2025',
  `academic_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Năm học, VD: 2024-2025',
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
INSERT INTO `semesters` VALUES (1,'HK1 2023-2024','2023-2024','2023-10-14','2024-01-14',0,'2026-05-09 03:17:37','2026-05-23 08:22:56'),(2,'HK2 2023-2024','2023-2024','2024-02-01','2024-06-30',0,'2026-05-09 03:17:37','2026-05-22 01:51:26'),(3,'HK1 2024-2025','2024-2025','2024-09-01','2025-01-15',1,'2026-05-11 16:11:33','2026-05-23 08:22:56');
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
  `student_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên, VD: A46644',
  `major` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Chuyên ngành',
  `course_year` int NOT NULL COMMENT 'Khóa học, VD: 2022, 2023',
  `total_credits` int DEFAULT '0' COMMENT 'Tổng tín chỉ đã tích lũy',
  `gpa_cumulative` decimal(4,2) DEFAULT '0.00' COMMENT 'GPA tích lũy hệ 10',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `class_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `student_code` (`student_code`),
  UNIQUE KEY `student_code_2` (`student_code`),
  UNIQUE KEY `student_code_3` (`student_code`),
  UNIQUE KEY `student_code_4` (`student_code`),
  UNIQUE KEY `student_code_5` (`student_code`),
  UNIQUE KEY `student_code_6` (`student_code`),
  UNIQUE KEY `student_code_7` (`student_code`),
  UNIQUE KEY `student_code_8` (`student_code`),
  UNIQUE KEY `student_code_9` (`student_code`),
  UNIQUE KEY `student_code_10` (`student_code`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `students_ibfk_13` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `students_ibfk_14` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,1,'A46644','Công nghệ thông tin',2023,16,7.70,'2026-05-09 03:18:17','2026-05-29 02:14:05',1),(4,15,'A46655','Công nghệ thông tin',2022,2,7.70,'2026-05-18 08:14:41','2026-05-21 03:19:47',1),(5,16,'A41222','Công nghệ thông tin',2021,0,0.00,'2026-05-21 02:59:37','2026-05-21 03:20:52',1),(6,18,'A12345','Công nghệ thông tin',2022,0,0.00,'2026-05-21 09:10:33','2026-05-22 11:21:35',3),(7,20,'A11111','Trí tuệ nhân tạo',2022,0,0.00,'2026-06-03 02:05:17','2026-06-03 02:05:17',NULL);
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
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên file backup',
  `file_size` bigint DEFAULT NULL COMMENT 'Kích thước file (bytes)',
  `backup_type` enum('full','incremental') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'full' COMMENT 'Loại backup',
  `status` enum('success','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'success' COMMENT 'Trạng thái backup',
  `created_by` int DEFAULT NULL COMMENT 'user_id người tạo backup',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `system_backups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_backups`
--

LOCK TABLES `system_backups` WRITE;
/*!40000 ALTER TABLE `system_backups` DISABLE KEYS */;
INSERT INTO `system_backups` VALUES (4,'backup_2026-05-12_10-41-36-195Z.sql',25214,'full','success',2,'2026-05-12 10:41:53'),(5,'backup_2026-05-13_12-37-12-508Z.sql',33567,'full','success',2,'2026-05-13 12:37:31'),(7,'backup_2026-05-24_10-19-41-394Z.sql',79999,'full','success',2,'2026-05-24 10:20:00');
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
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','student','lecturer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'student@tlu.edu.vn','$2a$10$jLh/BNdLielhol5JZOnvw.1NSqi6D67v5B98x0HCvn35LZw4homVK','student','Nguyễn','Văn A','2026-05-09 03:18:17','2026-06-01 02:36:01',1,'2026-06-01 02:36:01'),(2,'admin@tlu.edu.vn','$2a$10$iNJLMzCyd/ZI1QUqenwF5.9b.lVzMZZoYmchsYlGKTMlbNV4PLCLG','admin','Admin','System','2026-05-09 09:14:11','2026-06-03 01:54:39',1,'2026-06-03 01:54:39'),(3,'lecturer@tlu.edu.vn','$2a$10$DZ9cieWgWV83Xz0fpvKbnuurW0kHsECTHY3DGUkZK9F4tDlw3knoG','lecturer','Trần','Tuấn Toàn','2026-05-09 09:35:47','2026-05-23 08:16:06',1,'2026-05-23 08:16:06'),(14,'nhunglt@tlu.edu.vn','$2a$10$8yvCsTn0B5HcokLfi4fQIeLY0idJbjw2gbmAjM/aM3lk2loejkiCK','lecturer','Nguyễn','Thị Nhung','2026-05-11 08:52:38','2026-06-01 02:26:59',1,'2026-06-01 02:26:59'),(15,'student1@tlu.edu.vn','$2a$10$Fd/dWr4bUkzmRZ62YRmkjuBrHhFCL01hYQEoJSbI3WKC2DBAtTK2W','student','Trần','Đồng Toàn','2026-05-18 08:14:41','2026-05-21 03:19:23',1,'2026-05-20 02:31:06'),(16,'a41222@tlu.edu.vn','$2a$10$u1qIooErNhDpJiPDGjMh6OgwrlU/kFeafeSubW0aubgsv6FAFvcku','student','Nguyễn','Văn A','2026-05-21 02:59:36','2026-05-21 03:25:35',1,NULL),(17,'hungcuongtl@tlu.edu.vn','$2a$10$f7A3Rm6Eu50oPLmV21ZoPeFeKzxUgmB9JqjGZnB/R3zCHllPP6LG2','lecturer','Nguyễn','Hùng Cường','2026-05-21 07:41:12','2026-05-21 07:41:12',1,NULL),(18,'a12345@tlu.edu.vn','$2a$10$PwURu82tSRliCHXXymT3COGipsGEXaJ4MB2SD.vhOq/PebYitzLKi','student','Nguyễn','Văn C','2026-05-21 09:10:33','2026-05-23 03:06:05',1,'2026-05-23 03:06:05'),(19,'testlt@tlu.edu.vn','$2a$10$zw2k/iwQf0b3Oujar9jvWuKGyQGGW89ajYAMr0xYicCVHQPVUDRy2','lecturer','TGG','teen','2026-05-21 09:30:00','2026-05-21 09:34:04',1,NULL),(20,'A11111@tlu.edu.vn','$2a$10$EljP1lClXK2qMDqqnOPmse75bsxs2PdhVyXFmSgxvGF4TWjPw8Rni','student','Nguyễn','Văn D','2026-06-03 02:05:17','2026-06-03 02:05:17',1,NULL);
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

-- Dump completed on 2026-06-03  9:35:02
