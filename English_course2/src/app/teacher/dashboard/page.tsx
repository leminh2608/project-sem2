'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { WeeklySchedule } from '@/components/shared/weekly-schedule'
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen,
  UserCheck,
  AlertCircle,
  ChevronRight,
  GraduationCap
} from 'lucide-react'

interface Class {
  class_id: number
  class_name: string
  course_name: string
  start_date: string
  end_date: string
  schedule_time: string
  location: string
  student_count: number
  max_students: number
}

interface TeacherStats {
  totalClasses: number
  totalStudents: number
  upcomingClasses: number
  completedClasses: number
}

interface ScheduleItem {
  schedule_id: number
  class_id: number
  class_name: string
  course_name: string
  lesson_date: string
  start_time: string
  end_time: string
  room_or_link?: string
  level?: string
  student_count?: number
  day_of_week?: string
}

interface WeekInfo {
  weekOffset: number
  startDate: string
  endDate: string
  displayRange: string
}

interface TeacherDashboardData {
  classes: Class[]
  stats: TeacherStats
  schedule: ScheduleItem[]
  weekInfo: WeekInfo
}

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [scheduleLoading, setScheduleLoading] = useState(false)

  // Redirect if not authenticated or not a teacher
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user.role !== 'teacher') {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Fetch dashboard data
  const fetchDashboardData = async (offset: number = 0, isScheduleOnly: boolean = false) => {
    try {
      if (isScheduleOnly) {
        setScheduleLoading(true)
      } else {
        setLoading(true)
      }

      const response = await fetch(`/api/teacher/dashboard?weekOffset=${offset}`)
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      if (isScheduleOnly) {
        setScheduleLoading(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (session?.user.role === 'teacher') {
      fetchDashboardData(weekOffset)
    }
  }, [session, weekOffset])

  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset)
    fetchDashboardData(newOffset, true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getClassStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (now < start) return 'upcoming'
    if (now > end) return 'completed'
    return 'active'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (status === 'loading' || loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const { classes, stats, schedule, weekInfo } = dashboardData

  return (
    <CourseDashboardLayout
      pageTitle={`Welcome back, ${session.user.name}!`}
      pageDescription="Here's an overview of your classes and students"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalClasses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalStudents}
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
                  {loading ? '...' : stats.upcomingClasses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.completedClasses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Mark attendance for your classes.</p>
            <Button 
              className="w-full" 
              onClick={() => router.push('/teacher/attendance')}
            >
              Mark Attendance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View your teaching schedule.</p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => router.push('/teacher/schedule')}
            >
              View Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage your class rosters.</p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => router.push('/teacher/classes')}
            >
              View Classes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Classes */}
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>
            Overview of all your assigned classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : classes.length > 0 ? (
            <div className="space-y-4">
              {classes.map((classItem) => {
                const status = getClassStatus(classItem.start_date, classItem.end_date)
                return (
                  <div key={classItem.class_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{classItem.class_name}</h4>
                        <p className="text-gray-600">{classItem.course_name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(status)}
                        <Badge variant="secondary">
                          {classItem.student_count}/{classItem.max_students} students
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{classItem.schedule_time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{classItem.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(classItem.start_date)} - {formatDate(classItem.end_date)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/teacher/classes/${classItem.class_id}`)}
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classes assigned</h3>
              <p className="text-gray-600">You don't have any classes assigned yet. Contact your administrator for class assignments.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule Section */}
      <div className="mt-8">
        <WeeklySchedule
          schedule={schedule || []}
          weekInfo={weekInfo || { weekOffset: 0, startDate: '', endDate: '', displayRange: 'Current Week' }}
          onWeekChange={handleWeekChange}
          loading={scheduleLoading}
          userRole="teacher"
          title="My Teaching Schedule"
        />
      </div>
    </CourseDashboardLayout>
  )
}
