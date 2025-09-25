'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { WeeklySchedule } from '@/components/shared/weekly-schedule'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Plus,
  GraduationCap,
  TrendingUp,
  Activity,
  ChevronRight,
  PlayCircle
} from 'lucide-react'

interface EnrolledCourse {
  course_id: number
  course_name: string
  description: string
  level: string
  registered_at: string
  class_id?: number
  class_name?: string
  teacher_name?: string
  start_date?: string
  end_date?: string
}

interface StudentStats {
  totalCourses: number
  coursesWithClasses: number
  upcomingClasses: number
  completionRate: number
}

interface ScheduleItem {
  schedule_id: number
  class_id: number
  lesson_date: string
  start_time: string
  end_time: string
  class_name: string
  course_name: string
  teacher_name: string
  room_or_link?: string
  level?: string
  day_of_week?: string
}

interface RecentActivity {
  id: number
  type: string
  message: string
  timestamp: string
  course: string
}

interface ProgressData {
  course_id: number
  course_name: string
  level: string
  progress: number
  completed_lessons: number
  total_lessons: number
}

interface WeekInfo {
  weekOffset: number
  startDate: string
  endDate: string
  displayRange: string
}

interface DashboardData {
  stats: StudentStats
  enrolledCourses: EnrolledCourse[]
  upcomingSchedule: ScheduleItem[]
  fullSchedule: ScheduleItem[]
  recentActivity: RecentActivity[]
  progressData: ProgressData[]
  weekInfo: WeekInfo
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weekOffset, setWeekOffset] = useState(0)
  const [scheduleLoading, setScheduleLoading] = useState(false)

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user.role !== 'student') {
      router.push('/dashboard')
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
        setError('')
      }

      const response = await fetch(`/api/student/dashboard?weekOffset=${offset}`)
      const data = await response.json()

      if (response.ok) {
        setDashboardData(data)
      } else {
        if (!isScheduleOnly) {
          setError(data.error || 'Failed to fetch dashboard data')
        }
      }
    } catch (err) {
      if (!isScheduleOnly) {
        setError('Failed to fetch dashboard data')
      }
      console.error('Error fetching dashboard data:', err)
    } finally {
      if (isScheduleOnly) {
        setScheduleLoading(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (session?.user.role === 'student') {
      fetchDashboardData(weekOffset)
    }
  }, [session, weekOffset])

  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset)
    fetchDashboardData(newOffset, true)
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
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'schedule':
        return <Calendar className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <CourseDashboardLayout
        pageTitle="My Dashboard"
        pageDescription="Track your learning progress and manage your courses"

      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-[120px]" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[200px]" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[250px]" />
              <Skeleton className="h-[200px]" />
            </div>
          </div>
        </div>
      </CourseDashboardLayout>
    )
  }

  if (error) {
    return (
      <CourseDashboardLayout
        pageTitle="My Dashboard"
        pageDescription="Track your learning progress and manage your courses"

      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </CourseDashboardLayout>
    )
  }

  if (!dashboardData) {
    return null
  }

  const { stats, enrolledCourses, upcomingSchedule, fullSchedule, recentActivity, progressData, weekInfo } = dashboardData

  return (
    <CourseDashboardLayout
      pageTitle={`Welcome back, ${session?.user.name}!`}
      pageDescription="Track your learning progress and manage your courses"

    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.coursesWithClasses} with active classes
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingClasses}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Course assignments
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Days active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Courses and Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => router.push('/student/courses/browse')}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Browse Courses</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => router.push('/student/schedule')}
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">My Schedule</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => router.push('/notifications')}
                  >
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">Notifications</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>Track your learning progress across all courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.map((course) => (
                    <div key={course.course_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{course.course_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {course.completed_lessons} of {course.total_lessons} lessons completed
                          </p>
                        </div>
                        <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Schedule and Activity */}
          <div className="space-y-6">
            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSchedule.length > 0 ? (
                    upcomingSchedule.map((item) => (
                      <div key={item.schedule_id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.course_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.lesson_date)} • {formatTime(item.start_time)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.teacher_name}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming classes scheduled
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.course} • {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Schedule Section */}
        <div className="mt-8">
          <WeeklySchedule
            schedule={fullSchedule || []}
            weekInfo={weekInfo || { weekOffset: 0, startDate: '', endDate: '', displayRange: 'Current Week' }}
            onWeekChange={handleWeekChange}
            loading={scheduleLoading}
            userRole="student"
            title="My Weekly Schedule"
          />
        </div>
      </div>
    </CourseDashboardLayout>
  )
}
