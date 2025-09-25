const mysql = require('mysql2/promise')

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system',
}

async function checkAllTables() {
  let connection
  
  try {
    connection = await mysql.createConnection(connectionConfig)
    console.log('✅ Connected to database')

    // Get all tables
    const [tables] = await connection.execute(`
      SHOW TABLES
    `)

    console.log('\n📋 All tables in database:')
    for (const table of tables) {
      const tableName = Object.values(table)[0]
      console.log(`\n🔸 Table: ${tableName}`)
      
      // Get table structure
      const [columns] = await connection.execute(`
        DESCRIBE ${tableName}
      `)

      columns.forEach(column => {
        console.log(`    - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${column.Key ? `[${column.Key}]` : ''}`)
      })

      // Get row count
      const [count] = await connection.execute(`
        SELECT COUNT(*) as count FROM ${tableName}
      `)
      console.log(`    📊 Rows: ${count[0].count}`)
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

checkAllTables()
