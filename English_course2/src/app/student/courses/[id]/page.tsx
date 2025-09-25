'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react'

interface Course {
  course_id: number
  course_name: string
  description: string
  level: string
  duration_weeks: number
  price: number
  max_students: number
  is_active: boolean
  enrolled_count: number
  created_at: string
}

interface Class {
  class_id: number
  class_name: string
  start_date: string
  end_date: string
  teacher_name: string
  student_count: number
}

interface RegistrationStatus {
  registered_at: string
  class_id?: number
  class_name?: string
  joined_at?: string
}

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const resolvedParams = React.use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user.role !== 'student') {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/courses/${resolvedParams.id}`)

      if (response.ok) {
        const data = await response.json()
        setCourse(data.course)
        setClasses(data.classes)
        setRegistrationStatus(data.registrationStatus)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to fetch course details')
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
      setError('Failed to fetch course details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'student') {
      fetchCourseDetails()
    }
  }, [session, resolvedParams.id])

  const handleRegister = async () => {
    try {
      setRegistering(true)
      setError('')

      const response = await fetch(`/api/courses/${resolvedParams.id}/register`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh course details to get updated registration status
        await fetchCourseDetails()
      } else {
        setError(data.error || 'Failed to register for course')
      }
    } catch (error) {
      setError('Failed to register for course')
    } finally {
      setRegistering(false)
    }
  }

  const handleUnregister = async () => {
    try {
      setRegistering(true)
      setError('')

      const response = await fetch(`/api/courses/${resolvedParams.id}/register`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh course details to get updated registration status
        await fetchCourseDetails()
      } else {
        setError(data.error || 'Failed to unregister from course')
      }
    } catch (error) {
      setError('Failed to unregister from course')
    } finally {
      setRegistering(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  const breadcrumbs = [
    { title: 'Home', href: '/' },
    { title: 'Courses', href: '/student/courses' },
    { title: course?.course_name || 'Course Details' }
  ]

  if (loading) {
    return (
      <CourseDashboardLayout
        pageTitle="Course Details"
        pageDescription="Loading course information..."
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CourseDashboardLayout>
    )
  }

  if (error && !course) {
    return (
      <CourseDashboardLayout
        pageTitle="Course Not Found"
        pageDescription="The requested course could not be found"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </CourseDashboardLayout>
    )
  }

  return (
    <CourseDashboardLayout
      pageTitle={course?.course_name || 'Course Details'}
      pageDescription="Detailed information about this course"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{course?.course_name}</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Badge className={getLevelColor(course?.level || '')}>
                        {course?.level}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course?.enrolled_count} students enrolled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Course Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {course?.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Classes */}
            {classes.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Available Classes</CardTitle>
                  <CardDescription>
                    Classes available for this course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classes.map((classItem) => (
                      <div key={classItem.class_id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{classItem.class_name}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{formatDate(classItem.start_date)} - {formatDate(classItem.end_date)}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                <span>{classItem.teacher_name}</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{classItem.student_count} students</span>
                              </div>
                            </div>
                          </div>
                          {registrationStatus?.class_id === classItem.class_id && (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
              </CardHeader>
              <CardContent>
                {registrationStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Registered</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Registered on: {formatDate(registrationStatus.registered_at)}</p>
                      {registrationStatus.class_id ? (
                        <p className="mt-1">
                          Assigned to: <span className="font-medium">{registrationStatus.class_name}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-yellow-600">
                          Waiting for class assignment
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleUnregister}
                      disabled={registering}
                      variant="destructive"
                      className="w-full"
                    >
                      {registering ? 'Processing...' : 'Unregister'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <XCircle className="h-5 w-5 mr-2" />
                      <span>Not registered</span>
                    </div>
                    
                    <Button
                      onClick={handleRegister}
                      disabled={registering}
                      className="w-full"
                    >
                      {registering ? 'Registering...' : 'Register for Course'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <Badge className={getLevelColor(course?.level || '')}>
                    {course?.level}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students:</span>
                  <span>{course?.enrolled_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classes:</span>
                  <span>{classes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{course ? formatDate(course.created_at) : ''}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CourseDashboardLayout>
  )
}
