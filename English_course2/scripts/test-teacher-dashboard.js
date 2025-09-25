const fetch = require('node-fetch');

async function testTeacherDashboard() {
  try {
    console.log('🧪 Testing Teacher Dashboard API...\n');
    
    const baseUrl = 'http://localhost:3000';
    
    // Step 1: Get CSRF token
    console.log('1. Getting CSRF token...');
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    
    if (!csrfData.csrfToken) {
      console.log('   ❌ No CSRF token');
      return;
    }
    console.log('   ✅ CSRF token obtained');
    
    // Step 2: Login as teacher
    console.log('2. Logging in as teacher...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'teacher.a@example.com',
        password: 'teacher123',
        csrfToken: csrfData.csrfToken,
        callbackUrl: '/teacher/dashboard',
        json: 'true'
      })
    });
    
    console.log('   Login status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      console.log('   ❌ Login failed');
      return;
    }
    
    // Get cookies for session
    const cookies = loginResponse.headers.get('set-cookie');
    
    if (!cookies) {
      console.log('   ❌ No cookies set');
      return;
    }
    console.log('   ✅ Login successful');
    
    // Step 3: Test session
    console.log('3. Checking session...');
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { 'Cookie': cookies }
    });
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('   Session user:', sessionData.user?.name, '- Role:', sessionData.user?.role);
      
      if (sessionData.user?.role === 'teacher') {
        console.log('   ✅ Teacher session confirmed');
        
        // Step 4: Test teacher dashboard API
        console.log('4. Testing teacher dashboard API...');
        const dashboardResponse = await fetch(`${baseUrl}/api/teacher/dashboard`, {
          headers: { 'Cookie': cookies }
        });
        
        console.log('   Dashboard API status:', dashboardResponse.status);
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          console.log('   ✅ Dashboard API successful!');
          console.log('   Classes count:', dashboardData.classes?.length || 0);
          console.log('   Schedule count:', dashboardData.schedule?.length || 0);
          console.log('   Stats:', dashboardData.stats ? 'Available' : 'Not available');
          
          // Show sample data
          if (dashboardData.classes && dashboardData.classes.length > 0) {
            console.log('   Sample class:', {
              name: dashboardData.classes[0].class_name,
              course: dashboardData.classes[0].course_name,
              students: dashboardData.classes[0].student_count
            });
          }
          
          if (dashboardData.schedule && dashboardData.schedule.length > 0) {
            console.log('   Sample schedule:', {
              class: dashboardData.schedule[0].class_name,
              date: dashboardData.schedule[0].lesson_date,
              time: `${dashboardData.schedule[0].start_time} - ${dashboardData.schedule[0].end_time}`,
              location: dashboardData.schedule[0].location
            });
          }
          
        } else {
          const errorData = await dashboardResponse.text();
          console.log('   ❌ Dashboard API failed:', errorData);
        }
        
      } else {
        console.log('   ❌ Not a teacher session');
      }
    } else {
      console.log('   ❌ Session check failed');
    }
    
    console.log('\n🎉 Teacher dashboard test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTeacherDashboard();
