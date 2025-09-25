const fetch = require('node-fetch');

async function testScheduleAPIEndpoint() {
  try {
    console.log('🧪 Testing Teacher Schedule API Endpoint...\n');
    
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
      console.log('   Session user:', sessionData.user?.name, '- Role:', sessionData.user?.role, '- ID:', sessionData.user?.id);
      
      if (sessionData.user?.role === 'teacher') {
        console.log('   ✅ Teacher session confirmed');
        
        // Step 4: Test teacher schedule API with different week offsets
        console.log('4. Testing teacher schedule API...');
        
        const weekOffsets = [0, 1, -1, 2];
        
        for (const weekOffset of weekOffsets) {
          console.log(`   Testing weekOffset = ${weekOffset}...`);
          
          const scheduleUrl = `${baseUrl}/api/teacher/schedule${weekOffset !== 0 ? `?weekOffset=${weekOffset}` : ''}`;
          const scheduleResponse = await fetch(scheduleUrl, {
            headers: { 'Cookie': cookies }
          });
          
          console.log(`   Schedule API status (weekOffset=${weekOffset}):`, scheduleResponse.status);
          
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json();
            console.log(`   ✅ Schedule API successful!`);
            console.log(`   Schedules count: ${scheduleData.schedules?.length || 0}`);
            console.log(`   Upcoming classes count: ${scheduleData.upcomingClasses?.length || 0}`);
            
            if (scheduleData.weekInfo) {
              console.log(`   Week info: ${scheduleData.weekInfo.displayRange} (${scheduleData.weekInfo.startDate} to ${scheduleData.weekInfo.endDate})`);
            }
            
            // Show sample data if available
            if (scheduleData.schedules && scheduleData.schedules.length > 0) {
              console.log('   Sample schedule:', {
                class: scheduleData.schedules[0].class_name,
                date: scheduleData.schedules[0].lesson_date,
                day: scheduleData.schedules[0].day_of_week,
                time: `${scheduleData.schedules[0].start_time} - ${scheduleData.schedules[0].end_time}`,
                location: scheduleData.schedules[0].location
              });
            }
            
          } else {
            const errorData = await scheduleResponse.text();
            console.log(`   ❌ Schedule API failed (weekOffset=${weekOffset}):`, errorData);
          }
          
          console.log('');
        }
        
        // Step 5: Test with invalid parameters
        console.log('5. Testing with invalid parameters...');
        
        const invalidScheduleResponse = await fetch(`${baseUrl}/api/teacher/schedule?weekOffset=invalid`, {
          headers: { 'Cookie': cookies }
        });
        
        console.log('   Invalid weekOffset status:', invalidScheduleResponse.status);
        
        if (invalidScheduleResponse.ok) {
          const invalidData = await invalidScheduleResponse.json();
          console.log('   ✅ Invalid weekOffset handled gracefully');
          console.log('   Week info:', invalidData.weekInfo?.displayRange);
        } else {
          console.log('   ❌ Invalid weekOffset caused error');
        }
        
      } else {
        console.log('   ❌ Not a teacher session');
      }
    } else {
      console.log('   ❌ Session check failed');
    }
    
    console.log('\n🎉 Teacher schedule API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testScheduleAPIEndpoint();
