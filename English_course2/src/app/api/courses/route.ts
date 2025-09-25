import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findCourses, getCourseStats } from '@/lib/db-direct'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    const filters = {
      level: level || undefined,
      search: search || undefined,
      limit,
      offset
    }

    const courses = await findCourses(filters)
    const stats = await getCourseStats()

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total: stats.totalCourses,
        totalPages: Math.ceil(stats.totalCourses / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
