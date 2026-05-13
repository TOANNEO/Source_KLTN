const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    comment: 'Mã môn học, VD: CTDLGT, HQTCSDL'
  },
  course_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Tên môn học'
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Số tín chỉ'
  },
  course_type: {
    type: DataTypes.ENUM('required', 'elective'),
    defaultValue: 'required',
    comment: 'Bắt buộc hoặc tự chọn'
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  }
}, {
  tableName: 'courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Course;
