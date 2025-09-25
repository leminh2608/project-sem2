import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getAllCoursesWithStats,
  createCourse,
  getCoursesWithAdvancedFilters,
  bulkUpdateCourseStatus
} from '@/lib/db-direct'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Check if advanced filtering is requested
    const useAdvancedFilters = searchParams.get('advanced') === 'true'

    if (useAdvancedFilters) {
      const filters: any = {
        search: searchParams.get('search') || undefined,
        level: searchParams.get('level') || undefined,
        status: searchParams.get('status') || undefined,
        teacherId: searchParams.get('teacherId') ? parseInt(searchParams.get('teacherId')!) : undefined,
        sortBy: searchParams.get('sortBy') || 'created_at',
        sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC',
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
      }

      // Parse enrollment range
      const enrollmentMin = searchParams.get('enrollmentMin')
      const enrollmentMax = searchParams.get('enrollmentMax')
      if (enrollmentMin && enrollmentMax) {
        filters.enrollmentRange = {
          min: parseInt(enrollmentMin),
          max: parseInt(enrollmentMax)
        }
      }

      // Parse date range
      const dateStart = searchParams.get('dateStart')
      const dateEnd = searchParams.get('dateEnd')
      if (dateStart && dateEnd) {
        filters.dateRange = {
          start: dateStart,
          end: dateEnd
        }
      }

      const courses = await getCoursesWithAdvancedFilters(filters)
      return NextResponse.json({ courses, filters })
    } else {
      const courses = await getAllCoursesWithStats()
      return NextResponse.json({ courses })
    }
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseName, description, level, durationWeeks, price, maxStudents, isActive } = body

    // Validation
    if (!courseName || !description || !level) {
      return NextResponse.json(
        { error: 'Course name, description, and level are required' },
        { status: 400 }
      )
    }

    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level. Must be Beginner, Intermediate, or Advanced' },
        { status: 400 }
      )
    }

    if (durationWeeks && (durationWeeks < 1 || durationWeeks > 52)) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 52 weeks' },
        { status: 400 }
      )
    }

    if (price && price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      )
    }

    if (maxStudents && (maxStudents < 1 || maxStudents > 100)) {
      return NextResponse.json(
        { error: 'Maximum students must be between 1 and 100' },
        { status: 400 }
      )
    }

    const courseData = {
      courseName: courseName.trim(),
      description: description.trim(),
      level,
      durationWeeks: durationWeeks ? parseInt(durationWeeks) : 12,
      price: price ? parseFloat(price) : 0,
      maxStudents: maxStudents ? parseInt(maxStudents) : 30,
      isActive: isActive !== false
    }

    const result = await createCourse(courseData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        course: result.course,
        message: 'Course created successfully'
      }, { status: 201 })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to create course' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, courseIds, data } = body

    if (!action || !courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json(
        { error: 'Action and courseIds array are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'bulk_status_update':
        if (typeof data?.isActive !== 'boolean') {
          return NextResponse.json(
            { error: 'isActive boolean value is required for status update' },
            { status: 400 }
          )
        }

        const result = await bulkUpdateCourseStatus(courseIds, data.isActive)

        if (result.success) {
          return NextResponse.json({
            message: result.message
          })
        } else {
          return NextResponse.json(
            { error: result.error },
            { status: 400 }
          )
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error performing bulk operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
