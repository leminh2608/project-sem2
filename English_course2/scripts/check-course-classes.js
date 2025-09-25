const mysql = require('mysql2/promise')

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system'
}

async function checkCourseClasses() {
  const connection = await mysql.createConnection(connectionConfig)
  
  try {
    console.log('🔍 Checking courses and their classes...\n')
    
    // Check all courses
    const [courses] = await connection.execute('SELECT * FROM courses')
    console.log('📋 Available courses:')
    console.table(courses)
    
    // Check all classes
    const [classes] = await connection.execute(`
      SELECT 
        cl.class_id,
        cl.course_id,
        cl.class_name,
        c.course_name,
        u.full_name as teacher_name
      FROM classes cl
      INNER JOIN courses c ON cl.course_id = c.course_id
      INNER JOIN users u ON cl.teacher_id = u.user_id
    `)
    console.log('\n📋 Available classes:')
    console.table(classes)
    
    // Check schedules
    const [schedules] = await connection.execute(`
      SELECT 
        s.schedule_id,
        s.class_id,
        cl.class_name,
        s.lesson_date,
        s.start_time,
        s.end_time,
        s.room_or_link
      FROM schedules s
      INNER JOIN classes cl ON s.class_id = cl.class_id
    `)
    console.log('\n📋 Available schedules:')
    console.table(schedules)
    
    // Check class students
    const [classStudents] = await connection.execute(`
      SELECT 
        cs.class_id,
        cl.class_name,
        cs.student_id,
        u.full_name as student_name
      FROM class_students cs
      INNER JOIN classes cl ON cs.class_id = cl.class_id
      INNER JOIN users u ON cs.student_id = u.user_id
    `)
    console.log('\n📋 Class student assignments:')
    console.table(classStudents)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await connection.end()
  }
}

checkCourseClasses()
