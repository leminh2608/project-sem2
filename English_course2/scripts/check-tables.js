const mysql = require('mysql2/promise');

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });

    console.log('✅ Connected to database');

    // Check what tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables in database:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check users table structure
    if (tables.length > 0) {
      console.log('\n📊 Users table structure:');
      const [columns] = await connection.execute('DESCRIBE users');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }

    await connection.end();
    console.log('✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkTables();
