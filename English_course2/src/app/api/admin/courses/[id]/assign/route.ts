import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { assignStudentToClass } from '@/lib/db-direct'

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
    const { student_id, class_id } = body

    if (!student_id || !class_id) {
      return NextResponse.json(
        { error: 'Student ID and Class ID are required' },
        { status: 400 }
      )
    }

    const result = await assignStudentToClass(courseId, student_id, class_id)

    if (result.success) {
      return NextResponse.json({
        message: 'Student assigned to class successfully',
        assignment: result.assignment
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error assigning student to class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
