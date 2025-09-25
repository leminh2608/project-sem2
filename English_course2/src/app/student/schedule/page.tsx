'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  CalendarDays
} from 'lucide-react'

interface StudentSchedule {
  schedule_id: number
  class_id: number
  class_name: string
  course_name: string
  level: string
  teacher_name: string
  day_of_week: string
  start_time: string
  end_time: string
  location: string
  start_date: string
  end_date: string
}

interface DaySchedule {
  day: string
  classes: StudentSchedule[]
}

export default function StudentSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedule, setSchedule] = useState<StudentSchedule[]>([])
  const [loading, setLoading] = useState(true)

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

  // Fetch student schedule
  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/schedule')
      
      if (response.ok) {
        const data = await response.json()
        setSchedule(data.schedule)
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'student') {
      fetchSchedule()
    }
  }, [session])

  // Group schedule by day
  const groupScheduleByDay = (): DaySchedule[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    return days.map(day => ({
      day,
      classes: schedule
        .filter(s => s.day_of_week === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
    }))
  }

  const weekSchedule = groupScheduleByDay()

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

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get current day for highlighting
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  const currentDay = getCurrentDay()

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
    { title: 'My Schedule' }
  ]

  return (
    <CourseDashboardLayout
      pageTitle="My Schedule"
      pageDescription="Your weekly class schedule and timetable"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : schedule.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : new Set(schedule.map(s => s.course_name)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : new Set(schedule.map(s => s.teacher_name)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarDays className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Days</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : weekSchedule.filter(day => day.classes.length > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              Your class schedule organized by day and time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-6">
                {[...Array(7)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-3">
                      {[...Array(2)].map((_, j) => (
                        <Skeleton key={j} className="h-24 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : schedule.length > 0 ? (
              <div className="space-y-8">
                {weekSchedule.map((daySchedule) => (
                  <div key={daySchedule.day}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold flex items-center ${
                        daySchedule.day === currentDay ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {daySchedule.day}
                        {daySchedule.day === currentDay && (
                          <Badge variant="default" className="ml-2">Today</Badge>
                        )}
                      </h3>
                      <Badge variant="outline">
                        {daySchedule.classes.length} class{daySchedule.classes.length !== 1 ? 'es' : ''}
                      </Badge>
                    </div>
                    
                    {daySchedule.classes.length > 0 ? (
                      <div className="space-y-4">
                        {daySchedule.classes.map((classItem) => (
                          <div 
                            key={classItem.schedule_id} 
                            className={`border rounded-lg p-4 ${
                              daySchedule.day === currentDay ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-semibold text-lg">{classItem.class_name}</h4>
                                <Badge className={getLevelColor(classItem.level)}>
                                  {classItem.level}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="font-medium">{classItem.course_name}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{classItem.teacher_name}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{classItem.location}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{formatDate(classItem.start_date)} - {formatDate(classItem.end_date)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No classes scheduled for {daySchedule.day}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schedule available</h3>
                <p className="text-gray-600 mb-4">
                  You haven't been assigned to any classes yet. Register for courses to get started.
                </p>
                <Button onClick={() => router.push('/student/courses/browse')}>
                  Browse Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CourseDashboardLayout>
  )
}
