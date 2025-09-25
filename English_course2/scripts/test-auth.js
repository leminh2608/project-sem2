const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testAuth() {
  try {
    console.log('🔍 Testing authentication logic...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });

    console.log('✅ Connected to database');

    // Test finding user by email
    const testEmail = 'admin@example.com';
    const testPassword = 'admin123';
    
    const [rows] = await connection.execute(
      'SELECT user_id, full_name, email, password, role, created_at FROM users WHERE email = ?',
      [testEmail]
    );
    
    const users = rows;
    console.log('📋 Found users:', users.length);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('👤 User found:', {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role
      });
      
      // Test password comparison
      console.log('🔐 Testing password...');
      const isPasswordValid = await bcrypt.compare(testPassword, user.password);
      console.log('🔐 Password valid:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('✅ Authentication test successful!');
        console.log('🎉 User can login with:', testEmail, '/', testPassword);
      } else {
        console.log('❌ Password verification failed');
        
        // Let's check what the stored password hash looks like
        console.log('🔍 Stored password hash:', user.password);
        
        // Try to hash the test password and compare
        const newHash = await bcrypt.hash(testPassword, 12);
        console.log('🔍 New hash for comparison:', newHash);
      }
    } else {
      console.log('❌ No user found with email:', testEmail);
    }

    await connection.end();
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  }
}

testAuth();
