'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BookOpen,
  Users,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Settings,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Palette,
  TrendingUp,
  Star,
  Activity
} from 'lucide-react'

interface CourseRegistration {
  course_id: number
  course_name: string
  level: string
  student_id: number
  student_name: string
  student_email: string
  registered_at: string
  class_id?: number
  class_name?: string
  assigned_at?: string
}

interface Course {
  course_id: number
  course_name: string
  level: string
  enrolled_count: number
  class_count: number
  teacher_count?: number
  avg_satisfaction?: number
  is_active?: boolean
  created_at?: string
  price?: number
  max_students?: number
  description?: string
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [message, setMessage] = useState('')

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

  // Fetch data with advanced filtering
  const fetchData = async (useAdvancedFilters = false) => {
    try {
      setLoading(true)

      let coursesUrl = '/api/admin/courses'
      if (useAdvancedFilters) {
        const params = new URLSearchParams({
          advanced: 'true',
          search: searchTerm,
          level: levelFilter,
          status: statusFilter,
          sortBy,
          sortOrder,
          limit: '50',
          offset: '0'
        })
        coursesUrl += `?${params.toString()}`
      }

      const [registrationsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/registrations'),
        fetch(coursesUrl)
      ])

      if (registrationsRes.ok) {
        const registrationsData = await registrationsRes.json()
        setRegistrations(registrationsData.registrations)
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData.courses)
        setFilteredCourses(coursesData.courses)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage('Error fetching data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter courses locally
  const filterCourses = () => {
    let filtered = [...courses]

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (levelFilter) {
      filtered = filtered.filter(course => course.level === levelFilter)
    }

    if (statusFilter) {
      filtered = filtered.filter(course =>
        statusFilter === 'active' ? course.is_active : !course.is_active
      )
    }

    setFilteredCourses(filtered)
  }

  // Bulk operations
  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedCourses.length === 0) {
      setMessage('Please select courses to update.')
      return
    }

    setBulkActionLoading(true)
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk_status_update',
          courseIds: selectedCourses,
          data: { isActive }
        })
      })

      if (response.ok) {
        const result = await response.json()
        setMessage(result.message)
        setSelectedCourses([])
        fetchData()
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to update courses')
      }
    } catch (error) {
      console.error('Error updating courses:', error)
      setMessage('Error updating courses. Please try again.')
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(filteredCourses.map(course => course.course_id))
    }
  }

  const handleSelectCourse = (courseId: number) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchData()
    }
  }, [session])

  useEffect(() => {
    filterCourses()
  }, [searchTerm, levelFilter, statusFilter, courses])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getSatisfactionStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      )
    }
    return stars
  }

  const pendingRegistrations = registrations.filter(r => !r.class_id)
  const assignedRegistrations = registrations.filter(r => r.class_id)

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
    { title: 'Course Management' }
  ]

  return (
    <CourseDashboardLayout
      pageTitle="Course Management"
      pageDescription="Comprehensive course management with theming and analytics"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Message Alert */}
        {message && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600">Manage courses, themes, and analytics</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            <Button onClick={() => router.push('/admin/courses/create')}>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="course_name">Course Name</SelectItem>
                    <SelectItem value="enrolled_count">Enrollment</SelectItem>
                    <SelectItem value="avg_satisfaction">Satisfaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedCourses.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {selectedCourses.length} course(s) selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCourses([])}
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate(true)}
                    disabled={bulkActionLoading}
                  >
                    Activate Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate(false)}
                    disabled={bulkActionLoading}
                  >
                    Deactivate Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : courses.length}
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
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : courses.filter(c => c.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : (
                      courses.length > 0
                        ? (courses.reduce((sum, c) => sum + (c.avg_satisfaction || 0), 0) / courses.length).toFixed(1)
                        : '0'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : courses.reduce((sum, c) => sum + (c.class_count || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
          </TabsList>

          {/* Course Management Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Course Management</CardTitle>
                    <CardDescription>
                      Manage all courses with advanced filtering and bulk operations
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-gray-600">Select All</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-2" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredCourses.length > 0 ? (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {filteredCourses.map((course) => (
                      <div key={course.course_id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedCourses.includes(course.course_id)}
                            onCheckedChange={() => handleSelectCourse(course.course_id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-lg">{course.course_name}</h4>
                              <Badge className={getLevelColor(course.level)}>
                                {course.level}
                              </Badge>
                              <Badge className={getStatusColor(course.is_active || false)}>
                                {course.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>

                            {course.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {course.description}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-gray-400" />
                                <span>{course.enrolled_count || 0} students</span>
                              </div>
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-1 text-gray-400" />
                                <span>{course.class_count || 0} classes</span>
                              </div>
                              {course.price !== undefined && (
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-1">$</span>
                                  <span>{formatCurrency(course.price)}</span>
                                </div>
                              )}
                              {course.avg_satisfaction && (
                                <div className="flex items-center">
                                  <div className="flex mr-1">
                                    {getSatisfactionStars(Math.round(course.avg_satisfaction))}
                                  </div>
                                  <span>{course.avg_satisfaction.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={`flex ${viewMode === 'list' ? 'items-center space-x-2' : 'justify-between items-center mt-4'}`}>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/courses/${course.course_id}?enhanced=true`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/courses/${course.course_id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/courses/${course.course_id}/theme`)}
                            >
                              <Palette className="h-4 w-4 mr-1" />
                              Theme
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || levelFilter || statusFilter
                        ? 'No courses match your current filters.'
                        : 'Create your first course to get started.'
                      }
                    </p>
                    <Button onClick={() => router.push('/admin/courses/create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Course
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle>Course Registrations</CardTitle>
                <CardDescription>
                  Manage student course registrations and class assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-2" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : registrations.length > 0 ? (
                  <div className="space-y-4">
                    {/* Pending Registrations */}
                    {pendingRegistrations.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                          Pending Class Assignment ({pendingRegistrations.length})
                        </h3>
                        <div className="space-y-3">
                          {pendingRegistrations.map((registration) => (
                            <div key={`${registration.course_id}-${registration.student_id}`} 
                                 className="border rounded-lg p-4 bg-yellow-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-semibold">{registration.course_name}</h4>
                                    <Badge className={getLevelColor(registration.level)}>
                                      {registration.level}
                                    </Badge>
                                    <Badge variant="outline">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Pending
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      <span>{registration.student_name}</span>
                                    </div>
                                    <span>({registration.student_email})</span>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      <span>Registered: {formatDate(registration.registered_at)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/admin/courses/${registration.course_id}/assign`)}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Assign to Class
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned Registrations */}
                    {assignedRegistrations.length > 0 && (
                      <div className={pendingRegistrations.length > 0 ? 'mt-8' : ''}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                          Assigned to Classes ({assignedRegistrations.length})
                        </h3>
                        <div className="space-y-3">
                          {assignedRegistrations.map((registration) => (
                            <div key={`${registration.course_id}-${registration.student_id}`} 
                                 className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-semibold">{registration.course_name}</h4>
                                    <Badge className={getLevelColor(registration.level)}>
                                      {registration.level}
                                    </Badge>
                                    <Badge variant="secondary">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Assigned
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      <span>{registration.student_name}</span>
                                    </div>
                                    <span>Class: {registration.class_name}</span>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      <span>Registered: {formatDate(registration.registered_at)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/admin/courses/${registration.course_id}/manage`)}
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Manage
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
                    <p className="text-gray-600">Course registrations will appear here when students enroll.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
                <CardDescription>
                  Overview of all courses and their enrollment statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="h-6 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <Card key={course.course_id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{course.course_name}</CardTitle>
                            <Badge className={getLevelColor(course.level)}>
                              {course.level}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Students:</span>
                              <span className="font-medium">{course.enrolled_count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Classes:</span>
                              <span className="font-medium">{course.class_count}</span>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => router.push(`/admin/courses/${course.course_id}`)}
                          >
                            Manage Course
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-600">Courses will appear here when they are created.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Performance Overview</CardTitle>
                  <CardDescription>
                    Key metrics and performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {courses.filter(c => c.level === 'Beginner').length}
                        </div>
                        <div className="text-sm text-gray-600">Beginner Courses</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {courses.filter(c => c.level === 'Intermediate').length}
                        </div>
                        <div className="text-sm text-gray-600">Intermediate Courses</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {courses.filter(c => c.level === 'Advanced').length}
                        </div>
                        <div className="text-sm text-gray-600">Advanced Courses</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {courses.filter(c => c.is_active).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Courses</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Trends</CardTitle>
                  <CardDescription>
                    Student enrollment by course level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                      const levelCourses = courses.filter(c => c.level === level)
                      const totalEnrollments = levelCourses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0)
                      const avgEnrollment = levelCourses.length > 0 ? totalEnrollments / levelCourses.length : 0

                      return (
                        <div key={level} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{level}</div>
                            <div className="text-sm text-gray-600">
                              {levelCourses.length} courses, {totalEnrollments} total students
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{avgEnrollment.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">avg/course</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes">
            <Card>
              <CardHeader>
                <CardTitle>Course Theme Management</CardTitle>
                <CardDescription>
                  Manage visual themes and branding for courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.course_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{course.course_name}</h4>
                        <Badge className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-sm text-gray-600">Default Theme</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {course.enrolled_count || 0} students
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/courses/${course.course_id}/theme`)}
                          >
                            <Palette className="h-4 w-4 mr-1" />
                            Customize
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {courses.length === 0 && (
                  <div className="text-center py-12">
                    <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
                    <p className="text-gray-600">Create courses to manage their themes.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CourseDashboardLayout>
  )
}
