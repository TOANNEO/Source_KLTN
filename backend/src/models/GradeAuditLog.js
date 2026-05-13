const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GradeAuditLog = sequelize.define('GradeAuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  grade_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'grades',
      key: 'id'
    }
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'user_id của người thay đổi'
  },
  old_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Giá trị cũ trước khi thay đổi'
  },
  new_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Giá trị mới sau khi thay đổi'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Lý do thay đổi'
  },
  changed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Thời điểm thay đổi'
  }
}, {
  tableName: 'grade_audit_logs',
  timestamps: false
});

module.exports = GradeAuditLog;
