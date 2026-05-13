const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ImprovementSuggestion = sequelize.define('ImprovementSuggestion', {
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
  semester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'semesters',
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
  current_score: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Điểm hiện tại (4.0-5.6)'
  },
  target_score: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Điểm cần đạt để cải thiện'
  },
  gpa_gain: {
    type: DataTypes.DECIMAL(4, 3),
    allowNull: true,
    comment: 'Mức tăng GPA dự kiến'
  },
  priority_rank: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Thứ tự ưu tiên (1=cao nhất)'
  }
}, {
  tableName: 'improvement_suggestions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ImprovementSuggestion;
