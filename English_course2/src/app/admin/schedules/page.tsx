'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { MonthlyCalendar, CalendarEvent } from '@/components/shared/monthly-calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  BookOpen,
  User
} from 'lucide-react'

interface Schedule {
  schedule_id: number
  class_id: number
  class_name: string
  course_name: string
  teacher_name: string
  lesson_date: string
  start_time: string
  end_time: string
  room_or_link: string
  student_count: number
}

interface Class {
  class_id: number
  class_name: string
  course_name: string
  teacher_name: string
}

interface CreateScheduleForm {
  class_id: string
  lesson_date: string
  start_time: string
  end_time: string
  room_or_link: string
}

export default function AdminSchedulesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formData, setFormData] = useState<CreateScheduleForm>({
    class_id: '',
    lesson_date: '',
    start_time: '',
    end_time: '',
    room_or_link: ''
  })

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [schedulesResponse, classesResponse] = await Promise.all([
        fetch('/api/admin/schedules'),
        fetch('/api/admin/classes')
      ])
      
      const schedulesData = await schedulesResponse.json()
      const classesData = await classesResponse.json()
      
      if (schedulesResponse.ok) {
        setSchedules(schedulesData.schedules || [])
      } else {
        setError(schedulesData.error || 'Failed to fetch schedules')
      }
      
      if (classesResponse.ok) {
        setClasses(classesData.classes || [])
      }
    } catch (err) {
      setError('Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchData()
    }
  }, [session])

  const handleCreateSchedule = async () => {
    try {
      setCreateLoading(true)
      setError('')
      
      const response = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        await fetchData()
        setShowCreateDialog(false)
        setFormData({
          class_id: '',
          lesson_date: '',
          start_time: '',
          end_time: '',
          room_or_link: ''
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create schedule')
      }
    } catch (err) {
      setError('Failed to create schedule')
      console.error('Error creating schedule:', err)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    
    try {
      const response = await fetch(`/api/admin/schedules/${scheduleId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchData()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete schedule')
      }
    } catch (err) {
      setError('Failed to delete schedule')
      console.error('Error deleting schedule:', err)
    }
  }

  // Convert schedules to calendar events
  const calendarEvents: CalendarEvent[] = schedules.map(schedule => ({
    id: schedule.schedule_id.toString(),
    title: schedule.class_name,
    date: new Date(schedule.lesson_date),
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    location: schedule.room_or_link,
    teacher: schedule.teacher_name,
    type: 'class' as const,
    description: `${schedule.course_name} - ${schedule.student_count} students`
  }))

  const breadcrumbs = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Class Schedules' }
  ]

  if (status === 'loading' || loading) {
    return (
      <CourseDashboardLayout
        pageTitle="Class Schedules"
        pageDescription="Manage class schedules and timetables"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </CourseDashboardLayout>
    )
  }

  if (error) {
    return (
      <CourseDashboardLayout
        pageTitle="Class Schedules"
        pageDescription="Manage class schedules and timetables"
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
      pageTitle="Class Schedules"
      pageDescription="Manage class schedules and timetables"
      breadcrumbs={breadcrumbs}
      pageActions={
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-4">
            <MonthlyCalendar
              events={calendarEvents}
              highlightToday={true}
            />
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Schedules</CardTitle>
                <CardDescription>
                  View and manage all class schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule) => (
                        <TableRow key={schedule.schedule_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{schedule.class_name}</div>
                              <div className="text-sm text-muted-foreground">{schedule.course_name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{schedule.teacher_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {new Date(schedule.lesson_date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {schedule.start_time} - {schedule.end_time}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{schedule.room_or_link}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {schedule.student_count} students
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSchedule(schedule.schedule_id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {schedules.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
                    <p className="text-muted-foreground">
                      Create your first class schedule to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Schedule Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>
                Add a new class schedule to the timetable.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="class_id">Class</Label>
                <Select value={formData.class_id} onValueChange={(value) => setFormData({...formData, class_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                        {cls.class_name} - {cls.course_name} ({cls.teacher_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lesson_date">Date</Label>
                <Input
                  id="lesson_date"
                  type="date"
                  value={formData.lesson_date}
                  onChange={(e) => setFormData({...formData, lesson_date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room_or_link">Location/Room</Label>
                <Input
                  id="room_or_link"
                  placeholder="Room 101 or Zoom link"
                  value={formData.room_or_link}
                  onChange={(e) => setFormData({...formData, room_or_link: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule} disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Schedule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CourseDashboardLayout>
  )
}
