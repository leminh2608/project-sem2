import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCourseById, getCourseClasses, getStudentRegistrationStatus } from '@/lib/db-direct'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    const course = await getCourseById(courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get course classes
    const classes = await getCourseClasses(courseId)
    
    // Get student registration status if user is a student
    let registrationStatus = null
    if (session.user.role === 'student') {
      registrationStatus = await getStudentRegistrationStatus(
        courseId, 
        parseInt(session.user.id)
      )
    }

    return NextResponse.json({
      course,
      classes,
      registrationStatus
    })
  } catch (error) {
    console.error('Error fetching course details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
