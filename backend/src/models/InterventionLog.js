const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InterventionLog = sequelize.define('InterventionLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lecturer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semester_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('direct', 'phone', 'email'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('not_contacted', 'consulting', 'reminded', 'need_family'),
    defaultValue: 'not_contacted'
  },
  contacted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  meeting_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  student_response: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending'
  },
  reject_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lecturer_approval: {
    type: DataTypes.ENUM('pending', 'approved', 'denied'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'intervention_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InterventionLog;
