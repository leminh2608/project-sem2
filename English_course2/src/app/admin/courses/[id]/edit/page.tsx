'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Save, 
  ArrowLeft, 
  BookOpen, 
  AlertCircle, 
  CheckCircle,
  Users,
  Clock,
  DollarSign,
  Trash2
} from 'lucide-react'

interface CourseData {
  courseId: number
  courseName: string
  description: string
  level: string
  durationWeeks: number
  price: number
  maxStudents: number
  isActive: boolean
  createdAt: string
}

interface FormErrors {
  courseName?: string
  description?: string
  level?: string
  durationWeeks?: string
  price?: string
  maxStudents?: string
  general?: string
}

export default function EditCoursePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string

  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    level: '',
    durationWeeks: 12,
    price: 0,
    maxStudents: 30,
    isActive: true
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user.role !== 'admin') {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return

      try {
        const response = await fetch(`/api/admin/courses/${courseId}`)
        const data = await response.json()

        if (response.ok) {
          setCourseData(data.course)
          setFormData({
            courseName: data.course.courseName,
            description: data.course.description,
            level: data.course.level,
            durationWeeks: data.course.durationWeeks,
            price: data.course.price,
            maxStudents: data.course.maxStudents,
            isActive: data.course.isActive
          })
        } else {
          setErrors({ general: data.error || 'Failed to load course' })
        }
      } catch (error) {
        console.error('Error fetching course:', error)
        setErrors({ general: 'Failed to load course' })
      } finally {
        setInitialLoading(false)
      }
    }

    if (session?.user.role === 'admin') {
      fetchCourse()
    }
  }, [courseId, session])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required'
    } else if (formData.courseName.trim().length < 3) {
      newErrors.courseName = 'Course name must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.level) {
      newErrors.level = 'Level is required'
    }

    if (formData.durationWeeks < 1) {
      newErrors.durationWeeks = 'Duration must be at least 1 week'
    } else if (formData.durationWeeks > 52) {
      newErrors.durationWeeks = 'Duration cannot exceed 52 weeks'
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative'
    }

    if (formData.maxStudents < 1) {
      newErrors.maxStudents = 'Maximum students must be at least 1'
    } else if (formData.maxStudents > 100) {
      newErrors.maxStudents = 'Maximum students cannot exceed 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName: formData.courseName.trim(),
          description: formData.description.trim(),
          level: formData.level,
          durationWeeks: formData.durationWeeks,
          price: formData.price,
          maxStudents: formData.maxStudents,
          isActive: formData.isActive
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/courses')
        }, 2000)
      } else {
        setErrors({ general: data.error || 'Failed to update course' })
      }
    } catch (error) {
      console.error('Course update error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/courses')
      } else {
        setErrors({ general: data.error || 'Failed to delete course' })
      }
    } catch (error) {
      console.error('Course deletion error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !session || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!courseData && !initialLoading) {
    return (
      <CourseDashboardLayout
        pageTitle="Course Not Found"
        pageDescription="The requested course could not be found"
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Admin Dashboard', href: '/admin' },
          { title: 'Courses', href: '/admin/courses' },
          { title: 'Edit Course' }
        ]}
      >
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Not Found</h3>
              <p className="text-gray-600 mb-4">
                The course you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
              </p>
              <Button onClick={() => router.push('/admin/courses')}>
                Back to Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </CourseDashboardLayout>
    )
  }

  const breadcrumbs = [
    { title: 'Home', href: '/' },
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Courses', href: '/admin/courses' },
    { title: 'Edit Course' }
  ]

  if (success) {
    return (
      <CourseDashboardLayout
        pageTitle="Course Updated Successfully"
        pageDescription="Your course has been updated and changes are now live"
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Updated!</h3>
              <p className="text-gray-600 mb-4">
                Your course has been successfully updated. You will be redirected to the courses list shortly.
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          </Card>
        </div>
      </CourseDashboardLayout>
    )
  }

  return (
    <CourseDashboardLayout
      pageTitle={`Edit Course: ${courseData?.courseName || 'Loading...'}`}
      pageDescription="Update course information and settings"
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Information
                </CardTitle>
                <CardDescription>
                  Update the details for this course
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Course
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input
                    id="courseName"
                    type="text"
                    placeholder="Enter course name"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                    className={errors.courseName ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.courseName && (
                    <p className="text-sm text-red-600">{errors.courseName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter course description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleInputChange('level', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select course level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-sm text-red-600">{errors.level}</p>
                  )}
                </div>
              </div>

              {/* Course Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationWeeks" className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Duration (weeks) *
                  </Label>
                  <Input
                    id="durationWeeks"
                    type="number"
                    min="1"
                    max="52"
                    value={formData.durationWeeks}
                    onChange={(e) => handleInputChange('durationWeeks', parseInt(e.target.value) || 0)}
                    className={errors.durationWeeks ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.durationWeeks && (
                    <p className="text-sm text-red-600">{errors.durationWeeks}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Price (USD) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={errors.price ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStudents" className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Max Students *
                  </Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
                    className={errors.maxStudents ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.maxStudents && (
                    <p className="text-sm text-red-600">{errors.maxStudents}</p>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
                  disabled={loading}
                />
                <Label htmlFor="isActive">Course is active and available for registration</Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Course...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Course
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </CourseDashboardLayout>
  )
}
