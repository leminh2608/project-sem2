import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getCourseById, 
  getStudentRegistrationStatus, 
  registerStudentForCourse,
  unregisterStudentFromCourse 
} from '@/lib/db-direct'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    const studentId = parseInt(session.user.id)
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    // Check if course exists
    const course = await getCourseById(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if student is already registered
    const existingRegistration = await getStudentRegistrationStatus(courseId, studentId)
    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this course' }, 
        { status: 400 }
      )
    }

    // Register student for course
    await registerStudentForCourse(courseId, studentId)

    return NextResponse.json({
      message: 'Successfully registered for course',
      courseId,
      studentId
    })
  } catch (error) {
    console.error('Error registering for course:', error)
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
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    const studentId = parseInt(session.user.id)
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    // Check if student is registered
    const existingRegistration = await getStudentRegistrationStatus(courseId, studentId)
    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'Not registered for this course' }, 
        { status: 400 }
      )
    }

    // Unregister student from course
    await unregisterStudentFromCourse(courseId, studentId)

    return NextResponse.json({
      message: 'Successfully unregistered from course',
      courseId,
      studentId
    })
  } catch (error) {
    console.error('Error unregistering from course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
