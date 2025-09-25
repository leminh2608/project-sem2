'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  User, 
  BookOpen,
  ArrowRight,
  Home,
  AlertCircle
} from 'lucide-react'

interface RegistrationData {
  course: {
    course_id: number
    course_name: string
    description: string
    level: string
  }
  registration: {
    registered_at: string
    status: string
  }
  nextSteps: string[]
}

export default function RegistrationConfirmationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

    if (!courseId) {
      router.push('/student/courses')
      return
    }
  }, [session, status, router, courseId])

  // Fetch registration confirmation data
  useEffect(() => {
    const fetchRegistrationData = async () => {
      if (!courseId) return

      try {
        const response = await fetch(`/api/student/registrations/confirmation?courseId=${courseId}`)
        const data = await response.json()

        if (response.ok) {
          setRegistrationData(data)
        } else {
          setError(data.error || 'Failed to load registration confirmation')
        }
      } catch (error) {
        console.error('Error fetching registration data:', error)
        setError('Failed to load registration confirmation')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'student' && courseId) {
      fetchRegistrationData()
    }
  }, [session, courseId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
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
    { title: 'Courses', href: '/student/courses' },
    { title: 'Registration Confirmation' }
  ]

  if (loading) {
    return (
      <CourseDashboardLayout
        pageTitle="Registration Confirmation"
        pageDescription="Confirming your course registration..."
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading confirmation details...</p>
          </div>
        </div>
      </CourseDashboardLayout>
    )
  }

  if (error || !registrationData) {
    return (
      <CourseDashboardLayout
        pageTitle="Registration Error"
        pageDescription="There was an issue with your registration"
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Registration confirmation not found'}
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button onClick={() => router.push('/student/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </CourseDashboardLayout>
    )
  }

  return (
    <CourseDashboardLayout
      pageTitle="Registration Successful!"
      pageDescription="Your course registration has been confirmed"
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Message */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-900">
                  Registration Successful!
                </h3>
                <p className="text-green-700">
                  You have successfully registered for the course. You will be assigned to a class by an administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{registrationData.course.course_name}</h3>
              <div className="mt-2">
                <Badge className={getLevelColor(registrationData.course.level)}>
                  {registrationData.course.level}
                </Badge>
              </div>
            </div>
            
            <p className="text-gray-700">{registrationData.course.description}</p>
            
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Registered on: {formatDate(registrationData.registration.registered_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
            <CardDescription>
              Here's what you can expect after your registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">Class Assignment</h4>
                  <p className="text-sm text-gray-600">
                    An administrator will review your registration and assign you to an appropriate class based on availability and your level.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">Notification</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive a notification once you've been assigned to a class with schedule details.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">Start Learning</h4>
                  <p className="text-sm text-gray-600">
                    Attend your first class and begin your English learning journey!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => router.push('/student/dashboard')}
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/student/courses')}
            className="flex-1"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Browse More Courses
          </Button>
        </div>

        {/* Additional Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900">Important Information</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Check your dashboard regularly for class assignment updates</li>
                  <li>• You can view your registration status in the "My Courses" section</li>
                  <li>• Contact support if you don't receive a class assignment within 3 business days</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CourseDashboardLayout>
  )
}
