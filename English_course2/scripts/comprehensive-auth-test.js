const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function comprehensiveAuthTest() {
  try {
    console.log('🧪 Running comprehensive authentication tests...\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });

    console.log('✅ Connected to database\n');

    // Test cases
    const testCases = [
      { email: 'admin@example.com', password: 'admin123', expected: true },
      { email: 'ADMIN@EXAMPLE.COM', password: 'admin123', expected: true }, // Case sensitivity test
      { email: 'admin@example.com', password: 'wrongpassword', expected: false },
      { email: 'teacher.a@example.com', password: 'teacher123', expected: true },
      { email: 'student.c@example.com', password: 'student123', expected: true },
      { email: 'nonexistent@example.com', password: 'anypassword', expected: false },
    ];

    for (const testCase of testCases) {
      console.log(`🔍 Testing: ${testCase.email} / ${testCase.password}`);
      
      // Simulate the findUserByEmail function
      const [rows] = await connection.execute(
        'SELECT user_id, full_name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
        [testCase.email]
      );

      const users = rows;
      
      if (users.length === 0) {
        console.log(`   📋 User not found: ${testCase.expected ? '❌ FAIL' : '✅ PASS'}`);
        continue;
      }

      const user = users[0];
      console.log(`   👤 User found: ${user.full_name} (${user.role})`);

      // Test password comparison
      const isPasswordValid = await bcrypt.compare(testCase.password, user.password);
      const result = isPasswordValid === testCase.expected;
      
      console.log(`   🔐 Password valid: ${isPasswordValid} - ${result ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!result) {
        console.log(`   ⚠️  Expected: ${testCase.expected}, Got: ${isPasswordValid}`);
      }
      
      console.log('');
    }

    // Test case sensitivity in email lookup
    console.log('📧 Testing email case sensitivity...');
    const [lowerRows] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      ['admin@example.com']
    );
    const [upperRows] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      ['ADMIN@EXAMPLE.COM']
    );
    
    console.log(`   Lowercase lookup: ${lowerRows.length} results`);
    console.log(`   Uppercase lookup: ${upperRows.length} results`);
    
    if (lowerRows.length > 0 && upperRows.length === 0) {
      console.log('   ⚠️  Email lookup is case-sensitive - this might cause login issues');
    } else {
      console.log('   ✅ Email lookup handling appears correct');
    }

    await connection.end();
    console.log('\n🎉 Comprehensive authentication test completed!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error(error);
  }
}

comprehensiveAuthTest();
