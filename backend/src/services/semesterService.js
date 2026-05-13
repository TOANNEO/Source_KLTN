const { Semester, Grade, BehaviorRecord } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all semesters
 */
const getAllSemesters = async () => {
  return await Semester.findAll({
    order: [['academic_year', 'DESC'], ['name', 'DESC']]
  });
};

/**
 * Get current semester
 */
const getCurrentSemester = async () => {
  const semester = await Semester.findOne({
    where: { is_current: 1 }
  });

  if (!semester) {
    throw new Error('Không có học kỳ hiện hành');
  }

  return semester;
};

/**
 * Get semester by ID
 */
const getSemesterById = async (id) => {
  const semester = await Semester.findByPk(id);
  if (!semester) {
    throw new Error('Không tìm thấy học kỳ');
  }
  return semester;
};

/**
 * Create new semester
 */
const createSemester = async (data) => {
  const { name, academic_year, start_date, end_date, is_current } = data;

  // Check if semester with same name and year exists
  const existing = await Semester.findOne({
    where: { name, academic_year }
  });

  if (existing) {
    throw new Error('Học kỳ này đã tồn tại');
  }

  // Validate dates
  if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
    throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
  }

  // If setting as current, unset other current semesters
  if (is_current) {
    await Semester.update(
      { is_current: 0 },
      { where: { is_current: 1 } }
    );
  }

  return await Semester.create({
    name,
    academic_year,
    start_date,
    end_date,
    is_current: is_current ? 1 : 0
  });
};

/**
 * Update semester
 */
const updateSemester = async (id, data) => {
  const semester = await Semester.findByPk(id);
  if (!semester) {
    throw new Error('Không tìm thấy học kỳ');
  }

  const { name, academic_year, start_date, end_date, is_current } = data;

  // Check if new name/year conflicts
  if ((name && name !== semester.name) || (academic_year && academic_year !== semester.academic_year)) {
    const existing = await Semester.findOne({
      where: {
        name: name || semester.name,
        academic_year: academic_year || semester.academic_year,
        id: { [Op.ne]: id }
      }
    });

    if (existing) {
      throw new Error('Học kỳ này đã tồn tại');
    }
  }

  // Validate dates
  const newStartDate = start_date || semester.start_date;
  const newEndDate = end_date || semester.end_date;
  if (newStartDate && newEndDate && new Date(newStartDate) >= new Date(newEndDate)) {
    throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
  }

  // If setting as current, unset other current semesters
  if (is_current && !semester.is_current) {
    await Semester.update(
      { is_current: 0 },
      { where: { is_current: 1 } }
    );
  }

  return await semester.update({
    name,
    academic_year,
    start_date,
    end_date,
    is_current: is_current !== undefined ? (is_current ? 1 : 0) : semester.is_current
  });
};

/**
 * Set semester as current
 * UC08: Chỉ 1 học kỳ is_current=1 tại một thời điểm
 */
const setCurrentSemester = async (id) => {
  const semester = await Semester.findByPk(id);
  if (!semester) {
    throw new Error('Không tìm thấy học kỳ');
  }

  // Unset all current semesters
  await Semester.update(
    { is_current: 0 },
    { where: { is_current: 1 } }
  );

  // Set this semester as current
  await semester.update({ is_current: 1 });

  return semester;
};

/**
 * Delete semester
 */
const deleteSemester = async (id) => {
  const semester = await Semester.findByPk(id);
  if (!semester) {
    throw new Error('Không tìm thấy học kỳ');
  }

  // Check if semester has grades
  const gradeCount = await Grade.count({ where: { semester_id: id } });
  if (gradeCount > 0) {
    throw new Error('Không thể xóa học kỳ đã có điểm');
  }

  // Check if semester has behavior records
  const behaviorCount = await BehaviorRecord.count({ where: { semester_id: id } });
  if (behaviorCount > 0) {
    throw new Error('Không thể xóa học kỳ đã có dữ liệu hành vi');
  }

  await semester.destroy();
  return true;
};

module.exports = {
  getAllSemesters,
  getCurrentSemester,
  getSemesterById,
  createSemester,
  updateSemester,
  setCurrentSemester,
  deleteSemester
};
