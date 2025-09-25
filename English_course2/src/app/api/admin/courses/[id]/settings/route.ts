import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCourseSettings, updateCourseSetting } from '@/lib/db-direct'

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

    const settings = await getCourseSettings(courseId)

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Error fetching course settings:', error)
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
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      )
    }

    // Update each setting
    const results = []
    for (const [key, value] of Object.entries(settings)) {
      // Determine the type based on the value
      let type = 'string'
      if (typeof value === 'boolean') {
        type = 'boolean'
      } else if (typeof value === 'number') {
        type = 'number'
      } else if (typeof value === 'object' && value !== null) {
        type = 'json'
      }

      const result = await updateCourseSetting(courseId, key, value, type)
      results.push({ key, success: result.success })
    }

    // Check if all updates were successful
    const allSuccessful = results.every(r => r.success)

    if (allSuccessful) {
      // Fetch updated settings
      const updatedSettings = await getCourseSettings(courseId)
      
      return NextResponse.json({
        success: true,
        settings: updatedSettings,
        message: 'Course settings updated successfully'
      })
    } else {
      const failedKeys = results.filter(r => !r.success).map(r => r.key)
      return NextResponse.json(
        { error: `Failed to update settings: ${failedKeys.join(', ')}` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating course settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { key, value, type } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }

    // Determine the type if not provided
    let settingType = type
    if (!settingType) {
      if (typeof value === 'boolean') {
        settingType = 'boolean'
      } else if (typeof value === 'number') {
        settingType = 'number'
      } else if (typeof value === 'object' && value !== null) {
        settingType = 'json'
      } else {
        settingType = 'string'
      }
    }

    const result = await updateCourseSetting(courseId, key, value, settingType)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Setting '${key}' updated successfully`
      })
    } else {
      return NextResponse.json(
        { error: `Failed to update setting '${key}'` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating course setting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
