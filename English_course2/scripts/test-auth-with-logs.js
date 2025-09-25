const fetch = require('node-fetch')

async function testAuthWithLogs() {
  console.log('🔐 Testing Authentication with Enhanced Logging...\n')

  const baseUrl = 'http://localhost:3000'
  
  console.log('🔍 Checking server status...')
  try {
    const healthCheck = await fetch(`${baseUrl}/api/auth/session`)
    console.log(`   ✅ Server is running (Status: ${healthCheck.status})`)
  } catch (error) {
    console.log('   ❌ Server is not running. Please start with: npm run dev')
    return
  }

  console.log('\n📋 Testing authentication endpoints step by step...\n')

  // Test 1: Get CSRF token
  console.log('1️⃣ Getting CSRF token...')
  try {
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    const csrfData = await csrfResponse.json()
    console.log(`   ✅ CSRF Response: ${csrfResponse.status}`)
    console.log(`   📋 CSRF Token: ${csrfData.csrfToken ? 'Present' : 'Missing'}`)
  } catch (error) {
    console.log(`   ❌ CSRF Error: ${error.message}`)
  }

  // Test 2: Check providers
  console.log('\n2️⃣ Checking authentication providers...')
  try {
    const providersResponse = await fetch(`${baseUrl}/api/auth/providers`)
    const providersData = await providersResponse.json()
    console.log(`   ✅ Providers Response: ${providersResponse.status}`)
    console.log(`   📋 Available providers:`, Object.keys(providersData))
  } catch (error) {
    console.log(`   ❌ Providers Error: ${error.message}`)
  }

  // Test 3: Test signin page
  console.log('\n3️⃣ Testing signin page...')
  try {
    const signinResponse = await fetch(`${baseUrl}/auth/signin`)
    console.log(`   ✅ Signin Page Response: ${signinResponse.status}`)
    
    if (signinResponse.status === 200) {
      const signinHtml = await signinResponse.text()
      const hasForm = signinHtml.includes('<form')
      const hasEmailInput = signinHtml.includes('email')
      const hasPasswordInput = signinHtml.includes('password')
      
      console.log(`   📋 Has form: ${hasForm ? '✅' : '❌'}`)
      console.log(`   📋 Has email input: ${hasEmailInput ? '✅' : '❌'}`)
      console.log(`   📋 Has password input: ${hasPasswordInput ? '✅' : '❌'}`)
    }
  } catch (error) {
    console.log(`   ❌ Signin Page Error: ${error.message}`)
  }

  // Test 4: Test the actual authentication flow
  console.log('\n4️⃣ Testing authentication flow...')
  
  const testCredentials = {
    email: 'admin@example.com',
    password: 'admin123'
  }

  try {
    // Get fresh CSRF token
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    const csrfData = await csrfResponse.json()
    const csrfToken = csrfData.csrfToken

    console.log(`   🔑 Using CSRF token: ${csrfToken.substring(0, 20)}...`)
    console.log(`   👤 Testing with: ${testCredentials.email} / ${testCredentials.password}`)

    // Attempt authentication
    const authResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        email: testCredentials.email,
        password: testCredentials.password,
        csrfToken: csrfToken,
        callbackUrl: `${baseUrl}/`,
        json: 'true'
      }),
      redirect: 'manual'
    })

    console.log(`   📡 Auth Response Status: ${authResponse.status}`)
    console.log(`   📍 Response Headers:`)
    
    for (const [key, value] of authResponse.headers.entries()) {
      console.log(`      ${key}: ${value}`)
    }

    const responseText = await authResponse.text()
    console.log(`   📄 Response Body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`)

    // Check for success indicators
    const hasError = responseText.includes('error') || authResponse.headers.get('location')?.includes('error')
    const hasSuccess = authResponse.status === 200 && !hasError

    console.log(`   📊 Authentication Result: ${hasSuccess ? '✅ SUCCESS' : '❌ FAILURE'}`)

    if (hasError) {
      console.log(`   ⚠️  Error detected in response`)
    }

  } catch (error) {
    console.log(`   ❌ Authentication Error: ${error.message}`)
  }

  // Test 5: Check session after authentication attempt
  console.log('\n5️⃣ Checking session state...')
  try {
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`)
    const sessionData = await sessionResponse.json()
    console.log(`   📡 Session Response: ${sessionResponse.status}`)
    console.log(`   📋 Session Data:`, sessionData)
    
    if (sessionData.user) {
      console.log(`   ✅ User session found: ${sessionData.user.email}`)
    } else {
      console.log(`   ❌ No user session`)
    }
  } catch (error) {
    console.log(`   ❌ Session Error: ${error.message}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎯 Authentication Test with Logs Complete!')
  console.log('='.repeat(60))
  console.log('\n💡 Next steps:')
  console.log('   1. Check the browser developer tools for any JavaScript errors')
  console.log('   2. Try logging in manually through the browser')
  console.log('   3. Check the server console for NextAuth.js debug messages')
  console.log('   4. Verify that cookies are being set in the browser')
}

testAuthWithLogs().catch(console.error)
