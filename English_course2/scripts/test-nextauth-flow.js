const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

// Simulate the exact NextAuth.js authorize function
async function simulateNextAuthAuthorize(credentials) {
  console.log('🔐 Simulating NextAuth.js authorize function...')
  console.log(`   Input email: "${credentials.email}"`)
  console.log(`   Input password: "${credentials.password}"`)

  try {
    if (!credentials?.email || !credentials?.password) {
      console.log('   ❌ Missing credentials')
      return null
    }

    // Normalize email to lowercase for consistent lookup (as in auth.ts)
    const normalizedEmail = credentials.email.toLowerCase().trim()
    console.log(`   📧 Normalized email: "${normalizedEmail}"`)

    // Simulate findUserByEmail function
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    })

    let user = null
    try {
      const [rows] = await connection.execute(
        'SELECT user_id, full_name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
        [normalizedEmail]
      )

      const users = rows
      if (users.length > 0) {
        user = {
          userId: users[0].user_id,
          fullName: users[0].full_name,
          email: users[0].email,
          password: users[0].password,
          role: users[0].role,
          createdAt: users[0].created_at,
        }
        console.log(`   👤 User found: ${user.fullName} (${user.role})`)
      } else {
        console.log('   ❌ User not found')
        return null
      }
    } finally {
      await connection.end()
    }

    if (!user) {
      console.log('   ❌ User not found')
      return null
    }

    // Compare password with bcrypt (as in auth.ts)
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    )
    console.log(`   🔐 Password valid: ${isPasswordValid}`)

    if (!isPasswordValid) {
      console.log('   ❌ Invalid password')
      return null
    }

    // Return user object (as in auth.ts)
    const authUser = {
      id: user.userId.toString(),
      email: user.email,
      name: user.fullName,
      role: user.role,
    }
    console.log(`   ✅ Authentication successful`)
    console.log(`   📋 Returned user object:`, authUser)
    return authUser

  } catch (error) {
    console.error('   ❌ Auth error:', error)
    return null
  }
}

async function testNextAuthFlow() {
  console.log('🧪 Testing NextAuth.js Authentication Flow...\n')

  const testCases = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      expected: true,
      description: 'Valid admin credentials'
    },
    {
      email: 'ADMIN@EXAMPLE.COM',
      password: 'admin123',
      expected: true,
      description: 'Valid admin credentials (uppercase email)'
    },
    {
      email: ' admin@example.com ',
      password: 'admin123',
      expected: true,
      description: 'Valid admin credentials (email with spaces)'
    },
    {
      email: 'teacher.a@example.com',
      password: 'teacher123',
      expected: true,
      description: 'Valid teacher credentials'
    },
    {
      email: 'student.c@example.com',
      password: 'student123',
      expected: true,
      description: 'Valid student credentials'
    },
    {
      email: 'admin@example.com',
      password: 'wrongpassword',
      expected: false,
      description: 'Invalid password'
    },
    {
      email: 'nonexistent@example.com',
      password: 'anypassword',
      expected: false,
      description: 'Non-existent user'
    },
    {
      email: '',
      password: 'admin123',
      expected: false,
      description: 'Empty email'
    },
    {
      email: 'admin@example.com',
      password: '',
      expected: false,
      description: 'Empty password'
    }
  ]

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`\n📝 Test ${i + 1}: ${testCase.description}`)
    console.log('─'.repeat(50))

    const result = await simulateNextAuthAuthorize({
      email: testCase.email,
      password: testCase.password
    })

    const success = testCase.expected ? (result !== null) : (result === null)
    
    if (success) {
      console.log(`   ✅ Test PASSED`)
    } else {
      console.log(`   ❌ Test FAILED`)
      console.log(`   Expected: ${testCase.expected ? 'Success' : 'Failure'}`)
      console.log(`   Got: ${result !== null ? 'Success' : 'Failure'}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎯 NextAuth.js Flow Test Complete!')
  console.log('='.repeat(60))
}

testNextAuthFlow().catch(console.error)
