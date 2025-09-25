const { getCourseClassesWithStats } = require('../src/lib/db-direct.ts')

async function testClassDeduplication() {
  console.log('🧪 Testing class deduplication fix...\n')
  
  try {
    // Test with course ID 5 (Tiếng Anh Giao Tiếp)
    console.log('1️⃣ Testing getCourseClassesWithStats() for course ID 5...')
    const classes1 = await getCourseClassesWithStats(5)
    console.log(`📊 Found ${classes1.length} class records for course 5`)
    
    if (classes1.length > 0) {
      console.log('📝 Class data for course 5:')
      console.table(classes1.map(c => ({
        class_id: c.class_id,
        class_name: c.class_name,
        teacher_name: c.teacher_name,
        max_students: c.max_students,
        current_students: c.current_students,
        schedule_time: c.schedule_time,
        location: c.location
      })))
      
      // Check for duplicates
      const classIds = classes1.map(c => c.class_id)
      const uniqueClassIds = [...new Set(classIds)]
      
      if (classIds.length === uniqueClassIds.length) {
        console.log('✅ No duplicate class_id values found!')
      } else {
        console.log('❌ Duplicate class_id values detected:')
        const duplicates = classIds.filter((id, index) => classIds.indexOf(id) !== index)
        console.log('Duplicate IDs:', [...new Set(duplicates)])
      }
    }
    
    // Test with course ID 6 (IELTS Foundation)
    console.log('\n2️⃣ Testing getCourseClassesWithStats() for course ID 6...')
    const classes2 = await getCourseClassesWithStats(6)
    console.log(`📊 Found ${classes2.length} class records for course 6`)
    
    if (classes2.length > 0) {
      console.log('📝 Class data for course 6:')
      console.table(classes2.map(c => ({
        class_id: c.class_id,
        class_name: c.class_name,
        teacher_name: c.teacher_name,
        max_students: c.max_students,
        current_students: c.current_students,
        schedule_time: c.schedule_time,
        location: c.location
      })))
      
      // Check for duplicates
      const classIds = classes2.map(c => c.class_id)
      const uniqueClassIds = [...new Set(classIds)]
      
      if (classIds.length === uniqueClassIds.length) {
        console.log('✅ No duplicate class_id values found!')
      } else {
        console.log('❌ Duplicate class_id values detected:')
        const duplicates = classIds.filter((id, index) => classIds.indexOf(id) !== index)
        console.log('Duplicate IDs:', [...new Set(duplicates)])
      }
    }
    
    console.log('\n🎉 Class deduplication test completed!')
    console.log('\n✅ Fixes implemented:')
    console.log('   - Modified SQL query to use GROUP BY with proper aggregation')
    console.log('   - Added GROUP_CONCAT for schedule_time and location')
    console.log('   - Used COUNT(DISTINCT) for current_students')
    console.log('   - Added client-side deduplication in React component')
    console.log('   - Implemented composite keys for React rendering')
    
  } catch (error) {
    console.error('❌ Error testing class deduplication:', error.message)
    console.error('Stack:', error.stack)
  }
}

testClassDeduplication()
