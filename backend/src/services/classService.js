const { Class, Student, Lecturer, Department, User, PredictionHistory, InterventionLog, Semester, sequelize } = require('../models');
const { Op } = require('sequelize');

// ==================== ADMIN ====================

/**
 * Lấy danh sách lớp hành chính (có filter)
 */
const getClasses = async (filters = {}) => {
  const where = {};
  if (filters.department_id) where.department_id = filters.department_id;
  if (filters.search) {
    where.class_name = { [Op.like]: `%${filters.search}%` };
  }

  const classes = await Class.findAll({
    where,
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'code', 'name']
      },
      {
        model: Lecturer,
        as: 'homeroom_teacher',
        attributes: ['id', 'lecturer_code'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['first_name', 'last_name', 'email']
          }
        ]
      },
      {
        model: Student,
        as: 'students',
        attributes: ['id']
      }
    ],
    order: [['class_name', 'ASC']]
  });

  return classes.map(c => {
    const obj = c.toJSON();
    obj.student_count = obj.students ? obj.students.length : 0;
    delete obj.students;
    return obj;
  });
};

/**
 * Lấy chi tiết 1 lớp
 */
const getClassById = async (id) => {
  const cls = await Class.findByPk(id, {
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'code', 'name']
      },
      {
        model: Lecturer,
        as: 'homeroom_teacher',
        attributes: ['id', 'lecturer_code'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      }
    ]
  });
  if (!cls) throw new Error('Không tìm thấy lớp hành chính');
  return cls;
};

/**
 * Tạo lớp mới
 */
const createClass = async (data) => {
  const { class_name, department_id, lecturer_id } = data;

  const existing = await Class.findOne({ where: { class_name } });
  if (existing) throw new Error('Tên lớp đã tồn tại');

  const dept = await Department.findByPk(department_id);
  if (!dept) throw new Error('Khoa không tồn tại');

  if (lecturer_id) {
    const lecturer = await Lecturer.findByPk(lecturer_id);
    if (!lecturer) throw new Error('Giảng viên không tồn tại');
  }

  const cls = await Class.create({ class_name, department_id, lecturer_id: lecturer_id || null });
  return getClassById(cls.id);
};

/**
 * Cập nhật thông tin lớp
 */
const updateClass = async (id, data) => {
  const cls = await Class.findByPk(id);
  if (!cls) throw new Error('Không tìm thấy lớp hành chính');

  const { class_name, department_id, lecturer_id } = data;

  if (class_name && class_name !== cls.class_name) {
    const existing = await Class.findOne({ where: { class_name } });
    if (existing) throw new Error('Tên lớp đã tồn tại');
  }

  await cls.update({
    class_name: class_name || cls.class_name,
    department_id: department_id || cls.department_id,
    lecturer_id: lecturer_id !== undefined ? (lecturer_id || null) : cls.lecturer_id
  });

  return getClassById(id);
};

/**
 * Xóa lớp (chỉ khi không còn SV)
 */
const deleteClass = async (id) => {
  const cls = await Class.findByPk(id);
  if (!cls) throw new Error('Không tìm thấy lớp hành chính');

  const studentCount = await Student.count({ where: { class_id: id } });
  if (studentCount > 0) {
    throw new Error(`Không thể xóa lớp đang có ${studentCount} sinh viên`);
  }

  await cls.destroy();
};

/**
 * Phân công GVCN cho lớp
 */
const assignHomeroom = async (classId, lecturerId) => {
  const cls = await Class.findByPk(classId);
  if (!cls) throw new Error('Không tìm thấy lớp hành chính');

  if (lecturerId) {
    const lecturer = await Lecturer.findByPk(lecturerId);
    if (!lecturer) throw new Error('Giảng viên không tồn tại');
  }

  await cls.update({ lecturer_id: lecturerId || null });
  return getClassById(classId);
};

/**
 * Lấy danh sách SV trong lớp (kèm GPA, nguy cơ mới nhất)
 */
const getClassStudents = async (classId) => {
  const cls = await Class.findByPk(classId);
  if (!cls) throw new Error('Không tìm thấy lớp hành chính');

  const students = await Student.findAll({
    where: { class_id: classId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name']
      },
      {
        model: PredictionHistory,
        as: 'predictions',
        attributes: ['predicted_gpa', 'risk_label', 'risk_score', 'predicted_at'],
        order: [['predicted_at', 'DESC']],
        limit: 1,
        separate: true
      }
    ],
    order: [['student_code', 'ASC']]
  });

  return students.map(s => {
    const obj = s.toJSON();
    obj.latest_prediction = obj.predictions && obj.predictions.length > 0 ? obj.predictions[0] : null;
    delete obj.predictions;
    return obj;
  });
};

/**
 * Lấy danh sách SV chưa có lớp hoặc tìm kiếm
 */
const getUnassignedStudents = async (search = '') => {
  const where = { class_id: null };
  const userWhere = {};

  if (search) {
    userWhere[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } }
    ];
  }

  const students = await Student.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name'],
        where: Object.keys(userWhere).length > 0 ? userWhere : undefined
      }
    ],
    order: [['student_code', 'ASC']]
  });

  // Also search by student_code
  let byCode = [];
  if (search) {
    byCode = await Student.findAll({
      where: {
        class_id: null,
        student_code: { [Op.like]: `%${search}%` }
      },
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] }],
      order: [['student_code', 'ASC']]
    });
  }

  // Merge and deduplicate
  const merged = [...students, ...byCode];
  const seen = new Set();
  return merged.filter(s => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
};

/**
 * Batch thêm SV vào lớp
 */
const addStudentsToClass = async (classId, studentIds) => {
  const cls = await Class.findByPk(classId);
  if (!cls) throw new Error('Không tìm thấy lớp hành chính');

  const results = { added: [], skipped: [], errors: [] };

  for (const studentId of studentIds) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      results.errors.push({ id: studentId, reason: 'Không tìm thấy sinh viên' });
      continue;
    }
    if (student.class_id && student.class_id !== parseInt(classId)) {
      results.skipped.push({ id: studentId, reason: 'Sinh viên đã thuộc lớp khác' });
      continue;
    }
    await student.update({ class_id: classId });
    results.added.push(studentId);
  }

  return results;
};

/**
 * Xóa SV khỏi lớp
 */
const removeStudentFromClass = async (classId, studentId) => {
  const student = await Student.findOne({
    where: { id: studentId, class_id: classId }
  });
  if (!student) throw new Error('Sinh viên không thuộc lớp này');

  await student.update({ class_id: null });
};

// ==================== LECTURER ====================

/**
 * Lấy các lớp mà giảng viên là GVCN (kèm risk_counts từ dự báo mới nhất)
 */
const getLecturerClasses = async (userId) => {
  const lecturer = await Lecturer.findOne({ where: { user_id: userId } });
  if (!lecturer) throw new Error('Không tìm thấy hồ sơ giảng viên');

  const classes = await Class.findAll({
    where: { lecturer_id: lecturer.id },
    include: [
      { model: Department, as: 'department', attributes: ['id', 'code', 'name'] },
      { model: Student, as: 'students', attributes: ['id'] }
    ],
    order: [['class_name', 'ASC']]
  });

  if (classes.length === 0) return [];

  const classIds = classes.map(c => c.id);

  // Đếm risk_label mới nhất của từng SV, gom theo lớp
  const riskRows = await sequelize.query(`
    SELECT s.class_id, ph.risk_label, COUNT(*) AS cnt
    FROM prediction_history ph
    INNER JOIN (
      SELECT student_id, MAX(predicted_at) AS max_at
      FROM prediction_history
      GROUP BY student_id
    ) latest ON ph.student_id = latest.student_id AND ph.predicted_at = latest.max_at
    INNER JOIN students s ON s.id = ph.student_id
    WHERE s.class_id IN (:classIds)
    GROUP BY s.class_id, ph.risk_label
  `, { replacements: { classIds }, type: sequelize.QueryTypes.SELECT });

  const riskMap = {};
  for (const row of riskRows) {
    if (!riskMap[row.class_id]) riskMap[row.class_id] = { danger: 0, warning: 0, safe: 0 };
    riskMap[row.class_id][row.risk_label] = parseInt(row.cnt, 10);
  }

  return classes.map(c => {
    const obj = c.toJSON();
    obj.student_count = obj.students ? obj.students.length : 0;
    delete obj.students;
    obj.risk_counts = riskMap[c.id] || { danger: 0, warning: 0, safe: 0 };
    return obj;
  });
};

/**
 * Chi tiết lớp chủ nhiệm (kèm DS SV + GPA + nguy cơ)
 */
const getLecturerClassDetail = async (userId, classId) => {
  const lecturer = await Lecturer.findOne({ where: { user_id: userId } });
  if (!lecturer) throw new Error('Không tìm thấy hồ sơ giảng viên');

  const cls = await Class.findOne({
    where: { id: classId, lecturer_id: lecturer.id },
    include: [
      { model: Department, as: 'department', attributes: ['id', 'code', 'name'] }
    ]
  });
  if (!cls) throw new Error('Bạn không phải GVCN của lớp này');

  const students = await getClassStudents(classId);

  // Thêm intervention_status từ học kỳ hiện tại
  const currentSem = await Semester.findOne({ where: { is_current: 1 } });
  if (currentSem && students.length > 0) {
    const studentIds = students.map(s => s.id);
    const logs = await InterventionLog.findAll({
      where: { student_id: studentIds, semester_id: currentSem.id },
      attributes: ['student_id', 'status'],
      order: [['contacted_at', 'DESC']]
    });
    const ivMap = {};
    for (const log of logs) {
      if (!ivMap[log.student_id]) ivMap[log.student_id] = log.status;
    }
    students.forEach(s => { s.intervention_status = ivMap[s.id] || null; });
  }

  return { class: cls, students };
};

// ==================== STUDENT ====================

/**
 * Lấy thông tin lớp + danh sách bạn của sinh viên
 */
const getStudentClassInfo = async (userId) => {
  const student = await Student.findOne({
    where: { user_id: userId },
    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
  });
  if (!student) throw new Error('Không tìm thấy hồ sơ sinh viên');
  if (!student.class_id) return { class: null, classmates: [] };

  const cls = await Class.findByPk(student.class_id, {
    include: [
      { model: Department, as: 'department', attributes: ['id', 'code', 'name'] },
      {
        model: Lecturer,
        as: 'homeroom_teacher',
        attributes: ['id', 'lecturer_code'],
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
      }
    ]
  });

  // Classmates: chỉ hiển thị tên + mã SV, không hiển thị điểm
  const classmates = await Student.findAll({
    where: { class_id: student.class_id },
    include: [
      { model: User, as: 'user', attributes: ['first_name', 'last_name'] }
    ],
    attributes: ['id', 'student_code', 'major', 'course_year'],
    order: [['student_code', 'ASC']]
  });

  return { class: cls, classmates };
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignHomeroom,
  getClassStudents,
  getUnassignedStudents,
  addStudentsToClass,
  removeStudentFromClass,
  getLecturerClasses,
  getLecturerClassDetail,
  getStudentClassInfo
};
