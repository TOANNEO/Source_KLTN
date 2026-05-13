const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GpaTarget = sequelize.define('GpaTarget', {
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
  target_gpa: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    comment: 'GPA mục tiêu (hệ 4.0)'
  },
  target_type: {
    type: DataTypes.ENUM('semester', 'cumulative'),
    defaultValue: 'semester',
    comment: 'Loại mục tiêu: học kỳ hoặc tích lũy'
  }
}, {
  tableName: 'gpa_targets',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'semester_id', 'target_type'],
      name: 'uq_target'
    }
  ]
});

module.exports = GpaTarget;
