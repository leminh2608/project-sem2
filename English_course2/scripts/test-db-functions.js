const mysql = require('mysql2/promise');

async function testDatabaseFunctions() {
  try {
    console.log('🧪 Testing Database Functions...\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    // Test 1: Check if teacher exists
    console.log('1. Checking teacher data...');
    const [teachers] = await connection.execute(`
      SELECT user_id, full_name, email, role 
      FROM users 
      WHERE role = 'teacher' 
      LIMIT 3
    `);
    
    console.log('   Teachers found:', teachers.length);
    teachers.forEach(teacher => {
      console.log(`   - ${teacher.full_name} (${teacher.email}) - ID: ${teacher.user_id}`);
    });
    
    if (teachers.length === 0) {
      console.log('   ❌ No teachers found');
      await connection.end();
      return;
    }
    
    const teacherId = teachers[0].user_id;
    console.log(`   Using teacher ID: ${teacherId} for tests\n`);
    
    // Test 2: Test getTeacherClasses function
    console.log('2. Testing getTeacherClasses function...');
    try {
      const [classRows] = await connection.execute(`
        SELECT
          cl.class_id,
          cl.class_name,
          c.course_name,
          c.level,
          COUNT(DISTINCT cls.student_id) as student_count,
          COUNT(DISTINCT s.schedule_id) as schedule_count
        FROM classes cl
        INNER JOIN courses c ON cl.course_id = c.course_id
        LEFT JOIN class_students cls ON cl.class_id = cls.class_id
        LEFT JOIN schedules s ON cl.class_id = s.class_id
        WHERE cl.teacher_id = ?
        GROUP BY cl.class_id, cl.class_name, c.course_name, c.level
        ORDER BY cl.class_name
      `, [teacherId]);
      
      console.log('   ✅ getTeacherClasses query successful');
      console.log('   Classes found:', classRows.length);
      
      if (classRows.length > 0) {
        console.log('   Sample class:', {
          name: classRows[0].class_name,
          course: classRows[0].course_name,
          level: classRows[0].level,
          students: classRows[0].student_count,
          schedules: classRows[0].schedule_count
        });
      }
    } catch (error) {
      console.log('   ❌ getTeacherClasses query failed:', error.message);
    }
    
    // Test 3: Test getTeacherSchedule function
    console.log('\n3. Testing getTeacherSchedule function...');
    try {
      // Calculate current week
      const today = new Date();
      const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const targetWeekStart = new Date(currentWeekStart.getTime());
      const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
      
      const [scheduleRows] = await connection.execute(`
        SELECT
          s.schedule_id,
          s.class_id,
          c.class_name,
          co.course_name,
          s.lesson_date,
          DAYNAME(s.lesson_date) as day_of_week,
          s.start_time,
          s.end_time,
          s.room_or_link as location,
          co.level,
          COUNT(DISTINCT cs.student_id) as student_count
        FROM schedules s
        INNER JOIN classes c ON s.class_id = c.class_id
        INNER JOIN courses co ON c.course_id = co.course_id
        LEFT JOIN class_students cs ON c.class_id = cs.class_id
        WHERE c.teacher_id = ? 
          AND s.lesson_date >= ? 
          AND s.lesson_date <= ?
        GROUP BY s.schedule_id, s.class_id, c.class_name, co.course_name,
                 s.lesson_date, s.start_time, s.end_time, s.room_or_link, co.level
        ORDER BY s.lesson_date ASC, s.start_time ASC
      `, [teacherId, targetWeekStart.toISOString().split('T')[0], targetWeekEnd.toISOString().split('T')[0]]);
      
      console.log('   ✅ getTeacherSchedule query successful');
      console.log('   Schedule entries found:', scheduleRows.length);
      console.log('   Week range:', targetWeekStart.toISOString().split('T')[0], 'to', targetWeekEnd.toISOString().split('T')[0]);
      
      if (scheduleRows.length > 0) {
        console.log('   Sample schedule:', {
          class: scheduleRows[0].class_name,
          date: scheduleRows[0].lesson_date,
          day: scheduleRows[0].day_of_week,
          time: `${scheduleRows[0].start_time} - ${scheduleRows[0].end_time}`,
          location: scheduleRows[0].location,
          students: scheduleRows[0].student_count
        });
      }
    } catch (error) {
      console.log('   ❌ getTeacherSchedule query failed:', error.message);
    }
    
    // Test 4: Check schedules table structure
    console.log('\n4. Checking schedules table structure...');
    const [columns] = await connection.execute('DESCRIBE schedules');
    console.log('   Schedules table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });
    
    // Test 5: Check sample schedule data
    console.log('\n5. Checking sample schedule data...');
    const [sampleSchedules] = await connection.execute(`
      SELECT s.*, c.class_name, u.full_name as teacher_name
      FROM schedules s
      INNER JOIN classes c ON s.class_id = c.class_id
      INNER JOIN users u ON c.teacher_id = u.user_id
      LIMIT 5
    `);
    
    console.log('   Sample schedules:', sampleSchedules.length);
    sampleSchedules.forEach(schedule => {
      console.log(`   - ${schedule.class_name} on ${schedule.lesson_date} at ${schedule.start_time} (Teacher: ${schedule.teacher_name})`);
    });
    
    await connection.end();
    console.log('\n🎉 Database function tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabaseFunctions();
