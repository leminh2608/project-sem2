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
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react'

interface Schedule {
  schedule_id: number
  class_id: number
  class_name: string
  course_name: string
  teacher_name: string
  day_of_week: string
  start_time: string
  end_time: string
  location: string
  student_count: number
}

interface TimeSlot {
  time: string
  schedules: Schedule[]
}

export default function AdminSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

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

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/schedules')
      
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchSchedules()
    }
  }, [session])

  // Group schedules by day and time
  const groupSchedulesByDay = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const groupedSchedules: { [key: string]: TimeSlot[] } = {}

    days.forEach(day => {
      const daySchedules = schedules.filter(s => s.day_of_week === day)
      const timeSlots: { [key: string]: Schedule[] } = {}

      daySchedules.forEach(schedule => {
        const timeKey = `${schedule.start_time}-${schedule.end_time}`
        if (!timeSlots[timeKey]) {
          timeSlots[timeKey] = []
        }
        timeSlots[timeKey].push(schedule)
      })

      groupedSchedules[day] = Object.entries(timeSlots)
        .map(([time, schedules]) => ({ time, schedules }))
        .sort((a, b) => a.time.localeCompare(b.time))
    })

    return groupedSchedules
  }

  const groupedSchedules = groupSchedulesByDay()

  // Check for conflicts
  const hasConflicts = (daySchedules: TimeSlot[]) => {
    for (let i = 0; i < daySchedules.length; i++) {
      const slot = daySchedules[i]
      // Add null/undefined check for slot
      if (slot && slot.schedules && slot.schedules.length > 1) {
        // Check if any schedules in this time slot have the same teacher or location
        const teachers = slot.schedules.map(s => s.teacher_name)
        const locations = slot.schedules.map(s => s.location)

        if (new Set(teachers).size !== teachers.length || new Set(locations).size !== locations.length) {
          return true
        }
      }
    }
    return false
  }

  const getConflictType = (schedules: Schedule[]) => {
    if (schedules.length <= 1) return null
    
    const teachers = schedules.map(s => s.teacher_name)
    const locations = schedules.map(s => s.location)
    
    const teacherConflict = new Set(teachers).size !== teachers.length
    const locationConflict = new Set(locations).size !== locations.length
    
    if (teacherConflict && locationConflict) return 'both'
    if (teacherConflict) return 'teacher'
    if (locationConflict) return 'location'
    return null
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
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Schedule Management' }
  ]

  return (
    <CourseDashboardLayout
      pageTitle="Schedule Management"
      pageDescription="Manage class schedules and detect conflicts"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Button onClick={() => router.push('/admin/schedule/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Schedules</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : schedules.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Classes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : new Set(schedules.map(s => s.class_id)).size}
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
                    {loading ? '...' : new Set(schedules.map(s => s.teacher_name)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conflicts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : Object.values(groupedSchedules).filter(hasConflicts).length}
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
              View all class schedules organized by day and time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-6">
                {[...Array(7)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-3">
                      {[...Array(3)].map((_, j) => (
                        <Skeleton key={j} className="h-16 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedSchedules).map(([day, timeSlots]) => (
                  <div key={day}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        {day}
                        {hasConflicts(timeSlots) && (
                          <AlertCircle className="h-5 w-5 ml-2 text-red-500" />
                        )}
                      </h3>
                      <Badge variant="outline">
                        {timeSlots.reduce((total, slot) => total + slot.schedules.length, 0)} classes
                      </Badge>
                    </div>
                    
                    {timeSlots.length > 0 ? (
                      <div className="space-y-3">
                        {timeSlots.map((slot, index) => {
                          const conflictType = getConflictType(slot.schedules)
                          return (
                            <div 
                              key={index} 
                              className={`border rounded-lg p-4 ${
                                conflictType ? 'border-red-300 bg-red-50' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="font-medium">{slot.time}</span>
                                  {conflictType && (
                                    <Badge variant="destructive" className="ml-2">
                                      {conflictType === 'both' ? 'Teacher & Location Conflict' :
                                       conflictType === 'teacher' ? 'Teacher Conflict' : 'Location Conflict'}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {slot.schedules.length} class{slot.schedules.length !== 1 ? 'es' : ''}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {slot.schedules.map((schedule) => (
                                  <div key={schedule.schedule_id} className="bg-white border rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medium text-sm">{schedule.class_name}</h4>
                                      <div className="flex space-x-1">
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <div className="flex items-center">
                                        <span className="font-medium">{schedule.course_name}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        <span>{schedule.teacher_name}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span>{schedule.location}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <span>{schedule.student_count} students</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No classes scheduled for {day}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CourseDashboardLayout>
  )
}
