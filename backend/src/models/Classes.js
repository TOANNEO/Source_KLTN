const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  class_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Tên lớp hành chính, VD: CNTT2022A'
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  lecturer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Giảng viên chủ nhiệm',
    references: {
      model: 'lecturers',
      key: 'id'
    }
  }
}, {
  tableName: 'classes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Class;
