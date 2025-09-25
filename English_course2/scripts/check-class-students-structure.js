const mysql = require('mysql2/promise');

async function checkClassStudentsStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    console.log('📋 Checking class_students table structure...\n');
    
    const [rows] = await connection.execute('DESCRIBE class_students');
    console.log('class_students table columns:');
    rows.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('\n📋 Sample class_students data:');
    const [students] = await connection.execute(`
      SELECT * FROM class_students LIMIT 3
    `);
    
    students.forEach((student, index) => {
      console.log(`\nStudent ${index + 1}:`);
      Object.keys(student).forEach(key => {
        console.log(`  ${key}: ${student[key]}`);
      });
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkClassStudentsStructure();
