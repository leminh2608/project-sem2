const mysql = require('mysql2/promise');

async function checkCourseSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    console.log('📋 Checking courses table structure...\n');
    
    const [rows] = await connection.execute('DESCRIBE courses');
    console.log('Courses table columns:');
    rows.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('\n📋 Sample courses data:');
    const [courses] = await connection.execute(`
      SELECT * FROM courses LIMIT 3
    `);
    
    courses.forEach((course, index) => {
      console.log(`\nCourse ${index + 1}:`);
      Object.keys(course).forEach(key => {
        console.log(`  ${key}: ${course[key]}`);
      });
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCourseSchema();
