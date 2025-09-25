const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔍 Testing login API...');
    
    const baseUrl = 'http://localhost:3000';
    
    // First, get CSRF token
    console.log('📋 Getting CSRF token...');
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    console.log('✅ CSRF token received:', csrfData.csrfToken ? 'Yes' : 'No');
    
    // Test login with admin credentials
    console.log('🔐 Testing login with admin credentials...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@example.com',
        password: 'admin123',
        csrfToken: csrfData.csrfToken,
        callbackUrl: baseUrl,
        json: 'true'
      })
    });
    
    console.log('📊 Login response status:', loginResponse.status);
    console.log('📊 Login response headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('📋 Response data:', loginData);
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed');
      console.log('📋 Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
}

testLogin();
