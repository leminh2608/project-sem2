import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCourseById, getStudentRegistrationStatus } from '@/lib/db-direct'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = parseInt(searchParams.get('courseId') || '0')
    const studentId = parseInt(session.user.id)
    
    if (isNaN(courseId) || courseId <= 0) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    // Get course details
    const course = await getCourseById(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get registration status
    const registrationStatus = await getStudentRegistrationStatus(courseId, studentId)
    if (!registrationStatus) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Prepare response data
    const registrationData = {
      course: {
        course_id: course.course_id,
        course_name: course.course_name,
        description: course.description,
        level: course.level
      },
      registration: {
        registered_at: registrationStatus.registered_at,
        status: 'confirmed'
      },
      nextSteps: [
        'Wait for class assignment by administrator',
        'Check your dashboard for updates',
        'Prepare for your first class'
      ]
    }

    return NextResponse.json(registrationData)
  } catch (error) {
    console.error('Error fetching registration confirmation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
