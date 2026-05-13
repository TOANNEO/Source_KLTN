const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PredictionHistory = sequelize.define('PredictionHistory', {
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
  predicted_gpa4: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'GPA dự báo hệ 4.0 (raw từ model)'
  },
  predicted_gpa: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'GPA dự báo hệ 10 (hiển thị cho user)'
  },
  risk_label: {
    type: DataTypes.ENUM('safe', 'warning', 'danger'),
    allowNull: false,
    comment: 'Mức độ nguy cơ học tập'
  },
  risk_score: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Xác suất nguy cơ (0-1)'
  },
  input_snapshot: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dữ liệu đầu vào lúc dự báo'
  },
  feature_importance: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Các nhân tố ảnh hưởng chính'
  },
  predicted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Thời điểm dự báo'
  }
}, {
  tableName: 'prediction_history',
  timestamps: false
});

module.exports = PredictionHistory;
