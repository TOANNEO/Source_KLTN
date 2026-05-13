// Backup Service - Database backup and restore operations
const { spawn } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { SystemBackup } = require('../models');
const { Op } = require('sequelize');

// Backup directory path
const BACKUP_DIR = path.join(__dirname, '../../backups');

// 👉 FIX: MySQL bin path (Windows safe)
const MYSQL_BIN =
  "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\";

/**
 * Ensure backup directory exists
 */
const ensureBackupDir = async () => {
  try {
    await fs.access(BACKUP_DIR);
  } catch (error) {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
};

/**
 * Create a new database backup
 */
const createBackup = async (userId) => {
  await ensureBackupDir();

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('.')[0];

  const filename = `backup_${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'student_prediction_db';

  // 👉 FIX mysqldump path
  const mysqldump = MYSQL_BIN + "mysqldump.exe";

  return new Promise((resolve, reject) => {
    const args = [
      "-h", dbHost,
      "-u", dbUser,
      ...(dbPassword ? [`-p${dbPassword}`] : []),
      "--single-transaction",
      "--routines",
      "--triggers",
      dbName
    ];

    const out = fsSync.createWriteStream(filepath);
    const processDump = spawn(mysqldump, args);

    processDump.stdout.pipe(out);

    processDump.on("error", async (error) => {
      try {
        await SystemBackup.create({
          filename,
          file_size: 0,
          backup_type: "full",
          status: "failed",
          created_by: userId
        });
      } catch (dbError) {
        console.error(dbError);
      }

      return reject(new Error("Backup failed: " + error.message));
    });

    processDump.on("close", async (code) => {
      if (code !== 0) {
        return reject(new Error("Backup failed with code " + code));
      }

      try {
        const stats = await fs.stat(filepath);

        const backupRecord = await SystemBackup.create({
          filename,
          file_size: stats.size,
          backup_type: "full",
          status: "success",
          created_by: userId
        });

        resolve({
          id: backupRecord.id,
          filename: backupRecord.filename,
          file_size: backupRecord.file_size,
          backup_type: backupRecord.backup_type,
          status: backupRecord.status,
          created_at: backupRecord.created_at
        });
      } catch (err) {
        reject(new Error("Backup created but DB log failed: " + err.message));
      }
    });
  });
};

/**
 * Get list of all backups
 */
const listBackups = async (filters = {}) => {
  const whereClause = {};

  if (filters.status) {
    whereClause.status = filters.status;
  }

  const options = {
    where: whereClause,
    order: [['created_at', 'DESC']],
    attributes: [
      'id',
      'filename',
      'file_size',
      'backup_type',
      'status',
      'created_at',
      'created_by'
    ],
    include: [
      {
        model: require('./User'),
        as: 'creator',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        required: false
      }
    ]
  };

  if (filters.limit) {
    options.limit = parseInt(filters.limit);
  }

  const backups = await SystemBackup.findAll(options);

  return Promise.all(
    backups.map(async (backup) => {
      const filepath = path.join(BACKUP_DIR, backup.filename);

      let fileExists = false;
      try {
        await fs.access(filepath);
        fileExists = true;
      } catch (err) {
        fileExists = false;
      }

      return {
        ...backup.toJSON(),
        file_exists: fileExists
      };
    })
  );
};

/**
 * Get backup file
 */
const getBackupFile = async (backupId) => {
  const backup = await SystemBackup.findByPk(backupId);

  if (!backup) {
    throw new Error("Backup không tồn tại");
  }

  const filepath = path.join(BACKUP_DIR, backup.filename);

  await fs.access(filepath);

  return {
    filepath,
    filename: backup.filename,
    file_size: backup.file_size
  };
};

/**
 * Delete backup
 */
const deleteBackup = async (backupId) => {
  const backup = await SystemBackup.findByPk(backupId);

  if (!backup) {
    throw new Error("Backup không tồn tại");
  }

  const filepath = path.join(BACKUP_DIR, backup.filename);

  try {
    await fs.unlink(filepath);
  } catch (err) {
    console.warn("File not found, deleting DB record only");
  }

  await backup.destroy();
};

/**
 * Restore database from backup (FIXED)
 */
const restoreBackup = async (backupId, userId) => {
  const backup = await SystemBackup.findByPk(backupId);

  if (!backup) throw new Error("Backup không tồn tại");

  const filepath = path.join(BACKUP_DIR, backup.filename);

  await fs.access(filepath);

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'student_prediction_db';

  // 👉 FIX mysql path
  const mysql = MYSQL_BIN + "mysql.exe";

  return new Promise((resolve, reject) => {
    const args = [
      "-h", dbHost,
      "-u", dbUser,
      ...(dbPassword ? [`-p${dbPassword}`] : []),
      dbName
    ];

    const restoreProcess = spawn(mysql, args);

    const fileStream = fsSync.createReadStream(filepath);
    fileStream.pipe(restoreProcess.stdin);

    restoreProcess.on("error", (err) => {
      reject(new Error("Restore failed: " + err.message));
    });

    restoreProcess.on("close", async (code) => {
      if (code !== 0) {
        return reject(new Error("Restore failed with code " + code));
      }

      await SystemBackup.create({
        filename: `restore_from_${backup.filename}`,
        file_size: backup.file_size,
        backup_type: "full",
        status: "success",
        created_by: userId
      });

      resolve({
        message: "Khôi phục thành công",
        restored_from: backup.filename
      });
    });
  });
};

module.exports = {
  createBackup,
  listBackups,
  getBackupFile,
  deleteBackup,
  restoreBackup
};





/** 
 
// Backup Service - Database backup and restore operations
const { exec } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { SystemBackup } = require('../models');
const { Op } = require('sequelize');

// Backup directory path
const BACKUP_DIR = path.join(__dirname, '../../backups');

/**
 * Ensure backup directory exists
 
const ensureBackupDir = async () => {
  try {
    await fs.access(BACKUP_DIR);
  } catch (error) {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
};

/**
 * Create a new database backup
 * @param {number} userId - ID of user creating the backup
 * @returns {Promise<Object>} Backup record with file info
 ---
const createBackup = async (userId) => {
  await ensureBackupDir();

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
  const filename = `backup_${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  // Get database credentials from environment
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'student_prediction_db';

  // Build mysqldump command
  // Using --single-transaction for InnoDB tables to avoid locking
  const cmd = `mysqldump -h ${dbHost} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} --single-transaction --routines --triggers ${dbName} > "${filepath}"`;

  return new Promise((resolve, reject) => {
    exec(cmd, async (error, stdout, stderr) => {
      if (error) {
        // Log failed backup to database
        try {
          await SystemBackup.create({
            filename,
            file_size: 0,
            backup_type: 'full',
            status: 'failed',
            created_by: userId
          });
        } catch (dbError) {
          console.error('Failed to log backup error:', dbError);
        }
        return reject(new Error(`Backup failed: ${error.message}`));
      }

      try {
        // Get file size
        const stats = await fs.stat(filepath);

        // Log successful backup to database
        const backupRecord = await SystemBackup.create({
          filename,
          file_size: stats.size,
          backup_type: 'full',
          status: 'success',
          created_by: userId
        });

        resolve({
          id: backupRecord.id,
          filename: backupRecord.filename,
          file_size: backupRecord.file_size,
          backup_type: backupRecord.backup_type,
          status: backupRecord.status,
          created_at: backupRecord.created_at
        });
      } catch (dbError) {
        // Backup file created but failed to log to database
        reject(new Error(`Backup created but failed to log: ${dbError.message}`));
      }
    });
  });
};

/**
 * Get list of all backups
 * @param {Object} filters - Optional filters (status, limit)
 * @returns {Promise<Array>} List of backup records
 
const listBackups = async (filters = {}) => {
  const whereClause = {};

  if (filters.status) {
    whereClause.status = filters.status;
  }

  const options = {
    where: whereClause,
    order: [['created_at', 'DESC']],
    attributes: ['id', 'filename', 'file_size', 'backup_type', 'status', 'created_at', 'created_by'],
    include: [
      {
        model: require('./User'),
        as: 'creator',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        required: false
      }
    ]
  };

  if (filters.limit) {
    options.limit = parseInt(filters.limit);
  }

  const backups = await SystemBackup.findAll(options);

  // Check if files actually exist on disk
  const backupsWithFileStatus = await Promise.all(
    backups.map(async (backup) => {
      const filepath = path.join(BACKUP_DIR, backup.filename);
      let fileExists = false;

      try {
        await fs.access(filepath);
        fileExists = true;
      } catch (error) {
        fileExists = false;
      }

      return {
        ...backup.toJSON(),
        file_exists: fileExists
      };
    })
  );

  return backupsWithFileStatus;
};



 */