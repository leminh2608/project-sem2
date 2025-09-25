const fetch = require('node-fetch')

async function testLiveAuthentication() {
  console.log('🌐 Testing Live Authentication System...\n')

  const baseUrl = 'http://localhost:3000'
  
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
    }
  ]

  console.log('🔍 Checking if server is running...')
  try {
    const healthCheck = await fetch(`${baseUrl}/api/auth/session`)
    console.log(`   ✅ Server is running (Status: ${healthCheck.status})`)
  } catch (error) {
    console.log('   ❌ Server is not running. Please start the development server with: npm run dev')
    console.log('   Error:', error.message)
    return
  }

  console.log('\n🧪 Testing authentication endpoints...\n')

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`📝 Test ${i + 1}: ${testCase.description}`)
    console.log(`   Email: ${testCase.email}`)
    console.log(`   Password: ${testCase.password}`)

    try {
      // Test the NextAuth.js signin endpoint
      const response = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: testCase.email,
          password: testCase.password,
          redirect: 'false',
          json: 'true'
        })
      })

      console.log(`   📡 Response status: ${response.status}`)
      
      const responseText = await response.text()
      console.log(`   📄 Response body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`)

      // Try to parse as JSON if possible
      let responseData = null
      try {
        responseData = JSON.parse(responseText)
        console.log(`   📋 Parsed response:`, responseData)
      } catch (e) {
        // Not JSON, that's okay
      }

      // Check if authentication was successful
      const isSuccess = response.status === 200 && !responseText.includes('error')
      
      if (testCase.expected === isSuccess) {
        console.log(`   ✅ Test PASSED`)
      } else {
        console.log(`   ❌ Test FAILED`)
        console.log(`   Expected: ${testCase.expected ? 'Success' : 'Failure'}`)
        console.log(`   Got: ${isSuccess ? 'Success' : 'Failure'}`)
      }

    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`)
    }

    console.log('')
  }

  // Test the session endpoint
  console.log('🔐 Testing session endpoint...')
  try {
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`)
    const sessionData = await sessionResponse.json()
    console.log(`   📡 Session status: ${sessionResponse.status}`)
    console.log(`   📋 Session data:`, sessionData)
  } catch (error) {
    console.log(`   ❌ Session test failed: ${error.message}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎯 Live Authentication Test Complete!')
  console.log('='.repeat(60))
}

// Check if we're running this script directly
if (require.main === module) {
  testLiveAuthentication().catch(console.error)
}

module.exports = { testLiveAuthentication }
