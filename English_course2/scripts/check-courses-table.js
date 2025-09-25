const mysql = require('mysql2/promise')

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system',
}

async function checkCoursesTable() {
  let connection
  
  try {
    connection = await mysql.createConnection(connectionConfig)
    console.log('✅ Connected to database')

    // Check if courses table exists and get its structure
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'courses'
    `)

    if (tables.length === 0) {
      console.log('❌ Courses table does not exist')
      return
    }

    console.log('✅ Courses table exists')

    // Get table structure
    const [columns] = await connection.execute(`
      DESCRIBE courses
    `)

    console.log('\n📋 Courses table structure:')
    columns.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${column.Key ? `[${column.Key}]` : ''}`)
    })

    // Check if we have any existing courses
    const [courseCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM courses
    `)

    console.log(`\n📊 Total courses in database: ${courseCount[0].count}`)

    // Show sample courses if any exist
    if (courseCount[0].count > 0) {
      const [sampleCourses] = await connection.execute(`
        SELECT course_id, course_name, level, created_at 
        FROM courses 
        ORDER BY created_at DESC 
        LIMIT 5
      `)

      console.log('\n📚 Sample courses:')
      sampleCourses.forEach(course => {
        console.log(`  - ID: ${course.course_id}, Name: "${course.course_name}", Level: ${course.level}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 Database connection closed')
    }
  }
}

checkCoursesTable()
