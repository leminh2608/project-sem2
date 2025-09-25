import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCourseTheme, updateCourseTheme } from '@/lib/db-direct'

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

    const theme = await getCourseTheme(courseId)

    if (!theme) {
      return NextResponse.json({ error: 'Course theme not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      theme
    })
  } catch (error) {
    console.error('Error fetching course theme:', error)
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
    const {
      themeName,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      cardStyle,
      layoutStyle,
      fontFamily,
      customCss
    } = body

    // Validation
    if (!themeName) {
      return NextResponse.json(
        { error: 'Theme name is required' },
        { status: 400 }
      )
    }

    // Validate color format (hex colors)
    const colorRegex = /^#[0-9A-F]{6}$/i
    const colors = { primaryColor, secondaryColor, accentColor, backgroundColor, textColor }
    
    for (const [colorName, colorValue] of Object.entries(colors)) {
      if (colorValue && !colorRegex.test(colorValue)) {
        return NextResponse.json(
          { error: `Invalid ${colorName} format. Must be a valid hex color (e.g., #FF0000)` },
          { status: 400 }
        )
      }
    }

    // Validate card style
    const validCardStyles = ['default', 'rounded', 'shadow', 'bordered']
    if (cardStyle && !validCardStyles.includes(cardStyle)) {
      return NextResponse.json(
        { error: 'Invalid card style. Must be one of: ' + validCardStyles.join(', ') },
        { status: 400 }
      )
    }

    // Validate layout style
    const validLayoutStyles = ['grid', 'list', 'card']
    if (layoutStyle && !validLayoutStyles.includes(layoutStyle)) {
      return NextResponse.json(
        { error: 'Invalid layout style. Must be one of: ' + validLayoutStyles.join(', ') },
        { status: 400 }
      )
    }

    const themeData = {
      themeName: themeName.trim(),
      primaryColor: primaryColor || '#3B82F6',
      secondaryColor: secondaryColor || '#1E40AF',
      accentColor: accentColor || '#F59E0B',
      backgroundColor: backgroundColor || '#FFFFFF',
      textColor: textColor || '#1F2937',
      cardStyle: cardStyle || 'default',
      layoutStyle: layoutStyle || 'grid',
      fontFamily: fontFamily || 'Inter',
      customCss: customCss || null
    }

    const updatedTheme = await updateCourseTheme(courseId, themeData)

    if (updatedTheme) {
      return NextResponse.json({
        success: true,
        theme: updatedTheme,
        message: 'Course theme updated successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to update course theme' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating course theme:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
