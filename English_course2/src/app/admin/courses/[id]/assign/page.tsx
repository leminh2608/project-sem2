'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
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
  ArrowLeft,
  Users,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Clock,
  MapPin
} from 'lucide-react'

interface Student {
  student_id: number
  student_name: string
  student_email: string
  registered_at: string
  class_id?: number
  class_name?: string
}

interface Class {
  class_id: number
  class_name: string
  teacher_name: string
  start_date: string
  end_date: string
  schedule_time: string
  location: string
  max_students: number
  current_students: number
}

interface Course {
  course_id: number
  course_name: string
  level: string
  description: string
}

export default function AdminCourseAssignPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<number | null>(null)

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

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [courseRes, studentsRes, classesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/admin/courses/${courseId}/students`),
        fetch(`/api/admin/courses/${courseId}/classes`)
      ])
      
      if (courseRes.ok) {
        const courseData = await courseRes.json()
        setCourse(courseData.course)
      }
      
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData.students)
      }
      
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        // Deduplicate classes by class_id to prevent React key conflicts
        const uniqueClasses = classesData.classes.filter((classItem: Class, index: number, self: Class[]) =>
          index === self.findIndex(c => c.class_id === classItem.class_id)
        )
        setClasses(uniqueClasses)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'admin' && courseId) {
      fetchData()
    }
  }, [session, courseId])

  const handleAssignStudent = async (studentId: number, classId: number) => {
    try {
      setAssigning(studentId)
      
      const response = await fetch(`/api/admin/courses/${courseId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          class_id: classId
        })
      })

      if (response.ok) {
        // Refresh data to show updated assignments
        await fetchData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error assigning student:', error)
      alert('Failed to assign student to class')
    } finally {
      setAssigning(null)
    }
  }

  const handleUnassignStudent = async (studentId: number) => {
    try {
      setAssigning(studentId)
      
      const response = await fetch(`/api/admin/courses/${courseId}/unassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId
        })
      })

      if (response.ok) {
        // Refresh data to show updated assignments
        await fetchData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error unassigning student:', error)
      alert('Failed to unassign student from class')
    } finally {
      setAssigning(null)
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
      month: 'short',
      day: 'numeric'
    })
  }

  const unassignedStudents = students.filter(s => !s.class_id)
  const assignedStudents = students.filter(s => s.class_id)

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
    { title: 'Course Management', href: '/admin/courses' },
    { title: course?.course_name || 'Course', href: `/admin/courses/${courseId}` },
    { title: 'Assign Students' }
  ]

  const pageActions = (
    <Button
      variant="outline"
      onClick={() => router.push('/admin/courses')}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Courses
    </Button>
  )

  return (
    <CourseDashboardLayout
      pageTitle={loading ? 'Loading...' : course ? `${course.course_name} - Student Assignment` : 'Course Not Found'}
      pageDescription={loading ? 'Please wait...' : course ? 'Assign registered students to specific classes' : 'The requested course could not be found.'}
      breadcrumbs={breadcrumbs}
      pageActions={pageActions}
    >

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : students.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unassigned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : unassignedStudents.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assigned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : assignedStudents.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assignment Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : students.length > 0 ? Math.round((assignedStudents.length / students.length) * 100) + '%' : '0%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Available Classes</CardTitle>
              <CardDescription>
                Classes available for this course
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
                  {classes.map((classItem, index) => (
                    <div key={`class-${classItem.class_id}-${index}`} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg">{classItem.class_name}</h4>
                        <Badge variant={classItem.current_students >= classItem.max_students ? "destructive" : "secondary"}>
                          {classItem.current_students}/{classItem.max_students} students
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>Teacher: {classItem.teacher_name}</span>
                        </div>
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No classes available</h3>
                  <p className="text-gray-600">Classes need to be created before assigning students.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Student Assignments</CardTitle>
              <CardDescription>
                Assign registered students to classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  {/* Unassigned Students */}
                  {unassignedStudents.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                        Unassigned Students ({unassignedStudents.length})
                      </h4>
                      <div className="space-y-3">
                        {unassignedStudents.map((student) => (
                          <div key={student.student_id} className="border rounded-lg p-4 bg-yellow-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium">{student.student_name}</h5>
                                <p className="text-sm text-gray-600">{student.student_email}</p>
                                <p className="text-xs text-gray-500">
                                  Registered: {formatDate(student.registered_at)}
                                </p>
                              </div>
                              
                              <div className="ml-4">
                                <Select
                                  onValueChange={(value) => handleAssignStudent(student.student_id, parseInt(value))}
                                  disabled={assigning === student.student_id || classes.length === 0}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Assign to class" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {classes
                                      .filter(c => c.current_students < c.max_students)
                                      .map((classItem, index) => (
                                        <SelectItem key={`select-class-${classItem.class_id}-${index}`} value={classItem.class_id.toString()}>
                                          {classItem.class_name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned Students */}
                  {assignedStudents.length > 0 && (
                    <div className={unassignedStudents.length > 0 ? 'mt-8' : ''}>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        Assigned Students ({assignedStudents.length})
                      </h4>
                      <div className="space-y-3">
                        {assignedStudents.map((student) => (
                          <div key={student.student_id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium">{student.student_name}</h5>
                                <p className="text-sm text-gray-600">{student.student_email}</p>
                                <p className="text-sm text-green-600 font-medium">
                                  Assigned to: {student.class_name}
                                </p>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnassignStudent(student.student_id)}
                                disabled={assigning === student.student_id}
                              >
                                {assigning === student.student_id ? 'Unassigning...' : 'Unassign'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students registered</h3>
                  <p className="text-gray-600">Students need to register for this course first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </CourseDashboardLayout>
  )
}
