const mysql = require('mysql2/promise');

// Test the fixed saveAttendance function
async function saveAttendance(classId, teacherId, date, attendance) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  });

  try {
    // Start transaction
    await connection.beginTransaction();

    // Validate input parameters
    if (!classId || !teacherId || !date) {
      await connection.rollback();
      return { success: false, error: 'Missing required parameters' };
    }

    console.log(`[DEBUG] saveAttendance called with: classId=${classId}, teacherId=${teacherId}, date="${date}"`);

    // Verify teacher owns this class
    const [classCheck] = await connection.execute(`
      SELECT 1 FROM classes WHERE class_id = ? AND teacher_id = ?
    `, [classId, teacherId]);

    if (!Array.isArray(classCheck) || classCheck.length === 0) {
      await connection.rollback();
      return { success: false, error: 'Unauthorized access to class' };
    }

    // First, get the schedule_id for this class and date
    // Use DATE() function to compare only the date part, ignoring time and timezone
    const [scheduleRows] = await connection.execute(`
      SELECT schedule_id, lesson_date FROM schedules 
      WHERE class_id = ? AND DATE(lesson_date) = DATE(?)
    `, [classId, date]);

    console.log(`[DEBUG] Schedule query result: ${scheduleRows.length} schedules found`);
    
    const schedules = scheduleRows;
    if (schedules.length === 0) {
      // Additional debug: check what schedules exist for this class
      const [allClassSchedules] = await connection.execute(`
        SELECT schedule_id, lesson_date, DATE(lesson_date) as date_only 
        FROM schedules WHERE class_id = ?
      `, [classId]);
      
      console.log(`[DEBUG] All schedules for class ${classId}:`, allClassSchedules);
      console.log(`[DEBUG] Looking for date: ${date}`);
      
      await connection.rollback();
      return { success: false, error: `No schedule found for this class and date. Available dates: ${allClassSchedules.map(s => s.date_only).join(', ')}` };
    }

    const scheduleId = schedules[0].schedule_id;
    console.log(`[DEBUG] Found schedule ID: ${scheduleId}`);

    // Delete existing attendance for this schedule
    await connection.execute(`
      DELETE FROM attendance WHERE schedule_id = ?
    `, [scheduleId]);

    // Insert new attendance records
    for (const record of attendance) {
      await connection.execute(`
        INSERT INTO attendance (schedule_id, student_id, status, note)
        VALUES (?, ?, ?, ?)
      `, [scheduleId, record.student_id, record.status, record.note || null]);
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error('Error saving attendance:', error);
    return { success: false, error: 'Database error occurred' };
  } finally {
    await connection.end();
  }
}

async function testAttendanceFix() {
  try {
    console.log('🧪 Testing Attendance Fix...\n');
    
    // Get test data from database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    // Get a schedule to test with
    const [schedules] = await connection.execute(`
      SELECT s.schedule_id, s.class_id, s.lesson_date, 
             c.class_name, u.user_id as teacher_id, u.full_name as teacher_name
      FROM schedules s
      INNER JOIN classes c ON s.class_id = c.class_id
      INNER JOIN users u ON c.teacher_id = u.user_id
      LIMIT 1
    `);
    
    if (schedules.length === 0) {
      console.log('❌ No schedules found for testing');
      await connection.end();
      return;
    }
    
    const testSchedule = schedules[0];
    console.log('📅 Using test schedule:');
    console.log(`   Class: ${testSchedule.class_name} (ID: ${testSchedule.class_id})`);
    console.log(`   Teacher: ${testSchedule.teacher_name} (ID: ${testSchedule.teacher_id})`);
    console.log(`   Date: ${testSchedule.lesson_date}`);
    
    // Get students in this class
    const [students] = await connection.execute(`
      SELECT cs.student_id, u.full_name
      FROM class_students cs
      INNER JOIN users u ON cs.student_id = u.user_id
      WHERE cs.class_id = ?
    `, [testSchedule.class_id]);
    
    console.log(`\n👥 Students in class: ${students.length}`);
    students.forEach(student => {
      console.log(`   - ${student.full_name} (ID: ${student.student_id})`);
    });
    
    await connection.end();
    
    // Test different date formats
    const testDates = [
      // Original date object converted to different formats
      testSchedule.lesson_date instanceof Date ? testSchedule.lesson_date.toISOString().split('T')[0] : testSchedule.lesson_date,
      '2025-10-02', // Explicit date that should match
      '2025-10-04', // Another date that should match
      '2025-10-01', // Date that won't match (timezone issue)
    ];
    
    console.log('\n🧪 Testing different date formats...');
    
    for (let i = 0; i < testDates.length; i++) {
      const testDate = testDates[i];
      console.log(`\n${i + 1}. Testing with date: "${testDate}"`);
      
      // Create sample attendance data
      const attendanceData = students.map(student => ({
        student_id: student.student_id,
        status: 'present',
        note: 'Test attendance'
      }));
      
      const result = await saveAttendance(
        testSchedule.class_id,
        testSchedule.teacher_id,
        testDate,
        attendanceData
      );
      
      if (result.success) {
        console.log('   ✅ Attendance saved successfully!');
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    }
    
    console.log('\n🎉 Attendance fix test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAttendanceFix();
