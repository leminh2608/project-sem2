const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function debugAuthenticationIssue() {
  console.log('🔍 Debugging Authentication Issue...\n')

  // Check 1: Database connectivity and user data
  console.log('1️⃣ Checking database connectivity and user data...')
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    })

    const [users] = await connection.execute(
      'SELECT user_id, email, role, LENGTH(password) as password_length FROM users LIMIT 5'
    )

    console.log('   ✅ Database connection successful')
    console.log('   📋 Users found:')
    users.forEach(user => {
      console.log(`      - ${user.email} (${user.role}) - Password length: ${user.password_length}`)
    })

    await connection.end()
  } catch (error) {
    console.log('   ❌ Database error:', error.message)
    return
  }

  // Check 2: Environment variables
  console.log('\n2️⃣ Checking environment variables...')
  const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar]
    if (value) {
      console.log(`   ✅ ${envVar}: ${envVar === 'NEXTAUTH_SECRET' ? '[HIDDEN]' : value}`)
    } else {
      console.log(`   ❌ ${envVar}: Not set`)
    }
  })

  // Check 3: NextAuth.js configuration files
  console.log('\n3️⃣ Checking NextAuth.js configuration files...')
  
  const fs = require('fs')
  const path = require('path')
  
  const configFiles = [
    'src/lib/auth.ts',
    'src/app/api/auth/[...nextauth]/route.ts',
    '.env.local'
  ]
  
  configFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}: Exists`)
      
      if (file === 'src/lib/auth.ts') {
        const content = fs.readFileSync(filePath, 'utf8')
        const hasCredentialsProvider = content.includes('CredentialsProvider')
        const hasAuthorizeFunction = content.includes('async authorize')
        const hasBcryptCompare = content.includes('bcrypt.compare')
        
        console.log(`      - CredentialsProvider: ${hasCredentialsProvider ? '✅' : '❌'}`)
        console.log(`      - authorize function: ${hasAuthorizeFunction ? '✅' : '❌'}`)
        console.log(`      - bcrypt.compare: ${hasBcryptCompare ? '✅' : '❌'}`)
      }
    } else {
      console.log(`   ❌ ${file}: Missing`)
    }
  })

  // Check 4: Test the findUserByEmail function directly
  console.log('\n4️⃣ Testing findUserByEmail function...')
  try {
    // Import the function (this might not work in all environments)
    const testEmail = 'admin@example.com'
    console.log(`   🔍 Testing with email: ${testEmail}`)
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    })

    const [rows] = await connection.execute(
      'SELECT user_id, full_name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
      [testEmail]
    )

    if (rows.length > 0) {
      const user = rows[0]
      console.log(`   ✅ User found: ${user.full_name}`)
      
      // Test password comparison
      const testPassword = 'admin123'
      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log(`   🔐 Password "${testPassword}" valid: ${isValid ? '✅' : '❌'}`)
    } else {
      console.log(`   ❌ User not found`)
    }

    await connection.end()
  } catch (error) {
    console.log(`   ❌ Error testing findUserByEmail: ${error.message}`)
  }

  // Check 5: Common authentication issues
  console.log('\n5️⃣ Checking for common authentication issues...')
  
  const commonIssues = [
    {
      name: 'NEXTAUTH_SECRET length',
      check: () => {
        const secret = process.env.NEXTAUTH_SECRET
        return secret && secret.length >= 32
      },
      fix: 'Ensure NEXTAUTH_SECRET is at least 32 characters long'
    },
    {
      name: 'NEXTAUTH_URL format',
      check: () => {
        const url = process.env.NEXTAUTH_URL
        return url && (url.startsWith('http://') || url.startsWith('https://'))
      },
      fix: 'Ensure NEXTAUTH_URL starts with http:// or https://'
    },
    {
      name: 'Database URL format',
      check: () => {
        const dbUrl = process.env.DATABASE_URL
        return dbUrl && dbUrl.includes('mysql://')
      },
      fix: 'Ensure DATABASE_URL is in correct MySQL format'
    }
  ]

  commonIssues.forEach(issue => {
    const result = issue.check()
    console.log(`   ${result ? '✅' : '❌'} ${issue.name}`)
    if (!result) {
      console.log(`      💡 Fix: ${issue.fix}`)
    }
  })

  // Check 6: Recommendations
  console.log('\n6️⃣ Recommendations for debugging...')
  console.log('   📝 To debug authentication issues:')
  console.log('      1. Check browser developer tools for network errors')
  console.log('      2. Look for NextAuth.js debug logs in server console')
  console.log('      3. Verify that the signin form is sending correct data')
  console.log('      4. Test with different browsers/incognito mode')
  console.log('      5. Check if cookies are being set properly')
  
  console.log('\n   🔧 Quick fixes to try:')
  console.log('      1. Clear browser cookies and localStorage')
  console.log('      2. Restart the development server')
  console.log('      3. Check if antivirus/firewall is blocking requests')
  console.log('      4. Try authentication with curl or Postman')

  console.log('\n' + '='.repeat(60))
  console.log('🎯 Authentication Debug Complete!')
  console.log('='.repeat(60))
}

// Load environment variables manually
const fs = require('fs')
const path = require('path')

try {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/"/g, '')
      }
    })
  }
} catch (error) {
  console.log('Could not load .env.local file')
}

debugAuthenticationIssue().catch(console.error)
