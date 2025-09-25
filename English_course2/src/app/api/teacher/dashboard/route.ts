import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTeacherClasses, getTeacherStats, getTeacherSchedule } from '@/lib/db-direct'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const teacherId = parseInt(session.user.id)

    // Get week offset from query parameters
    const { searchParams } = new URL(request.url)
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0')

    // Get teacher's classes, stats, and schedule
    const [classes, stats, schedule] = await Promise.all([
      getTeacherClasses(teacherId),
      getTeacherStats(teacherId),
      getTeacherSchedule(teacherId, weekOffset)
    ])

    // Calculate week range for display
    const today = new Date()
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const targetWeekStart = new Date(currentWeekStart.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000))
    const targetWeekEnd = new Date(targetWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000))

    return NextResponse.json({
      classes,
      stats,
      schedule: schedule || [],
      weekInfo: {
        weekOffset,
        startDate: targetWeekStart.toISOString().split('T')[0],
        endDate: targetWeekEnd.toISOString().split('T')[0],
        displayRange: `${targetWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${targetWeekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
    })

  } catch (error) {
    console.error('Error fetching teacher dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
