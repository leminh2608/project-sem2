const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function testAuthenticationFlow() {
  console.log('🔐 Testing Authentication Flow...\n')

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  })

  try {
    // Test cases with known users
    const testCases = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        expected: true,
        description: 'Admin user with correct password'
      },
      {
        email: 'teacher.a@example.com', 
        password: 'teacher123',
        expected: true,
        description: 'Teacher user with correct password'
      },
      {
        email: 'admin@example.com',
        password: 'wrongpassword',
        expected: false,
        description: 'Admin user with wrong password'
      },
      {
        email: 'nonexistent@example.com',
        password: 'anypassword',
        expected: false,
        description: 'Non-existent user'
      }
    ]

    console.log('🧪 Testing authentication scenarios...\n')

    for (const testCase of testCases) {
      console.log(`📝 Test: ${testCase.description}`)
      console.log(`   Email: ${testCase.email}`)
      console.log(`   Password: ${testCase.password}`)

      // Step 1: Normalize email (as done in auth.ts)
      const normalizedEmail = testCase.email.toLowerCase().trim()
      console.log(`   Normalized Email: ${normalizedEmail}`)

      // Step 2: Find user by email (simulate findUserByEmail function)
      const [rows] = await connection.execute(
        'SELECT user_id, full_name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
        [normalizedEmail]
      )

      const users = rows
      if (users.length === 0) {
        console.log(`   📋 Result: User not found`)
        console.log(`   ✅ Expected: ${testCase.expected ? 'FAIL' : 'PASS'}\n`)
        continue
      }

      const user = users[0]
      console.log(`   📋 User found: ID ${user.user_id}, Role: ${user.role}`)

      // Step 3: Compare password with bcrypt
      try {
        const isPasswordValid = await bcrypt.compare(testCase.password, user.password)
        console.log(`   🔐 Password valid: ${isPasswordValid}`)
        
        if (isPasswordValid === testCase.expected) {
          console.log(`   ✅ Test PASSED`)
        } else {
          console.log(`   ❌ Test FAILED - Expected: ${testCase.expected}, Got: ${isPasswordValid}`)
        }
      } catch (error) {
        console.log(`   ❌ Password comparison error: ${error.message}`)
      }

      console.log('')
    }

    // Test the actual findUserByEmail function behavior
    console.log('🔍 Testing findUserByEmail function behavior...\n')
    
    // Test case sensitivity
    const emailVariations = [
      'admin@example.com',
      'ADMIN@EXAMPLE.COM',
      'Admin@Example.com',
      ' admin@example.com ',
      'admin@example.com '
    ]

    for (const email of emailVariations) {
      const normalizedEmail = email.toLowerCase().trim()
      const [rows] = await connection.execute(
        'SELECT user_id, email FROM users WHERE email = ? LIMIT 1',
        [normalizedEmail]
      )
      
      console.log(`   Input: "${email}" -> Normalized: "${normalizedEmail}" -> Found: ${rows.length > 0 ? '✅' : '❌'}`)
    }

    // Check if there are any password hash issues
    console.log('\n🔐 Analyzing password hashes...\n')
    
    const [allUsers] = await connection.execute(
      'SELECT user_id, email, password FROM users LIMIT 5'
    )

    for (const user of allUsers) {
      const hashInfo = {
        length: user.password.length,
        startsWithBcrypt: user.password.startsWith('$2'),
        format: user.password.substring(0, 7)
      }
      
      console.log(`   ${user.email}:`)
      console.log(`     - Length: ${hashInfo.length}`)
      console.log(`     - Bcrypt format: ${hashInfo.startsWithBcrypt ? '✅' : '❌'}`)
      console.log(`     - Hash prefix: ${hashInfo.format}`)
      
      // Test with a known password to see if hash works
      try {
        const testResult = await bcrypt.compare('admin123', user.password)
        console.log(`     - Test with 'admin123': ${testResult ? '✅ Match' : '❌ No match'}`)
      } catch (error) {
        console.log(`     - Test error: ${error.message}`)
      }
      console.log('')
    }

  } finally {
    await connection.end()
  }
}

testAuthenticationFlow().catch(console.error)
