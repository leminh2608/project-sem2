import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllSchedules, createSchedule } from '@/lib/db-direct'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const schedules = await getAllSchedules()

    return NextResponse.json({
      schedules
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
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

    const { class_id, lesson_date, start_time, end_time, room_or_link } = await request.json()

    if (!class_id || !lesson_date || !start_time || !end_time || !room_or_link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const scheduleId = await createSchedule({
      class_id: parseInt(class_id),
      lesson_date,
      start_time,
      end_time,
      room_or_link
    })

    return NextResponse.json({ success: true, schedule_id: scheduleId })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
