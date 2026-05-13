import api from './api';

/**
 * Create a new database backup
 */
export const createBackup = async () => {
  return await api.post('/admin/backups');
};

/**
 * Get list of all backups
 */
export const listBackups = async () => {
  return await api.get('/admin/backups');
};

/**
 * Download a backup file
 * @param {number} id - Backup ID
 */
export const downloadBackup = async (id) => {
  const response = await api.get(`/admin/backups/${id}/download`, {
    responseType: 'blob'
  });
  return response;
};

/**
 * Delete a backup
 * @param {number} id - Backup ID
 */
export const deleteBackup = async (id) => {
  return await api.delete(`/admin/backups/${id}`);
};

/**
 * Restore database from backup
 * @param {number} id - Backup ID
 */
export const restoreBackup = async (id) => {
  return await api.post(`/admin/backups/${id}/restore`);
};
