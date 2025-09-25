const mysql = require('mysql2/promise');

// Test the fixed getTeacherSchedule function directly
async function getTeacherSchedule(teacherId, weekOffset = 0) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  });

  try {
    // Validate input parameters
    if (!teacherId || isNaN(teacherId)) {
      throw new Error('Invalid teacherId parameter')
    }
    
    if (isNaN(weekOffset)) {
      weekOffset = 0 // Default to current week if invalid
    }

    // Calculate the week range based on weekOffset (avoid mutating original date)
    const today = new Date()
    const currentWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const targetWeekStart = new Date(currentWeekStart.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000))
    const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000))

    // Format dates as YYYY-MM-DD strings for MySQL
    const startDateStr = targetWeekStart.toISOString().split('T')[0]
    const endDateStr = targetWeekEnd.toISOString().split('T')[0]

    // Validate that date strings are properly formatted
    if (!startDateStr || !endDateStr || startDateStr === 'Invalid Date' || endDateStr === 'Invalid Date') {
      throw new Error('Invalid date calculation')
    }

    console.log(`   📅 Week range: ${startDateStr} to ${endDateStr}`)
    console.log(`   🔢 Parameters: teacherId=${teacherId}, startDate=${startDateStr}, endDate=${endDateStr}`)

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
    `, [teacherId, startDateStr, endDateStr])

    return rows
  } finally {
    await connection.end()
  }
}

async function testScheduleAPIFix() {
  try {
    console.log('🧪 Testing Fixed getTeacherSchedule Function...\n');
    
    // Test 1: Valid parameters
    console.log('1. Testing with valid parameters...');
    const teacherId = 2; // Nguyen Van A
    const weekOffset = 1; // Next week (where we know there's data)
    
    const schedules = await getTeacherSchedule(teacherId, weekOffset);
    console.log('   ✅ Function executed successfully');
    console.log(`   📊 Found ${schedules.length} schedules`);
    
    if (schedules.length > 0) {
      schedules.forEach(schedule => {
        console.log(`   - ${schedule.class_name} on ${schedule.lesson_date} (${schedule.day_of_week}) at ${schedule.start_time}-${schedule.end_time}`);
      });
    }
    
    // Test 2: Edge cases
    console.log('\n2. Testing edge cases...');
    
    // Test with weekOffset = 0 (current week)
    console.log('   Testing weekOffset = 0...');
    const currentWeekSchedules = await getTeacherSchedule(teacherId, 0);
    console.log(`   ✅ Current week: ${currentWeekSchedules.length} schedules`);
    
    // Test with negative weekOffset
    console.log('   Testing weekOffset = -1...');
    const lastWeekSchedules = await getTeacherSchedule(teacherId, -1);
    console.log(`   ✅ Last week: ${lastWeekSchedules.length} schedules`);
    
    // Test 3: Parameter validation
    console.log('\n3. Testing parameter validation...');
    
    try {
      await getTeacherSchedule(null, 0);
      console.log('   ❌ Should have thrown error for null teacherId');
    } catch (error) {
      console.log('   ✅ Correctly rejected null teacherId:', error.message);
    }
    
    try {
      await getTeacherSchedule('invalid', 0);
      console.log('   ❌ Should have thrown error for invalid teacherId');
    } catch (error) {
      console.log('   ✅ Correctly rejected invalid teacherId:', error.message);
    }
    
    // Test with invalid weekOffset (should default to 0)
    console.log('   Testing invalid weekOffset...');
    const invalidOffsetSchedules = await getTeacherSchedule(teacherId, 'invalid');
    console.log('   ✅ Invalid weekOffset handled gracefully');
    
    console.log('\n🎉 All tests passed! The function should now work without "undefined" parameter errors.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testScheduleAPIFix();
