const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function finalAuthenticationTest() {
  console.log('🎯 Final Authentication System Test...\n')

  // Test 1: Database connectivity and user verification
  console.log('1️⃣ Testing database connectivity and user data...')
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'english_course_system'
  })

  try {
    const testCredentials = [
      { email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { email: 'teacher.a@example.com', password: 'teacher123', role: 'teacher' },
      { email: 'student.c@example.com', password: 'student123', role: 'student' }
    ]

    for (const cred of testCredentials) {
      const [rows] = await connection.execute(
        'SELECT user_id, full_name, email, password, role FROM users WHERE email = ?',
        [cred.email]
      )

      if (rows.length > 0) {
        const user = rows[0]
        const isPasswordValid = await bcrypt.compare(cred.password, user.password)
        console.log(`   ${isPasswordValid ? '✅' : '❌'} ${cred.email} (${cred.role}): ${isPasswordValid ? 'VALID' : 'INVALID'}`)
      } else {
        console.log(`   ❌ ${cred.email}: USER NOT FOUND`)
      }
    }

  } finally {
    await connection.end()
  }

  // Test 2: NextAuth.js configuration check
  console.log('\n2️⃣ Checking NextAuth.js configuration...')
  
  const fs = require('fs')
  const path = require('path')
  
  const authConfigPath = path.join(process.cwd(), 'src', 'lib', 'auth.ts')
  if (fs.existsSync(authConfigPath)) {
    const authConfig = fs.readFileSync(authConfigPath, 'utf8')
    
    const checks = [
      { name: 'CredentialsProvider', test: authConfig.includes('CredentialsProvider') },
      { name: 'authorize function', test: authConfig.includes('async authorize') },
      { name: 'bcrypt.compare', test: authConfig.includes('bcrypt.compare') },
      { name: 'findUserByEmail', test: authConfig.includes('findUserByEmail') },
      { name: 'email normalization', test: authConfig.includes('toLowerCase().trim()') }
    ]
    
    checks.forEach(check => {
      console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`)
    })
  } else {
    console.log('   ❌ auth.ts file not found')
  }

  // Test 3: Environment variables
  console.log('\n3️⃣ Checking environment variables...')
  
  // Load environment variables manually
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
  
  const requiredEnvVars = [
    { name: 'DATABASE_URL', required: true },
    { name: 'NEXTAUTH_SECRET', required: true },
    { name: 'NEXTAUTH_URL', required: true }
  ]
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar.name]
    const isValid = value && value.length > 0
    console.log(`   ${isValid ? '✅' : '❌'} ${envVar.name}: ${isValid ? 'SET' : 'MISSING'}`)
  })

  // Test 4: API endpoint availability
  console.log('\n4️⃣ Testing API endpoint availability...')
  
  try {
    const fetch = require('node-fetch')
    const baseUrl = 'http://localhost:3000'
    
    const endpoints = [
      { name: 'Session endpoint', url: '/api/auth/session' },
      { name: 'CSRF endpoint', url: '/api/auth/csrf' },
      { name: 'Providers endpoint', url: '/api/auth/providers' },
      { name: 'Signin page', url: '/auth/signin' }
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint.url}`)
        console.log(`   ${response.status === 200 ? '✅' : '❌'} ${endpoint.name}: ${response.status}`)
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ERROR (${error.message})`)
      }
    }
  } catch (error) {
    console.log('   ⚠️  Cannot test endpoints - server may not be running')
  }

  // Test 5: File structure check
  console.log('\n5️⃣ Checking file structure...')
  
  const requiredFiles = [
    'src/lib/auth.ts',
    'src/app/api/auth/[...nextauth]/route.ts',
    'src/app/auth/signin/page.tsx',
    'src/lib/db-direct.ts',
    '.env.local'
  ]
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file)
    const exists = fs.existsSync(filePath)
    console.log(`   ${exists ? '✅' : '❌'} ${file}`)
  })

  console.log('\n' + '='.repeat(60))
  console.log('🎯 Final Authentication Test Results')
  console.log('='.repeat(60))
  
  console.log('\n📋 Demo Credentials (Copy these exactly):')
  console.log('┌─────────────────────────────────────────────────────┐')
  console.log('│ Admin:   admin@example.com    / admin123           │')
  console.log('│ Teacher: teacher.a@example.com / teacher123        │')
  console.log('│ Student: student.c@example.com / student123        │')
  console.log('└─────────────────────────────────────────────────────┘')
  
  console.log('\n🔧 If authentication still fails:')
  console.log('   1. Open browser developer tools (F12)')
  console.log('   2. Go to Console tab to see detailed logs')
  console.log('   3. Try login with exact credentials above')
  console.log('   4. Check Network tab for failed requests')
  console.log('   5. Clear cookies: Application > Storage > Clear site data')
  console.log('   6. Try incognito/private browsing mode')
  
  console.log('\n🌐 Test in browser:')
  console.log('   1. Go to: http://localhost:3000/auth/signin')
  console.log('   2. Use credentials: admin@example.com / admin123')
  console.log('   3. Check browser console for detailed logs')
}

finalAuthenticationTest().catch(console.error)
