const mysql = require('mysql2/promise');

async function createCourseThemeSchema() {
  try {
    console.log('🔧 Creating course theme schema...\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    // Create course_themes table
    console.log('1. Creating course_themes table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_themes (
        theme_id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        theme_name VARCHAR(100) NOT NULL DEFAULT 'Default',
        primary_color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
        secondary_color VARCHAR(7) NOT NULL DEFAULT '#1E40AF',
        accent_color VARCHAR(7) NOT NULL DEFAULT '#F59E0B',
        background_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
        text_color VARCHAR(7) NOT NULL DEFAULT '#1F2937',
        card_style ENUM('default', 'rounded', 'shadow', 'bordered') DEFAULT 'default',
        layout_style ENUM('grid', 'list', 'card') DEFAULT 'grid',
        font_family VARCHAR(50) DEFAULT 'Inter',
        custom_css TEXT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        UNIQUE KEY unique_course_theme (course_id)
      )
    `);
    console.log('   ✅ course_themes table created');
    
    // Create course_settings table for additional course configurations
    console.log('2. Creating course_settings table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_settings (
        setting_id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT NOT NULL,
        setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        UNIQUE KEY unique_course_setting (course_id, setting_key)
      )
    `);
    console.log('   ✅ course_settings table created');
    
    // Create course_analytics table for tracking course performance
    console.log('3. Creating course_analytics table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_analytics (
        analytics_id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(10,2) NOT NULL,
        metric_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        INDEX idx_course_metric_date (course_id, metric_name, metric_date)
      )
    `);
    console.log('   ✅ course_analytics table created');
    
    // Insert default themes for existing courses
    console.log('4. Creating default themes for existing courses...');
    const [courses] = await connection.execute('SELECT course_id, course_name, level FROM courses');
    
    for (const course of courses) {
      // Define theme colors based on course level
      let primaryColor = '#3B82F6'; // Blue
      let secondaryColor = '#1E40AF';
      let accentColor = '#F59E0B'; // Amber
      
      switch (course.level) {
        case 'Beginner':
          primaryColor = '#10B981'; // Green
          secondaryColor = '#059669';
          accentColor = '#34D399';
          break;
        case 'Intermediate':
          primaryColor = '#F59E0B'; // Amber
          secondaryColor = '#D97706';
          accentColor = '#FBBF24';
          break;
        case 'Advanced':
          primaryColor = '#EF4444'; // Red
          secondaryColor = '#DC2626';
          accentColor = '#F87171';
          break;
      }
      
      await connection.execute(`
        INSERT IGNORE INTO course_themes (
          course_id, theme_name, primary_color, secondary_color, accent_color,
          background_color, text_color, card_style, layout_style, font_family
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        course.course_id,
        `${course.level} Theme`,
        primaryColor,
        secondaryColor,
        accentColor,
        '#FFFFFF',
        '#1F2937',
        'default',
        'grid',
        'Inter'
      ]);
      
      console.log(`   ✅ Default theme created for course: ${course.course_name}`);
    }
    
    // Insert some sample analytics data
    console.log('5. Creating sample analytics data...');
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    for (const course of courses) {
      // Sample metrics
      const metrics = [
        { name: 'enrollment_rate', value: Math.floor(Math.random() * 100) },
        { name: 'completion_rate', value: Math.floor(Math.random() * 100) },
        { name: 'satisfaction_score', value: Math.floor(Math.random() * 5) + 1 },
        { name: 'attendance_rate', value: Math.floor(Math.random() * 100) }
      ];
      
      for (const metric of metrics) {
        // Insert data for last month, last week, and today
        for (const date of [lastMonth, lastWeek, today]) {
          await connection.execute(`
            INSERT IGNORE INTO course_analytics (course_id, metric_name, metric_value, metric_date)
            VALUES (?, ?, ?, ?)
          `, [
            course.course_id,
            metric.name,
            metric.value + Math.floor(Math.random() * 10) - 5, // Add some variation
            date.toISOString().split('T')[0]
          ]);
        }
      }
      
      console.log(`   ✅ Sample analytics created for course: ${course.course_name}`);
    }
    
    // Insert some default course settings
    console.log('6. Creating default course settings...');
    for (const course of courses) {
      const settings = [
        { key: 'allow_self_enrollment', value: 'true', type: 'boolean' },
        { key: 'max_class_size', value: '25', type: 'number' },
        { key: 'notification_enabled', value: 'true', type: 'boolean' },
        { key: 'certificate_template', value: 'default', type: 'string' },
        { key: 'grading_system', value: 'percentage', type: 'string' }
      ];
      
      for (const setting of settings) {
        await connection.execute(`
          INSERT IGNORE INTO course_settings (course_id, setting_key, setting_value, setting_type)
          VALUES (?, ?, ?, ?)
        `, [course.course_id, setting.key, setting.value, setting.type]);
      }
      
      console.log(`   ✅ Default settings created for course: ${course.course_name}`);
    }
    
    await connection.end();
    
    console.log('\n✅ Course theme schema creation complete!');
    
    console.log('\n📋 Summary:');
    console.log('   ✅ course_themes table created with theme customization options');
    console.log('   ✅ course_settings table created for flexible course configuration');
    console.log('   ✅ course_analytics table created for performance tracking');
    console.log('   ✅ Default themes created for all existing courses');
    console.log('   ✅ Sample analytics data generated');
    console.log('   ✅ Default course settings configured');
    
    console.log('\n🎨 Theme Features:');
    console.log('   - Custom color schemes per course');
    console.log('   - Multiple layout styles (grid, list, card)');
    console.log('   - Card styling options (default, rounded, shadow, bordered)');
    console.log('   - Custom CSS support');
    console.log('   - Font family customization');
    console.log('   - Level-based default themes');
    
  } catch (error) {
    console.error('❌ Error creating course theme schema:', error);
    process.exit(1);
  }
}

// Run the schema creation
createCourseThemeSchema();
