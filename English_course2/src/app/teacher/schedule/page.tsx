'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { MonthlyCalendar, CalendarEvent, EventDetail } from '@/components/shared/monthly-calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  AlertCircle,
  Plus,
  Filter,
  Download
} from 'lucide-react'

interface Schedule {
  schedule_id: number
  class_id: number
  class_name: string
  course_name: string
  lesson_date: string
  start_time: string
  end_time: string
  room_or_link: string
  student_count: number
  level: string
}

interface UpcomingClass {
  class_id: number
  class_name: string
  course_name: string
  next_lesson: string
  next_time: string
  location: string
  student_count: number
  total_lessons: number
  completed_lessons: number
}

export default function TeacherSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)

  // Redirect if not authenticated or not a teacher
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user.role !== 'teacher') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/teacher/schedule')
      const data = await response.json()
      
      if (response.ok) {
        setSchedules(data.schedules || [])
        setUpcomingClasses(data.upcomingClasses || [])
      } else {
        setError(data.error || 'Failed to fetch schedule')
      }
    } catch (err) {
      setError('Failed to fetch schedule')
      console.error('Error fetching schedule:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'teacher') {
      fetchSchedules()
    }
  }, [session])

  // Convert schedules to calendar events
  const calendarEvents: CalendarEvent[] = schedules.map(schedule => ({
    id: schedule.schedule_id.toString(),
    title: schedule.class_name,
    date: new Date(schedule.lesson_date),
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    location: schedule.room_or_link,
    type: 'class' as const,
    description: `${schedule.course_name} - ${schedule.student_count} students`
  }))

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDialog(true)
  }

  const handleDateClick = (date: Date) => {
    // Could implement adding new schedule functionality here
    console.log('Date clicked:', date)
  }

  const breadcrumbs = [
    { title: 'Teacher Dashboard', href: '/teacher/dashboard' },
    { title: 'My Schedule' }
  ]

  if (status === 'loading' || loading) {
    return (
      <CourseDashboardLayout
        pageTitle="My Teaching Schedule"
        pageDescription="View and manage your class schedules"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        </div>
      </CourseDashboardLayout>
    )
  }

  if (error) {
    return (
      <CourseDashboardLayout
        pageTitle="My Teaching Schedule"
        pageDescription="View and manage your class schedules"
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
      pageTitle="My Teaching Schedule"
      pageDescription="View and manage your class schedules"
      breadcrumbs={breadcrumbs}
      pageActions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-4">
            <MonthlyCalendar
              events={calendarEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              highlightToday={true}
            />
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingClasses.map(classItem => (
                <Card key={classItem.class_id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{classItem.class_name}</CardTitle>
                        <CardDescription>{classItem.course_name}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {classItem.completed_lessons}/{classItem.total_lessons}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(classItem.next_lesson).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{classItem.next_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{classItem.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{classItem.student_count} students</span>
                    </div>
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => router.push(`/teacher/classes/${classItem.class_id}`)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Class
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {upcomingClasses.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Classes</h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any upcoming classes scheduled.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Event Detail Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Class Details</DialogTitle>
              <DialogDescription>
                View details for this scheduled class
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && <EventDetail event={selectedEvent} />}
          </DialogContent>
        </Dialog>
      </div>
    </CourseDashboardLayout>
  )
}
