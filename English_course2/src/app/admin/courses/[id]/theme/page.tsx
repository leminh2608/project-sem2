'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Palette,
  Save,
  RotateCcw,
  Eye,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Paintbrush,
  Layout,
  Type,
  Code
} from 'lucide-react'

interface CourseTheme {
  theme_id: number
  course_id: number
  theme_name: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  card_style: string
  layout_style: string
  font_family: string
  custom_css: string | null
  is_active: boolean
}

interface Course {
  course_id: number
  course_name: string
  level: string
  description: string
}

export default function CourseThemePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = parseInt(params.id as string)

  const [course, setCourse] = useState<Course | null>(null)
  const [theme, setTheme] = useState<CourseTheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // Form state
  const [formData, setFormData] = useState({
    themeName: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    cardStyle: 'default',
    layoutStyle: 'grid',
    fontFamily: 'Inter',
    customCss: ''
  })

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/admin')
      return
    }
  }, [session, status, router])

  // Fetch course and theme data
  useEffect(() => {
    if (session?.user.role === 'admin' && courseId) {
      fetchData()
    }
  }, [session, courseId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [courseRes, themeRes] = await Promise.all([
        fetch(`/api/admin/courses/${courseId}`),
        fetch(`/api/admin/courses/${courseId}/theme`)
      ])

      if (courseRes.ok) {
        const courseData = await courseRes.json()
        setCourse(courseData.course)
      }

      if (themeRes.ok) {
        const themeData = await themeRes.json()
        setTheme(themeData.theme)
        
        // Populate form with existing theme data
        if (themeData.theme) {
          setFormData({
            themeName: themeData.theme.theme_name || '',
            primaryColor: themeData.theme.primary_color || '#3B82F6',
            secondaryColor: themeData.theme.secondary_color || '#1E40AF',
            accentColor: themeData.theme.accent_color || '#F59E0B',
            backgroundColor: themeData.theme.background_color || '#FFFFFF',
            textColor: themeData.theme.text_color || '#1F2937',
            cardStyle: themeData.theme.card_style || 'default',
            layoutStyle: themeData.theme.layout_style || 'grid',
            fontFamily: themeData.theme.font_family || 'Inter',
            customCss: themeData.theme.custom_css || ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage('Error loading course theme data')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/courses/${courseId}/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setTheme(result.theme)
        setMessage('Theme updated successfully!')
        setMessageType('success')
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to update theme')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error saving theme:', error)
      setMessage('Error saving theme. Please try again.')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (theme) {
      setFormData({
        themeName: theme.theme_name || '',
        primaryColor: theme.primary_color || '#3B82F6',
        secondaryColor: theme.secondary_color || '#1E40AF',
        accentColor: theme.accent_color || '#F59E0B',
        backgroundColor: theme.background_color || '#FFFFFF',
        textColor: theme.text_color || '#1F2937',
        cardStyle: theme.card_style || 'default',
        layoutStyle: theme.layout_style || 'grid',
        fontFamily: theme.font_family || 'Inter',
        customCss: theme.custom_css || ''
      })
    }
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (status === 'loading' || loading) {
    return (
      <CourseDashboardLayout
        pageTitle="Course Theme"
        pageDescription="Customize course appearance"
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Admin Dashboard', href: '/admin' },
          { title: 'Course Management', href: '/admin/courses' },
          { title: 'Theme Customization' }
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </CourseDashboardLayout>
    )
  }

  const breadcrumbs = [
    { title: 'Home', href: '/' },
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Course Management', href: '/admin/courses' },
    { title: course?.course_name || 'Course', href: `/admin/courses/${courseId}` },
    { title: 'Theme Customization' }
  ]

  return (
    <CourseDashboardLayout
      pageTitle={`Theme: ${course?.course_name || 'Course'}`}
      pageDescription="Customize the visual appearance and branding"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Message Alert */}
        {message && (
          <Alert className={messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {messageType === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Theme Customization</h1>
            <p className="text-gray-600">
              Customize the visual appearance for {course?.course_name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/courses')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Theme'}
            </Button>
          </div>
        </div>

        {/* Theme Customization Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Theme Editor
              </CardTitle>
              <CardDescription>
                Customize colors, layout, and styling options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="colors" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="colors">
                    <Paintbrush className="h-4 w-4 mr-1" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="layout">
                    <Layout className="h-4 w-4 mr-1" />
                    Layout
                  </TabsTrigger>
                  <TabsTrigger value="typography">
                    <Type className="h-4 w-4 mr-1" />
                    Typography
                  </TabsTrigger>
                  <TabsTrigger value="custom">
                    <Code className="h-4 w-4 mr-1" />
                    Custom
                  </TabsTrigger>
                </TabsList>

                {/* Colors Tab */}
                <TabsContent value="colors" className="space-y-4">
                  <div>
                    <Label htmlFor="themeName">Theme Name</Label>
                    <Input
                      id="themeName"
                      value={formData.themeName}
                      onChange={(e) => handleInputChange('themeName', e.target.value)}
                      placeholder="Enter theme name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          placeholder="#3B82F6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          placeholder="#1E40AF"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={formData.accentColor}
                          onChange={(e) => handleInputChange('accentColor', e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.accentColor}
                          onChange={(e) => handleInputChange('accentColor', e.target.value)}
                          placeholder="#F59E0B"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.backgroundColor}
                          onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                          placeholder="#FFFFFF"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => handleInputChange('textColor', e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.textColor}
                          onChange={(e) => handleInputChange('textColor', e.target.value)}
                          placeholder="#1F2937"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Layout Tab */}
                <TabsContent value="layout" className="space-y-4">
                  <div>
                    <Label htmlFor="cardStyle">Card Style</Label>
                    <Select value={formData.cardStyle} onValueChange={(value) => handleInputChange('cardStyle', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select card style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="shadow">Shadow</SelectItem>
                        <SelectItem value="bordered">Bordered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="layoutStyle">Layout Style</Label>
                    <Select value={formData.layoutStyle} onValueChange={(value) => handleInputChange('layoutStyle', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select layout style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Typography Tab */}
                <TabsContent value="typography" className="space-y-4">
                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select value={formData.fontFamily} onValueChange={(value) => handleInputChange('fontFamily', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Custom CSS Tab */}
                <TabsContent value="custom" className="space-y-4">
                  <div>
                    <Label htmlFor="customCss">Custom CSS</Label>
                    <Textarea
                      id="customCss"
                      value={formData.customCss}
                      onChange={(e) => handleInputChange('customCss', e.target.value)}
                      placeholder="Enter custom CSS rules..."
                      rows={10}
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Add custom CSS to further customize the course appearance. Use standard CSS syntax.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See how your theme will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border rounded-lg p-6 min-h-[400px]"
                style={{
                  backgroundColor: formData.backgroundColor,
                  color: formData.textColor,
                  fontFamily: formData.fontFamily
                }}
              >
                {/* Preview Content */}
                <div className="space-y-4">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: formData.primaryColor }}
                  >
                    {course?.course_name || 'Course Name'}
                  </div>

                  <div
                    className="text-lg"
                    style={{ color: formData.secondaryColor }}
                  >
                    {course?.level || 'Course Level'} Level
                  </div>

                  <div className="text-gray-600">
                    {course?.description || 'Course description will appear here...'}
                  </div>

                  {/* Sample Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div
                      className={`p-4 border ${
                        formData.cardStyle === 'rounded' ? 'rounded-lg' :
                        formData.cardStyle === 'shadow' ? 'shadow-md' :
                        formData.cardStyle === 'bordered' ? 'border-2' : ''
                      }`}
                      style={{ borderColor: formData.primaryColor }}
                    >
                      <div
                        className="font-semibold mb-2"
                        style={{ color: formData.primaryColor }}
                      >
                        Sample Card
                      </div>
                      <div className="text-sm">
                        This is how cards will appear with your theme settings.
                      </div>
                    </div>

                    <div
                      className={`p-4 border ${
                        formData.cardStyle === 'rounded' ? 'rounded-lg' :
                        formData.cardStyle === 'shadow' ? 'shadow-md' :
                        formData.cardStyle === 'bordered' ? 'border-2' : ''
                      }`}
                      style={{ borderColor: formData.secondaryColor }}
                    >
                      <div
                        className="font-semibold mb-2"
                        style={{ color: formData.secondaryColor }}
                      >
                        Another Card
                      </div>
                      <div className="text-sm">
                        Multiple cards showing the theme consistency.
                      </div>
                    </div>
                  </div>

                  {/* Sample Button */}
                  <div className="mt-6">
                    <button
                      className="px-4 py-2 rounded font-medium text-white"
                      style={{ backgroundColor: formData.accentColor }}
                    >
                      Sample Button
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CourseDashboardLayout>
  )
}
