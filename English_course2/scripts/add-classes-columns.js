const mysql = require('mysql2/promise')

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system',
}

async function addClassesColumns() {
  console.log('🔧 Adding Missing Columns to Classes Table\n')

  let connection
  
  try {
    connection = await mysql.createConnection(connectionConfig)

    // Check current classes table structure
    console.log('📋 Current classes table structure:')
    const [columns] = await connection.execute('DESCRIBE classes')
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`)
    })

    // Add missing columns if they don't exist
    const columnNames = columns.map(col => col.Field)
    
    if (!columnNames.includes('max_students')) {
      console.log('\n➕ Adding max_students column...')
      await connection.execute(`
        ALTER TABLE classes 
        ADD COLUMN max_students INT DEFAULT 30 NOT NULL
      `)
      console.log('   ✅ max_students column added')
    } else {
      console.log('\n✅ max_students column already exists')
    }

    if (!columnNames.includes('start_date')) {
      console.log('\n➕ Adding start_date column...')
      await connection.execute(`
        ALTER TABLE classes 
        ADD COLUMN start_date DATE NULL
      `)
      console.log('   ✅ start_date column added')
    } else {
      console.log('\n✅ start_date column already exists')
    }

    if (!columnNames.includes('end_date')) {
      console.log('\n➕ Adding end_date column...')
      await connection.execute(`
        ALTER TABLE classes 
        ADD COLUMN end_date DATE NULL
      `)
      console.log('   ✅ end_date column added')
    } else {
      console.log('\n✅ end_date column already exists')
    }

    if (!columnNames.includes('created_at')) {
      console.log('\n➕ Adding created_at column...')
      await connection.execute(`
        ALTER TABLE classes 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `)
      console.log('   ✅ created_at column added')
    } else {
      console.log('\n✅ created_at column already exists')
    }

    if (!columnNames.includes('updated_at')) {
      console.log('\n➕ Adding updated_at column...')
      await connection.execute(`
        ALTER TABLE classes 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `)
      console.log('   ✅ updated_at column added')
    } else {
      console.log('\n✅ updated_at column already exists')
    }

    // Update existing classes with default values
    console.log('\n🔄 Updating existing classes with default values...')
    await connection.execute(`
      UPDATE classes 
      SET max_students = 30 
      WHERE max_students IS NULL OR max_students = 0
    `)

    // Show updated table structure
    console.log('\n📋 Updated classes table structure:')
    const [updatedColumns] = await connection.execute('DESCRIBE classes')
    updatedColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`)
    })

    // Test the updated structure
    console.log('\n🧪 Testing updated structure...')
    const [testQuery] = await connection.execute(`
      SELECT 
        c.class_id,
        c.class_name,
        c.max_students,
        c.start_date,
        c.end_date,
        c.created_at,
        co.course_name
      FROM classes c
      INNER JOIN courses co ON c.course_id = co.course_id
      LIMIT 3
    `)

    console.log('   Test query results:')
    testQuery.forEach(cls => {
      console.log(`   - ${cls.class_name}: max ${cls.max_students} students, course: ${cls.course_name}`)
    })

    console.log('\n✅ Classes table enhancement completed successfully!')
    console.log('🎉 Teacher class CRUD functionality is now fully supported!')

  } catch (error) {
    console.error('❌ Error updating classes table:', error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 Database connection closed')
    }
  }
}

addClassesColumns()
