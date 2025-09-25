import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCourseById, updateCourse, deleteCourse, getEnhancedCourseDetails } from '@/lib/db-direct'

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

    // Check if enhanced details are requested
    const { searchParams } = new URL(request.url)
    const enhanced = searchParams.get('enhanced') === 'true'

    if (enhanced) {
      const courseDetails = await getEnhancedCourseDetails(courseId)

      if (!courseDetails) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        course: courseDetails
      })
    } else {
      const course = await getCourseById(courseId)

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      // Transform the course data to match the expected format
      const transformedCourse = {
        courseId: course.course_id,
        courseName: course.course_name,
        description: course.description,
        level: course.level,
        durationWeeks: course.duration_weeks || 12,
        price: parseFloat(course.price || '0'),
        maxStudents: course.max_students || 30,
        isActive: Boolean(course.is_active),
        createdAt: course.created_at,
        enrolledCount: course.enrolled_count || 0
      }

      return NextResponse.json({
        success: true,
        course: transformedCourse
      })
    }
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { courseName, description, level, durationWeeks, price, maxStudents, isActive } = body

    // Validation
    if (!courseName || !description || !level) {
      return NextResponse.json(
        { error: 'Course name, description, and level are required' },
        { status: 400 }
      )
    }

    if (durationWeeks < 1 || durationWeeks > 52) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 52 weeks' },
        { status: 400 }
      )
    }

    if (price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      )
    }

    if (maxStudents < 1 || maxStudents > 100) {
      return NextResponse.json(
        { error: 'Maximum students must be between 1 and 100' },
        { status: 400 }
      )
    }

    const courseData = {
      courseName: courseName.trim(),
      description: description.trim(),
      level,
      durationWeeks: parseInt(durationWeeks),
      price: parseFloat(price),
      maxStudents: parseInt(maxStudents),
      isActive: Boolean(isActive)
    }

    const result = await updateCourse(courseId, courseData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        course: result.course,
        message: 'Course updated successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to update course' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const result = await deleteCourse(courseId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'Course deleted successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to delete course' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
