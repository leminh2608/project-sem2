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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  Save
} from 'lucide-react'

interface TeacherClass {
  class_id: number
  class_name: string
  course_name: string
  level: string
  day_of_week: string
  start_time: string
  end_time: string
  location: string
  student_count: number
}

interface Student {
  student_id: number
  student_name: string
  student_email: string
}

interface AttendanceRecord {
  student_id: number
  status: 'present' | 'absent' | 'late'
}

export default function TeacherAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0] || '')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  // Fetch teacher's classes
  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/classes')
      
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes)
        if (data.classes.length > 0) {
          setSelectedClass(data.classes[0].class_id)
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch students for selected class
  const fetchStudents = async (classId: number) => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/students`)
      
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
        
        // Initialize attendance records
        const initialAttendance = data.students.map((student: Student) => ({
          student_id: student.student_id,
          status: 'present' as const
        }))
        setAttendance(initialAttendance)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  // Fetch existing attendance for the date
  const fetchExistingAttendance = async (classId: number, date: string) => {
    try {
      const response = await fetch(`/api/teacher/attendance/${classId}?date=${date}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.attendance && data.attendance.length > 0) {
          setAttendance(data.attendance)
        }
      }
    } catch (error) {
      console.error('Error fetching existing attendance:', error)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'teacher') {
      fetchClasses()
    }
  }, [session])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass)
      fetchExistingAttendance(selectedClass, selectedDate)
    }
  }, [selectedClass, selectedDate])

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => 
      prev.map(record => 
        record.student_id === studentId 
          ? { ...record, status }
          : record
      )
    )
  }

  const handleSaveAttendance = async () => {
    if (!selectedClass) return

    try {
      setSaving(true)
      
      const response = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_id: selectedClass,
          date: selectedDate,
          attendance: attendance
        })
      })

      if (response.ok) {
        alert('Attendance saved successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const getAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'present').length
    const absent = attendance.filter(a => a.status === 'absent').length
    const late = attendance.filter(a => a.status === 'late').length
    
    return { present, absent, late, total: attendance.length }
  }

  const stats = getAttendanceStats()
  const selectedClassInfo = classes.find(c => c.class_id === selectedClass)

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
    { title: 'Teacher Dashboard', href: '/teacher/dashboard' },
    { title: 'Attendance Management' }
  ]

  return (
    <CourseDashboardLayout
      pageTitle="Attendance Management"
      pageDescription="Mark student attendance for your classes"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">

        {/* Class and Date Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Class and Date</CardTitle>
            <CardDescription>
              Choose the class and date to mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Class
                </label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedClass?.toString() || ''}
                    onValueChange={(value) => setSelectedClass(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem.class_id} value={classItem.class_id.toString()}>
                          {classItem.class_name} - {classItem.course_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {selectedClassInfo && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">{selectedClassInfo.course_name}</span>
                  </div>
                  <Badge className={getLevelColor(selectedClassInfo.level)}>
                    {selectedClassInfo.level}
                  </Badge>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    <span>{selectedClassInfo.day_of_week}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    <span>{formatTime(selectedClassInfo.start_time)} - {formatTime(selectedClassInfo.end_time)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    <span>{selectedClassInfo.student_count} students</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        {selectedClass && students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Late</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student Attendance List */}
        {selectedClass && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Student Attendance</CardTitle>
                  <CardDescription>
                    Mark attendance for each student
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleSaveAttendance}
                  disabled={saving || students.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="space-y-4">
                  {students.map((student) => {
                    const attendanceRecord = attendance.find(a => a.student_id === student.student_id)
                    const status = attendanceRecord?.status || 'present'
                    
                    return (
                      <div key={student.student_id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-center mb-3 md:mb-0">
                            <User className="h-5 w-5 mr-3 text-gray-500" />
                            <div>
                              <h4 className="font-medium">{student.student_name}</h4>
                              <p className="text-sm text-gray-600">{student.student_email}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant={status === 'present' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceChange(student.student_id, 'present')}
                              className={status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Present
                            </Button>
                            
                            <Button
                              variant={status === 'late' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceChange(student.student_id, 'late')}
                              className={status === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Late
                            </Button>
                            
                            <Button
                              variant={status === 'absent' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceChange(student.student_id, 'absent')}
                              className={status === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Absent
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-600">
                    {selectedClass ? 'No students are enrolled in this class.' : 'Please select a class to view students.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </CourseDashboardLayout>
  )
}
