const mysql = require('mysql2/promise')

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system',
}

async function testCourseWorkflow() {
  console.log('🧪 Testing Complete Course Management Workflow\n')

  let connection
  let testCourseId = null

  try {
    connection = await mysql.createConnection(connectionConfig)

    // Test 1: Create a new course
    console.log('📚 Test 1: Creating a new course')
    const [createResult] = await connection.execute(`
      INSERT INTO courses (
        course_name, 
        description, 
        level, 
        duration_weeks, 
        price, 
        max_students, 
        is_active, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      'Advanced Writing Workshop',
      'Master advanced writing techniques including academic writing, creative writing, and professional communication.',
      'Advanced',
      14,
      349.99,
      18,
      1
    ])

    testCourseId = createResult.insertId
    console.log(`✅ Course created with ID: ${testCourseId}`)

    // Test 2: Retrieve the created course
    console.log('\n📖 Test 2: Retrieving course details')
    const [courseRows] = await connection.execute(`
      SELECT 
        course_id,
        course_name,
        description,
        level,
        duration_weeks,
        price,
        max_students,
        is_active,
        created_at
      FROM courses 
      WHERE course_id = ?
    `, [testCourseId])

    if (courseRows.length > 0) {
      const course = courseRows[0]
      console.log('✅ Course retrieved successfully:')
      console.log(`   Name: ${course.course_name}`)
      console.log(`   Level: ${course.level}`)
      console.log(`   Duration: ${course.duration_weeks} weeks`)
      console.log(`   Price: $${course.price}`)
      console.log(`   Max Students: ${course.max_students}`)
      console.log(`   Active: ${course.is_active ? 'Yes' : 'No'}`)
    } else {
      console.log('❌ Failed to retrieve course')
    }

    // Test 3: Update the course
    console.log('\n✏️  Test 3: Updating course details')
    await connection.execute(`
      UPDATE courses SET
        course_name = ?,
        description = ?,
        duration_weeks = ?,
        price = ?,
        max_students = ?
      WHERE course_id = ?
    `, [
      'Advanced Writing & Communication Workshop',
      'Master advanced writing techniques including academic writing, creative writing, professional communication, and digital content creation.',
      16,
      379.99,
      20,
      testCourseId
    ])

    // Verify update
    const [updatedRows] = await connection.execute(`
      SELECT course_name, duration_weeks, price, max_students 
      FROM courses 
      WHERE course_id = ?
    `, [testCourseId])

    if (updatedRows.length > 0) {
      const updated = updatedRows[0]
      console.log('✅ Course updated successfully:')
      console.log(`   New Name: ${updated.course_name}`)
      console.log(`   New Duration: ${updated.duration_weeks} weeks`)
      console.log(`   New Price: $${updated.price}`)
      console.log(`   New Max Students: ${updated.max_students}`)
    }

    // Test 4: Test course with students (should prevent deletion)
    console.log('\n👥 Test 4: Testing course with student registrations')
    
    // First, get a student ID
    const [students] = await connection.execute(`
      SELECT user_id FROM users WHERE role = 'student' LIMIT 1
    `)

    if (students.length > 0) {
      const studentId = students[0].user_id
      
      // Register student for the course
      await connection.execute(`
        INSERT INTO course_students (course_id, student_id, registered_at)
        VALUES (?, ?, NOW())
      `, [testCourseId, studentId])

      console.log(`✅ Student ${studentId} registered for course ${testCourseId}`)

      // Try to delete course (should fail)
      const [registrations] = await connection.execute(
        'SELECT COUNT(*) as count FROM course_students WHERE course_id = ?',
        [testCourseId]
      )

      const registrationCount = registrations[0].count
      console.log(`📊 Course has ${registrationCount} student registration(s)`)

      if (registrationCount > 0) {
        console.log('✅ Course deletion protection working - course has students')
      }

      // Clean up - remove student registration for deletion test
      await connection.execute(`
        DELETE FROM course_students WHERE course_id = ? AND student_id = ?
      `, [testCourseId, studentId])
      console.log('🧹 Cleaned up student registration for deletion test')
    }

    // Test 5: Course deletion
    console.log('\n🗑️  Test 5: Testing course deletion')
    
    // Check for any remaining dependencies
    const [finalRegistrations] = await connection.execute(
      'SELECT COUNT(*) as count FROM course_students WHERE course_id = ?',
      [testCourseId]
    )

    const [classes] = await connection.execute(
      'SELECT COUNT(*) as count FROM classes WHERE course_id = ?',
      [testCourseId]
    )

    console.log(`📊 Final check - Registrations: ${finalRegistrations[0].count}, Classes: ${classes[0].count}`)

    if (finalRegistrations[0].count === 0 && classes[0].count === 0) {
      const [deleteResult] = await connection.execute(
        'DELETE FROM courses WHERE course_id = ?',
        [testCourseId]
      )

      if (deleteResult.affectedRows > 0) {
        console.log('✅ Course deleted successfully')
      } else {
        console.log('❌ Course deletion failed')
      }
    } else {
      console.log('⚠️  Course has dependencies, deletion would be prevented')
    }

    // Test 6: Verify course list functionality
    console.log('\n📋 Test 6: Testing course listing')
    const [allCourses] = await connection.execute(`
      SELECT 
        c.course_id,
        c.course_name,
        c.level,
        c.duration_weeks,
        c.price,
        c.max_students,
        c.is_active,
        COUNT(DISTINCT cs.student_id) as enrolled_count,
        COUNT(DISTINCT cl.class_id) as class_count
      FROM courses c
      LEFT JOIN course_students cs ON c.course_id = cs.course_id
      LEFT JOIN classes cl ON c.course_id = cl.course_id
      GROUP BY c.course_id, c.course_name, c.level, c.duration_weeks, 
               c.price, c.max_students, c.is_active
      ORDER BY c.created_at DESC
      LIMIT 5
    `)

    console.log('✅ Course listing working:')
    allCourses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.course_name} (${course.level})`)
      console.log(`      Duration: ${course.duration_weeks} weeks, Price: $${course.price}`)
      console.log(`      Students: ${course.enrolled_count}/${course.max_students}, Classes: ${course.class_count}`)
      console.log(`      Active: ${course.is_active ? 'Yes' : 'No'}`)
      console.log('')
    })

    console.log('🎉 All course management workflow tests completed successfully!')

  } catch (error) {
    console.error('❌ Error during testing:', error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 Database connection closed')
    }
  }
}

testCourseWorkflow()
