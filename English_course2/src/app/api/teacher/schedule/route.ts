import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTeacherSchedule, getTeacherUpcomingClasses } from '@/lib/db-direct'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teacherId = parseInt(session.user.id)

    // Validate teacherId
    if (!teacherId || isNaN(teacherId)) {
      return NextResponse.json(
        { error: 'Invalid teacher ID' },
        { status: 400 }
      )
    }

    // Get week offset from query parameters
    const { searchParams } = new URL(request.url)
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0')

    // Get teacher's schedule and upcoming classes
    const [schedules, upcomingClasses] = await Promise.all([
      getTeacherSchedule(teacherId, weekOffset),
      getTeacherUpcomingClasses(teacherId)
    ])

    // Calculate week range for display
    const today = new Date()
    const currentWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const targetWeekStart = new Date(currentWeekStart.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000))
    const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000))

    return NextResponse.json({
      schedules,
      upcomingClasses,
      weekInfo: {
        weekOffset,
        startDate: targetWeekStart.toISOString().split('T')[0],
        endDate: targetWeekEnd.toISOString().split('T')[0],
        displayRange: `${targetWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${targetWeekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
    })
  } catch (error) {
    console.error('Error fetching teacher schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}
