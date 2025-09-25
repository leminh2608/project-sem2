import mysql from 'mysql2/promise'

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'english_course_system',
}

export async function findUserByEmail(email: string) {
  const connection = await mysql.createConnection({
    ...connectionConfig,
    // Add connection timeout settings
    connectTimeout: 10000, // 10 seconds
  })

  try {
    const [rows] = await connection.execute(
      'SELECT user_id, full_name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    )

    const users = rows as any[]
    return users.length > 0 ? {
      userId: users[0].user_id,
      fullName: users[0].full_name,
      email: users[0].email,
      password: users[0].password,
      role: users[0].role,
      createdAt: users[0].created_at,
    } : null
  } catch (error) {
    console.error('Database error in findUserByEmail:', error)
    throw error
  } finally {
    await connection.end()
  }
}

export async function testConnection() {
  try {
    const connection = await mysql.createConnection(connectionConfig)
    await connection.execute('SELECT 1')
    await connection.end()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export async function findCourses(filters: {
  level?: string
  search?: string
  limit: number
  offset: number
}) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    let query = `
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
        COUNT(cs.student_id) as enrolled_count,
        COUNT(DISTINCT cl.class_id) as class_count
      FROM courses c
      LEFT JOIN course_students cs ON c.course_id = cs.course_id
      LEFT JOIN classes cl ON c.course_id = cl.course_id
    `

    const conditions = []
    const params = []

    if (filters.level) {
      conditions.push('c.level = ?')
      params.push(filters.level)
    }

    if (filters.search) {
      conditions.push('(c.course_name LIKE ? OR c.description LIKE ?)')
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += `
      GROUP BY c.course_id, c.course_name, c.description, c.level,
               c.duration_weeks, c.price, c.max_students, c.is_active, c.created_at
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `

    params.push(filters.limit, filters.offset)

    const [rows] = await connection.execute(query, params)
    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getCourseStats() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM courses')
    const [levelResult] = await connection.execute(`
      SELECT level, COUNT(*) as count
      FROM courses
      GROUP BY level
    `)

    return {
      totalCourses: (totalResult as any[])[0].total,
      byLevel: levelResult as any[]
    }
  } finally {
    await connection.end()
  }
}

export async function getCourseById(courseId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
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
        COUNT(cs.student_id) as enrolled_count
      FROM courses c
      LEFT JOIN course_students cs ON c.course_id = cs.course_id
      WHERE c.course_id = ?
      GROUP BY c.course_id, c.course_name, c.description, c.level,
               c.duration_weeks, c.price, c.max_students, c.is_active, c.created_at
    `, [courseId])

    const courses = rows as any[]
    return courses.length > 0 ? courses[0] : null
  } finally {
    await connection.end()
  }
}

export async function getCourseClasses(courseId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        cl.class_id,
        cl.class_name,
        cl.start_date,
        cl.end_date,
        u.full_name as teacher_name,
        COUNT(cls.student_id) as student_count
      FROM classes cl
      LEFT JOIN users u ON cl.teacher_id = u.user_id
      LEFT JOIN class_students cls ON cl.class_id = cls.class_id
      WHERE cl.course_id = ?
      GROUP BY cl.class_id, cl.class_name, cl.start_date, cl.end_date, u.full_name
      ORDER BY cl.start_date
    `, [courseId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getStudentRegistrationStatus(courseId: number, studentId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        cs.registered_at,
        cls.class_id,
        cl.class_name,
        cls.joined_at
      FROM course_students cs
      LEFT JOIN class_students cls ON cs.student_id = cls.student_id
      LEFT JOIN classes cl ON cls.class_id = cl.class_id AND cl.course_id = cs.course_id
      WHERE cs.course_id = ? AND cs.student_id = ?
    `, [courseId, studentId])

    const registrations = rows as any[]
    return registrations.length > 0 ? registrations[0] : null
  } finally {
    await connection.end()
  }
}

export async function registerStudentForCourse(courseId: number, studentId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    await connection.execute(`
      INSERT INTO course_students (course_id, student_id, registered_at)
      VALUES (?, ?, NOW())
    `, [courseId, studentId])
  } finally {
    await connection.end()
  }
}

export async function unregisterStudentFromCourse(courseId: number, studentId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Remove from class_students first (if assigned)
    await connection.execute(`
      DELETE cls FROM class_students cls
      INNER JOIN classes cl ON cls.class_id = cl.class_id
      WHERE cl.course_id = ? AND cls.student_id = ?
    `, [courseId, studentId])

    // Remove from course_students
    await connection.execute(`
      DELETE FROM course_students
      WHERE course_id = ? AND student_id = ?
    `, [courseId, studentId])
  } finally {
    await connection.end()
  }
}

export async function getStudentEnrolledCourses(studentId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        c.course_id,
        c.course_name,
        c.description,
        c.level,
        cs.registered_at,
        cl.class_id,
        cl.class_name,
        cl.start_date,
        cl.end_date,
        u.full_name as teacher_name
      FROM course_students cs
      INNER JOIN courses c ON cs.course_id = c.course_id
      LEFT JOIN class_students cls ON cs.course_id = cls.class_id AND cs.student_id = cls.student_id
      LEFT JOIN classes cl ON cls.class_id = cl.class_id
      LEFT JOIN users u ON cl.teacher_id = u.user_id
      WHERE cs.student_id = ?
      ORDER BY cs.registered_at DESC
    `, [studentId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getAllCourseRegistrations() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        c.course_id,
        c.course_name,
        c.level,
        cs.student_id,
        u.full_name as student_name,
        u.email as student_email,
        cs.registered_at,
        cl.class_id,
        cl.class_name,
        cls.joined_at as assigned_at
      FROM course_students cs
      INNER JOIN courses c ON cs.course_id = c.course_id
      INNER JOIN users u ON cs.student_id = u.user_id
      LEFT JOIN class_students cls ON cs.course_id = cls.class_id AND cs.student_id = cls.student_id
      LEFT JOIN classes cl ON cls.class_id = cl.class_id
      ORDER BY cs.registered_at DESC
    `)

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getAllCoursesWithStats() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        c.course_id,
        c.course_name,
        c.level,
        COUNT(DISTINCT cs.student_id) as enrolled_count,
        COUNT(DISTINCT cl.class_id) as class_count
      FROM courses c
      LEFT JOIN course_students cs ON c.course_id = cs.course_id
      LEFT JOIN classes cl ON c.course_id = cl.course_id
      GROUP BY c.course_id, c.course_name, c.level
      ORDER BY c.course_name
    `)

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getCourseRegisteredStudents(courseId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        cs.student_id,
        u.full_name as student_name,
        u.email as student_email,
        cs.registered_at,
        cls.class_id,
        cl.class_name
      FROM course_students cs
      INNER JOIN users u ON cs.student_id = u.user_id
      LEFT JOIN class_students cls ON cs.student_id = cls.student_id AND cs.course_id = cls.class_id
      LEFT JOIN classes cl ON cls.class_id = cl.class_id
      WHERE cs.course_id = ?
      ORDER BY cs.registered_at DESC
    `, [courseId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getCourseClassesWithStats(courseId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        cl.class_id,
        cl.class_name,
        cl.start_date,
        cl.end_date,
        30 as max_students,
        u.full_name as teacher_name,
        GROUP_CONCAT(
          DISTINCT CONCAT(
            COALESCE(DAYNAME(s.lesson_date), 'TBD'),
            ' ',
            COALESCE(s.start_time, ''),
            COALESCE(CONCAT('-', s.end_time), '')
          )
          ORDER BY s.lesson_date, s.start_time
          SEPARATOR ', '
        ) as schedule_time,
        GROUP_CONCAT(DISTINCT s.room_or_link ORDER BY s.lesson_date SEPARATOR ', ') as location,
        COUNT(DISTINCT cls.student_id) as current_students
      FROM classes cl
      INNER JOIN users u ON cl.teacher_id = u.user_id
      LEFT JOIN schedules s ON cl.class_id = s.class_id
      LEFT JOIN class_students cls ON cl.class_id = cls.class_id
      WHERE cl.course_id = ?
      GROUP BY cl.class_id, cl.class_name, cl.start_date, cl.end_date, u.full_name
      ORDER BY cl.class_name
    `, [courseId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function assignStudentToClass(courseId: number, studentId: number, classId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Start transaction
    await connection.beginTransaction()

    // Check if student is registered for the course
    const [courseCheck] = await connection.execute(`
      SELECT 1 FROM course_students
      WHERE course_id = ? AND student_id = ?
    `, [courseId, studentId])

    if (!Array.isArray(courseCheck) || courseCheck.length === 0) {
      await connection.rollback()
      return { success: false, error: 'Student is not registered for this course' }
    }

    // Check if class belongs to the course
    const [classCheck] = await connection.execute(`
      SELECT class_id FROM classes
      WHERE class_id = ? AND course_id = ?
    `, [classId, courseId])

    if (!Array.isArray(classCheck) || classCheck.length === 0) {
      await connection.rollback()
      return { success: false, error: 'Class does not belong to this course' }
    }

    const maxStudents = 30 // Default max students per class

    // Check current enrollment
    const [enrollmentCheck] = await connection.execute(`
      SELECT COUNT(*) as current_count FROM class_students
      WHERE class_id = ?
    `, [classId])

    const currentCount = (enrollmentCheck as any[])[0].current_count

    if (currentCount >= maxStudents) {
      await connection.rollback()
      return { success: false, error: 'Class is full' }
    }

    // Check if student is already assigned to a class for this course
    const [existingAssignment] = await connection.execute(`
      SELECT cl.class_name FROM class_students cls
      INNER JOIN classes cl ON cls.class_id = cl.class_id
      WHERE cls.student_id = ? AND cl.course_id = ?
    `, [studentId, courseId])

    if (Array.isArray(existingAssignment) && existingAssignment.length > 0) {
      await connection.rollback()
      const className = (existingAssignment[0] as any).class_name
      return { success: false, error: `Student is already assigned to class: ${className}` }
    }

    // Assign student to class
    await connection.execute(`
      INSERT INTO class_students (class_id, student_id, joined_at)
      VALUES (?, ?, NOW())
    `, [classId, studentId])

    await connection.commit()

    return {
      success: true,
      assignment: {
        class_id: classId,
        student_id: studentId,
        joined_at: new Date()
      }
    }
  } catch (error) {
    await connection.rollback()
    console.error('Error assigning student to class:', error)
    return { success: false, error: 'Database error occurred' }
  } finally {
    await connection.end()
  }
}

export async function unassignStudentFromClass(courseId: number, studentId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Start transaction
    await connection.beginTransaction()

    // Find and remove the class assignment for this course
    await connection.execute(`
      DELETE cls FROM class_students cls
      INNER JOIN classes cl ON cls.class_id = cl.class_id
      WHERE cls.student_id = ? AND cl.course_id = ?
    `, [studentId, courseId])

    await connection.commit()

    return { success: true }
  } catch (error) {
    await connection.rollback()
    console.error('Error unassigning student from class:', error)
    return { success: false, error: 'Database error occurred' }
  } finally {
    await connection.end()
  }
}



export async function getStudentSchedule(studentId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        s.schedule_id,
        s.class_id,
        cl.class_name,
        c.course_name,
        c.level,
        u.full_name as teacher_name,
        s.lesson_date,
        DAYNAME(s.lesson_date) as day_of_week,
        s.start_time,
        s.end_time,
        s.room_or_link as location,
        cl.start_date,
        cl.end_date
      FROM class_students cls
      INNER JOIN classes cl ON cls.class_id = cl.class_id
      INNER JOIN courses c ON cl.course_id = c.course_id
      INNER JOIN users u ON cl.teacher_id = u.user_id
      INNER JOIN schedules s ON cl.class_id = s.class_id
      WHERE cls.student_id = ?
      ORDER BY
        s.lesson_date,
        s.start_time
    `, [studentId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getTeacherClasses(teacherId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        cl.class_id,
        cl.class_name,
        c.course_name,
        cl.start_date,
        cl.end_date,
        'TBD' as schedule_time,
        'Classroom' as location,
        COUNT(DISTINCT cls.student_id) as student_count,
        cl.max_students,
        COUNT(DISTINCT s.schedule_id) as schedule_count
      FROM classes cl
      INNER JOIN courses c ON cl.course_id = c.course_id
      LEFT JOIN class_students cls ON cl.class_id = cls.class_id
      LEFT JOIN schedules s ON cl.class_id = s.class_id
      WHERE cl.teacher_id = ?
      GROUP BY cl.class_id, cl.class_name, c.course_name, cl.start_date, cl.end_date, cl.max_students
      ORDER BY cl.class_name
    `, [teacherId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getClassStudents(classId: number, teacherId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Verify teacher owns this class
    const [classCheck] = await connection.execute(`
      SELECT 1 FROM classes WHERE class_id = ? AND teacher_id = ?
    `, [classId, teacherId])

    if (!Array.isArray(classCheck) || classCheck.length === 0) {
      throw new Error('Unauthorized access to class')
    }

    const [rows] = await connection.execute(`
      SELECT
        cls.student_id,
        u.full_name as student_name,
        u.email as student_email,
        cls.joined_at
      FROM class_students cls
      INNER JOIN users u ON cls.student_id = u.user_id
      WHERE cls.class_id = ?
      ORDER BY u.full_name
    `, [classId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getTeacherClassById(classId: number, teacherId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Verify teacher owns this class and get class details
    const [rows] = await connection.execute(`
      SELECT
        cl.class_id,
        cl.class_name,
        c.course_name,
        cl.start_date,
        cl.end_date,
        cl.max_students,
        CASE
          WHEN s.start_time IS NOT NULL AND s.end_time IS NOT NULL THEN
            CONCAT(TIME_FORMAT(s.start_time, '%h:%i %p'), ' - ', TIME_FORMAT(s.end_time, '%h:%i %p'))
          ELSE 'TBD'
        END as schedule_time,
        COALESCE(s.room_or_link, 'TBD') as location
      FROM classes cl
      INNER JOIN courses c ON cl.course_id = c.course_id
      LEFT JOIN schedules s ON cl.class_id = s.class_id
      WHERE cl.class_id = ? AND cl.teacher_id = ?
      GROUP BY cl.class_id, cl.class_name, c.course_name, cl.start_date, cl.end_date, cl.max_students
      LIMIT 1
    `, [classId, teacherId])

    const classes = rows as any[]
    return classes.length > 0 ? classes[0] : null
  } finally {
    await connection.end()
  }
}

export async function getStudentClasses(studentId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        cl.class_id,
        cl.class_name,
        c.course_name,
        u.full_name as teacher_name,
        cl.start_date,
        cl.end_date,
        CASE
          WHEN s.start_time IS NOT NULL AND s.end_time IS NOT NULL THEN
            CONCAT(TIME_FORMAT(s.start_time, '%h:%i %p'), ' - ', TIME_FORMAT(s.end_time, '%h:%i %p'))
          ELSE 'TBD'
        END as schedule_time,
        COALESCE(s.room_or_link, 'TBD') as location,
        cl.max_students,
        (SELECT COUNT(*) FROM class_students WHERE class_id = cl.class_id) as student_count,
        (SELECT MIN(lesson_date) FROM schedules WHERE class_id = cl.class_id AND lesson_date > CURDATE()) as next_class
      FROM class_students cs
      INNER JOIN classes cl ON cs.class_id = cl.class_id
      INNER JOIN courses c ON cl.course_id = c.course_id
      INNER JOIN users u ON cl.teacher_id = u.user_id
      LEFT JOIN schedules s ON cl.class_id = s.class_id
      WHERE cs.student_id = ?
      GROUP BY cl.class_id, cl.class_name, c.course_name, u.full_name, cl.start_date, cl.end_date, cl.max_students
      ORDER BY cl.start_date DESC
    `, [studentId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getStudentClassById(classId: number, studentId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Verify student is enrolled in this class and get class details
    const [rows] = await connection.execute(`
      SELECT
        cl.class_id,
        cl.class_name,
        c.course_name,
        u.full_name as teacher_name,
        u.email as teacher_email,
        cl.start_date,
        cl.end_date,
        cl.max_students,
        CASE
          WHEN s.start_time IS NOT NULL AND s.end_time IS NOT NULL THEN
            CONCAT(TIME_FORMAT(s.start_time, '%h:%i %p'), ' - ', TIME_FORMAT(s.end_time, '%h:%i %p'))
          ELSE 'TBD'
        END as schedule_time,
        COALESCE(s.room_or_link, 'TBD') as location,
        (SELECT COUNT(*) FROM class_students WHERE class_id = cl.class_id) as student_count
      FROM class_students cs
      INNER JOIN classes cl ON cs.class_id = cl.class_id
      INNER JOIN courses c ON cl.course_id = c.course_id
      INNER JOIN users u ON cl.teacher_id = u.user_id
      LEFT JOIN schedules s ON cl.class_id = s.class_id
      WHERE cl.class_id = ? AND cs.student_id = ?
      GROUP BY cl.class_id, cl.class_name, c.course_name, u.full_name, u.email, cl.start_date, cl.end_date, cl.max_students
      LIMIT 1
    `, [classId, studentId])

    const classes = rows as any[]
    return classes.length > 0 ? classes[0] : null
  } finally {
    await connection.end()
  }
}

export async function getStudentClassSchedules(classId: number, studentId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // First verify student is enrolled in this class
    const [enrollmentCheck] = await connection.execute(`
      SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?
    `, [classId, studentId])

    if ((enrollmentCheck as any[]).length === 0) {
      return []
    }

    // Get class schedules
    const [rows] = await connection.execute(`
      SELECT
        schedule_id,
        lesson_date,
        start_time,
        end_time,
        room_or_link
      FROM schedules
      WHERE class_id = ?
      ORDER BY lesson_date ASC
    `, [classId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

// Course Theme Management Functions
export async function getCourseTheme(courseId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        theme_id,
        course_id,
        theme_name,
        primary_color,
        secondary_color,
        accent_color,
        background_color,
        text_color,
        card_style,
        layout_style,
        font_family,
        custom_css,
        is_active,
        created_at,
        updated_at
      FROM course_themes
      WHERE course_id = ? AND is_active = TRUE
      LIMIT 1
    `, [courseId])

    const themes = rows as any[]
    return themes.length > 0 ? themes[0] : null
  } finally {
    await connection.end()
  }
}

export async function updateCourseTheme(courseId: number, themeData: {
  themeName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  cardStyle: string
  layoutStyle: string
  fontFamily: string
  customCss?: string
}) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Check if theme exists
    const [existingTheme] = await connection.execute(`
      SELECT theme_id FROM course_themes WHERE course_id = ?
    `, [courseId])

    if ((existingTheme as any[]).length > 0) {
      // Update existing theme
      await connection.execute(`
        UPDATE course_themes SET
          theme_name = ?,
          primary_color = ?,
          secondary_color = ?,
          accent_color = ?,
          background_color = ?,
          text_color = ?,
          card_style = ?,
          layout_style = ?,
          font_family = ?,
          custom_css = ?,
          updated_at = NOW()
        WHERE course_id = ?
      `, [
        themeData.themeName,
        themeData.primaryColor,
        themeData.secondaryColor,
        themeData.accentColor,
        themeData.backgroundColor,
        themeData.textColor,
        themeData.cardStyle,
        themeData.layoutStyle,
        themeData.fontFamily,
        themeData.customCss || null,
        courseId
      ])
    } else {
      // Create new theme
      await connection.execute(`
        INSERT INTO course_themes (
          course_id, theme_name, primary_color, secondary_color, accent_color,
          background_color, text_color, card_style, layout_style, font_family, custom_css
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        courseId,
        themeData.themeName,
        themeData.primaryColor,
        themeData.secondaryColor,
        themeData.accentColor,
        themeData.backgroundColor,
        themeData.textColor,
        themeData.cardStyle,
        themeData.layoutStyle,
        themeData.fontFamily,
        themeData.customCss || null
      ])
    }

    // Return updated theme
    return await getCourseTheme(courseId)
  } finally {
    await connection.end()
  }
}

export async function getCourseSettings(courseId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM course_settings
      WHERE course_id = ?
    `, [courseId])

    const settings = {} as any
    for (const row of rows as any[]) {
      let value = row.setting_value

      // Convert value based on type
      switch (row.setting_type) {
        case 'boolean':
          value = value === 'true'
          break
        case 'number':
          value = parseFloat(value)
          break
        case 'json':
          try {
            value = JSON.parse(value)
          } catch (e) {
            value = row.setting_value
          }
          break
      }

      settings[row.setting_key] = value
    }

    return settings
  } finally {
    await connection.end()
  }
}

export async function updateCourseSetting(courseId: number, key: string, value: any, type: string = 'string') {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    let stringValue = value

    // Convert value to string based on type
    switch (type) {
      case 'boolean':
        stringValue = value ? 'true' : 'false'
        break
      case 'number':
        stringValue = value.toString()
        break
      case 'json':
        stringValue = JSON.stringify(value)
        break
      default:
        stringValue = value.toString()
    }

    await connection.execute(`
      INSERT INTO course_settings (course_id, setting_key, setting_value, setting_type)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        setting_type = VALUES(setting_type),
        updated_at = NOW()
    `, [courseId, key, stringValue, type])

    return { success: true }
  } finally {
    await connection.end()
  }
}

export async function getCourseAnalytics(courseId: number, days: number = 30) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        metric_name,
        metric_value,
        metric_date
      FROM course_analytics
      WHERE course_id = ? AND metric_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY metric_date DESC, metric_name
    `, [courseId, days])

    const analytics = {} as any
    for (const row of rows as any[]) {
      if (!analytics[row.metric_name]) {
        analytics[row.metric_name] = []
      }
      analytics[row.metric_name].push({
        value: parseFloat(row.metric_value),
        date: row.metric_date
      })
    }

    return analytics
  } finally {
    await connection.end()
  }
}

export async function addCourseAnalytic(courseId: number, metricName: string, metricValue: number, date?: string) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const metricDate = date || new Date().toISOString().split('T')[0]

    await connection.execute(`
      INSERT INTO course_analytics (course_id, metric_name, metric_value, metric_date)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        metric_value = VALUES(metric_value)
    `, [courseId, metricName, metricValue, metricDate])

    return { success: true }
  } finally {
    await connection.end()
  }
}

export async function getEnhancedCourseDetails(courseId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Get course basic info with stats
    const [courseRows] = await connection.execute(`
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
      WHERE c.course_id = ?
      GROUP BY c.course_id, c.course_name, c.description, c.level, c.duration_weeks, c.price, c.max_students, c.is_active, c.created_at
    `, [courseId])

    if ((courseRows as any[]).length === 0) {
      return null
    }

    const course = (courseRows as any[])[0]

    // Get course theme
    const theme = await getCourseTheme(courseId)

    // Get course settings
    const settings = await getCourseSettings(courseId)

    // Get recent analytics
    const analytics = await getCourseAnalytics(courseId, 30)

    // Get classes with teacher info
    const [classRows] = await connection.execute(`
      SELECT
        cl.class_id,
        cl.class_name,
        cl.start_date,
        cl.end_date,
        cl.max_students,
        u.full_name as teacher_name,
        u.email as teacher_email,
        COUNT(cls.student_id) as enrolled_students
      FROM classes cl
      LEFT JOIN users u ON cl.teacher_id = u.user_id
      LEFT JOIN class_students cls ON cl.class_id = cls.class_id
      WHERE cl.course_id = ?
      GROUP BY cl.class_id, cl.class_name, cl.start_date, cl.end_date, cl.max_students, u.full_name, u.email
      ORDER BY cl.start_date DESC
    `, [courseId])

    // Get enrolled students
    const [studentRows] = await connection.execute(`
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        cs.registered_at,
        cl.class_name,
        cls.joined_at as class_joined_at
      FROM course_students cs
      INNER JOIN users u ON cs.student_id = u.user_id
      LEFT JOIN class_students cls ON cs.student_id = cls.student_id
      LEFT JOIN classes cl ON cls.class_id = cl.class_id AND cl.course_id = cs.course_id
      WHERE cs.course_id = ?
      ORDER BY cs.registered_at DESC
    `, [courseId])

    return {
      ...course,
      theme,
      settings,
      analytics,
      classes: classRows,
      students: studentRows
    }
  } finally {
    await connection.end()
  }
}

export async function bulkUpdateCourseStatus(courseIds: number[], isActive: boolean) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    if (courseIds.length === 0) {
      return { success: false, error: 'No courses selected' }
    }

    const placeholders = courseIds.map(() => '?').join(',')
    await connection.execute(`
      UPDATE courses
      SET is_active = ?
      WHERE course_id IN (${placeholders})
    `, [isActive ? 1 : 0, ...courseIds])

    return {
      success: true,
      message: `${courseIds.length} course(s) ${isActive ? 'activated' : 'deactivated'} successfully`
    }
  } finally {
    await connection.end()
  }
}

export async function getCoursesWithAdvancedFilters(filters: {
  search?: string
  level?: string
  status?: string
  teacherId?: number
  enrollmentRange?: { min: number; max: number }
  dateRange?: { start: string; end: string }
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
}) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    let query = `
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
        AVG(CASE WHEN ca.metric_name = 'satisfaction_score' THEN ca.metric_value END) as avg_satisfaction
      FROM courses c
      LEFT JOIN course_students cs ON c.course_id = cs.course_id
      LEFT JOIN classes cl ON c.course_id = cl.course_id
      LEFT JOIN users t ON cl.teacher_id = t.user_id
      LEFT JOIN course_analytics ca ON c.course_id = ca.course_id
        AND ca.metric_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `

    const conditions = []
    const params = []

    if (filters.search) {
      conditions.push('(c.course_name LIKE ? OR c.description LIKE ?)')
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    if (filters.level) {
      conditions.push('c.level = ?')
      params.push(filters.level)
    }

    if (filters.status) {
      conditions.push('c.is_active = ?')
      params.push(filters.status === 'active' ? 1 : 0)
    }

    if (filters.teacherId) {
      conditions.push('cl.teacher_id = ?')
      params.push(filters.teacherId)
    }

    if (filters.dateRange) {
      conditions.push('c.created_at BETWEEN ? AND ?')
      params.push(filters.dateRange.start, filters.dateRange.end)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += `
      GROUP BY c.course_id, c.course_name, c.description, c.level, c.duration_weeks, c.price, c.max_students, c.is_active, c.created_at
    `

    // Add enrollment range filter after GROUP BY
    if (filters.enrollmentRange) {
      query += ` HAVING enrolled_count BETWEEN ${filters.enrollmentRange.min} AND ${filters.enrollmentRange.max}`
    }

    // Add sorting
    const sortBy = filters.sortBy || 'created_at'
    const sortOrder = filters.sortOrder || 'DESC'
    query += ` ORDER BY ${sortBy} ${sortOrder}`

    // Add pagination
    const limit = filters.limit || 20
    const offset = filters.offset || 0
    query += ` LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await connection.execute(query, params)
    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function saveAttendance(classId: number, teacherId: number, date: string, attendance: any[]) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Start transaction
    await connection.beginTransaction()

    // Validate input parameters
    if (!classId || !teacherId || !date) {
      await connection.rollback()
      return { success: false, error: 'Missing required parameters' }
    }

    // Verify teacher owns this class
    const [classCheck] = await connection.execute(`
      SELECT 1 FROM classes WHERE class_id = ? AND teacher_id = ?
    `, [classId, teacherId])

    if (!Array.isArray(classCheck) || classCheck.length === 0) {
      await connection.rollback()
      return { success: false, error: 'Unauthorized access to class' }
    }

    // First, get the schedule_id for this class and date
    // Use YEAR, MONTH, DAY functions to compare date parts, avoiding timezone issues
    const [scheduleRows] = await connection.execute(`
      SELECT schedule_id, lesson_date FROM schedules
      WHERE class_id = ?
      AND YEAR(lesson_date) = YEAR(?)
      AND MONTH(lesson_date) = MONTH(?)
      AND DAY(lesson_date) = DAY(?)
    `, [classId, date, date, date])

    const schedules = scheduleRows as any[]
    if (schedules.length === 0) {
      // Get available dates for better error message
      const [allClassSchedules] = await connection.execute(`
        SELECT CONCAT(YEAR(lesson_date), '-',
                      LPAD(MONTH(lesson_date), 2, '0'), '-',
                      LPAD(DAY(lesson_date), 2, '0')) as date_formatted
        FROM schedules WHERE class_id = ?
        ORDER BY lesson_date
      `, [classId])

      const availableDates = allClassSchedules.map((s: any) => s.date_formatted).join(', ')
      await connection.rollback()
      return { success: false, error: `No schedule found for this class and date. Available dates: ${availableDates}` }
    }

    const scheduleId = schedules[0].schedule_id

    // Delete existing attendance for this schedule
    await connection.execute(`
      DELETE FROM attendance WHERE schedule_id = ?
    `, [scheduleId])

    // Insert new attendance records
    for (const record of attendance) {
      await connection.execute(`
        INSERT INTO attendance (schedule_id, student_id, status, note)
        VALUES (?, ?, ?, ?)
      `, [scheduleId, record.student_id, record.status, record.note || null])
    }

    await connection.commit()
    return { success: true }
  } catch (error) {
    await connection.rollback()
    console.error('Error saving attendance:', error)
    return { success: false, error: 'Database error occurred' }
  } finally {
    await connection.end()
  }
}

export async function getAttendanceByDate(classId: number, teacherId: number, date: string) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Verify teacher owns this class
    const [classCheck] = await connection.execute(`
      SELECT 1 FROM classes WHERE class_id = ? AND teacher_id = ?
    `, [classId, teacherId])

    if (!Array.isArray(classCheck) || classCheck.length === 0) {
      throw new Error('Unauthorized access to class')
    }

    // Get attendance data by joining with schedules table
    const [rows] = await connection.execute(`
      SELECT
        a.student_id,
        a.status,
        a.note
      FROM attendance a
      INNER JOIN schedules s ON a.schedule_id = s.schedule_id
      WHERE s.class_id = ? AND DATE(s.lesson_date) = ?
    `, [classId, date])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getAnalyticsData(period: string) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Get date filter based on period
    let dateFilter = ''
    const now = new Date()

    switch (period) {
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFilter = `AND cs.registered_at >= '${startOfMonth.toISOString().split('T')[0]}'`
        break
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        dateFilter = `AND cs.registered_at >= '${quarterStart.toISOString().split('T')[0]}'`
        break
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1)
        dateFilter = `AND cs.registered_at >= '${yearStart.toISOString().split('T')[0]}'`
        break
      default:
        dateFilter = ''
    }

    // Get total counts
    const [totalStudents] = await connection.execute(`
      SELECT COUNT(DISTINCT user_id) as count FROM users WHERE role = 'student'
    `)

    const [totalCourses] = await connection.execute(`
      SELECT COUNT(*) as count FROM courses
    `)

    const [totalClasses] = await connection.execute(`
      SELECT COUNT(*) as count FROM classes
    `)

    const [totalTeachers] = await connection.execute(`
      SELECT COUNT(DISTINCT user_id) as count FROM users WHERE role = 'teacher'
    `)

    // Get enrollment by level
    const [enrollmentByLevel] = await connection.execute(`
      SELECT
        c.level,
        COUNT(DISTINCT cs.student_id) as count
      FROM courses c
      LEFT JOIN course_students cs ON c.course_id = cs.course_id
      WHERE 1=1 ${dateFilter.replace('cs.registered_at', 'cs.registered_at')}
      GROUP BY c.level
      ORDER BY c.level
    `)

    // Get attendance statistics
    const [attendanceStats] = await connection.execute(`
      SELECT
        COUNT(*) as totalSessions,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentCount,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absentCount,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as lateCount
      FROM attendance
      WHERE 1=1 ${period !== 'all' ? `AND attendance_date >= '${new Date(now.getFullYear(), period === 'month' ? now.getMonth() : 0, 1).toISOString().split('T')[0]}'` : ''}
    `)

    // Get course enrollments
    const [courseEnrollments] = await connection.execute(`
      SELECT
        c.course_name,
        c.level,
        COUNT(DISTINCT cs.student_id) as enrolled_count,
        COUNT(DISTINCT cl.class_id) * 30 as capacity
      FROM courses c
      LEFT JOIN course_students cs ON c.course_id = cs.course_id ${dateFilter}
      LEFT JOIN classes cl ON c.course_id = cl.course_id
      GROUP BY c.course_id, c.course_name, c.level
      ORDER BY enrolled_count DESC
    `)

    const stats = (attendanceStats as any[])[0]
    const averageAttendance = stats.totalSessions > 0
      ? Math.round((stats.presentCount / stats.totalSessions) * 100)
      : 0

    return {
      totalStudents: (totalStudents as any[])[0].count,
      totalCourses: (totalCourses as any[])[0].count,
      totalClasses: (totalClasses as any[])[0].count,
      totalTeachers: (totalTeachers as any[])[0].count,
      enrollmentByLevel: enrollmentByLevel as any[],
      attendanceStats: {
        ...stats,
        averageAttendance
      },
      courseEnrollments: courseEnrollments as any[],
      monthlyEnrollments: [] // Could be implemented for trend analysis
    }
  } finally {
    await connection.end()
  }
}

export async function getUserNotifications(_userId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // For demo purposes, create some sample notifications
    // In a real system, these would be stored in a notifications table
    const sampleNotifications = [
      {
        id: 1,
        type: 'class_assignment',
        title: 'Class Assignment',
        message: 'You have been assigned to English Conversation - Beginner class.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: false
      },
      {
        id: 2,
        type: 'schedule_change',
        title: 'Schedule Update',
        message: 'Your Monday class time has been changed to 2:00 PM.',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        read: true
      },
      {
        id: 3,
        type: 'course_registration',
        title: 'Registration Confirmed',
        message: 'Your registration for Advanced Grammar course has been confirmed.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        read: true
      }
    ]

    return sampleNotifications
  } finally {
    await connection.end()
  }
}

export async function markNotificationAsRead(_notificationId: number, _userId: number) {
  // For demo purposes, just return success
  // In a real system, this would update the notifications table
  return { success: true }
}

export async function markAllNotificationsAsRead(_userId: number) {
  // For demo purposes, just return success
  // In a real system, this would update all unread notifications for the user
  return { success: true }
}

// Teacher-specific functions
export async function getTeacherStats(teacherId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [statsRows] = await connection.execute(`
      SELECT
        COUNT(DISTINCT cl.class_id) as totalClasses,
        COUNT(DISTINCT cs.student_id) as totalStudents,
        SUM(CASE WHEN cl.start_date > NOW() THEN 1 ELSE 0 END) as upcomingClasses,
        SUM(CASE WHEN cl.end_date < NOW() THEN 1 ELSE 0 END) as completedClasses
      FROM classes cl
      LEFT JOIN class_students cs ON cl.class_id = cs.class_id
      WHERE cl.teacher_id = ?
    `, [teacherId])

    const stats = (statsRows as any[])[0] || {
      totalClasses: 0,
      totalStudents: 0,
      upcomingClasses: 0,
      completedClasses: 0
    }

    return {
      totalClasses: parseInt(stats.totalClasses) || 0,
      totalStudents: parseInt(stats.totalStudents) || 0,
      upcomingClasses: parseInt(stats.upcomingClasses) || 0,
      completedClasses: parseInt(stats.completedClasses) || 0
    }
  } finally {
    await connection.end()
  }
}

// User creation function for signup
export async function createUser(userData: {
  fullName: string
  email: string
  password: string
  role: string
}) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [result] = await connection.execute(`
      INSERT INTO users (full_name, email, password, role, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [userData.fullName, userData.email, userData.password, userData.role])

    const insertResult = result as any
    if (insertResult.insertId) {
      // Return the created user
      const [userRows] = await connection.execute(`
        SELECT user_id, full_name, email, role, created_at
        FROM users
        WHERE user_id = ?
      `, [insertResult.insertId])

      return (userRows as any[])[0] || null
    }

    return null
  } finally {
    await connection.end()
  }
}

export async function createNotification(userId: number, type: string, title: string, message: string, data?: any) {
  // For demo purposes, just return success
  // In a real system, this would insert a new notification into the database
  return { success: true, notificationId: Math.floor(Math.random() * 1000) }
}

// Teacher Schedule Functions
export async function getTeacherSchedule(teacherId: number, weekOffset: number = 0) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Validate input parameters
    if (!teacherId || isNaN(teacherId)) {
      throw new Error('Invalid teacherId parameter')
    }

    if (isNaN(weekOffset)) {
      weekOffset = 0 // Default to current week if invalid
    }

    // Calculate the week range based on weekOffset (avoid mutating original date)
    const today = new Date()
    const currentWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const targetWeekStart = new Date(currentWeekStart.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000))
    const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000))

    // Format dates as YYYY-MM-DD strings for MySQL
    const startDateStr = targetWeekStart.toISOString().split('T')[0]
    const endDateStr = targetWeekEnd.toISOString().split('T')[0]

    // Validate that date strings are properly formatted
    if (!startDateStr || !endDateStr || startDateStr === 'Invalid Date' || endDateStr === 'Invalid Date') {
      throw new Error('Invalid date calculation')
    }

    const [rows] = await connection.execute(`
      SELECT
        s.schedule_id,
        s.class_id,
        c.class_name,
        co.course_name,
        s.lesson_date,
        DAYNAME(s.lesson_date) as day_of_week,
        s.start_time,
        s.end_time,
        s.room_or_link as location,
        co.level,
        COUNT(DISTINCT cs.student_id) as student_count
      FROM schedules s
      INNER JOIN classes c ON s.class_id = c.class_id
      INNER JOIN courses co ON c.course_id = co.course_id
      LEFT JOIN class_students cs ON c.class_id = cs.class_id
      WHERE c.teacher_id = ?
        AND s.lesson_date >= ?
        AND s.lesson_date <= ?
      GROUP BY s.schedule_id, s.class_id, c.class_name, co.course_name,
               s.lesson_date, s.start_time, s.end_time, s.room_or_link, co.level
      ORDER BY s.lesson_date ASC, s.start_time ASC
    `, [teacherId, startDateStr, endDateStr])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getTeacherUpcomingClasses(teacherId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        c.class_id,
        c.class_name,
        co.course_name,
        MIN(s.lesson_date) as next_lesson,
        MIN(s.start_time) as next_time,
        s.room_or_link as location,
        COUNT(DISTINCT cs.student_id) as student_count,
        COUNT(DISTINCT s.schedule_id) as total_lessons,
        COUNT(DISTINCT CASE WHEN s.lesson_date < CURDATE() THEN s.schedule_id END) as completed_lessons
      FROM classes c
      INNER JOIN courses co ON c.course_id = co.course_id
      LEFT JOIN class_students cs ON c.class_id = cs.class_id
      LEFT JOIN schedules s ON c.class_id = s.class_id
      WHERE c.teacher_id = ? AND s.lesson_date >= CURDATE()
      GROUP BY c.class_id, c.class_name, co.course_name, s.room_or_link
      ORDER BY next_lesson ASC, next_time ASC
      LIMIT 10
    `, [teacherId])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

// Admin Schedule Functions
export async function getAdminSchedule(weekOffset: number = 0) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Calculate the start and end of the target week
    const today = new Date()
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay())) // Start of current week (Sunday)
    const targetWeekStart = new Date(currentWeekStart.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000))
    const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000)) // End of week (Saturday)

    const [rows] = await connection.execute(`
      SELECT
        s.schedule_id,
        s.class_id,
        c.class_name,
        co.course_name,
        s.lesson_date,
        s.start_time,
        s.end_time,
        s.room_or_link,
        co.level,
        u.full_name as teacher_name,
        COUNT(cs.student_id) as student_count
      FROM schedules s
      INNER JOIN classes c ON s.class_id = c.class_id
      INNER JOIN courses co ON c.course_id = co.course_id
      INNER JOIN users u ON c.teacher_id = u.user_id
      LEFT JOIN class_students cs ON c.class_id = cs.class_id
      WHERE s.lesson_date >= ?
        AND s.lesson_date <= ?
      GROUP BY s.schedule_id, s.class_id, c.class_name, co.course_name,
               s.lesson_date, s.start_time, s.end_time, s.room_or_link, co.level, u.full_name
      ORDER BY s.lesson_date ASC, s.start_time ASC
    `, [targetWeekStart.toISOString().split('T')[0], targetWeekEnd.toISOString().split('T')[0]])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

// Admin Registration Functions
export async function getStudentRegistrations() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        cs.course_id as registration_id,
        cs.student_id,
        u.full_name as student_name,
        u.email as student_email,
        cs.course_id,
        co.course_name,
        co.level,
        cs.registered_at,
        'approved' as status
      FROM course_students cs
      INNER JOIN users u ON cs.student_id = u.user_id
      INNER JOIN courses co ON cs.course_id = co.course_id
      ORDER BY cs.registered_at DESC
    `, [])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getRegistrationStats() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        COUNT(*) as total,
        COUNT(*) as approved,
        0 as pending,
        0 as rejected
      FROM course_students
    `, [])

    const stats = rows as any[]
    return stats[0] || { total: 0, approved: 0, pending: 0, rejected: 0 }
  } finally {
    await connection.end()
  }
}

export async function updateRegistrationStatus(registrationId: number, status: string) {
  // For now, this is a placeholder since the current schema doesn't have a status field
  // In a real implementation, you would update a registrations table with status
  console.log(`Would update registration ${registrationId} to status ${status}`)
  return { success: true }
}

// Schedule Management Functions
export async function getAllSchedules() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        s.schedule_id,
        s.class_id,
        c.class_name,
        co.course_name,
        u.full_name as teacher_name,
        s.lesson_date,
        s.start_time,
        s.end_time,
        s.room_or_link,
        COUNT(cs.student_id) as student_count
      FROM schedules s
      INNER JOIN classes c ON s.class_id = c.class_id
      INNER JOIN courses co ON c.course_id = co.course_id
      INNER JOIN users u ON c.teacher_id = u.user_id
      LEFT JOIN class_students cs ON c.class_id = cs.class_id
      GROUP BY s.schedule_id, s.class_id, c.class_name, co.course_name,
               u.full_name, s.lesson_date, s.start_time, s.end_time, s.room_or_link
      ORDER BY s.lesson_date ASC, s.start_time ASC
    `, [])

    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function createSchedule(scheduleData: {
  class_id: number
  lesson_date: string
  start_time: string
  end_time: string
  room_or_link: string
}) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [result] = await connection.execute(`
      INSERT INTO schedules (class_id, lesson_date, start_time, end_time, room_or_link)
      VALUES (?, ?, ?, ?, ?)
    `, [scheduleData.class_id, scheduleData.lesson_date, scheduleData.start_time, scheduleData.end_time, scheduleData.room_or_link])

    return (result as any).insertId
  } finally {
    await connection.end()
  }
}

export async function deleteSchedule(scheduleId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    await connection.execute(`
      DELETE FROM schedules WHERE schedule_id = ?
    `, [scheduleId])

    return { success: true }
  } finally {
    await connection.end()
  }
}

export async function getAllClasses() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        c.class_id,
        c.class_name,
        co.course_name,
        u.full_name as teacher_name
      FROM classes c
      INNER JOIN courses co ON c.course_id = co.course_id
      INNER JOIN users u ON c.teacher_id = u.user_id
      ORDER BY c.class_name ASC
    `, [])

    return rows as any[]
  } finally {
    await connection.end()
  }
}



// Updated getTeacherClasses function for the classes listing page
export async function getTeacherClassesList(teacherId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Get teacher's classes with stats
    const [classRows] = await connection.execute(`
      SELECT
        c.class_id,
        c.class_name,
        co.course_name,
        co.level as course_level,
        COUNT(DISTINCT cs.student_id) as student_count,
        30 as max_students,
        COUNT(DISTINCT s.schedule_id) as schedule_count,
        MIN(CASE WHEN s.lesson_date > NOW() THEN s.lesson_date END) as next_class,
        CASE
          WHEN MIN(s.lesson_date) > NOW() THEN 'upcoming'
          WHEN MAX(s.lesson_date) < NOW() THEN 'completed'
          ELSE 'active'
        END as status
      FROM classes c
      INNER JOIN courses co ON c.course_id = co.course_id
      LEFT JOIN class_students cs ON c.class_id = cs.class_id
      LEFT JOIN schedules s ON c.class_id = s.class_id
      WHERE c.teacher_id = ?
      GROUP BY c.class_id, c.class_name, co.course_name, co.level
      ORDER BY c.class_name
    `, [teacherId])

    // Get summary stats
    const [statsRows] = await connection.execute(`
      SELECT
        COUNT(DISTINCT c.class_id) as totalClasses,
        COUNT(DISTINCT CASE WHEN s.lesson_date >= CURDATE() THEN c.class_id END) as activeClasses,
        COUNT(DISTINCT cs.student_id) as totalStudents,
        COUNT(DISTINCT CASE WHEN s.lesson_date > NOW() THEN c.class_id END) as upcomingClasses
      FROM classes c
      LEFT JOIN class_students cs ON c.class_id = cs.class_id
      LEFT JOIN schedules s ON c.class_id = s.class_id
      WHERE c.teacher_id = ?
    `, [teacherId])

    const stats = Array.isArray(statsRows) && statsRows.length > 0 ? statsRows[0] : {
      totalClasses: 0,
      activeClasses: 0,
      totalStudents: 0,
      upcomingClasses: 0
    }

    return {
      classes: classRows || [],
      stats
    }
  } catch (error) {
    console.error('Error fetching teacher classes:', error)
    throw error
  } finally {
    await connection.end()
  }
}

// Admin user management functions
export async function getAllUsers(filters: { search?: string; role?: string }) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    let query = `
      SELECT
        user_id,
        full_name,
        email,
        role,
        created_at,
        (SELECT COUNT(*) FROM course_students cs WHERE cs.student_id = users.user_id) as enrolled_courses,
        (SELECT COUNT(*) FROM classes cl WHERE cl.teacher_id = users.user_id) as teaching_classes
      FROM users
      WHERE 1=1
    `

    const params: any[] = []

    if (filters.search) {
      query += ` AND (full_name LIKE ? OR email LIKE ?)`
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    if (filters.role) {
      query += ` AND role = ?`
      params.push(filters.role)
    }

    query += ` ORDER BY created_at DESC`

    const [rows] = await connection.execute(query, params)
    return rows as any[]
  } finally {
    await connection.end()
  }
}

export async function getUserStats() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as totalStudents,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as totalTeachers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as totalAdmins
      FROM users
    `)

    return (rows as any[])[0] || {
      totalUsers: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalAdmins: 0
    }
  } finally {
    await connection.end()
  }
}

// Get user by ID
export async function getUserById(userId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    const [rows] = await connection.execute(`
      SELECT
        user_id,
        full_name,
        email,
        role,
        created_at,
        (SELECT COUNT(*) FROM course_students cs WHERE cs.student_id = users.user_id) as enrolled_courses,
        (SELECT COUNT(*) FROM classes cl WHERE cl.teacher_id = users.user_id) as teaching_classes
      FROM users
      WHERE user_id = ?
    `, [userId])

    const users = rows as any[]
    return users.length > 0 ? users[0] : null
  } finally {
    await connection.end()
  }
}

// Update user
export async function updateUser(userId: number, userData: {
  fullName: string
  email: string
  role: string
}) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Check if email is already taken by another user
    const [existingUser] = await connection.execute(
      'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
      [userData.email, userId]
    )

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return {
        success: false,
        error: 'Email is already taken by another user'
      }
    }

    // Update user
    await connection.execute(`
      UPDATE users SET
        full_name = ?,
        email = ?,
        role = ?
      WHERE user_id = ?
    `, [userData.fullName, userData.email, userData.role, userId])

    // Fetch the updated user
    const [userRows] = await connection.execute(`
      SELECT
        user_id,
        full_name,
        email,
        role,
        created_at
      FROM users
      WHERE user_id = ?
    `, [userId])

    const users = userRows as any[]
    if (users.length === 0) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    return {
      success: true,
      user: users[0]
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: 'Database error occurred'
    }
  } finally {
    await connection.end()
  }
}

// Delete user
export async function deleteUser(userId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Start transaction
    await connection.beginTransaction()

    // Check if user has any course registrations
    const [registrations] = await connection.execute(
      'SELECT COUNT(*) as count FROM course_students WHERE student_id = ?',
      [userId]
    )

    const registrationCount = (registrations as any[])[0].count

    // Check if user has any classes as teacher
    const [classes] = await connection.execute(
      'SELECT COUNT(*) as count FROM classes WHERE teacher_id = ?',
      [userId]
    )

    const classCount = (classes as any[])[0].count

    if (registrationCount > 0) {
      await connection.rollback()
      return {
        success: false,
        error: `Cannot delete user. User has ${registrationCount} course registration(s).`
      }
    }

    if (classCount > 0) {
      await connection.rollback()
      return {
        success: false,
        error: `Cannot delete user. User is teaching ${classCount} class(es).`
      }
    }

    // Delete the user
    const [result] = await connection.execute(
      'DELETE FROM users WHERE user_id = ?',
      [userId]
    )

    const deleteResult = result as any

    if (deleteResult.affectedRows === 0) {
      await connection.rollback()
      return {
        success: false,
        error: 'User not found'
      }
    }

    await connection.commit()

    return {
      success: true,
      message: 'User deleted successfully'
    }
  } catch (error) {
    await connection.rollback()
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: 'Database error occurred'
    }
  } finally {
    await connection.end()
  }
}

// Course creation function
export async function createCourse(courseData: {
  courseName: string
  description: string
  level: string
  durationWeeks: number
  price: number
  maxStudents: number
  isActive: boolean
}) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Check if course name already exists
    const [existingCourse] = await connection.execute(
      'SELECT course_id FROM courses WHERE course_name = ?',
      [courseData.courseName]
    )

    if (Array.isArray(existingCourse) && existingCourse.length > 0) {
      return {
        success: false,
        error: 'A course with this name already exists'
      }
    }

    // Insert new course
    const [result] = await connection.execute(`
      INSERT INTO courses (
        course_name,
        description,
        level,
        duration_weeks,
        price,
        max_students,
        is_active,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      courseData.courseName,
      courseData.description,
      courseData.level,
      courseData.durationWeeks,
      courseData.price,
      courseData.maxStudents,
      courseData.isActive ? 1 : 0
    ])

    const insertResult = result as any
    if (insertResult.insertId) {
      // Fetch the created course
      const [courseRows] = await connection.execute(`
        SELECT
          course_id,
          course_name,
          description,
          level,
          duration_weeks,
          price,
          max_students,
          is_active,
          created_at
        FROM courses
        WHERE course_id = ?
      `, [insertResult.insertId])

      const course = (courseRows as any[])[0]

      return {
        success: true,
        course: {
          courseId: course.course_id,
          courseName: course.course_name,
          description: course.description,
          level: course.level,
          durationWeeks: course.duration_weeks,
          price: parseFloat(course.price),
          maxStudents: course.max_students,
          isActive: Boolean(course.is_active),
          createdAt: course.created_at
        }
      }
    }

    return {
      success: false,
      error: 'Failed to create course'
    }
  } catch (error) {
    console.error('Error creating course:', error)
    return {
      success: false,
      error: 'Database error occurred'
    }
  } finally {
    await connection.end()
  }
}

// Course update function
export async function updateCourse(courseId: number, courseData: {
  courseName: string
  description: string
  level: string
  durationWeeks: number
  price: number
  maxStudents: number
  isActive: boolean
}) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Check if course exists
    const [existingCourse] = await connection.execute(
      'SELECT course_id FROM courses WHERE course_id = ?',
      [courseId]
    )

    if (!Array.isArray(existingCourse) || existingCourse.length === 0) {
      return {
        success: false,
        error: 'Course not found'
      }
    }

    // Check if another course with the same name exists (excluding current course)
    const [duplicateCourse] = await connection.execute(
      'SELECT course_id FROM courses WHERE course_name = ? AND course_id != ?',
      [courseData.courseName, courseId]
    )

    if (Array.isArray(duplicateCourse) && duplicateCourse.length > 0) {
      return {
        success: false,
        error: 'A course with this name already exists'
      }
    }

    // Update course
    await connection.execute(`
      UPDATE courses SET
        course_name = ?,
        description = ?,
        level = ?,
        duration_weeks = ?,
        price = ?,
        max_students = ?,
        is_active = ?
      WHERE course_id = ?
    `, [
      courseData.courseName,
      courseData.description,
      courseData.level,
      courseData.durationWeeks,
      courseData.price,
      courseData.maxStudents,
      courseData.isActive ? 1 : 0,
      courseId
    ])

    // Fetch the updated course
    const [courseRows] = await connection.execute(`
      SELECT
        course_id,
        course_name,
        description,
        level,
        duration_weeks,
        price,
        max_students,
        is_active,
        created_at
      FROM courses
      WHERE course_id = ?
    `, [courseId])

    const course = (courseRows as any[])[0]

    return {
      success: true,
      course: {
        courseId: course.course_id,
        courseName: course.course_name,
        description: course.description,
        level: course.level,
        durationWeeks: course.duration_weeks,
        price: parseFloat(course.price),
        maxStudents: course.max_students,
        isActive: Boolean(course.is_active),
        createdAt: course.created_at
      }
    }
  } catch (error) {
    console.error('Error updating course:', error)
    return {
      success: false,
      error: 'Database error occurred'
    }
  } finally {
    await connection.end()
  }
}

// Course deletion function
export async function deleteCourse(courseId: number) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Start transaction
    await connection.beginTransaction()

    // Check if course has any students registered
    const [registrations] = await connection.execute(
      'SELECT COUNT(*) as count FROM course_students WHERE course_id = ?',
      [courseId]
    )

    const registrationCount = (registrations as any[])[0].count

    if (registrationCount > 0) {
      await connection.rollback()
      return {
        success: false,
        error: `Cannot delete course. ${registrationCount} student(s) are registered for this course.`
      }
    }

    // Check if course has any classes
    const [classes] = await connection.execute(
      'SELECT COUNT(*) as count FROM classes WHERE course_id = ?',
      [courseId]
    )

    const classCount = (classes as any[])[0].count

    if (classCount > 0) {
      await connection.rollback()
      return {
        success: false,
        error: `Cannot delete course. ${classCount} class(es) are associated with this course.`
      }
    }

    // Delete the course
    const [result] = await connection.execute(
      'DELETE FROM courses WHERE course_id = ?',
      [courseId]
    )

    const deleteResult = result as any

    if (deleteResult.affectedRows === 0) {
      await connection.rollback()
      return {
        success: false,
        error: 'Course not found'
      }
    }

    await connection.commit()

    return {
      success: true,
      message: 'Course deleted successfully'
    }
  } catch (error) {
    await connection.rollback()
    console.error('Error deleting course:', error)
    return {
      success: false,
      error: 'Database error occurred'
    }
  } finally {
    await connection.end()
  }
}

// Schedule management functions
export async function getSchedules(filters: {
  date?: string
  classId?: number
}) {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    let query = `
      SELECT
        s.schedule_id,
        s.class_id,
        s.lesson_date,
        s.start_time,
        s.end_time,
        s.room_or_link as location,
        c.class_name,
        co.course_name,
        u.full_name as teacher_name,
        COUNT(cs.student_id) as student_count
      FROM schedules s
      INNER JOIN classes c ON s.class_id = c.class_id
      INNER JOIN courses co ON c.course_id = co.course_id
      INNER JOIN users u ON c.teacher_id = u.user_id
      LEFT JOIN class_students cs ON c.class_id = cs.class_id
    `

    const conditions = []
    const params = []

    if (filters.date) {
      conditions.push('s.lesson_date = ?')
      params.push(filters.date)
    }

    if (filters.classId) {
      conditions.push('s.class_id = ?')
      params.push(filters.classId)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += `
      GROUP BY s.schedule_id, s.class_id, s.lesson_date, s.start_time, s.end_time,
               s.room_or_link, c.class_name, co.course_name, u.full_name
      ORDER BY s.lesson_date ASC, s.start_time ASC
    `

    const [rows] = await connection.execute(query, params)
    return rows as any[]
  } finally {
    await connection.end()
  }
}

// Teacher class management functions
export async function createTeacherClass(classData: {
  class_name: string
  course_id: number
  teacher_id: number
  start_date: string
  end_date: string
  max_students: number
}): Promise<{ success: boolean; class_id?: number; error?: string }> {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Check if class name already exists for this teacher
    const [existing] = await connection.execute(
      'SELECT class_id FROM classes WHERE class_name = ? AND teacher_id = ?',
      [classData.class_name, classData.teacher_id]
    )

    if ((existing as any[]).length > 0) {
      return { success: false, error: 'Class name already exists' }
    }

    // Verify course exists
    const [courseCheck] = await connection.execute(
      'SELECT course_id FROM courses WHERE course_id = ?',
      [classData.course_id]
    )

    if ((courseCheck as any[]).length === 0) {
      return { success: false, error: 'Course not found' }
    }

    // Create the class
    const [result] = await connection.execute(
      `INSERT INTO classes (class_name, course_id, teacher_id, start_date, end_date, max_students)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        classData.class_name,
        classData.course_id,
        classData.teacher_id,
        classData.start_date,
        classData.end_date,
        classData.max_students
      ]
    )

    const insertResult = result as any
    return { success: true, class_id: insertResult.insertId }
  } catch (error) {
    console.error('Error creating teacher class:', error)
    return { success: false, error: 'Failed to create class' }
  } finally {
    await connection.end()
  }
}

export async function updateTeacherClass(
  classId: number,
  teacherId: number,
  classData: {
    class_name: string
    course_id: number
    start_date: string
    end_date: string
    max_students: number
  }
): Promise<{ success: boolean; error?: string }> {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Verify the class belongs to this teacher
    const [classCheck] = await connection.execute(
      'SELECT class_id FROM classes WHERE class_id = ? AND teacher_id = ?',
      [classId, teacherId]
    )

    if ((classCheck as any[]).length === 0) {
      return { success: false, error: 'Class not found or access denied' }
    }

    // Check if new class name conflicts with existing classes (excluding current class)
    const [existing] = await connection.execute(
      'SELECT class_id FROM classes WHERE class_name = ? AND teacher_id = ? AND class_id != ?',
      [classData.class_name, teacherId, classId]
    )

    if ((existing as any[]).length > 0) {
      return { success: false, error: 'Class name already exists' }
    }

    // Verify course exists
    const [courseCheck] = await connection.execute(
      'SELECT course_id FROM courses WHERE course_id = ?',
      [classData.course_id]
    )

    if ((courseCheck as any[]).length === 0) {
      return { success: false, error: 'Course not found' }
    }

    // Update the class
    await connection.execute(
      `UPDATE classes
       SET class_name = ?, course_id = ?, start_date = ?, end_date = ?, max_students = ?, updated_at = NOW()
       WHERE class_id = ? AND teacher_id = ?`,
      [
        classData.class_name,
        classData.course_id,
        classData.start_date,
        classData.end_date,
        classData.max_students,
        classId,
        teacherId
      ]
    )

    return { success: true }
  } catch (error) {
    console.error('Error updating teacher class:', error)
    return { success: false, error: 'Failed to update class' }
  } finally {
    await connection.end()
  }
}

export async function deleteTeacherClass(
  classId: number,
  teacherId: number
): Promise<{ success: boolean; error?: string }> {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // Verify the class belongs to this teacher
    const [classCheck] = await connection.execute(
      'SELECT class_id FROM classes WHERE class_id = ? AND teacher_id = ?',
      [classId, teacherId]
    )

    if ((classCheck as any[]).length === 0) {
      return { success: false, error: 'Class not found or access denied' }
    }

    // Check if class has students enrolled
    const [studentCheck] = await connection.execute(
      'SELECT COUNT(*) as student_count FROM class_students WHERE class_id = ?',
      [classId]
    )

    const studentCount = (studentCheck as any[])[0].student_count
    if (studentCount > 0) {
      return { success: false, error: 'Cannot delete class with enrolled students' }
    }

    // Delete related schedules first
    await connection.execute(
      'DELETE FROM schedules WHERE class_id = ?',
      [classId]
    )

    // Delete the class
    await connection.execute(
      'DELETE FROM classes WHERE class_id = ? AND teacher_id = ?',
      [classId, teacherId]
    )

    return { success: true }
  } catch (error) {
    console.error('Error deleting teacher class:', error)
    return { success: false, error: 'Failed to delete class' }
  } finally {
    await connection.end()
  }
}
