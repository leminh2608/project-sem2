const mysql = require('mysql2/promise');

async function debugAttendanceIssue() {
  try {
    console.log('🔍 Debugging Attendance Saving Issue...\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    // Step 1: Check all schedules in database
    console.log('1. Checking all schedules in database...');
    const [schedules] = await connection.execute(`
      SELECT s.schedule_id, s.class_id, s.lesson_date, s.start_time, s.end_time, 
             c.class_name, u.full_name as teacher_name, u.user_id as teacher_id
      FROM schedules s
      INNER JOIN classes c ON s.class_id = c.class_id
      INNER JOIN users u ON c.teacher_id = u.user_id
      ORDER BY s.lesson_date
    `);
    
    console.log(`   Found ${schedules.length} schedules:`);
    schedules.forEach(schedule => {
      console.log(`   - Schedule ID: ${schedule.schedule_id}, Class: ${schedule.class_id} (${schedule.class_name})`);
      console.log(`     Date: ${schedule.lesson_date}, Teacher: ${schedule.teacher_name} (ID: ${schedule.teacher_id})`);
      console.log(`     Time: ${schedule.start_time} - ${schedule.end_time}`);
      console.log('');
    });
    
    if (schedules.length === 0) {
      console.log('   ❌ No schedules found in database!');
      await connection.end();
      return;
    }
    
    // Step 2: Analyze date format
    console.log('2. Analyzing date format...');
    const sampleSchedule = schedules[0];
    const sampleDate = sampleSchedule.lesson_date;
    
    console.log(`   Sample date: ${sampleDate}`);
    console.log(`   Date type: ${typeof sampleDate}`);
    console.log(`   Date constructor: ${sampleDate.constructor.name}`);
    
    if (sampleDate instanceof Date) {
      console.log(`   ISO string: ${sampleDate.toISOString()}`);
      console.log(`   YYYY-MM-DD format: ${sampleDate.toISOString().split('T')[0]}`);
    } else {
      console.log(`   String value: "${sampleDate}"`);
    }
    
    // Step 3: Test the exact query used in saveAttendance
    console.log('3. Testing saveAttendance query logic...');
    const testClassId = sampleSchedule.class_id;
    const testTeacherId = sampleSchedule.teacher_id;
    
    // Test different date formats
    const dateFormats = [
      sampleDate, // Original format
      sampleDate instanceof Date ? sampleDate.toISOString().split('T')[0] : sampleDate, // YYYY-MM-DD
      sampleDate instanceof Date ? sampleDate.toISOString() : sampleDate, // Full ISO
    ];
    
    for (let i = 0; i < dateFormats.length; i++) {
      const testDate = dateFormats[i];
      console.log(`   Testing date format ${i + 1}: "${testDate}" (type: ${typeof testDate})`);
      
      try {
        const [scheduleRows] = await connection.execute(`
          SELECT schedule_id FROM schedules WHERE class_id = ? AND lesson_date = ?
        `, [testClassId, testDate]);
        
        console.log(`   ✅ Query successful: Found ${scheduleRows.length} schedules`);
        if (scheduleRows.length > 0) {
          console.log(`   Schedule ID: ${scheduleRows[0].schedule_id}`);
        }
      } catch (error) {
        console.log(`   ❌ Query failed: ${error.message}`);
      }
    }
    
    // Step 4: Test teacher authorization
    console.log('4. Testing teacher authorization...');
    try {
      const [classCheck] = await connection.execute(`
        SELECT 1 FROM classes WHERE class_id = ? AND teacher_id = ?
      `, [testClassId, testTeacherId]);
      
      console.log(`   Teacher authorization check: ${classCheck.length > 0 ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.log(`   ❌ Authorization check failed: ${error.message}`);
    }
    
    // Step 5: Check if there are any students in the class
    console.log('5. Checking class students...');
    try {
      const [students] = await connection.execute(`
        SELECT cs.student_id, u.full_name
        FROM class_students cs
        INNER JOIN users u ON cs.student_id = u.user_id
        WHERE cs.class_id = ?
      `, [testClassId]);
      
      console.log(`   Found ${students.length} students in class ${testClassId}:`);
      students.forEach(student => {
        console.log(`   - ${student.full_name} (ID: ${student.student_id})`);
      });
    } catch (error) {
      console.log(`   ❌ Student check failed: ${error.message}`);
    }
    
    // Step 6: Simulate the complete saveAttendance function
    console.log('6. Simulating complete saveAttendance function...');
    const testDate = sampleDate instanceof Date ? sampleDate.toISOString().split('T')[0] : sampleDate;
    
    console.log(`   Using parameters:`);
    console.log(`   - classId: ${testClassId}`);
    console.log(`   - teacherId: ${testTeacherId}`);
    console.log(`   - date: "${testDate}"`);
    
    try {
      // Verify teacher owns this class
      const [classCheck] = await connection.execute(`
        SELECT 1 FROM classes WHERE class_id = ? AND teacher_id = ?
      `, [testClassId, testTeacherId]);
      
      if (classCheck.length === 0) {
        console.log('   ❌ Teacher authorization failed');
      } else {
        console.log('   ✅ Teacher authorization passed');
        
        // Get the schedule_id for this class and date
        const [scheduleRows] = await connection.execute(`
          SELECT schedule_id FROM schedules WHERE class_id = ? AND lesson_date = ?
        `, [testClassId, testDate]);
        
        if (scheduleRows.length === 0) {
          console.log('   ❌ No schedule found for this class and date');
          console.log(`   Query: SELECT schedule_id FROM schedules WHERE class_id = ${testClassId} AND lesson_date = '${testDate}'`);
        } else {
          console.log('   ✅ Schedule found successfully');
          console.log(`   Schedule ID: ${scheduleRows[0].schedule_id}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Simulation failed: ${error.message}`);
    }
    
    await connection.end();
    console.log('\n🎉 Debug analysis completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAttendanceIssue();
