const { Department, Lecturer, Course } = require('../models');

/**
 * Get all departments
 */
const getAllDepartments = async () => {
  return await Department.findAll({
    order: [['name', 'ASC']]
  });
};

/**
 * Get department by ID
 */
const getDepartmentById = async (id) => {
  const department = await Department.findByPk(id, {
    include: [
      { model: Lecturer, as: 'lecturers' },
      { model: Course, as: 'courses' }
    ]
  });

  if (!department) {
    throw new Error('Không tìm thấy khoa');
  }

  return department;
};

/**
 * Create new department
 */
const createDepartment = async (data) => {
  const { code, name } = data;

  // Check if code already exists
  const existing = await Department.findOne({ where: { code } });
  if (existing) {
    throw new Error('Mã khoa đã tồn tại');
  }

  return await Department.create({ code, name });
};

/**
 * Update department
 */
const updateDepartment = async (id, data) => {
  const department = await Department.findByPk(id);
  if (!department) {
    throw new Error('Không tìm thấy khoa');
  }

  const { code, name } = data;

  // Check if new code conflicts with existing
  if (code && code !== department.code) {
    const existing = await Department.findOne({ where: { code } });
    if (existing) {
      throw new Error('Mã khoa đã tồn tại');
    }
  }

  return await department.update({ code, name });
};

/**
 * Delete department
 */
const deleteDepartment = async (id) => {
  const department = await Department.findByPk(id, {
    include: [
      { model: Lecturer, as: 'lecturers' },
      { model: Course, as: 'courses' }
    ]
  });

  if (!department) {
    throw new Error('Không tìm thấy khoa');
  }

  // Check if department has related data
  if (department.lecturers && department.lecturers.length > 0) {
    throw new Error('Không thể xóa khoa đang có giảng viên');
  }

  if (department.courses && department.courses.length > 0) {
    throw new Error('Không thể xóa khoa đang có môn học');
  }

  await department.destroy();
  return true;
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
