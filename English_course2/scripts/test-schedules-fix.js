const { getAllSchedules, getStudentSchedule } = require('../src/lib/db-direct.ts')

async function testSchedulesFunctions() {
  console.log('🧪 Testing fixed schedule functions...\n')
  
  try {
    // Test getAllSchedules function
    console.log('1️⃣ Testing getAllSchedules()...')
    const allSchedules = await getAllSchedules()
    console.log('✅ getAllSchedules() - SUCCESS')
    console.log(`📊 Found ${allSchedules.length} schedule records`)
    
    if (allSchedules.length > 0) {
      console.log('\n📝 Sample schedule data:')
      console.table(allSchedules.map(s => ({
        schedule_id: s.schedule_id,
        class_name: s.class_name,
        course_name: s.course_name,
        teacher_name: s.teacher_name,
        lesson_date: s.lesson_date,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        location: s.location,
        student_count: s.student_count
      })))
    }
    
    // Test getStudentSchedule function
    console.log('\n2️⃣ Testing getStudentSchedule()...')
    const studentSchedule = await getStudentSchedule(2) // Test with student ID 2
    console.log('✅ getStudentSchedule() - SUCCESS')
    console.log(`📊 Found ${studentSchedule.length} schedule records for student`)
    
    if (studentSchedule.length > 0) {
      console.log('\n📝 Student schedule data:')
      console.table(studentSchedule.map(s => ({
        class_name: s.class_name,
        course_name: s.course_name,
        teacher_name: s.teacher_name,
        lesson_date: s.lesson_date,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        location: s.location
      })))
    }
    
    console.log('\n🎉 All schedule functions are working correctly!')
    
  } catch (error) {
    console.error('❌ Error testing schedule functions:', error.message)
    console.error('Stack:', error.stack)
  }
}

testSchedulesFunctions()
