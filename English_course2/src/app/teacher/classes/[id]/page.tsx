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
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin,
  Mail,
  Phone,
  Search,
  UserCheck,
  ArrowLeft,
  BookOpen,
  AlertCircle,
  GraduationCap
} from 'lucide-react'

interface ClassInfo {
  class_id: number
  class_name: string
  course_name: string
  start_date: string
  end_date: string
  schedule_time: string
  location: string
  max_students: number
}

interface Student {
  student_id: number
  full_name: string
  email: string
  joined_at: string
  attendance_rate?: number
}

export default function ClassRosterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const classId = params.id as string

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

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

  // Fetch class data
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const [classResponse, studentsResponse] = await Promise.all([
          fetch(`/api/teacher/classes/${classId}`),
          fetch(`/api/teacher/classes/${classId}/students`)
        ])

        if (classResponse.ok) {
          const classData = await classResponse.json()
          setClassInfo(classData.class)
        } else {
          setError('Failed to load class information')
        }

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json()
          setStudents(studentsData.students || [])
          setFilteredStudents(studentsData.students || [])
        } else {
          setError('Failed to load student roster')
        }
      } catch (error) {
        console.error('Error fetching class data:', error)
        setError('Failed to load class information')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'teacher' && classId) {
      fetchClassData()
    }
  }, [session, classId])

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStudents(filtered)
    }
  }, [searchTerm, students])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatJoinedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
    { title: 'My Classes', href: '/teacher/classes' },
    { title: classInfo?.class_name || 'Class Roster' }
  ]

  if (loading) {
    return (
      <CourseDashboardLayout
        pageTitle="Class Roster"
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
      pageDescription="Manage your class roster and student information"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>

        {/* Class Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Class Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium">{classInfo.course_name}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.length}/{classInfo.max_students}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((students.length / classInfo.max_students) * 100)}%
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
                  <p className="text-sm font-medium text-gray-600">Available Spots</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classInfo.max_students - students.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Roster */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Student Roster</CardTitle>
                <CardDescription>
                  {filteredStudents.length} of {students.length} students
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => router.push(`/teacher/attendance?classId=${classId}`)}
                  size="sm"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Student List */}
            {filteredStudents.length > 0 ? (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.student_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{student.full_name}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            <span>{student.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Joined: {formatJoinedDate(student.joined_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {student.attendance_rate !== undefined && (
                          <Badge variant={student.attendance_rate >= 80 ? 'default' : 'secondary'}>
                            {student.attendance_rate}% attendance
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : students.length > 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600">
                  No students match your search criteria. Try adjusting your search terms.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
                <p className="text-gray-600">
                  This class doesn't have any students enrolled yet. Students will appear here once they are assigned to this class.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CourseDashboardLayout>
  )
}
