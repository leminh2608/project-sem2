import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCourseAnalytics, addCourseAnalytic } from '@/lib/db-direct'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }

    const analytics = await getCourseAnalytics(courseId, days)

    return NextResponse.json({
      success: true,
      analytics,
      period: `${days} days`
    })
  } catch (error) {
    console.error('Error fetching course analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    const body = await request.json()
    const { metricName, metricValue, date } = body

    // Validation
    if (!metricName || typeof metricName !== 'string') {
      return NextResponse.json(
        { error: 'Metric name is required and must be a string' },
        { status: 400 }
      )
    }

    if (typeof metricValue !== 'number') {
      return NextResponse.json(
        { error: 'Metric value is required and must be a number' },
        { status: 400 }
      )
    }

    // Validate date format if provided
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(date)) {
        return NextResponse.json(
          { error: 'Date must be in YYYY-MM-DD format' },
          { status: 400 }
        )
      }
    }

    const result = await addCourseAnalytic(courseId, metricName, metricValue, date)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Analytics data added successfully'
      }, { status: 201 })
    } else {
      return NextResponse.json(
        { error: 'Failed to add analytics data' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error adding course analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
