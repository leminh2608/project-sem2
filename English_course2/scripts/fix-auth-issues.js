const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function fixAuthenticationIssues() {
  console.log('🔧 Fixing Authentication Issues...\n')

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  })

  try {
    console.log('1️⃣ Verifying and updating user passwords...')
    
    // Ensure all demo users have correct passwords
    const demoUsers = [
      { email: 'admin@example.com', password: 'admin123', name: 'Admin System', role: 'admin' },
      { email: 'teacher.a@example.com', password: 'teacher123', name: 'Nguyen Van A', role: 'teacher' },
      { email: 'teacher.b@example.com', password: 'teacher123', name: 'Tran Thi B', role: 'teacher' },
      { email: 'student.c@example.com', password: 'student123', name: 'Le Van C', role: 'student' },
      { email: 'student.d@example.com', password: 'student123', name: 'Pham Thi D', role: 'student' }
    ]

    for (const user of demoUsers) {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT user_id, email, password FROM users WHERE email = ?',
        [user.email]
      )

      if (existing.length > 0) {
        // Verify current password
        const currentUser = existing[0]
        const isCurrentPasswordValid = await bcrypt.compare(user.password, currentUser.password)
        
        if (isCurrentPasswordValid) {
          console.log(`   ✅ ${user.email}: Password already correct`)
        } else {
          // Update password
          const hashedPassword = await bcrypt.hash(user.password, 12)
          await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, user.email]
          )
          console.log(`   🔄 ${user.email}: Password updated to "${user.password}"`)
        }
      } else {
        // Create user if doesn't exist
        const hashedPassword = await bcrypt.hash(user.password, 12)
        await connection.execute(
          'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, hashedPassword, user.role]
        )
        console.log(`   ➕ ${user.email}: User created with password "${user.password}"`)
      }
    }

    console.log('\n2️⃣ Testing all demo user credentials...')
    
    for (const user of demoUsers) {
      const [rows] = await connection.execute(
        'SELECT user_id, email, password, role FROM users WHERE email = ?',
        [user.email]
      )

      if (rows.length > 0) {
        const dbUser = rows[0]
        const isPasswordValid = await bcrypt.compare(user.password, dbUser.password)
        console.log(`   ${isPasswordValid ? '✅' : '❌'} ${user.email} / ${user.password} - ${isPasswordValid ? 'VALID' : 'INVALID'}`)
      }
    }

    console.log('\n3️⃣ Checking for common authentication blockers...')
    
    // Check for duplicate emails
    const [duplicates] = await connection.execute(
      'SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING COUNT(*) > 1'
    )
    
    if (duplicates.length > 0) {
      console.log('   ⚠️  Found duplicate emails:')
      duplicates.forEach(dup => {
        console.log(`      - ${dup.email}: ${dup.count} entries`)
      })
    } else {
      console.log('   ✅ No duplicate emails found')
    }

    // Check for invalid password hashes
    const [allUsers] = await connection.execute(
      'SELECT user_id, email, password FROM users'
    )
    
    let invalidHashes = 0
    for (const user of allUsers) {
      if (!user.password || !user.password.startsWith('$2')) {
        console.log(`   ❌ Invalid password hash for: ${user.email}`)
        invalidHashes++
      }
    }
    
    if (invalidHashes === 0) {
      console.log('   ✅ All password hashes are valid')
    }

    console.log('\n4️⃣ Creating test authentication summary...')
    console.log('   📋 Working Demo Credentials:')
    console.log('   ┌─────────────────────────────────────────────────────┐')
    console.log('   │ Role    │ Email                  │ Password     │')
    console.log('   ├─────────────────────────────────────────────────────┤')
    console.log('   │ Admin   │ admin@example.com      │ admin123     │')
    console.log('   │ Teacher │ teacher.a@example.com  │ teacher123   │')
    console.log('   │ Teacher │ teacher.b@example.com  │ teacher123   │')
    console.log('   │ Student │ student.c@example.com  │ student123   │')
    console.log('   │ Student │ student.d@example.com  │ student123   │')
    console.log('   └─────────────────────────────────────────────────────┘')

  } finally {
    await connection.end()
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎯 Authentication Fix Complete!')
  console.log('='.repeat(60))
  console.log('\n💡 If users still get "Invalid email or password":')
  console.log('   1. Clear browser cookies and localStorage')
  console.log('   2. Try incognito/private browsing mode')
  console.log('   3. Check browser developer tools for JavaScript errors')
  console.log('   4. Ensure exact email/password match (case sensitive)')
  console.log('   5. Restart the development server')
}

fixAuthenticationIssues().catch(console.error)
