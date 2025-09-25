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
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  Download,
  Filter
} from 'lucide-react'

interface AnalyticsData {
  totalStudents: number
  totalCourses: number
  totalClasses: number
  totalTeachers: number
  enrollmentByLevel: { level: string; count: number }[]
  attendanceStats: { 
    totalSessions: number
    averageAttendance: number
    presentCount: number
    absentCount: number
    lateCount: number
  }
  courseEnrollments: { 
    course_name: string
    level: string
    enrolled_count: number
    capacity: number
  }[]
  monthlyEnrollments: { month: string; count: number }[]
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('all')

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

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`)
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchAnalytics()
    }
  }, [session, selectedPeriod])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAttendancePercentage = () => {
    if (!analytics?.attendanceStats) return 0
    const { presentCount, totalSessions } = analytics.attendanceStats
    return totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0
  }

  const exportData = () => {
    if (!analytics) return
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Students', analytics.totalStudents.toString()],
      ['Total Courses', analytics.totalCourses.toString()],
      ['Total Classes', analytics.totalClasses.toString()],
      ['Total Teachers', analytics.totalTeachers.toString()],
      ['Average Attendance', `${getAttendancePercentage()}%`],
      [''],
      ['Course Enrollments', ''],
      ['Course Name', 'Level', 'Enrolled', 'Capacity'],
      ...analytics.courseEnrollments.map(course => [
        course.course_name,
        course.level,
        course.enrolled_count.toString(),
        course.capacity.toString()
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
    { title: 'Analytics Dashboard' }
  ]

  return (
    <CourseDashboardLayout
      pageTitle="Analytics Dashboard"
      pageDescription="Comprehensive insights into enrollment and attendance"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} disabled={!analytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : analytics?.totalStudents || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : analytics?.totalCourses || 0}
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
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : analytics?.totalClasses || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : `${getAttendancePercentage()}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enrollment by Level */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment by Level</CardTitle>
              <CardDescription>
                Distribution of students across course levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : analytics?.enrollmentByLevel ? (
                <div className="space-y-4">
                  {analytics.enrollmentByLevel.map((item) => (
                    <div key={item.level} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className={getLevelColor(item.level)}>
                          {item.level}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.count} students</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(item.count / analytics.totalStudents) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No enrollment data available</p>
              )}
            </CardContent>
          </Card>

          {/* Attendance Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>
                Overall attendance statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : analytics?.attendanceStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Sessions</span>
                    <span className="text-sm text-gray-600">{analytics.attendanceStats.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Present</span>
                    <span className="text-sm text-gray-600">{analytics.attendanceStats.presentCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-600">Late</span>
                    <span className="text-sm text-gray-600">{analytics.attendanceStats.lateCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600">Absent</span>
                    <span className="text-sm text-gray-600">{analytics.attendanceStats.absentCount}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Attendance</span>
                      <span className="text-lg font-bold text-blue-600">{getAttendancePercentage()}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No attendance data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Course Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle>Course Enrollment Details</CardTitle>
            <CardDescription>
              Detailed enrollment statistics for each course
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
            ) : analytics?.courseEnrollments && analytics.courseEnrollments.length > 0 ? (
              <div className="space-y-4">
                {analytics.courseEnrollments.map((course, index) => {
                  const enrollmentPercentage = course.capacity > 0 
                    ? Math.round((course.enrolled_count / course.capacity) * 100) 
                    : 0
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1 mb-3 md:mb-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold">{course.course_name}</h4>
                            <Badge className={getLevelColor(course.level)}>
                              {course.level}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{course.enrolled_count} enrolled</span>
                            <span>Capacity: {course.capacity}</span>
                            <span>{enrollmentPercentage}% full</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                enrollmentPercentage >= 90 ? 'bg-red-500' :
                                enrollmentPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <Badge variant={enrollmentPercentage >= 90 ? 'destructive' : 'secondary'}>
                            {enrollmentPercentage}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollment data</h3>
                <p className="text-gray-600">Course enrollment data will appear here when available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CourseDashboardLayout>
  )
}
