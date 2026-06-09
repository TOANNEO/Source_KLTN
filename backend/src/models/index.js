const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Department = require('./Department');
const Class = require('./Classes');
const Student = require('./Student');
const Lecturer = require('./Lecturer');
const Semester = require('./Semester');
const Course = require('./Course');
const Grade = require('./Grade');
const GradeAuditLog = require('./GradeAuditLog');
const BehaviorRecord = require('./BehaviorRecord');
const GpaTarget = require('./GpaTarget');
const PredictionHistory = require('./PredictionHistory');
const ImprovementSuggestion = require('./ImprovementSuggestion');
const SystemBackup = require('./SystemBackup');
const InterventionLog = require('./InterventionLog');

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasOne(Student, { foreignKey: 'user_id', as: 'student', onDelete: 'CASCADE' });
  User.hasOne(Lecturer, { foreignKey: 'user_id', as: 'lecturer', onDelete: 'CASCADE' });
  User.hasMany(GradeAuditLog, { foreignKey: 'changed_by', as: 'auditLogs' });
  User.hasMany(SystemBackup, { foreignKey: 'created_by', as: 'backups' });

  // Department associations
  Department.hasMany(Class, { foreignKey: 'department_id', as: 'classes' });
  Department.hasMany(Lecturer, { foreignKey: 'department_id', as: 'lecturers' });
  Department.hasMany(Course, { foreignKey: 'department_id', as: 'courses' });

  // Class associations
  Class.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
  Class.belongsTo(Lecturer, { foreignKey: 'lecturer_id', as: 'homeroom_teacher' });
  Class.hasMany(Student, { foreignKey: 'class_id', as: 'students' });

  // Student associations
  Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Student.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
  Student.hasMany(Grade, { foreignKey: 'student_id', as: 'grades', onDelete: 'CASCADE' });
  Student.hasMany(BehaviorRecord, { foreignKey: 'student_id', as: 'behaviorRecords', onDelete: 'CASCADE' });
  Student.hasMany(GpaTarget, { foreignKey: 'student_id', as: 'gpaTargets', onDelete: 'CASCADE' });
  Student.hasMany(PredictionHistory, { foreignKey: 'student_id', as: 'predictions', onDelete: 'CASCADE' });
  Student.hasMany(ImprovementSuggestion, { foreignKey: 'student_id', as: 'suggestions', onDelete: 'CASCADE' });

  // Lecturer associations
  Lecturer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Lecturer.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
  Lecturer.hasMany(Class, { foreignKey: 'lecturer_id', as: 'homeroom_classes' });

  // Course associations
  Course.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
  Course.hasMany(Grade, { foreignKey: 'course_id', as: 'grades' });
  Course.hasMany(ImprovementSuggestion, { foreignKey: 'course_id', as: 'suggestions' });

  // Semester associations
  Semester.hasMany(Grade, { foreignKey: 'semester_id', as: 'grades' });
  Semester.hasMany(BehaviorRecord, { foreignKey: 'semester_id', as: 'behaviorRecords' });
  Semester.hasMany(GpaTarget, { foreignKey: 'semester_id', as: 'gpaTargets' });
  Semester.hasMany(PredictionHistory, { foreignKey: 'semester_id', as: 'predictions' });
  Semester.hasMany(ImprovementSuggestion, { foreignKey: 'semester_id', as: 'suggestions' });

  // Grade associations
  Grade.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Grade.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
  Grade.belongsTo(Semester, { foreignKey: 'semester_id', as: 'semester' });
  Grade.hasMany(GradeAuditLog, { foreignKey: 'grade_id', as: 'auditLogs' });

  // GradeAuditLog associations
  GradeAuditLog.belongsTo(Grade, { foreignKey: 'grade_id', as: 'grade' });
  GradeAuditLog.belongsTo(User, { foreignKey: 'changed_by', as: 'changedBy' });

  // BehaviorRecord associations
  BehaviorRecord.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  BehaviorRecord.belongsTo(Semester, { foreignKey: 'semester_id', as: 'semester' });

  // GpaTarget associations
  GpaTarget.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  GpaTarget.belongsTo(Semester, { foreignKey: 'semester_id', as: 'semester' });

  // PredictionHistory associations
  PredictionHistory.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  PredictionHistory.belongsTo(Semester, { foreignKey: 'semester_id', as: 'semester' });

  // ImprovementSuggestion associations
  ImprovementSuggestion.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  ImprovementSuggestion.belongsTo(Semester, { foreignKey: 'semester_id', as: 'semester' });
  ImprovementSuggestion.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

  // SystemBackup associations
  SystemBackup.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // InterventionLog associations
  InterventionLog.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  InterventionLog.belongsTo(Lecturer, { foreignKey: 'lecturer_id', as: 'lecturer' });
  InterventionLog.belongsTo(Semester, { foreignKey: 'semester_id', as: 'semester' });
  Student.hasMany(InterventionLog, { foreignKey: 'student_id', as: 'interventionLogs' });
  Lecturer.hasMany(InterventionLog, { foreignKey: 'lecturer_id', as: 'interventionLogs' });
};

// Initialize associations
setupAssociations();

module.exports = { 
  sequelize,
  User,
  Department,
  Class,
  Student,
  Lecturer,
  Semester,
  Course,
  Grade,
  GradeAuditLog,
  BehaviorRecord,
  GpaTarget,
  PredictionHistory,
  ImprovementSuggestion,
  SystemBackup,
  InterventionLog
};
