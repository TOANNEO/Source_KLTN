const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lecturer = sequelize.define('Lecturer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lecturer_code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    comment: 'Mã giảng viên'
  },
  degree: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Học vị: Thạc sĩ, Tiến sĩ, etc.'
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  }
}, {
  tableName: 'lecturers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Lecturer;
