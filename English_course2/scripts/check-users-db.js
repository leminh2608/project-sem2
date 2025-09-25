const mysql = require('mysql2/promise')

async function checkUsersInDatabase() {
  console.log('🔍 Checking users in database...\n')

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  })

  try {
    // Get recent users
    const [rows] = await connection.execute(
      'SELECT user_id, full_name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10'
    )

    console.log('📋 Recent users in database:')
    if (rows.length === 0) {
      console.log('   ❌ No users found in database!')
    } else {
      rows.forEach(user => {
        console.log(`   - ID: ${user.user_id}, Email: ${user.email}, Role: ${user.role}, Name: ${user.full_name}`)
      })
    }

    // Check for specific test users
    console.log('\n🧪 Checking for common test users...')
    const testEmails = [
      'admin@example.com',
      'teacher@example.com', 
      'student@example.com',
      'test@test.com',
      'admin@test.com'
    ]

    for (const email of testEmails) {
      const [userRows] = await connection.execute(
        'SELECT user_id, email, role FROM users WHERE email = ?',
        [email]
      )
      
      if (userRows.length > 0) {
        console.log(`   ✅ Found: ${email} (Role: ${userRows[0].role})`)
      } else {
        console.log(`   ❌ Not found: ${email}`)
      }
    }

    // Check password hashes
    console.log('\n🔐 Checking password hashes...')
    const [passwordRows] = await connection.execute(
      'SELECT user_id, email, password FROM users LIMIT 3'
    )

    passwordRows.forEach(user => {
      const isValidHash = user.password && user.password.startsWith('$2')
      console.log(`   - ${user.email}: ${isValidHash ? '✅ Valid bcrypt hash' : '❌ Invalid hash format'}`)
    })

  } finally {
    await connection.end()
  }
}

checkUsersInDatabase().catch(console.error)
