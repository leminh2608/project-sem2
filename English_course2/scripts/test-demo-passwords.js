const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function testDemoPasswords() {
  console.log('🔐 Testing Demo Account Passwords...\n')

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  })

  try {
    // Demo accounts from the signin page
    const demoAccounts = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        email: 'teacher.a@example.com',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        email: 'student.c@example.com',
        password: 'student123',
        role: 'student'
      }
    ]

    console.log('🧪 Testing demo account passwords...\n')

    for (const account of demoAccounts) {
      console.log(`📝 Testing: ${account.email} (${account.role})`)
      console.log(`   Expected password: ${account.password}`)

      // Find user in database
      const [rows] = await connection.execute(
        'SELECT user_id, full_name, email, password, role FROM users WHERE email = ? LIMIT 1',
        [account.email]
      )

      if (rows.length === 0) {
        console.log(`   ❌ User not found in database!`)
        console.log('')
        continue
      }

      const user = rows[0]
      console.log(`   ✅ User found: ${user.full_name} (Role: ${user.role})`)

      // Test password
      try {
        const isPasswordValid = await bcrypt.compare(account.password, user.password)
        console.log(`   🔐 Password "${account.password}" valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`)
        
        if (!isPasswordValid) {
          // Try some common variations
          const variations = [
            'password',
            '123456',
            'admin',
            'teacher',
            'student',
            account.role + '123',
            account.role
          ]
          
          console.log(`   🔍 Trying common password variations...`)
          for (const variation of variations) {
            const testResult = await bcrypt.compare(variation, user.password)
            if (testResult) {
              console.log(`   ✅ Found working password: "${variation}"`)
              break
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ Password comparison error: ${error.message}`)
      }

      console.log('')
    }

    // Check if there are any users with simple passwords
    console.log('🔍 Checking all users for password patterns...\n')
    
    const [allUsers] = await connection.execute(
      'SELECT user_id, email, password, role FROM users'
    )

    const commonPasswords = ['password', '123456', 'admin123', 'teacher123', 'student123', 'admin', 'teacher', 'student']

    for (const user of allUsers) {
      console.log(`👤 ${user.email} (${user.role}):`)
      
      for (const testPassword of commonPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, user.password)
          if (isMatch) {
            console.log(`   ✅ Password is: "${testPassword}"`)
            break
          }
        } catch (error) {
          // Skip errors
        }
      }
      console.log('')
    }

  } finally {
    await connection.end()
  }
}

testDemoPasswords().catch(console.error)
