const { BehaviorRecord, Student, Semester } = require('../models');

/**
 * Validate behavior data ranges according to UC15
 */
const validateBehaviorData = (data) => {
  const errors = [];

  // study_hours: 0-16
  if (data.study_hours_per_day !== undefined) {
    if (data.study_hours_per_day < 0 || data.study_hours_per_day > 16) {
      errors.push('Số giờ tự học phải từ 0-16 giờ/ngày');
    }
  }

  // sleep_hours: 0-12
  if (data.sleep_hours_per_day !== undefined) {
    if (data.sleep_hours_per_day < 0 || data.sleep_hours_per_day > 12) {
      errors.push('Số giờ ngủ phải từ 0-12 giờ/ngày');
    }
  }

  // class_attendance: 0-100 (%)
  if (data.class_attendance !== undefined) {
    if (data.class_attendance < 0 || data.class_attendance > 100) {
      errors.push('Tỷ lệ đi học phải từ 0-100%');
    }
  }

  // social_media_hours: 0-24
  if (data.social_media_hours !== undefined) {
    if (data.social_media_hours < 0 || data.social_media_hours > 24) {
      errors.push('Số giờ dùng mạng xã hội phải từ 0-24 giờ/ngày');
    }
  }

  // screen_time_hours: 0-24
  if (data.screen_time_hours !== undefined) {
    if (data.screen_time_hours < 0 || data.screen_time_hours > 24) {
      errors.push('Thời gian sử dụng màn hình phải từ 0-24 giờ/ngày');
    }
  }

  // mental_stress_level: 0-9
  if (data.mental_stress_level !== undefined) {
    if (data.mental_stress_level < 0 || data.mental_stress_level > 9) {
      errors.push('Mức độ căng thẳng phải từ 0-9');
    }
  }

  return errors;
};

/**
 * Get behavior record for current semester
 * UC15: Xem chỉ số hành vi học kỳ hiện tại
 */
const getCurrentBehavior = async (userId) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  // Get current semester
  const currentSemester = await Semester.findOne({ where: { is_current: 1 } });
  if (!currentSemester) {
    throw new Error('Không có học kỳ hiện hành');
  }

  const behavior = await BehaviorRecord.findOne({
    where: {
      student_id: student.id,
      semester_id: currentSemester.id
    },
    include: [
      {
        model: Semester,
        as: 'semester',
        attributes: ['id', 'name', 'academic_year']
      }
    ]
  });

  return behavior;
};

/**
 * Get all behavior records for a student
 */
const getAllBehaviors = async (userId) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  const behaviors = await BehaviorRecord.findAll({
    where: { student_id: student.id },
    include: [
      {
        model: Semester,
        as: 'semester',
        attributes: ['id', 'name', 'academic_year']
      }
    ],
    order: [['semester_id', 'DESC']]
  });

  return behaviors;
};

/**
 * Create or update behavior record
 * UC15: Nhập theo học kỳ, lưu có timestamp
 */
const createOrUpdateBehavior = async (userId, data) => {
  const {
    semester_id,
    study_hours_per_day,
    sleep_hours_per_day,
    class_attendance,
    social_media_hours,
    screen_time_hours,
    mental_stress_level
  } = data;

  // Validate ranges
  const validationErrors = validateBehaviorData(data);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(', '));
  }

  // Get student
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  // Validate semester
  const semester = await Semester.findByPk(semester_id);
  if (!semester) {
    throw new Error('Không tìm thấy học kỳ');
  }

  // Check if behavior record exists
  const existingBehavior = await BehaviorRecord.findOne({
    where: {
      student_id: student.id,
      semester_id
    }
  });

  let behavior;

  if (existingBehavior) {
    // Update existing record
    behavior = await existingBehavior.update({
      study_hours_per_day,
      sleep_hours_per_day,
      class_attendance,
      social_media_hours: social_media_hours || 0,
      screen_time_hours: screen_time_hours || 0,
      mental_stress_level,
      recorded_at: new Date()
    });
  } else {
    // Create new record
    behavior = await BehaviorRecord.create({
      student_id: student.id,
      semester_id,
      study_hours_per_day,
      sleep_hours_per_day,
      class_attendance,
      social_media_hours: social_media_hours || 0,
      screen_time_hours: screen_time_hours || 0,
      mental_stress_level,
      recorded_at: new Date()
    });
  }

  // Return with semester info
  return await BehaviorRecord.findByPk(behavior.id, {
    include: [
      {
        model: Semester,
        as: 'semester',
        attributes: ['id', 'name', 'academic_year']
      }
    ]
  });
};

/**
 * Delete behavior record
 */
const deleteBehavior = async (userId, semesterId) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) {
    throw new Error('Không tìm thấy hồ sơ sinh viên');
  }

  const behavior = await BehaviorRecord.findOne({
    where: {
      student_id: student.id,
      semester_id: semesterId
    }
  });

  if (!behavior) {
    throw new Error('Không tìm thấy dữ liệu hành vi');
  }

  await behavior.destroy();
  return true;
};

module.exports = {
  validateBehaviorData,
  getCurrentBehavior,
  getAllBehaviors,
  createOrUpdateBehavior,
  deleteBehavior
};
