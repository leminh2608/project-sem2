import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTeacherClassesList, createTeacherClass } from '@/lib/db-direct'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacherId = parseInt(session.user.id)
    const data = await getTeacherClassesList(teacherId)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching teacher classes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const result = await createTeacherClass({
      class_name,
      course_id: parseInt(course_id),
      teacher_id: teacherId,
      start_date,
      end_date,
      max_students: parseInt(max_students)
    })

    if (result.success) {
      return NextResponse.json({
        message: 'Class created successfully',
        class_id: result.class_id
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
