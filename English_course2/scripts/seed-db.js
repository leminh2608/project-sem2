const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });

    console.log('✅ Connected to database');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const teacherPassword = await bcrypt.hash('teacher123', 12);
    const studentPassword = await bcrypt.hash('student123', 12);

    console.log('🔐 Passwords hashed');

    // Clear existing data (in reverse order due to foreign keys)
    await connection.execute('DELETE FROM attendance');
    await connection.execute('DELETE FROM schedules');
    await connection.execute('DELETE FROM class_students');
    await connection.execute('DELETE FROM classes');
    await connection.execute('DELETE FROM course_students');
    await connection.execute('DELETE FROM courses');
    await connection.execute('DELETE FROM users');

    console.log('🧹 Cleared existing data');

    // Insert users
    await connection.execute(`
      INSERT INTO users (full_name, email, password, role, created_at) VALUES
      ('Admin System', 'admin@example.com', ?, 'admin', NOW()),
      ('Nguyen Van A', 'teacher.a@example.com', ?, 'teacher', NOW()),
      ('Tran Thi B', 'teacher.b@example.com', ?, 'teacher', NOW()),
      ('Le Van C', 'student.c@example.com', ?, 'student', NOW()),
      ('Pham Thi D', 'student.d@example.com', ?, 'student', NOW())
    `, [adminPassword, teacherPassword, teacherPassword, studentPassword, studentPassword]);

    console.log('👤 Users created');

    // Insert courses
    await connection.execute(`
      INSERT INTO courses (course_name, description, level, created_at) VALUES
      ('Tiếng Anh Giao Tiếp', 'Khóa học luyện nói và phản xạ giao tiếp cơ bản.', 'Beginner', NOW()),
      ('IELTS Foundation', 'Khóa học nền tảng luyện thi IELTS.', 'Intermediate', NOW())
    `);

    console.log('📚 Courses created');

    // Get the actual IDs that were created
    const [users] = await connection.execute('SELECT user_id, email FROM users ORDER BY user_id');
    const [courses] = await connection.execute('SELECT course_id, course_name FROM courses ORDER BY course_id');

    console.log('📋 Created users:', users.map(u => `${u.user_id}: ${u.email}`));
    console.log('📋 Created courses:', courses.map(c => `${c.course_id}: ${c.course_name}`));

    // Insert course registrations using actual IDs
    const studentIds = users.filter(u => u.email.includes('student')).map(u => u.user_id);
    const courseIds = courses.map(c => c.course_id);

    await connection.execute(`
      INSERT INTO course_students (course_id, student_id, registered_at) VALUES
      (?, ?, NOW()),
      (?, ?, NOW()),
      (?, ?, NOW())
    `, [courseIds[0], studentIds[0], courseIds[0], studentIds[1], courseIds[1], studentIds[0]]);

    console.log('📝 Course registrations created');

    // Insert classes using actual IDs
    const teacherIds = users.filter(u => u.email.includes('teacher')).map(u => u.user_id);

    await connection.execute(`
      INSERT INTO classes (course_id, class_name, teacher_id, start_date, end_date) VALUES
      (?, 'Giao Tiếp A1', ?, '2025-10-01', '2025-12-30'),
      (?, 'IELTS F1', ?, '2025-10-05', '2026-01-15')
    `, [courseIds[0], teacherIds[0], courseIds[1], teacherIds[1]]);

    console.log('🏫 Classes created');

    // Get class IDs
    const [classes] = await connection.execute('SELECT class_id, class_name FROM classes ORDER BY class_id');
    console.log('📋 Created classes:', classes.map(c => `${c.class_id}: ${c.class_name}`));

    // Insert class enrollments using actual IDs
    await connection.execute(`
      INSERT INTO class_students (class_id, student_id, joined_at) VALUES
      (?, ?, NOW()),
      (?, ?, NOW()),
      (?, ?, NOW())
    `, [classes[0].class_id, studentIds[0], classes[0].class_id, studentIds[1], classes[1].class_id, studentIds[0]]);

    console.log('👥 Class enrollments created');

    // Insert schedules using actual class IDs
    await connection.execute(`
      INSERT INTO schedules (class_id, lesson_date, start_time, end_time, room_or_link) VALUES
      (?, '2025-10-02', '18:00:00', '20:00:00', 'Phòng 101'),
      (?, '2025-10-04', '18:00:00', '20:00:00', 'Phòng 101'),
      (?, '2025-10-06', '19:00:00', '21:00:00', 'Zoom link: zoom.us/ielts-f1')
    `, [classes[0].class_id, classes[0].class_id, classes[1].class_id]);

    console.log('📅 Schedules created');

    // Get schedule IDs
    const [schedules] = await connection.execute('SELECT schedule_id, class_id FROM schedules ORDER BY schedule_id');
    console.log('📋 Created schedules:', schedules.map(s => `${s.schedule_id}: class ${s.class_id}`));

    // Insert attendance using actual IDs
    await connection.execute(`
      INSERT INTO attendance (schedule_id, student_id, status) VALUES
      (?, ?, 'present'),
      (?, ?, 'absent'),
      (?, ?, 'present')
    `, [schedules[0].schedule_id, studentIds[0], schedules[0].schedule_id, studentIds[1], schedules[2].schedule_id, studentIds[0]]);

    console.log('✅ Attendance records created');

    await connection.end();
    
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📋 Demo Accounts:');
    console.log('👤 Admin: admin@example.com / admin123');
    console.log('👨‍🏫 Teacher: teacher.a@example.com / teacher123');
    console.log('👨‍🎓 Student: student.c@example.com / student123');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
