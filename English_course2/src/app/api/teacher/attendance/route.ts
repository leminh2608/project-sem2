import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { saveAttendance } from '@/lib/db-direct'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { class_id, date, attendance } = body

    if (!class_id || !date || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: 'Class ID, date, and attendance array are required' },
        { status: 400 }
      )
    }

    const teacherId = parseInt(session.user.id)

    if (!teacherId || isNaN(teacherId)) {
      return NextResponse.json(
        { error: 'Invalid teacher ID' },
        { status: 400 }
      )
    }
    const result = await saveAttendance(class_id, teacherId, date, attendance)

    if (result.success) {
      return NextResponse.json({
        message: 'Attendance saved successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error saving attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
