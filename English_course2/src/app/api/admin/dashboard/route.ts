import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getAnalyticsData,
  getUserStats,
  getRegistrationStats,
  getAllCoursesWithStats,
  getAdminSchedule
} from '@/lib/db-direct'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get week offset from query parameters
    const { searchParams } = new URL(request.url)
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0')

    // Get comprehensive dashboard data
    const [analytics, userStats, registrationStats, coursesData, schedule] = await Promise.all([
      getAnalyticsData('all'),
      getUserStats(),
      getRegistrationStats(),
      getAllCoursesWithStats(),
      getAdminSchedule(weekOffset)
    ])

    // Calculate additional metrics
    const totalEnrollments = registrationStats.total || 0
    const averageEnrollmentPerCourse = coursesData.length > 0 
      ? Math.round(totalEnrollments / coursesData.length) 
      : 0

    // Get recent activity (simplified for now)
    const recentActivity = [
      {
        id: 1,
        type: 'enrollment',
        message: 'New student enrolled in Advanced JavaScript',
        timestamp: new Date().toISOString(),
        user: 'John Doe'
      },
      {
        id: 2,
        type: 'course',
        message: 'New course "React Fundamentals" created',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'Admin'
      }
    ]

    // Calculate week range for display
    const today = new Date()
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const targetWeekStart = new Date(currentWeekStart.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000))
    const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000))

    return NextResponse.json({
      stats: {
        totalUsers: userStats.totalUsers || 0,
        totalStudents: userStats.totalStudents || 0,
        totalTeachers: userStats.totalTeachers || 0,
        totalCourses: analytics.totalCourses || 0,
        totalClasses: analytics.totalClasses || 0,
        totalEnrollments,
        averageEnrollmentPerCourse,
        averageAttendance: analytics.attendanceStats?.averageAttendance || 0
      },
      analytics: {
        enrollmentByLevel: analytics.enrollmentByLevel || [],
        courseEnrollments: analytics.courseEnrollments || [],
        attendanceStats: analytics.attendanceStats || {}
      },
      recentActivity,
      courses: coursesData.slice(0, 5), // Top 5 courses
      registrationStats,
      schedule: schedule || [],
      weekInfo: {
        weekOffset,
        startDate: targetWeekStart.toISOString().split('T')[0],
        endDate: targetWeekEnd.toISOString().split('T')[0],
        displayRange: `${targetWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${targetWeekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
    })

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
