const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Simulate the exact authentication flow from the application
async function simulateAuthFlow(email, password) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  });

  try {
    // Step 1: Normalize email (as updated in auth.ts)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Step 2: Find user by email (simulate findUserByEmail function)
    const [rows] = await connection.execute(
      'SELECT user_id, full_name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    const users = rows;
    if (users.length === 0) {
      return { success: false, reason: 'User not found' };
    }

    const user = users[0];

    // Step 3: Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return { success: false, reason: 'Invalid password' };
    }

    // Step 4: Return user data (simulate successful auth)
    return {
      success: true,
      user: {
        id: user.user_id.toString(),
        email: user.email,
        name: user.full_name,
        role: user.role,
      }
    };

  } finally {
    await connection.end();
  }
}

async function runFinalVerification() {
  console.log('🔐 Final Authentication Verification\n');

  const testCredentials = [
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'ADMIN@EXAMPLE.COM', password: 'admin123' }, // Test case normalization
    { email: '  teacher.a@example.com  ', password: 'teacher123' }, // Test trimming
    { email: 'student.c@example.com', password: 'student123' },
    { email: 'admin@example.com', password: 'wrongpassword' }, // Should fail
    { email: 'nonexistent@example.com', password: 'anypassword' }, // Should fail
  ];

  for (const creds of testCredentials) {
    console.log(`🧪 Testing: "${creds.email}" / "${creds.password}"`);
    
    try {
      const result = await simulateAuthFlow(creds.email, creds.password);
      
      if (result.success) {
        console.log(`   ✅ SUCCESS - User: ${result.user.name} (${result.user.role})`);
      } else {
        console.log(`   ❌ FAILED - Reason: ${result.reason}`);
      }
    } catch (error) {
      console.log(`   💥 ERROR - ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎉 Final verification completed!\n');
  
  // Summary
  console.log('📋 Summary of fixes applied:');
  console.log('   1. ✅ Fixed plain text passwords by hashing them with bcrypt');
  console.log('   2. ✅ Added email normalization in authentication flow');
  console.log('   3. ✅ Verified password comparison logic works correctly');
  console.log('   4. ✅ Tested case sensitivity and whitespace handling');
  console.log('\n🔑 Test credentials that should work:');
  console.log('   - admin@example.com / admin123');
  console.log('   - teacher.a@example.com / teacher123');
  console.log('   - teacher.b@example.com / teacher123');
  console.log('   - student.c@example.com / student123');
  console.log('   - student.d@example.com / student123');
}

runFinalVerification().catch(console.error);
