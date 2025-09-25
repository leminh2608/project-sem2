const mysql = require('mysql2/promise');

// Import the actual functions from db-direct.ts
async function getTeacherClasses(teacherId) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  });

  try {
    const [rows] = await connection.execute(`
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

    return rows;
  } finally {
    await connection.end();
  }
}

async function getTeacherSchedule(teacherId, weekOffset = 0) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  });

  try {
    // Calculate the week range based on weekOffset
    const today = new Date();
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const targetWeekStart = new Date(currentWeekStart.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000));
    const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000));

    const [rows] = await connection.execute(`
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

    return rows;
  } finally {
    await connection.end();
  }
}

async function testTeacherAPI() {
  try {
    console.log('🧪 Testing Teacher API Functions...\n');
    
    const teacherId = 2; // Nguyen Van A
    
    // Test getTeacherClasses
    console.log('1. Testing getTeacherClasses...');
    const classes = await getTeacherClasses(teacherId);
    console.log('   ✅ Classes retrieved:', classes.length);
    
    if (classes.length > 0) {
      console.log('   Sample class:', {
        id: classes[0].class_id,
        name: classes[0].class_name,
        course: classes[0].course_name,
        level: classes[0].level,
        students: classes[0].student_count,
        schedules: classes[0].schedule_count
      });
    }
    
    // Test getTeacherSchedule for different weeks
    console.log('\n2. Testing getTeacherSchedule...');
    
    for (let weekOffset = 0; weekOffset <= 4; weekOffset++) {
      const schedule = await getTeacherSchedule(teacherId, weekOffset);
      
      const today = new Date();
      const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const targetWeekStart = new Date(currentWeekStart.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000));
      const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
      
      console.log(`   Week +${weekOffset} (${targetWeekStart.toISOString().split('T')[0]} to ${targetWeekEnd.toISOString().split('T')[0]}): ${schedule.length} schedules`);
      
      if (schedule.length > 0) {
        schedule.forEach(item => {
          console.log(`     - ${item.class_name} on ${item.lesson_date} (${item.day_of_week}) at ${item.start_time}-${item.end_time} in ${item.location || 'TBD'}`);
        });
      }
    }
    
    console.log('\n🎉 Teacher API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTeacherAPI();
