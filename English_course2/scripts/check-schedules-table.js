const mysql = require('mysql2/promise')

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system'
}

async function checkSchedulesTable() {
  const connection = await mysql.createConnection(connectionConfig)
  
  try {
    console.log('🔍 Checking schedules table structure...')
    
    // Check table structure
    const [columns] = await connection.execute('DESCRIBE schedules')
    console.log('\n📋 Current schedules table structure:')
    console.table(columns)
    
    // Check if there's any data
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM schedules')
    console.log(`\n📊 Number of records in schedules table: ${rows[0].count}`)
    
    // Show sample data if exists
    if (rows[0].count > 0) {
      const [sampleData] = await connection.execute('SELECT * FROM schedules LIMIT 3')
      console.log('\n📝 Sample data:')
      console.table(sampleData)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await connection.end()
  }
}

checkSchedulesTable()
