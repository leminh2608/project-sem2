const mysql = require('mysql2/promise');

async function checkSchedulesStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    console.log('📋 Checking schedules table structure...\n');
    
    const [rows] = await connection.execute('DESCRIBE schedules');
    console.log('Schedules table columns:');
    rows.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('\n📋 Sample schedules data:');
    const [schedules] = await connection.execute(`
      SELECT * FROM schedules LIMIT 3
    `);
    
    schedules.forEach((schedule, index) => {
      console.log(`\nSchedule ${index + 1}:`);
      Object.keys(schedule).forEach(key => {
        console.log(`  ${key}: ${schedule[key]}`);
      });
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchedulesStructure();
