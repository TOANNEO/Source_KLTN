const bcrypt = require('bcryptjs');
const { sequelize, User, Student, Lecturer, Department } = require('../src/models');

async function createTestAccounts() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // ==================== CREATE STUDENT ACCOUNT ====================
    console.log('Creating Student Account...');

    let studentUser = await User.findOne({ where: { email: 'student@tlu.edu.vn' } });

    if (studentUser) {
      console.log('⚠ Student user already exists, updating password...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      await studentUser.update({ password: hashedPassword });
    } else {
      const hashedPassword = await bcrypt.hash('123456', 10);
      studentUser = await User.create({
        email: 'student@tlu.edu.vn',
        password: hashedPassword,
        role: 'student',
        first_name: 'Nguyễn',
        last_name: 'Văn A'
      });
      console.log('✓ Student user created');
    }

    // Check if student profile exists
    let studentProfile = await Student.findOne({ where: { user_id: studentUser.id } });

    if (!studentProfile) {
      studentProfile = await Student.create({
        user_id: studentUser.id,
        student_code: 'A46644',
        full_name: 'Nguyễn Văn A',
        major: 'Công nghệ thông tin',
        course_year: 2022,
        total_credits: 60,
        gpa_cumulative: 7.50
      });
      console.log('✓ Student profile created');
    } else {
      console.log('✓ Student profile already exists');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STUDENT ACCOUNT:');
    console.log('Email:', studentUser.email);
    console.log('Password: 123456');
    console.log('Student Code:', studentProfile.student_code);
    console.log('GPA:', studentProfile.gpa_cumulative);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ==================== CREATE LECTURER ACCOUNT ====================
    console.log('Creating Lecturer Account...');

    // Ensure department exists
    let department = await Department.findOne({ where: { code: 'CNTT' } });
    if (!department) {
      department = await Department.create({
        code: 'CNTT',
        name: 'Khoa Công nghệ thông tin'
      });
      console.log('✓ Department created');
    }

    let lecturerUser = await User.findOne({ where: { email: 'lecturer@tlu.edu.vn' } });

    if (lecturerUser) {
      console.log('⚠ Lecturer user already exists, updating password...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      await lecturerUser.update({ password: hashedPassword });
    } else {
      const hashedPassword = await bcrypt.hash('123456', 10);
      lecturerUser = await User.create({
        email: 'lecturer@tlu.edu.vn',
        password: hashedPassword,
        role: 'lecturer',
        first_name: 'Phạm',
        last_name: 'Văn B'
      });
      console.log('✓ Lecturer user created');
    }

    // Check if lecturer profile exists
    let lecturerProfile = await Lecturer.findOne({ where: { user_id: lecturerUser.id } });

    if (!lecturerProfile) {
      lecturerProfile = await Lecturer.create({
        user_id: lecturerUser.id,
        lecturer_code: 'GV001',
        degree: 'Tiến sĩ',
        department_id: department.id
      });
      console.log('✓ Lecturer profile created');
    } else {
      console.log('✓ Lecturer profile already exists');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LECTURER ACCOUNT:');
    console.log('Email:', lecturerUser.email);
    console.log('Password: 123456');
    console.log('Lecturer Code:', lecturerProfile.lecturer_code);
    console.log('Degree:', lecturerProfile.degree);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ All test accounts created successfully!\n');
    console.log('SUMMARY:');
    console.log('1. Admin:    admin@tlu.edu.vn    / 123456');
    console.log('2. Student:  student@tlu.edu.vn  / 123456');
    console.log('3. Lecturer: lecturer@tlu.edu.vn / 123456');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createTestAccounts();
