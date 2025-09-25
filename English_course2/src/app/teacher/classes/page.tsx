'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Search,
  Eye,
  CheckCircle,
  AlertCircle,
  User,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react'

interface TeacherClass {
  class_id: number
  class_name: string
  course_name: string
  course_level: string
  student_count: number
  max_students: number
  schedule_count: number
  next_class?: string
  status: 'active' | 'completed' | 'upcoming'
}

interface ClassStats {
  totalClasses: number
  activeClasses: number
  totalStudents: number
  upcomingClasses: number
}

interface Course {
  course_id: number
  course_name: string
  level: string
}

interface ClassFormData {
  class_name: string
  course_id: number
  start_date: string
  end_date: string
  max_students: number
}

interface FormErrors {
  class_name?: string
  course_id?: string
  start_date?: string
  end_date?: string
  max_students?: string
  general?: string
}

export default function TeacherClassesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [filteredClasses, setFilteredClasses] = useState<TeacherClass[]>([])
  const [stats, setStats] = useState<ClassStats>({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    upcomingClasses: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  // CRUD functionality state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingClass, setEditingClass] = useState<TeacherClass | null>(null)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [formData, setFormData] = useState<ClassFormData>({
    class_name: '',
    course_id: 0,
    start_date: '',
    end_date: '',
    max_students: 30
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

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
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/teacher/classes')
        const data = await response.json()

        if (response.ok) {
          setClasses(data.classes || [])
          setStats(data.stats || stats)
        } else {
          setError(data.error || 'Failed to load classes')
        }
      } catch (error) {
        console.error('Error fetching classes:', error)
        setError('Failed to load classes')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'teacher') {
      fetchClasses()
    }
  }, [session])

  // Filter classes based on search term
  useEffect(() => {
    let filtered = classes

    if (searchTerm) {
      filtered = classes.filter(cls => 
        cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.course_level.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredClasses(filtered)
  }, [searchTerm, classes])

  // Fetch available courses for class creation
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        const data = await response.json()
        if (response.ok) {
          setAvailableCourses(data.courses || [])
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }

    if (session?.user.role === 'teacher') {
      fetchCourses()
    }
  }, [session])

  // Form validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.class_name.trim()) {
      errors.class_name = 'Class name is required'
    }

    if (!formData.course_id) {
      errors.course_id = 'Course selection is required'
    }

    if (!formData.start_date) {
      errors.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      errors.end_date = 'End date is required'
    } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      errors.end_date = 'End date must be after start date'
    }

    if (formData.max_students < 1 || formData.max_students > 100) {
      errors.max_students = 'Maximum students must be between 1 and 100'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      class_name: '',
      course_id: 0,
      start_date: '',
      end_date: '',
      max_students: 30
    })
    setFormErrors({})
    setEditingClass(null)
  }

  // Handle create class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)
    setFormErrors({})

    try {
      const response = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Class created successfully!')
        setShowCreateDialog(false)
        resetForm()
        // Refresh classes list
        window.location.reload()
      } else {
        setFormErrors({ general: data.error || 'Failed to create class' })
      }
    } catch (error) {
      console.error('Error creating class:', error)
      setFormErrors({ general: 'An unexpected error occurred' })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit class
  const handleEditClass = (classItem: TeacherClass) => {
    setEditingClass(classItem)
    setFormData({
      class_name: classItem.class_name,
      course_id: 0, // Will need to be set based on course mapping
      start_date: '', // Will need to be set from class data
      end_date: '', // Will need to be set from class data
      max_students: classItem.max_students
    })
    setShowEditDialog(true)
  }

  // Handle update class
  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !editingClass) return

    setSubmitting(true)
    setFormErrors({})

    try {
      const response = await fetch(`/api/teacher/classes/${editingClass.class_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Class updated successfully!')
        setShowEditDialog(false)
        resetForm()
        // Refresh classes list
        window.location.reload()
      } else {
        setFormErrors({ general: data.error || 'Failed to update class' })
      }
    } catch (error) {
      console.error('Error updating class:', error)
      setFormErrors({ general: 'An unexpected error occurred' })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete class
  const handleDeleteClass = async (classId: number) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/teacher/classes/${classId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Class deleted successfully!')
        // Refresh classes list
        window.location.reload()
      } else {
        setError(data.error || 'Failed to delete class')
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      setError('An unexpected error occurred')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    { title: 'Teacher Dashboard', href: '/teacher/dashboard' },
    { title: 'My Classes' }
  ]

  return (
    <CourseDashboardLayout
      pageTitle="My Classes"
      pageDescription="Manage your assigned classes and students"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Class Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.totalClasses}
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
                  <p className="text-sm font-medium text-gray-600">Active Classes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.activeClasses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.upcomingClasses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Class Management</CardTitle>
                <CardDescription>
                  Create, search and manage your classes
                </CardDescription>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                    <DialogDescription>
                      Create a new class for your students
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateClass} className="space-y-4">
                    {formErrors.general && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{formErrors.general}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="class_name">Class Name *</Label>
                      <Input
                        id="class_name"
                        value={formData.class_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
                        placeholder="Enter class name"
                        className={formErrors.class_name ? 'border-red-500' : ''}
                      />
                      {formErrors.class_name && (
                        <p className="text-sm text-red-600">{formErrors.class_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course_id">Course *</Label>
                      <Select
                        value={formData.course_id.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: parseInt(value) }))}
                      >
                        <SelectTrigger className={formErrors.course_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCourses.map((course) => (
                            <SelectItem key={course.course_id} value={course.course_id.toString()}>
                              {course.course_name} ({course.level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.course_id && (
                        <p className="text-sm text-red-600">{formErrors.course_id}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date *</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                          className={formErrors.start_date ? 'border-red-500' : ''}
                        />
                        {formErrors.start_date && (
                          <p className="text-sm text-red-600">{formErrors.start_date}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date *</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                          className={formErrors.end_date ? 'border-red-500' : ''}
                        />
                        {formErrors.end_date && (
                          <p className="text-sm text-red-600">{formErrors.end_date}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_students">Maximum Students *</Label>
                      <Input
                        id="max_students"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.max_students}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_students: parseInt(e.target.value) || 0 }))}
                        className={formErrors.max_students ? 'border-red-500' : ''}
                      />
                      {formErrors.max_students && (
                        <p className="text-sm text-red-600">{formErrors.max_students}</p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateDialog(false)
                          resetForm()
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Create Class
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search classes by name, course, or level..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Classes List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredClasses.length > 0 ? (
              <div className="space-y-4">
                {filteredClasses.map((classItem) => (
                  <div key={classItem.class_id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{classItem.class_name}</h3>
                          {getStatusBadge(classItem.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Course</p>
                            <p className="font-medium">{classItem.course_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Level</p>
                            <Badge variant="outline">{classItem.course_level}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Students</p>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>{classItem.student_count}/{classItem.max_students}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Schedules</p>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{classItem.schedule_count} sessions</span>
                            </div>
                          </div>
                        </div>

                        {classItem.next_class && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Next Class</p>
                            <p className="text-sm font-medium text-blue-600">
                              {formatDate(classItem.next_class)}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/teacher/classes/${classItem.class_id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClass(classItem)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClass(classItem.class_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No classes found' : 'No classes assigned'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms.' 
                    : 'You don\'t have any classes assigned yet.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Class Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update class information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateClass} className="space-y-4">
              {formErrors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formErrors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit_class_name">Class Name *</Label>
                <Input
                  id="edit_class_name"
                  value={formData.class_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
                  placeholder="Enter class name"
                  className={formErrors.class_name ? 'border-red-500' : ''}
                />
                {formErrors.class_name && (
                  <p className="text-sm text-red-600">{formErrors.class_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_course_id">Course *</Label>
                <Select
                  value={formData.course_id.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: parseInt(value) }))}
                >
                  <SelectTrigger className={formErrors.course_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.course_id} value={course.course_id.toString()}>
                        {course.course_name} ({course.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.course_id && (
                  <p className="text-sm text-red-600">{formErrors.course_id}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_start_date">Start Date *</Label>
                  <Input
                    id="edit_start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className={formErrors.start_date ? 'border-red-500' : ''}
                  />
                  {formErrors.start_date && (
                    <p className="text-sm text-red-600">{formErrors.start_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_end_date">End Date *</Label>
                  <Input
                    id="edit_end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className={formErrors.end_date ? 'border-red-500' : ''}
                  />
                  {formErrors.end_date && (
                    <p className="text-sm text-red-600">{formErrors.end_date}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_max_students">Maximum Students *</Label>
                <Input
                  id="edit_max_students"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_students}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_students: parseInt(e.target.value) || 0 }))}
                  className={formErrors.max_students ? 'border-red-500' : ''}
                />
                {formErrors.max_students && (
                  <p className="text-sm text-red-600">{formErrors.max_students}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false)
                    resetForm()
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Class
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CourseDashboardLayout>
  )
}
