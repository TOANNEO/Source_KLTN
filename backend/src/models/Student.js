const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
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
  student_code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    comment: 'Mã sinh viên, VD: A46644'
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  // class_name: {
  //   type: DataTypes.STRING(50),
  //   allowNull: true,
  //   comment: 'Tên lớp, VD: TT35CL01'
  // },
  major: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Chuyên ngành'
  },
  course_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Khóa học, VD: 2022, 2023'
  },
  total_credits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Tổng tín chỉ đã tích lũy'
  },
  gpa_cumulative: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0.00,
    comment: 'GPA tích lũy hệ 10'
  }
}, {
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Student;
