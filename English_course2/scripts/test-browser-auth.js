const fetch = require('node-fetch')

async function testBrowserAuthentication() {
  console.log('🌐 Testing Browser-like Authentication Flow...\n')

  const baseUrl = 'http://localhost:3000'
  
  console.log('🔍 Checking if server is running...')
  try {
    const healthCheck = await fetch(`${baseUrl}/api/auth/session`)
    console.log(`   ✅ Server is running (Status: ${healthCheck.status})`)
  } catch (error) {
    console.log('   ❌ Server is not running. Please start the development server with: npm run dev')
    console.log('   Error:', error.message)
    return
  }

  // Test cases
  const testCases = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      expected: true,
      description: 'Valid admin credentials'
    },
    {
      email: 'teacher.a@example.com',
      password: 'teacher123',
      expected: true,
      description: 'Valid teacher credentials'
    },
    {
      email: 'admin@example.com',
      password: 'wrongpassword',
      expected: false,
      description: 'Invalid password'
    }
  ]

  console.log('\n🧪 Testing authentication with proper NextAuth.js flow...\n')

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`📝 Test ${i + 1}: ${testCase.description}`)
    console.log(`   Email: ${testCase.email}`)
    console.log(`   Password: ${testCase.password}`)

    try {
      // Step 1: Get CSRF token
      console.log('   🔑 Getting CSRF token...')
      const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
      const csrfData = await csrfResponse.json()
      const csrfToken = csrfData.csrfToken
      console.log(`   📋 CSRF Token: ${csrfToken.substring(0, 20)}...`)

      // Step 2: Attempt authentication with proper NextAuth.js format
      console.log('   🔐 Attempting authentication...')
      const authResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: testCase.email,
          password: testCase.password,
          csrfToken: csrfToken,
          callbackUrl: `${baseUrl}/`,
          json: 'true'
        }),
        redirect: 'manual' // Don't follow redirects
      })

      console.log(`   📡 Auth response status: ${authResponse.status}`)
      
      // Check response headers for authentication success/failure
      const location = authResponse.headers.get('location')
      console.log(`   📍 Redirect location: ${location}`)

      // Determine if authentication was successful
      let isSuccess = false
      if (location) {
        // Success usually redirects to the callback URL or dashboard
        // Error usually redirects to signin page with error parameter
        isSuccess = !location.includes('error') && !location.includes('signin')
      }

      console.log(`   📊 Authentication result: ${isSuccess ? 'SUCCESS' : 'FAILURE'}`)

      if (testCase.expected === isSuccess) {
        console.log(`   ✅ Test PASSED`)
      } else {
        console.log(`   ❌ Test FAILED`)
        console.log(`   Expected: ${testCase.expected ? 'Success' : 'Failure'}`)
        console.log(`   Got: ${isSuccess ? 'Success' : 'Failure'}`)
      }

      // If successful, try to get session
      if (isSuccess) {
        console.log('   🔍 Checking session after authentication...')
        // Note: In a real browser, cookies would be set automatically
        // For this test, we can't easily simulate the full cookie flow
      }

    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`)
    }

    console.log('')
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎯 Browser Authentication Test Complete!')
  console.log('='.repeat(60))
}

// Check if we're running this script directly
if (require.main === module) {
  testBrowserAuthentication().catch(console.error)
}

module.exports = { testBrowserAuthentication }
