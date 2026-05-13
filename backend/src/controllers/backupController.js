const backupService = require('../services/backupService');

/**
 * POST /api/v1/admin/backups
 * Create a new database backup
 */
const createBackup = async (req, res) => {
  try {
    const userId = req.user.id; // From authenticateToken middleware

    const backup = await backupService.createBackup(userId);

    res.status(201).json({
      success: true,
      message: 'Tạo backup thành công',
      data: backup
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo backup'
    });
  }
};

/**
 * GET /api/v1/admin/backups
 * Get list of all backups
 * Query params:
 *   - status: 'success' or 'failed' (optional)
 *   - limit: number of records (optional)
 */
const listBackups = async (req, res) => {
  try {
    const { status, limit } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = limit;

    const backups = await backupService.listBackups(filters);

    res.json({
      success: true,
      data: backups,
      count: backups.length
    });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách backup'
    });
  }
};

/**
 * GET /api/v1/admin/backups/:id/download
 * Download a backup file
 */
const downloadBackup = async (req, res) => {
  try {
    const backupId = parseInt(req.params.id);

    const { filepath, filename, file_size } = await backupService.getBackupFile(backupId);

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', file_size);

    // Stream file to response
    const fs = require('fs');
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Lỗi khi tải backup'
    });
  }
};

/**
 * DELETE /api/v1/admin/backups/:id
 * Delete a backup
 */
const deleteBackup = async (req, res) => {
  try {
    const backupId = parseInt(req.params.id);

    await backupService.deleteBackup(backupId);

    res.json({
      success: true,
      message: 'Xóa backup thành công'
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa backup'
    });
  }
};

/**
 * POST /api/v1/admin/backups/:id/restore
 * Restore database from backup
 * IMPORTANT: This will replace all current data
 */
const restoreBackup = async (req, res) => {
  try {
    const backupId = parseInt(req.params.id);
    const userId = req.user.id;

    const result = await backupService.restoreBackup(backupId, userId);

    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi khôi phục backup'
    });
  }
};

module.exports = {
  createBackup,
  listBackups,
  downloadBackup,
  deleteBackup,
  restoreBackup
};
