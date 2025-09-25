'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Eye,
  User
} from 'lucide-react'

interface StudentClass {
  class_id: number
  class_name: string
  course_name: string
  teacher_name: string
  start_date: string
  end_date: string
  schedule_time: string
  location: string
  student_count: number
  max_students: number
  next_class?: string
}

export default function StudentClassesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [classes, setClasses] = useState<StudentClass[]>([])
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

  // Fetch student's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/student/classes')
        
        if (response.ok) {
          const data = await response.json()
          setClasses(data.classes || [])
        } else {
          setError('Failed to load your classes')
        }
      } catch (error) {
        console.error('Error fetching classes:', error)
        setError('Failed to load your classes')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'student') {
      fetchClasses()
    }
  }, [session])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    { title: 'Student Dashboard', href: '/student/dashboard' },
    { title: 'My Classes' }
  ]

  if (loading) {
    return (
      <CourseDashboardLayout
        pageTitle="My Classes"
        pageDescription="View and manage your enrolled classes"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </CourseDashboardLayout>
    )
  }

  if (error) {
    return (
      <CourseDashboardLayout
        pageTitle="My Classes"
        pageDescription="View and manage your enrolled classes"
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </CourseDashboardLayout>
    )
  }

  return (
    <CourseDashboardLayout
      pageTitle="My Classes"
      pageDescription="View and manage your enrolled classes"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Classes Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Classes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classes.filter(cls => getStatusText(cls.start_date, cls.end_date) === 'Active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Classes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classes.filter(cls => getStatusText(cls.start_date, cls.end_date) === 'Upcoming').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        {classes.length > 0 ? (
          <div className="space-y-6">
            {classes.map((classItem) => (
              <Card key={classItem.class_id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{classItem.class_name}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {classItem.course_name}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(classItem.start_date, classItem.end_date)}>
                      {getStatusText(classItem.start_date, classItem.end_date)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Teacher</p>
                        <p className="font-medium">{classItem.teacher_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">
                          {formatDate(classItem.start_date)} - {formatDate(classItem.end_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Schedule</p>
                        <p className="font-medium">{classItem.schedule_time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{classItem.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{classItem.student_count}/{classItem.max_students} students</span>
                      </div>
                      {classItem.next_class && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Next: {formatDate(classItem.next_class)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/student/classes/${classItem.class_id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Enrolled</h3>
              <p className="text-gray-600 mb-6">
                You haven't enrolled in any classes yet. Browse available courses to get started.
              </p>
              <Button onClick={() => router.push('/student/courses/browse')}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </CourseDashboardLayout>
  )
}
