const fetch = require('node-fetch');

async function debugLoginFlow() {
  try {
    console.log('🔍 Debugging login flow...\n');
    
    const baseUrl = 'http://localhost:3001';
    
    // Test 1: Get CSRF token
    console.log('1. Getting CSRF token...');
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    console.log('   ✅ CSRF token received:', csrfData.csrfToken ? 'Yes' : 'No');
    
    if (!csrfData.csrfToken) {
      console.log('   ❌ No CSRF token - this might be the issue');
      return;
    }
    
    // Test 2: Attempt login
    console.log('\n2. Attempting login with admin credentials...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@example.com',
        password: 'admin123',
        csrfToken: csrfData.csrfToken,
        callbackUrl: `${baseUrl}/admin`,
        json: 'true'
      })
    });
    
    console.log('   Status:', loginResponse.status);
    console.log('   Headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Login response:', loginData);
      
      // Extract cookies for session testing
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('   🍪 Cookies set:', cookies ? 'Yes' : 'No');
      
      if (cookies) {
        // Test 3: Get session with cookies
        console.log('\n3. Testing session retrieval...');
        const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
          headers: {
            'Cookie': cookies
          }
        });
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          console.log('   ✅ Session data:', JSON.stringify(sessionData, null, 2));
          
          if (sessionData.user && sessionData.user.role) {
            console.log('   ✅ User role found:', sessionData.user.role);
            
            // Test redirect URLs
            const redirectUrls = {
              admin: '/admin',
              teacher: '/teacher/dashboard',
              student: '/student/dashboard'
            };
            
            const targetUrl = redirectUrls[sessionData.user.role];
            if (targetUrl) {
              console.log(`\n4. Testing target URL: ${baseUrl}${targetUrl}`);
              const pageResponse = await fetch(`${baseUrl}${targetUrl}`, {
                headers: {
                  'Cookie': cookies
                }
              });
              console.log('   Page status:', pageResponse.status);
              console.log('   Page accessible:', pageResponse.ok ? 'Yes' : 'No');
            }
          } else {
            console.log('   ❌ No user role in session - this is the problem!');
          }
        } else {
          console.log('   ❌ Failed to get session');
        }
      } else {
        console.log('   ❌ No cookies set - authentication failed');
      }
    } else {
      const errorText = await loginResponse.text();
      console.log('   ❌ Login failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugLoginFlow();
