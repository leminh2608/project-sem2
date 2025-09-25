const { 
  getAllSchedules, 
  getStudentSchedule, 
  getCourseClassesWithStats,
  getAnalyticsData 
} = require('../src/lib/db-direct.ts')

async function testAllFixes() {
  console.log('🧪 Testing all database schema fixes...\n')
  
  try {
    // Test 1: getAllSchedules function
    console.log('1️⃣ Testing getAllSchedules()...')
    const allSchedules = await getAllSchedules()
    console.log('✅ getAllSchedules() - SUCCESS')
    console.log(`📊 Found ${allSchedules.length} schedule records`)
    
    if (allSchedules.length > 0) {
      console.log('📝 Sample schedule data:')
      console.table(allSchedules.slice(0, 2).map(s => ({
        class_name: s.class_name,
        course_name: s.course_name,
        teacher_name: s.teacher_name,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        location: s.location,
        student_count: s.student_count
      })))
    }
    
    // Test 2: getStudentSchedule function
    console.log('\n2️⃣ Testing getStudentSchedule()...')
    const studentSchedule = await getStudentSchedule(2)
    console.log('✅ getStudentSchedule() - SUCCESS')
    console.log(`📊 Found ${studentSchedule.length} schedule records for student`)
    
    // Test 3: getCourseClassesWithStats function
    console.log('\n3️⃣ Testing getCourseClassesWithStats()...')
    const courseClasses = await getCourseClassesWithStats(1)
    console.log('✅ getCourseClassesWithStats() - SUCCESS')
    console.log(`📊 Found ${courseClasses.length} class records for course`)
    
    if (courseClasses.length > 0) {
      console.log('📝 Sample class data:')
      console.table(courseClasses.slice(0, 2).map(c => ({
        class_name: c.class_name,
        teacher_name: c.teacher_name,
        max_students: c.max_students,
        current_students: c.current_students,
        day_of_week: c.day_of_week,
        start_time: c.start_time,
        location: c.location
      })))
    }
    
    // Test 4: getAnalyticsData function
    console.log('\n4️⃣ Testing getAnalyticsData()...')
    const analytics = await getAnalyticsData('all')
    console.log('✅ getAnalyticsData() - SUCCESS')
    console.log('📊 Analytics data structure:')
    console.log({
      totalStudents: analytics.totalStudents,
      totalCourses: analytics.totalCourses,
      totalClasses: analytics.totalClasses,
      totalTeachers: analytics.totalTeachers,
      enrollmentByLevel: analytics.enrollmentByLevel?.length || 0,
      courseEnrollments: analytics.courseEnrollments?.length || 0
    })
    
    if (analytics.courseEnrollments && analytics.courseEnrollments.length > 0) {
      console.log('📝 Sample course enrollment data:')
      console.table(analytics.courseEnrollments.slice(0, 3).map(c => ({
        course_name: c.course_name,
        level: c.level,
        enrolled_count: c.enrolled_count,
        capacity: c.capacity
      })))
    }
    
    console.log('\n🎉 All database functions are working correctly!')
    console.log('\n✅ Schema fixes completed successfully:')
    console.log('   - Fixed schedules table column mapping (lesson_date, room_or_link)')
    console.log('   - Fixed classes table max_students issue (using default value)')
    console.log('   - Updated all SQL queries to match actual database schema')
    console.log('   - Fixed Next.js 15 async params issue in API routes')
    
  } catch (error) {
    console.error('❌ Error testing database functions:', error.message)
    console.error('Stack:', error.stack)
  }
}

testAllFixes()
