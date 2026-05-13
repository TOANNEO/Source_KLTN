const bcrypt = require('bcryptjs');
const { sequelize, User, Student, Department, Course, Semester, Grade, BehaviorRecord } = require('../src/models');

async function seedTestData() {
  try {
    console.log('🌱 Starting seed process...');

    // 1. Create Department
    const [department] = await Department.findOrCreate({
      where: { code: 'CNTT' },
      defaults: {
        name: 'Khoa Công nghệ Thông tin'
      }
    });
    console.log('✓ Department created');

    // 2. Create Semesters
    const [semester1] = await Semester.findOrCreate({
      where: { name: 'HK1 2024-2025' },
      defaults: {
        academic_year: '2024-2025',
        start_date: '2024-09-01',
        end_date: '2025-01-15',
        is_current: 1
      }
    });

    const [semester2] = await Semester.findOrCreate({
      where: { name: 'HK2 2023-2024' },
      defaults: {
        academic_year: '2023-2024',
        start_date: '2024-02-01',
        end_date: '2024-06-30',
        is_current: 0
      }
    });
    console.log('✓ Semesters created');

    // 3. Create Courses
    const courses = [
      { course_code: 'IT101', course_name: 'Lập trình căn bản', credits: 3, course_type: 'required' },
      { course_code: 'IT102', course_name: 'Cấu trúc dữ liệu', credits: 4, course_type: 'required' },
      { course_code: 'IT103', course_name: 'Cơ sở dữ liệu', credits: 3, course_type: 'required' },
      { course_code: 'IT104', course_name: 'Mạng máy tính', credits: 3, course_type: 'required' },
      { course_code: 'IT105', course_name: 'Lập trình Web', credits: 4, course_type: 'elective' }
    ];

    const createdCourses = [];
    for (const courseData of courses) {
      const [course] = await Course.findOrCreate({
        where: { course_code: courseData.course_code },
        defaults: courseData
      });
      createdCourses.push(course);
    }
    console.log('✓ Courses created');

    // 4. Create Test Student User
    const hashedPassword = await bcrypt.hash('123456', 10);
    const [studentUser] = await User.findOrCreate({
      where: { email: 'student@tlu.edu.vn' },
      defaults: {
        password: hashedPassword,
        role: 'student',
        first_name: 'Nguyễn',
        last_name: 'Văn A'
      }
    });
    console.log('✓ Student user created');

    // 5. Create Student Profile
    const [student] = await Student.findOrCreate({
      where: { user_id: studentUser.id },
      defaults: {
        student_code: 'A46644',
        full_name: 'Nguyễn Văn A',
        major: 'Công nghệ Thông tin',
        course_year: 2023,
        total_credits: 0,
        gpa_cumulative: 0.00
      }
    });
    console.log('✓ Student profile created');

    // 6. Create Grades for Semester 2 (previous semester)
    const gradesData = [
      { course_id: createdCourses[0].id, midterm_score: 7.0, final_score: 8.0 }, // IT101
      { course_id: createdCourses[1].id, midterm_score: 6.5, final_score: 7.5 }, // IT102
      { course_id: createdCourses[2].id, midterm_score: 8.0, final_score: 8.5 }  // IT103
    ];

    for (const gradeData of gradesData) {
      const totalScore = 0.3 * gradeData.midterm_score + 0.7 * gradeData.final_score;

      await Grade.findOrCreate({
        where: {
          student_id: student.id,
          course_id: gradeData.course_id,
          semester_id: semester2.id
        },
        defaults: {
          midterm_score: gradeData.midterm_score,
          final_score: gradeData.final_score,
          total_score: totalScore,
          is_improvement: 0
        }
      });
    }
    console.log('✓ Grades created for previous semester');

    // 7. Calculate and update cumulative GPA
    const allGrades = await Grade.findAll({
      where: { student_id: student.id, is_improvement: 0 },
      include: [{ model: Course, as: 'course', attributes: ['credits'] }]
    });

    let totalWeighted = 0;
    let totalCredits = 0;
    for (const grade of allGrades) {
      totalWeighted += grade.total_score * grade.course.credits;
      totalCredits += grade.course.credits;
    }

    const cumulativeGPA = totalCredits > 0 ? totalWeighted / totalCredits : 0;
    await student.update({
      total_credits: totalCredits,
      gpa_cumulative: Math.round(cumulativeGPA * 100) / 100
    });
    console.log(`✓ Updated cumulative GPA: ${cumulativeGPA.toFixed(2)}`);

    // 8. Create Behavior Record for current semester
    await BehaviorRecord.findOrCreate({
      where: {
        student_id: student.id,
        semester_id: semester1.id
      },
      defaults: {
        study_hours_per_day: 5.0,
        sleep_hours_per_day: 7.5,
        class_attendance: 85.0,
        social_media_hours: 2.0,
        screen_time_hours: 4.0,
        mental_stress_level: 6,
        recorded_at: new Date()
      }
    });
    console.log('✓ Behavior record created for current semester');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nTest credentials:');
    console.log('  Email: student@tlu.edu.vn');
    console.log('  Password: 123456');
    console.log('  Student Code: A46644');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

seedTestData();
