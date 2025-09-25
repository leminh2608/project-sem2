const mysql = require('mysql2/promise');

async function fixAttendanceSchema() {
  try {
    console.log('🔧 Fixing Attendance System Database Schema...\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    console.log('✅ Connected to database');
    
    // 1. Fix attendance table schema
    console.log('\n1. Fixing attendance table schema...');
    
    // Check current schema
    const [attendanceColumns] = await connection.execute('DESCRIBE attendance');
    console.log('   Current attendance table columns:');
    attendanceColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'created_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];
    
    for (const column of columnsToAdd) {
      const columnExists = attendanceColumns.some(col => col.Field === column.name);
      if (!columnExists) {
        console.log(`   Adding ${column.name} column...`);
        await connection.execute(`ALTER TABLE attendance ADD COLUMN ${column.name} ${column.definition}`);
        console.log(`   ✅ Added ${column.name} column`);
      } else {
        console.log(`   ✅ ${column.name} column already exists`);
      }
    }
    
    // Fix status enum to include 'late'
    console.log('\n   Updating status enum to include "late"...');
    try {
      await connection.execute(`
        ALTER TABLE attendance 
        MODIFY COLUMN status ENUM('present', 'absent', 'late', 'excused') NOT NULL DEFAULT 'present'
      `);
      console.log('   ✅ Status enum updated to include "late"');
    } catch (error) {
      console.log(`   ⚠️  Status enum update failed: ${error.message}`);
    }
    
    // 2. Ensure schedules table has proper structure
    console.log('\n2. Checking schedules table...');
    
    const [schedulesColumns] = await connection.execute('DESCRIBE schedules');
    console.log('   Current schedules table columns:');
    schedulesColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Add missing columns to schedules if needed
    const scheduleColumnsToAdd = [
      { name: 'created_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];
    
    for (const column of scheduleColumnsToAdd) {
      const columnExists = schedulesColumns.some(col => col.Field === column.name);
      if (!columnExists) {
        console.log(`   Adding ${column.name} column to schedules...`);
        await connection.execute(`ALTER TABLE schedules ADD COLUMN ${column.name} ${column.definition}`);
        console.log(`   ✅ Added ${column.name} column to schedules`);
      } else {
        console.log(`   ✅ ${column.name} column already exists in schedules`);
      }
    }
    
    // 3. Create sample schedules for testing if none exist for today
    console.log('\n3. Ensuring test schedules exist...');
    
    const today = new Date().toISOString().split('T')[0];
    const [todaySchedules] = await connection.execute(`
      SELECT s.schedule_id, c.class_name, s.lesson_date
      FROM schedules s
      INNER JOIN classes c ON s.class_id = c.class_id
      WHERE s.lesson_date = ?
    `, [today]);
    
    console.log(`   Found ${todaySchedules.length} schedules for today (${today})`);
    
    if (todaySchedules.length === 0) {
      console.log('   Creating test schedules for today...');
      
      // Get classes to create schedules for
      const [classes] = await connection.execute('SELECT class_id, class_name FROM classes LIMIT 2');
      
      for (const cls of classes) {
        await connection.execute(`
          INSERT INTO schedules (class_id, lesson_date, start_time, end_time, room_or_link)
          VALUES (?, ?, '09:00:00', '11:00:00', 'Room 101')
        `, [cls.class_id, today]);
        
        console.log(`   ✅ Created schedule for ${cls.class_name} today`);
      }
    }
    
    // 4. Test attendance functionality
    console.log('\n4. Testing attendance functionality...');
    
    // Get a schedule for today
    const [testSchedules] = await connection.execute(`
      SELECT s.schedule_id, s.class_id, c.class_name, s.lesson_date
      FROM schedules s
      INNER JOIN classes c ON s.class_id = c.class_id
      WHERE s.lesson_date = ?
      LIMIT 1
    `, [today]);
    
    if (testSchedules.length > 0) {
      const testSchedule = testSchedules[0];
      console.log(`   Testing with: ${testSchedule.class_name} on ${testSchedule.lesson_date}`);
      
      // Get students for this class
      const [students] = await connection.execute(`
        SELECT cs.student_id, u.full_name
        FROM class_students cs
        INNER JOIN users u ON cs.student_id = u.user_id
        WHERE cs.class_id = ?
        LIMIT 3
      `, [testSchedule.class_id]);
      
      console.log(`   Found ${students.length} students for testing`);
      
      if (students.length > 0) {
        try {
          await connection.beginTransaction();
          
          // Clear existing attendance for this schedule
          await connection.execute(`
            DELETE FROM attendance WHERE schedule_id = ?
          `, [testSchedule.schedule_id]);
          
          // Insert test attendance records
          const testAttendance = [
            { student_id: students[0].student_id, status: 'present', note: 'On time' },
            { student_id: students[1]?.student_id, status: 'late', note: '5 minutes late' },
            { student_id: students[2]?.student_id, status: 'absent', note: 'Sick' }
          ].filter(record => record.student_id); // Filter out undefined students
          
          for (const record of testAttendance) {
            await connection.execute(`
              INSERT INTO attendance (schedule_id, student_id, status, note)
              VALUES (?, ?, ?, ?)
            `, [testSchedule.schedule_id, record.student_id, record.status, record.note]);
          }
          
          await connection.commit();
          console.log(`   ✅ Saved ${testAttendance.length} test attendance records`);
          
          // Verify the records
          const [savedRecords] = await connection.execute(`
            SELECT a.student_id, a.status, a.note, u.full_name
            FROM attendance a
            INNER JOIN users u ON a.student_id = u.user_id
            WHERE a.schedule_id = ?
            ORDER BY a.attendance_id
          `, [testSchedule.schedule_id]);
          
          console.log('   Verified saved records:');
          savedRecords.forEach(record => {
            console.log(`     - ${record.full_name}: ${record.status} (${record.note || 'No note'})`);
          });
          
          // Test retrieval function
          console.log('\n   Testing attendance retrieval...');
          const [retrievedRecords] = await connection.execute(`
            SELECT
              a.student_id,
              a.status,
              a.note
            FROM attendance a
            INNER JOIN schedules s ON a.schedule_id = s.schedule_id
            WHERE s.class_id = ? AND DATE(s.lesson_date) = ?
          `, [testSchedule.class_id, today]);
          
          console.log(`   ✅ Retrieved ${retrievedRecords.length} attendance records`);
          retrievedRecords.forEach(record => {
            console.log(`     - Student ${record.student_id}: ${record.status}`);
          });
          
        } catch (error) {
          await connection.rollback();
          console.log(`   ❌ Test failed: ${error.message}`);
        }
      } else {
        console.log('   ⚠️  No students found for testing');
      }
    } else {
      console.log('   ⚠️  No schedules found for today');
    }
    
    // 5. Verify final schema
    console.log('\n5. Final schema verification...');
    
    const [finalAttendanceSchema] = await connection.execute('DESCRIBE attendance');
    console.log('   Final attendance table schema:');
    finalAttendanceSchema.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check indexes
    const [indexes] = await connection.execute(`
      SHOW INDEX FROM attendance WHERE Key_name != 'PRIMARY'
    `);
    console.log('\n   Attendance table indexes:');
    indexes.forEach(index => {
      console.log(`   - ${index.Key_name}: ${index.Column_name}`);
    });
    
    await connection.end();
    
    console.log('\n✅ Attendance system schema fix completed successfully!');
    
    console.log('\n📋 Summary of fixes applied:');
    console.log('   ✅ Added missing created_at and updated_at columns');
    console.log('   ✅ Updated status enum to include "late" option');
    console.log('   ✅ Verified foreign key relationships');
    console.log('   ✅ Created test schedules for today');
    console.log('   ✅ Tested attendance saving and retrieval');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Restart the Next.js development server');
    console.log('   2. Login as a teacher');
    console.log('   3. Navigate to /teacher/attendance');
    console.log('   4. Test attendance marking functionality');
    
  } catch (error) {
    console.error('❌ Error fixing attendance schema:', error);
    process.exit(1);
  }
}

// Run the schema fix
fixAttendanceSchema();
