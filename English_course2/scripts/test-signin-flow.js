const fetch = require('node-fetch');

async function testSignInFlow() {
  try {
    console.log('🔍 Testing complete signin flow...\n');
    
    const baseUrl = 'http://localhost:3001';
    
    // Step 1: Get the signin page to establish session
    console.log('1. Loading signin page...');
    const signinPageResponse = await fetch(`${baseUrl}/auth/signin`);
    console.log('   Status:', signinPageResponse.status);
    
    // Extract cookies from signin page
    const signinCookies = signinPageResponse.headers.get('set-cookie');
    console.log('   Cookies from signin page:', signinCookies ? 'Yes' : 'No');
    
    // Step 2: Get CSRF token with cookies
    console.log('\n2. Getting CSRF token with session...');
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`, {
      headers: signinCookies ? { 'Cookie': signinCookies } : {}
    });
    const csrfData = await csrfResponse.json();
    console.log('   CSRF token received:', csrfData.csrfToken ? 'Yes' : 'No');
    
    if (!csrfData.csrfToken) {
      console.log('   ❌ No CSRF token received');
      return;
    }
    
    // Combine cookies
    const csrfCookies = csrfResponse.headers.get('set-cookie');
    const allCookies = [signinCookies, csrfCookies].filter(Boolean).join('; ');
    
    // Step 3: Test the signIn function approach (like the frontend does)
    console.log('\n3. Testing NextAuth signIn endpoint...');
    const signInResponse = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': allCookies
      },
      body: new URLSearchParams({
        email: 'admin@example.com',
        password: 'admin123',
        csrfToken: csrfData.csrfToken,
        callbackUrl: `${baseUrl}/admin`,
        json: 'true'
      })
    });
    
    console.log('   Status:', signInResponse.status);
    console.log('   Headers:', Object.fromEntries(signInResponse.headers.entries()));
    
    if (signInResponse.ok) {
      const signInData = await signInResponse.json();
      console.log('   Response:', signInData);
      
      // Get final cookies
      const finalCookies = signInResponse.headers.get('set-cookie');
      const sessionCookies = [allCookies, finalCookies].filter(Boolean).join('; ');
      
      // Step 4: Check session
      console.log('\n4. Checking session after signin...');
      const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
        headers: {
          'Cookie': sessionCookies
        }
      });
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        console.log('   Session data:', JSON.stringify(sessionData, null, 2));
        
        if (sessionData.user && sessionData.user.role) {
          console.log('   ✅ Login successful! User role:', sessionData.user.role);
          
          // Test accessing the dashboard
          const dashboardUrl = sessionData.user.role === 'admin' ? '/admin' : 
                              sessionData.user.role === 'teacher' ? '/teacher/dashboard' :
                              '/student/dashboard';
          
          console.log(`\n5. Testing dashboard access: ${dashboardUrl}`);
          const dashboardResponse = await fetch(`${baseUrl}${dashboardUrl}`, {
            headers: {
              'Cookie': sessionCookies
            }
          });
          console.log('   Dashboard status:', dashboardResponse.status);
          console.log('   Dashboard accessible:', dashboardResponse.ok ? 'Yes' : 'No');
        } else {
          console.log('   ❌ No user data in session');
        }
      } else {
        console.log('   ❌ Failed to get session');
      }
    } else {
      const errorText = await signInResponse.text();
      console.log('   ❌ SignIn failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSignInFlow();
