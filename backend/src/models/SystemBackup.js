const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemBackup = sequelize.define('SystemBackup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Tên file backup'
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Kích thước file (bytes)'
  },
  backup_type: {
    type: DataTypes.ENUM('full', 'incremental'),
    defaultValue: 'full',
    comment: 'Loại backup'
  },
  status: {
    type: DataTypes.ENUM('success', 'failed'),
    defaultValue: 'success',
    comment: 'Trạng thái backup'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'user_id người tạo backup'
  }
}, {
  tableName: 'system_backups',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SystemBackup;
