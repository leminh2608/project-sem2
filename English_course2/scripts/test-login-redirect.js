const fetch = require('node-fetch');

async function testLoginRedirect() {
  try {
    console.log('🔍 Testing login redirect functionality...\n');
    
    const baseUrl = 'http://localhost:3000';
    
    const testUsers = [
      { email: 'admin@example.com', password: 'admin123', expectedRedirect: '/admin' },
      { email: 'teacher.a@example.com', password: 'teacher123', expectedRedirect: '/teacher/dashboard' },
      { email: 'student.c@example.com', password: 'student123', expectedRedirect: '/student/dashboard' }
    ];
    
    for (const user of testUsers) {
      console.log(`🧪 Testing login for: ${user.email}`);
      
      // Step 1: Get CSRF token
      const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
      const csrfData = await csrfResponse.json();
      
      if (!csrfData.csrfToken) {
        console.log('   ❌ No CSRF token');
        continue;
      }
      
      // Step 2: Attempt login
      const loginResponse = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: user.email,
          password: user.password,
          csrfToken: csrfData.csrfToken,
          callbackUrl: user.expectedRedirect,
          json: 'true'
        })
      });
      
      console.log('   Login status:', loginResponse.status);
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('   Login response:', loginData);
        
        // Get cookies for session check
        const cookies = loginResponse.headers.get('set-cookie');
        
        if (cookies) {
          // Step 3: Check session
          const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
            headers: { 'Cookie': cookies }
          });
          
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('   Session user:', sessionData.user?.name, '- Role:', sessionData.user?.role);
            
            if (sessionData.user && sessionData.user.role) {
              console.log('   ✅ Login successful!');
              
              // Step 4: Test accessing the expected dashboard
              const dashboardResponse = await fetch(`${baseUrl}${user.expectedRedirect}`, {
                headers: { 'Cookie': cookies },
                redirect: 'manual' // Don't follow redirects
              });
              
              console.log('   Dashboard access status:', dashboardResponse.status);
              
              if (dashboardResponse.status === 200) {
                console.log('   ✅ Dashboard accessible');
              } else if (dashboardResponse.status >= 300 && dashboardResponse.status < 400) {
                const location = dashboardResponse.headers.get('location');
                console.log('   🔄 Redirected to:', location);
              } else {
                console.log('   ❌ Dashboard not accessible');
              }
            } else {
              console.log('   ❌ No user session');
            }
          } else {
            console.log('   ❌ Session check failed');
          }
        } else {
          console.log('   ❌ No cookies set');
        }
      } else {
        console.log('   ❌ Login failed');
      }
      
      console.log('');
    }
    
    console.log('🎉 Login redirect test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginRedirect();
