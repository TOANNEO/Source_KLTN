const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Semester = sequelize.define('Semester', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tên học kỳ, VD: HK1 2024-2025'
  },
  academic_year: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Năm học, VD: 2024-2025'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_current: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '1 = học kỳ đang hoạt động'
  }
}, {
  tableName: 'semesters',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['name', 'academic_year'],
      name: 'uq_semester_name_year'
    }
  ]
});

module.exports = Semester;
