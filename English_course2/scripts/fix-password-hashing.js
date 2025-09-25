const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixPasswordHashing() {
  try {
    console.log('🔧 Starting password hashing fix...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });

    console.log('✅ Connected to database');

    // Get all users with plain text passwords
    const [rows] = await connection.execute(
      'SELECT user_id, email, password FROM users'
    );
    
    console.log(`📋 Found ${rows.length} users to process`);

    for (const user of rows) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isAlreadyHashed = user.password.match(/^\$2[aby]\$/);
      
      if (!isAlreadyHashed) {
        console.log(`🔐 Hashing password for user: ${user.email}`);
        
        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Update the user's password in the database
        await connection.execute(
          'UPDATE users SET password = ? WHERE user_id = ?',
          [hashedPassword, user.user_id]
        );
        
        console.log(`✅ Updated password for: ${user.email}`);
        
        // Verify the hash works
        const isValid = await bcrypt.compare(user.password, hashedPassword);
        console.log(`🔍 Verification for ${user.email}: ${isValid ? 'PASS' : 'FAIL'}`);
      } else {
        console.log(`⏭️  Password already hashed for: ${user.email}`);
      }
    }

    console.log('🎉 Password hashing fix completed!');
    
    // Test authentication with the first user
    console.log('\n🧪 Testing authentication...');
    const testUser = rows[0];
    const [updatedRows] = await connection.execute(
      'SELECT password FROM users WHERE user_id = ?',
      [testUser.user_id]
    );
    
    const updatedPassword = updatedRows[0].password;
    const authTest = await bcrypt.compare(testUser.password, updatedPassword);
    console.log(`🔐 Auth test for ${testUser.email}: ${authTest ? 'SUCCESS' : 'FAILED'}`);

    await connection.end();
    
  } catch (error) {
    console.error('❌ Password hashing fix failed:', error.message);
    console.error(error);
  }
}

fixPasswordHashing();
