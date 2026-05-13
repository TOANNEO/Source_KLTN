# Sequelize Models Documentation

## Tổng quan

Toàn bộ 13 models đã được tạo với đầy đủ associations theo thiết kế database.

## Danh sách Models

### 1. User
- **File**: `models/User.js`
- **Table**: `users`
- **Associations**:
  - `hasOne` Student (as 'student')
  - `hasOne` Lecturer (as 'lecturer')
  - `hasMany` GradeAuditLog (as 'auditLogs')
  - `hasMany` SystemBackup (as 'backups')

### 2. Department
- **File**: `models/Department.js`
- **Table**: `departments`
- **Associations**:
  - `hasMany` Lecturer (as 'lecturers')
  - `hasMany` Course (as 'courses')

### 3. Student
- **File**: `models/Student.js`
- **Table**: `students`
- **Associations**:
  - `belongsTo` User (as 'user')
  - `hasMany` Grade (as 'grades')
  - `hasMany` BehaviorRecord (as 'behaviorRecords')
  - `hasMany` GpaTarget (as 'gpaTargets')
  - `hasMany` PredictionHistory (as 'predictions')
  - `hasMany` ImprovementSuggestion (as 'suggestions')

### 4. Lecturer
- **File**: `models/Lecturer.js`
- **Table**: `lecturers`
- **Associations**:
  - `belongsTo` User (as 'user')
  - `belongsTo` Department (as 'department')

### 5. Semester
- **File**: `models/Semester.js`
- **Table**: `semesters`
- **Associations**:
  - `hasMany` Grade (as 'grades')
  - `hasMany` BehaviorRecord (as 'behaviorRecords')
  - `hasMany` GpaTarget (as 'gpaTargets')
  - `hasMany` PredictionHistory (as 'predictions')
  - `hasMany` ImprovementSuggestion (as 'suggestions')

### 6. Course
- **File**: `models/Course.js`
- **Table**: `courses`
- **Associations**:
  - `belongsTo` Department (as 'department')
  - `hasMany` Grade (as 'grades')
  - `hasMany` ImprovementSuggestion (as 'suggestions')

### 7. Grade
- **File**: `models/Grade.js`
- **Table**: `grades`
- **Associations**:
  - `belongsTo` Student (as 'student')
  - `belongsTo` Course (as 'course')
  - `belongsTo` Semester (as 'semester')
  - `hasMany` GradeAuditLog (as 'auditLogs')

### 8. GradeAuditLog
- **File**: `models/GradeAuditLog.js`
- **Table**: `grade_audit_logs`
- **Associations**:
  - `belongsTo` Grade (as 'grade')
  - `belongsTo` User (as 'changedBy')

### 9. BehaviorRecord
- **File**: `models/BehaviorRecord.js`
- **Table**: `behavior_records`
- **Associations**:
  - `belongsTo` Student (as 'student')
  - `belongsTo` Semester (as 'semester')

### 10. GpaTarget
- **File**: `models/GpaTarget.js`
- **Table**: `gpa_targets`
- **Associations**:
  - `belongsTo` Student (as 'student')
  - `belongsTo` Semester (as 'semester')

### 11. PredictionHistory
- **File**: `models/PredictionHistory.js`
- **Table**: `prediction_history`
- **Associations**:
  - `belongsTo` Student (as 'student')
  - `belongsTo` Semester (as 'semester')

### 12. ImprovementSuggestion
- **File**: `models/ImprovementSuggestion.js`
- **Table**: `improvement_suggestions`
- **Associations**:
  - `belongsTo` Student (as 'student')
  - `belongsTo` Semester (as 'semester')
  - `belongsTo` Course (as 'course')

### 13. SystemBackup
- **File**: `models/SystemBackup.js`
- **Table**: `system_backups`
- **Associations**:
  - `belongsTo` User (as 'creator')

---

## Sử dụng Models

### Import models

```javascript
const {
  User,
  Student,
  Grade,
  Course,
  Semester,
  // ... other models
} = require('./models');
```

### Query với associations

```javascript
// Lấy student với user info
const student = await Student.findOne({
  where: { student_code: 'A46644' },
  include: [{ model: User, as: 'user' }]
});

// Lấy grades của student với course và semester info
const grades = await Grade.findAll({
  where: { student_id: studentId },
  include: [
    { model: Course, as: 'course' },
    { model: Semester, as: 'semester' }
  ]
});

// Lấy student với tất cả grades và behavior records
const studentWithData = await Student.findByPk(studentId, {
  include: [
    { model: Grade, as: 'grades' },
    { model: BehaviorRecord, as: 'behaviorRecords' }
  ]
});
```

### Tạo record mới

```javascript
// Tạo student mới
const newStudent = await Student.create({
  user_id: userId,
  student_code: 'A46644',
  full_name: 'Nguyễn Văn A',
  major: 'Công nghệ thông tin',
  course_year: 2022
});

// Tạo grade mới
const newGrade = await Grade.create({
  student_id: studentId,
  course_id: courseId,
  semester_id: semesterId,
  middle_exam_score: 7.5,
  final_score: 8.0,
  total_score: 7.85
});
```

### Update record

```javascript
// Update GPA của student
await Student.update(
  { gpa_cumulative: 3.25 },
  { where: { id: studentId } }
);

// Update grade
await Grade.update(
  {
    final_score: 8.5,
    total_score: 8.25,
    updated_by: userId,
    updated_reason: 'Chỉnh sửa điểm sau phúc khảo'
  },
  { where: { id: gradeId } }
);
```

---

## Lưu ý quan trọng

1. **Timestamps**: Hầu hết các models có `created_at` và `updated_at` tự động
2. **Cascade Delete**: Student, Grade, BehaviorRecord có `onDelete: 'CASCADE'`
3. **Unique Constraints**:
   - Grade: unique trên (student_id, course_id, semester_id, is_improvement)
   - BehaviorRecord: unique trên (student_id, semester_id)
   - GpaTarget: unique trên (student_id, semester_id, target_type)
4. **JSON Fields**:
   - Grade: `updated_reason` (TEXT)
   - GradeAuditLog: `old_values`, `new_values` (JSON)
   - PredictionHistory: `input_snapshot`, `feature_importance` (JSON)

---

## Database Sync

Trong `app.js`, models được sync với database:

```javascript
// Development: sync without dropping tables
await models.sequelize.sync({ alter: false });

// WARNING: This will drop all tables and recreate
// await models.sequelize.sync({ force: true });
```

**Khuyến nghị**: Sử dụng migrations thay vì `sync()` trong production.
