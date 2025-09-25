import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateTeacherClass, deleteTeacherClass, getTeacherClassById } from '@/lib/db-direct'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const classId = parseInt(id)
    if (isNaN(classId)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 })
    }

    const teacherId = parseInt(session.user.id)
    const classInfo = await getTeacherClassById(classId, teacherId)

    if (!classInfo) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json({
      class: classInfo
    })
  } catch (error) {
    console.error('Error fetching class details:', error)
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
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const classId = parseInt(id)
    const body = await request.json()
    const { class_name, course_id, start_date, end_date, max_students } = body

    // Validation
    if (!class_name || !course_id || !start_date || !end_date || !max_students) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (new Date(end_date) <= new Date(start_date)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    if (max_students < 1 || max_students > 100) {
      return NextResponse.json(
        { error: 'Maximum students must be between 1 and 100' },
        { status: 400 }
      )
    }

    const teacherId = parseInt(session.user.id)
    const result = await updateTeacherClass(classId, teacherId, {
      class_name,
      course_id: parseInt(course_id),
      start_date,
      end_date,
      max_students: parseInt(max_students)
    })

    if (result.success) {
      return NextResponse.json({
        message: 'Class updated successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating class:', error)
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
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const classId = parseInt(id)
    const teacherId = parseInt(session.user.id)

    const result = await deleteTeacherClass(classId, teacherId)

    if (result.success) {
      return NextResponse.json({
        message: 'Class deleted successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
