const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  semester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'semesters',
      key: 'id'
    }
  },
  attendance_score: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Điểm chuyên cần (CC) /10'
  },
  middle_exam_score: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Điểm giữa kỳ (GK) /10'
  },
  assignment_score: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Điểm bài tập'
  },
  final_score: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Điểm cuối kỳ (CK) /10'
  },
  total_score: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Điểm tổng kết = 0.1*CC + 0.3*GK + 0.6*CK'
  },
  grade_4: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Điểm quy đổi hệ 4'
  },
  is_improvement: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '1 = học cải thiện'
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'user_id của người sửa điểm'
  },
  updated_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Lý do chỉnh sửa điểm'
  }
}, {
  tableName: 'grades',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'course_id', 'semester_id', 'is_improvement'],
      name: 'uq_grade'
    }
  ]
});

module.exports = Grade;
