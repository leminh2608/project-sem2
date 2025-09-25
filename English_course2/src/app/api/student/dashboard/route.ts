import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStudentEnrolledCourses, getStudentSchedule } from '@/lib/db-direct'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = parseInt(session.user.id)

    // Get weekOffset from query parameters
    const { searchParams } = new URL(request.url)
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0')
    
    // Get student's enrolled courses and schedule
    const [enrolledCourses, schedule] = await Promise.all([
      getStudentEnrolledCourses(studentId),
      getStudentSchedule(studentId)
    ])

    // Calculate stats
    const totalCourses = enrolledCourses.length
    const coursesWithClasses = enrolledCourses.filter(course => course.class_id).length
    const upcomingClasses = schedule.filter(item => {
      const lessonDate = new Date(item.lesson_date)
      const now = new Date()
      return lessonDate > now
    }).length

    // Get recent activity (simplified)
    const recentActivity = [
      {
        id: 1,
        type: 'enrollment',
        message: 'Successfully enrolled in new course',
        timestamp: new Date().toISOString(),
        course: enrolledCourses[0]?.course_name || 'Course'
      },
      {
        id: 2,
        type: 'schedule',
        message: 'Upcoming class reminder',
        timestamp: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        course: enrolledCourses[0]?.course_name || 'Course'
      }
    ]

    // Get progress data (simplified - could be enhanced with actual progress tracking)
    const progressData = enrolledCourses.map(course => ({
      course_id: course.course_id,
      course_name: course.course_name,
      level: course.level,
      progress: Math.floor(Math.random() * 100), // Placeholder - replace with actual progress calculation
      completed_lessons: Math.floor(Math.random() * 10),
      total_lessons: 12
    }))

    // Calculate week range for display
    const today = new Date()
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const targetWeekStart = new Date(currentWeekStart.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000))
    const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000))

    return NextResponse.json({
      stats: {
        totalCourses,
        coursesWithClasses,
        upcomingClasses,
        completionRate: totalCourses > 0 ? Math.round((coursesWithClasses / totalCourses) * 100) : 0
      },
      enrolledCourses,
      upcomingSchedule: schedule.slice(0, 5), // Next 5 upcoming classes
      fullSchedule: schedule, // Full week schedule
      recentActivity,
      progressData,
      weekInfo: {
        weekOffset,
        startDate: targetWeekStart.toISOString().split('T')[0],
        endDate: targetWeekEnd.toISOString().split('T')[0],
        displayRange: `${targetWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${targetWeekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
    })

  } catch (error) {
    console.error('Error fetching student dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
