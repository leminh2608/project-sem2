const mysql = require('mysql2/promise');

async function testAttendanceFixV2() {
  try {
    console.log('🧪 Testing Attendance Fix V2 (Timezone-Safe)...\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    // Test the new query approach directly
    console.log('1. Testing new date comparison query...');
    
    const testClassId = 1;
    const testDates = ['2025-10-01', '2025-10-02', '2025-10-04'];
    
    for (const testDate of testDates) {
      console.log(`\n   Testing date: ${testDate}`);
      
      // Test the new query approach
      const [scheduleRows] = await connection.execute(`
        SELECT schedule_id, lesson_date FROM schedules 
        WHERE class_id = ? 
        AND YEAR(lesson_date) = YEAR(?)
        AND MONTH(lesson_date) = MONTH(?)
        AND DAY(lesson_date) = DAY(?)
      `, [testClassId, testDate, testDate, testDate]);
      
      console.log(`   Result: ${scheduleRows.length} schedules found`);
      
      if (scheduleRows.length > 0) {
        scheduleRows.forEach(schedule => {
          console.log(`   - Schedule ID: ${schedule.schedule_id}, Date: ${schedule.lesson_date}`);
        });
      }
    }
    
    // Show all schedules for comparison
    console.log('\n2. All schedules in class 1:');
    const [allSchedules] = await connection.execute(`
      SELECT schedule_id, lesson_date,
             CONCAT(YEAR(lesson_date), '-', 
                    LPAD(MONTH(lesson_date), 2, '0'), '-', 
                    LPAD(DAY(lesson_date), 2, '0')) as date_formatted
      FROM schedules WHERE class_id = ?
    `, [testClassId]);
    
    allSchedules.forEach(schedule => {
      console.log(`   - Schedule ID: ${schedule.schedule_id}, Date: ${schedule.lesson_date}, Formatted: ${schedule.date_formatted}`);
    });
    
    await connection.end();
    
    // Test the complete saveAttendance function with the fix
    console.log('\n3. Testing complete saveAttendance function...');
    
    // Import the actual function (simulate it here)
    async function saveAttendanceFixed(classId, teacherId, date, attendance) {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'english_course_system'
      });

      try {
        await connection.beginTransaction();

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

        // Get the schedule_id for this class and date using the new approach
        const [scheduleRows] = await connection.execute(`
          SELECT schedule_id, lesson_date FROM schedules 
          WHERE class_id = ? 
          AND YEAR(lesson_date) = YEAR(?)
          AND MONTH(lesson_date) = MONTH(?)
          AND DAY(lesson_date) = DAY(?)
        `, [classId, date, date, date]);

        console.log(`[DEBUG] Schedule query result: ${scheduleRows.length} schedules found`);
        
        if (scheduleRows.length === 0) {
          const [allClassSchedules] = await connection.execute(`
            SELECT schedule_id, lesson_date,
                   CONCAT(YEAR(lesson_date), '-', 
                          LPAD(MONTH(lesson_date), 2, '0'), '-', 
                          LPAD(DAY(lesson_date), 2, '0')) as date_formatted
            FROM schedules WHERE class_id = ?
          `, [classId]);
          
          console.log(`[DEBUG] All schedules for class ${classId}:`, allClassSchedules);
          console.log(`[DEBUG] Looking for date: ${date}`);
          
          await connection.rollback();
          return { success: false, error: `No schedule found for this class and date. Available dates: ${allClassSchedules.map(s => s.date_formatted).join(', ')}` };
        }

        const scheduleId = scheduleRows[0].schedule_id;
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
    
    // Test with sample data
    const sampleAttendance = [
      { student_id: 4, status: 'present', note: 'On time' },
      { student_id: 5, status: 'absent', note: 'Sick' }
    ];
    
    const testCases = [
      { date: '2025-10-02', shouldWork: true },
      { date: '2025-10-04', shouldWork: true },
      { date: '2025-10-01', shouldWork: true }, // This should now work!
      { date: '2025-10-03', shouldWork: false }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n   Testing attendance save for date: ${testCase.date}`);
      
      const result = await saveAttendanceFixed(1, 2, testCase.date, sampleAttendance);
      
      if (result.success) {
        console.log(`   ✅ Success! Attendance saved for ${testCase.date}`);
      } else {
        console.log(`   ${testCase.shouldWork ? '❌' : '✅'} ${result.error}`);
      }
    }
    
    console.log('\n🎉 Attendance fix V2 test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAttendanceFixV2();
