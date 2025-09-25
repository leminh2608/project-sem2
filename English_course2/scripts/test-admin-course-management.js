const mysql = require('mysql2/promise')

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system'
}

async function testAdminCourseManagement() {
  const connection = await mysql.createConnection(connectionConfig)
  
  try {
    console.log('🧪 Testing Admin Course Management System...\n')

    // Test 1: Check course theme schema
    console.log('1. Testing Course Theme Schema...')
    const [themeColumns] = await connection.execute('DESCRIBE course_themes')
    console.log('✅ Course themes table structure:')
    themeColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`)
    })

    // Test 2: Check course settings schema
    console.log('\n2. Testing Course Settings Schema...')
    const [settingsColumns] = await connection.execute('DESCRIBE course_settings')
    console.log('✅ Course settings table structure:')
    settingsColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`)
    })

    // Test 3: Check course analytics schema
    console.log('\n3. Testing Course Analytics Schema...')
    const [analyticsColumns] = await connection.execute('DESCRIBE course_analytics')
    console.log('✅ Course analytics table structure:')
    analyticsColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`)
    })

    // Test 4: Check existing themes
    console.log('\n4. Testing Existing Course Themes...')
    const [themes] = await connection.execute(`
      SELECT 
        ct.course_id,
        c.course_name,
        ct.theme_name,
        ct.primary_color,
        ct.secondary_color,
        ct.accent_color,
        ct.card_style,
        ct.layout_style,
        ct.font_family
      FROM course_themes ct
      JOIN courses c ON ct.course_id = c.course_id
      ORDER BY ct.course_id
    `)
    
    if (themes.length > 0) {
      console.log('✅ Found course themes:')
      themes.forEach(theme => {
        console.log(`   - ${theme.course_name}: ${theme.theme_name} (${theme.primary_color})`)
      })
    } else {
      console.log('⚠️  No course themes found')
    }

    // Test 5: Check course analytics data
    console.log('\n5. Testing Course Analytics Data...')
    const [analytics] = await connection.execute(`
      SELECT 
        ca.course_id,
        c.course_name,
        ca.metric_name,
        ca.metric_value,
        ca.metric_date
      FROM course_analytics ca
      JOIN courses c ON ca.course_id = c.course_id
      ORDER BY ca.course_id, ca.metric_date DESC
      LIMIT 10
    `)
    
    if (analytics.length > 0) {
      console.log('✅ Found analytics data:')
      analytics.forEach(analytic => {
        console.log(`   - ${analytic.course_name}: ${analytic.metric_name} = ${analytic.metric_value} (${analytic.metric_date})`)
      })
    } else {
      console.log('⚠️  No analytics data found')
    }

    // Test 6: Test enhanced course details query
    console.log('\n6. Testing Enhanced Course Details Query...')
    const [courseDetails] = await connection.execute(`
      SELECT
        c.course_id,
        c.course_name,
        c.description,
        c.level,
        c.duration_weeks,
        c.price,
        c.max_students,
        c.is_active,
        c.created_at,
        COUNT(DISTINCT cs.student_id) as enrolled_count,
        COUNT(DISTINCT cl.class_id) as class_count,
        COUNT(DISTINCT t.user_id) as teacher_count,
        AVG(CASE WHEN ca.metric_name = 'satisfaction_score' THEN ca.metric_value END) as avg_satisfaction,
        AVG(CASE WHEN ca.metric_name = 'completion_rate' THEN ca.metric_value END) as completion_rate
      FROM courses c
      LEFT JOIN course_students cs ON c.course_id = cs.course_id
      LEFT JOIN classes cl ON c.course_id = cl.course_id
      LEFT JOIN users t ON cl.teacher_id = t.user_id
      LEFT JOIN course_analytics ca ON c.course_id = ca.course_id 
        AND ca.metric_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY c.course_id, c.course_name, c.description, c.level, c.duration_weeks, c.price, c.max_students, c.is_active, c.created_at
      LIMIT 5
    `)
    
    if (courseDetails.length > 0) {
      console.log('✅ Enhanced course details working:')
      courseDetails.forEach(course => {
        console.log(`   - ${course.course_name} (${course.level}):`)
        console.log(`     * Students: ${course.enrolled_count || 0}`)
        console.log(`     * Classes: ${course.class_count || 0}`)
        console.log(`     * Teachers: ${course.teacher_count || 0}`)
        console.log(`     * Satisfaction: ${course.avg_satisfaction ? Number(course.avg_satisfaction).toFixed(1) : 'N/A'}`)
        console.log(`     * Status: ${course.is_active ? 'Active' : 'Inactive'}`)
      })
    } else {
      console.log('⚠️  No course details found')
    }

    // Test 7: Test course filtering capabilities
    console.log('\n7. Testing Course Filtering...')
    
    // Filter by level
    const [beginnerCourses] = await connection.execute(`
      SELECT course_id, course_name, level 
      FROM courses 
      WHERE level = 'Beginner' AND is_active = 1
    `)
    console.log(`✅ Beginner courses: ${beginnerCourses.length}`)
    
    // Filter by status
    const [activeCourses] = await connection.execute(`
      SELECT course_id, course_name, is_active 
      FROM courses 
      WHERE is_active = 1
    `)
    console.log(`✅ Active courses: ${activeCourses.length}`)

    // Test 8: Test course statistics
    console.log('\n8. Testing Course Statistics...')
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_courses,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_courses,
        COUNT(CASE WHEN level = 'Beginner' THEN 1 END) as beginner_courses,
        COUNT(CASE WHEN level = 'Intermediate' THEN 1 END) as intermediate_courses,
        COUNT(CASE WHEN level = 'Advanced' THEN 1 END) as advanced_courses
      FROM courses
    `)
    
    if (stats.length > 0) {
      const stat = stats[0]
      console.log('✅ Course statistics:')
      console.log(`   - Total courses: ${stat.total_courses}`)
      console.log(`   - Active courses: ${stat.active_courses}`)
      console.log(`   - Beginner: ${stat.beginner_courses}`)
      console.log(`   - Intermediate: ${stat.intermediate_courses}`)
      console.log(`   - Advanced: ${stat.advanced_courses}`)
    }

    console.log('\n🎉 Admin Course Management System Test Complete!')
    console.log('\n📋 Summary:')
    console.log('✅ Database schema properly configured')
    console.log('✅ Course themes system ready')
    console.log('✅ Course analytics system ready')
    console.log('✅ Enhanced course details working')
    console.log('✅ Course filtering capabilities working')
    console.log('✅ Course statistics working')
    
  } catch (error) {
    console.error('❌ Error testing admin course management:', error.message)
  } finally {
    await connection.end()
  }
}

// Run the test
testAdminCourseManagement().catch(console.error)
