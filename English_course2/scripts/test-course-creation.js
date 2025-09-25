const mysql = require('mysql2/promise')

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system',
}

// Import the createCourse function (simulate it here for testing)
async function createCourse(courseData) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Check if course name already exists
    const [existingCourse] = await connection.execute(
      'SELECT course_id FROM courses WHERE course_name = ?',
      [courseData.courseName]
    )

    if (Array.isArray(existingCourse) && existingCourse.length > 0) {
      return {
        success: false,
        error: 'A course with this name already exists'
      }
    }

    // Insert new course
    const [result] = await connection.execute(`
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
      courseData.courseName,
      courseData.description,
      courseData.level,
      courseData.durationWeeks,
      courseData.price,
      courseData.maxStudents,
      courseData.isActive ? 1 : 0
    ])

    const insertResult = result
    if (insertResult.insertId) {
      // Fetch the created course
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
      `, [insertResult.insertId])

      const course = courseRows[0]
      
      return {
        success: true,
        course: {
          courseId: course.course_id,
          courseName: course.course_name,
          description: course.description,
          level: course.level,
          durationWeeks: course.duration_weeks,
          price: parseFloat(course.price),
          maxStudents: course.max_students,
          isActive: Boolean(course.is_active),
          createdAt: course.created_at
        }
      }
    }

    return {
      success: false,
      error: 'Failed to create course'
    }
  } catch (error) {
    console.error('Error creating course:', error)
    return {
      success: false,
      error: 'Database error occurred'
    }
  } finally {
    await connection.end()
  }
}

async function testCourseCreation() {
  console.log('🧪 Testing Course Creation Functionality\n')

  // Test data
  const testCourses = [
    {
      courseName: 'Business English Fundamentals',
      description: 'Learn essential business English skills for professional communication, including email writing, presentations, and meetings.',
      level: 'Intermediate',
      durationWeeks: 16,
      price: 299.99,
      maxStudents: 25,
      isActive: true
    },
    {
      courseName: 'TOEFL Preparation Course',
      description: 'Comprehensive TOEFL preparation covering all four skills: reading, listening, speaking, and writing.',
      level: 'Advanced',
      durationWeeks: 20,
      price: 399.99,
      maxStudents: 20,
      isActive: true
    },
    {
      courseName: 'English for Kids (Ages 6-10)',
      description: 'Fun and interactive English learning for young children with games, songs, and activities.',
      level: 'Beginner',
      durationWeeks: 8,
      price: 149.99,
      maxStudents: 15,
      isActive: true
    }
  ]

  for (let i = 0; i < testCourses.length; i++) {
    const courseData = testCourses[i]
    console.log(`📚 Test ${i + 1}: Creating "${courseData.courseName}"`)
    
    try {
      const result = await createCourse(courseData)
      
      if (result.success) {
        console.log('✅ Course created successfully!')
        console.log(`   ID: ${result.course.courseId}`)
        console.log(`   Name: ${result.course.courseName}`)
        console.log(`   Level: ${result.course.level}`)
        console.log(`   Duration: ${result.course.durationWeeks} weeks`)
        console.log(`   Price: $${result.course.price}`)
        console.log(`   Max Students: ${result.course.maxStudents}`)
        console.log(`   Active: ${result.course.isActive ? 'Yes' : 'No'}`)
      } else {
        console.log('❌ Course creation failed!')
        console.log(`   Error: ${result.error}`)
      }
    } catch (error) {
      console.log('❌ Unexpected error!')
      console.log(`   Error: ${error.message}`)
    }
    
    console.log('')
  }

  // Test duplicate course name
  console.log('🔄 Test 4: Testing duplicate course name validation')
  try {
    const duplicateResult = await createCourse(testCourses[0]) // Try to create the first course again
    
    if (!duplicateResult.success) {
      console.log('✅ Duplicate validation working correctly!')
      console.log(`   Error: ${duplicateResult.error}`)
    } else {
      console.log('❌ Duplicate validation failed - course was created!')
    }
  } catch (error) {
    console.log('❌ Unexpected error during duplicate test!')
    console.log(`   Error: ${error.message}`)
  }

  console.log('\n📊 Final course count:')
  try {
    const connection = await mysql.createConnection(connectionConfig)
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM courses')
    console.log(`   Total courses: ${count[0].count}`)
    await connection.end()
  } catch (error) {
    console.log(`   Error getting count: ${error.message}`)
  }

  console.log('\n🎉 Course creation testing completed!')
}

testCourseCreation()
