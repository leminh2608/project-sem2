const mysql = require('mysql2/promise')

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system',
}

async function addCourseColumns() {
  let connection
  
  try {
    connection = await mysql.createConnection(connectionConfig)
    console.log('✅ Connected to database')

    // Check current table structure
    const [columns] = await connection.execute(`
      DESCRIBE courses
    `)

    console.log('\n📋 Current courses table structure:')
    const existingColumns = columns.map(col => col.Field)
    existingColumns.forEach(column => {
      console.log(`  - ${column}`)
    })

    // Add missing columns if they don't exist
    const columnsToAdd = [
      {
        name: 'duration_weeks',
        definition: 'INT DEFAULT 12 COMMENT "Course duration in weeks"'
      },
      {
        name: 'price',
        definition: 'DECIMAL(10,2) DEFAULT 0.00 COMMENT "Course price in USD"'
      },
      {
        name: 'max_students',
        definition: 'INT DEFAULT 30 COMMENT "Maximum students per course"'
      },
      {
        name: 'is_active',
        definition: 'BOOLEAN DEFAULT TRUE COMMENT "Whether course is active for registration"'
      }
    ]

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`\n➕ Adding column: ${column.name}`)
        await connection.execute(`
          ALTER TABLE courses 
          ADD COLUMN ${column.name} ${column.definition}
        `)
        console.log(`✅ Added ${column.name} column`)
      } else {
        console.log(`\n⏭️  Column ${column.name} already exists`)
      }
    }

    // Update existing courses with default values
    console.log('\n🔄 Updating existing courses with default values...')
    await connection.execute(`
      UPDATE courses 
      SET 
        duration_weeks = COALESCE(duration_weeks, 12),
        price = COALESCE(price, 0.00),
        max_students = COALESCE(max_students, 30),
        is_active = COALESCE(is_active, TRUE)
      WHERE duration_weeks IS NULL 
         OR price IS NULL 
         OR max_students IS NULL 
         OR is_active IS NULL
    `)

    // Show updated table structure
    const [updatedColumns] = await connection.execute(`
      DESCRIBE courses
    `)

    console.log('\n📋 Updated courses table structure:')
    updatedColumns.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${column.Default !== null ? `[Default: ${column.Default}]` : ''}`)
    })

    // Show sample courses with new data
    const [sampleCourses] = await connection.execute(`
      SELECT 
        course_id, 
        course_name, 
        level, 
        duration_weeks, 
        price, 
        max_students, 
        is_active 
      FROM courses 
      ORDER BY created_at DESC 
      LIMIT 5
    `)

    console.log('\n📚 Sample courses with new fields:')
    sampleCourses.forEach(course => {
      console.log(`  - ID: ${course.course_id}`)
      console.log(`    Name: "${course.course_name}"`)
      console.log(`    Level: ${course.level}`)
      console.log(`    Duration: ${course.duration_weeks} weeks`)
      console.log(`    Price: $${course.price}`)
      console.log(`    Max Students: ${course.max_students}`)
      console.log(`    Active: ${course.is_active ? 'Yes' : 'No'}`)
      console.log('')
    })

    console.log('✅ Course table enhancement completed!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 Database connection closed')
    }
  }
}

addCourseColumns()
