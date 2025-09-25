const mysql = require('mysql2/promise');

async function fixTeacherCrudSchema() {
  try {
    console.log('🔧 Fixing Teacher CRUD Database Schema...\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'english_course_system'
    });
    
    console.log('✅ Connected to database');
    
    // Check if max_students column exists in classes table
    console.log('\n1. Checking classes table schema...');
    const [classesColumns] = await connection.execute(`
      SHOW COLUMNS FROM classes LIKE 'max_students'
    `);
    
    if (classesColumns.length === 0) {
      console.log('   Adding max_students column to classes table...');
      await connection.execute(`
        ALTER TABLE classes 
        ADD COLUMN max_students INT DEFAULT 20 AFTER end_date
      `);
      console.log('   ✅ Added max_students column');
    } else {
      console.log('   ✅ max_students column already exists');
    }
    
    // Check if updated_at column exists in classes table
    const [updatedAtColumns] = await connection.execute(`
      SHOW COLUMNS FROM classes LIKE 'updated_at'
    `);

    if (updatedAtColumns.length === 0) {
      console.log('   Adding updated_at column to classes table...');
      await connection.execute(`
        ALTER TABLE classes
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('   ✅ Added updated_at column');
    } else {
      console.log('   ✅ updated_at column already exists');
    }
    
    // Check if is_active column exists in users table
    console.log('\n2. Checking users table schema...');
    const [isActiveColumns] = await connection.execute(`
      SHOW COLUMNS FROM users LIKE 'is_active'
    `);
    
    if (isActiveColumns.length === 0) {
      console.log('   Adding is_active column to users table...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role
      `);
      console.log('   ✅ Added is_active column');
    } else {
      console.log('   ✅ is_active column already exists');
    }
    
    // Check if last_login column exists in users table
    const [lastLoginColumns] = await connection.execute(`
      SHOW COLUMNS FROM users LIKE 'last_login'
    `);
    
    if (lastLoginColumns.length === 0) {
      console.log('   Adding last_login column to users table...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN last_login TIMESTAMP NULL AFTER is_active
      `);
      console.log('   ✅ Added last_login column');
    } else {
      console.log('   ✅ last_login column already exists');
    }
    
    // Verify the schema changes
    console.log('\n3. Verifying schema changes...');
    
    const [classesSchema] = await connection.execute(`
      DESCRIBE classes
    `);
    
    console.log('   Classes table schema:');
    classesSchema.forEach(column => {
      console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });
    
    const [usersSchema] = await connection.execute(`
      DESCRIBE users
    `);
    
    console.log('\n   Users table schema:');
    usersSchema.forEach(column => {
      console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });
    
    // Test teacher CRUD operations
    console.log('\n4. Testing teacher data...');
    const [teachers] = await connection.execute(`
      SELECT user_id, full_name, email, role, is_active, created_at
      FROM users 
      WHERE role = 'teacher' 
      LIMIT 3
    `);
    
    console.log(`   Found ${teachers.length} teachers:`);
    teachers.forEach(teacher => {
      console.log(`   - ${teacher.full_name} (${teacher.email}) - Active: ${teacher.is_active ? 'Yes' : 'No'}`);
    });
    
    // Test classes data
    const [classes] = await connection.execute(`
      SELECT c.class_id, c.class_name, c.max_students, u.full_name as teacher_name
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.user_id
      LIMIT 3
    `);
    
    console.log(`\n   Found ${classes.length} classes:`);
    classes.forEach(cls => {
      console.log(`   - ${cls.class_name} (Max: ${cls.max_students}) - Teacher: ${cls.teacher_name || 'Not assigned'}`);
    });
    
    await connection.end();
    console.log('\n✅ Teacher CRUD schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing teacher CRUD schema:', error);
    process.exit(1);
  }
}

// Run the schema fix
fixTeacherCrudSchema();
