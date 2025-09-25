const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // First, connect without specifying database to create it
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`
      CREATE DATABASE IF NOT EXISTS english_course_system 
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    
    console.log('✅ Database "english_course_system" created/verified');

    // Close connection
    await connection.end();

    // Now test connection to the specific database
    const dbConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });

    console.log('✅ Connected to english_course_system database');
    
    // Test a simple query
    const [rows] = await dbConnection.execute('SELECT 1 as test');
    console.log('✅ Database query test successful:', rows);

    await dbConnection.end();
    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
