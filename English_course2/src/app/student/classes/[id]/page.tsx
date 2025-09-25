'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin,
  BookOpen,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface ClassInfo {
  class_id: number
  class_name: string
  course_name: string
  teacher_name: string
  teacher_email: string
  start_date: string
  end_date: string
  schedule_time: string
  location: string
  max_students: number
  student_count: number
  description?: string
}

interface ClassSchedule {
  schedule_id: number
  lesson_date: string
  start_time: string
  end_time: string
  room_or_link: string
}

export default function StudentClassDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const classId = params.id as string

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [loading, setLoading] = useState(true)
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

  // Fetch class data
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const [classResponse, schedulesResponse] = await Promise.all([
          fetch(`/api/student/classes/${classId}`),
          fetch(`/api/student/classes/${classId}/schedules`)
        ])

        if (classResponse.ok) {
          const classData = await classResponse.json()
          setClassInfo(classData.class)
        } else {
          setError('Failed to load class information')
        }

        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json()
          setSchedules(schedulesData.schedules || [])
        }
      } catch (error) {
        console.error('Error fetching class data:', error)
        setError('Failed to load class information')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'student' && classId) {
      fetchClassData()
    }
  }, [session, classId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (now < start) return 'bg-blue-100 text-blue-800'
    if (now > end) return 'bg-gray-100 text-gray-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (now < start) return 'Upcoming'
    if (now > end) return 'Completed'
    return 'Active'
  }

  const isSchedulePast = (lessonDate: string) => {
    return new Date(lessonDate) < new Date()
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
    { title: 'My Classes', href: '/student/classes' },
    { title: classInfo?.class_name || 'Class Details' }
  ]

  if (loading) {
    return (
      <CourseDashboardLayout
        pageTitle="Class Details"
        pageDescription="Loading class information..."
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </CourseDashboardLayout>
    )
  }

  if (error || !classInfo) {
    return (
      <CourseDashboardLayout
        pageTitle="Class Not Found"
        pageDescription="The requested class could not be found"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Class not found'}</AlertDescription>
          </Alert>
        </div>
      </CourseDashboardLayout>
    )
  }

  return (
    <CourseDashboardLayout
      pageTitle={classInfo.class_name}
      pageDescription="View your class details and schedule"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Classes
        </Button>

        {/* Class Information */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Class Information
                </CardTitle>
                <CardDescription className="mt-2">
                  {classInfo.course_name}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(classInfo.start_date, classInfo.end_date)}>
                {getStatusText(classInfo.start_date, classInfo.end_date)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Teacher</p>
                  <p className="font-medium">{classInfo.teacher_name}</p>
                  <p className="text-sm text-gray-500">{classInfo.teacher_email}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">
                    {formatDate(classInfo.start_date)} - {formatDate(classInfo.end_date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Schedule</p>
                  <p className="font-medium">{classInfo.schedule_time}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{classInfo.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Class Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classInfo.student_count}/{classInfo.max_students}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Course</p>
                  <p className="text-2xl font-bold text-gray-900">{classInfo.course_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Schedule */}
        {schedules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>
                Upcoming and past class sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.schedule_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {isSchedulePast(schedule.lesson_date) ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-blue-600" />
                          )}
                          <div className="ml-3">
                            <p className="font-medium">
                              {formatDate(schedule.lesson_date)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{schedule.room_or_link}</span>
                        </div>
                      </div>
                      <Badge variant={isSchedulePast(schedule.lesson_date) ? 'secondary' : 'default'}>
                        {isSchedulePast(schedule.lesson_date) ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </CourseDashboardLayout>
  )
}
