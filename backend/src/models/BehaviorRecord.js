const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BehaviorRecord = sequelize.define('BehaviorRecord', {
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
  study_hours_per_day: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    comment: 'Số giờ tự học mỗi ngày'
  },
  sleep_hours_per_day: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    comment: 'Số giờ ngủ mỗi ngày'
  },
  class_attendance: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Tỷ lệ đi học (0-100%)'
  },
  social_media_hours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
    comment: 'Số giờ dùng mạng xã hội mỗi ngày'
  },
  screen_time_hours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
    comment: 'Tổng thời gian sử dụng màn hình'
  },
  mental_stress_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Mức độ căng thẳng (1-10)'
  },
  recorded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Thời điểm ghi nhận'
  }
}, {
  tableName: 'behavior_records',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'semester_id'],
      name: 'uq_behavior'
    }
  ]
});

module.exports = BehaviorRecord;
