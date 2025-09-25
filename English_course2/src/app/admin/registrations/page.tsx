'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  BookOpen
} from 'lucide-react'

interface Registration {
  registration_id: number
  student_id: number
  student_name: string
  student_email: string
  course_id: number
  course_name: string
  level: string
  registered_at: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
}

interface RegistrationStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function AdminRegistrationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<RegistrationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [actionLoading, setActionLoading] = useState(false)

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

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/admin/registrations')
      const data = await response.json()
      
      if (response.ok) {
        setRegistrations(data.registrations || [])
        setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 })
      } else {
        setError(data.error || 'Failed to fetch registrations')
      }
    } catch (err) {
      setError('Failed to fetch registrations')
      console.error('Error fetching registrations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchRegistrations()
    }
  }, [session])

  const handleRegistrationAction = async (registration: Registration, action: 'approve' | 'reject') => {
    setSelectedRegistration(registration)
    setActionType(action)
    setShowActionDialog(true)
  }

  const confirmAction = async () => {
    if (!selectedRegistration) return
    
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/admin/registrations/${selectedRegistration.registration_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: actionType === 'approve' ? 'approved' : 'rejected'
        }),
      })
      
      if (response.ok) {
        await fetchRegistrations()
        setShowActionDialog(false)
        setSelectedRegistration(null)
      } else {
        const data = await response.json()
        setError(data.error || `Failed to ${actionType} registration`)
      }
    } catch (err) {
      setError(`Failed to ${actionType} registration`)
      console.error(`Error ${actionType}ing registration:`, err)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = registration.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.course_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const breadcrumbs = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Student Registrations' }
  ]

  if (status === 'loading' || loading) {
    return (
      <CourseDashboardLayout
        pageTitle="Student Registrations"
        pageDescription="Manage student course registrations and approvals"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-[100px]" />
            ))}
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </CourseDashboardLayout>
    )
  }

  if (error) {
    return (
      <CourseDashboardLayout
        pageTitle="Student Registrations"
        pageDescription="Manage student course registrations and approvals"
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
      pageTitle="Student Registrations"
      pageDescription="Manage student course registrations and approvals"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Registrations</CardTitle>
            <CardDescription>
              Review and manage student course registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by student name, email, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Registrations Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration, index) => (
                    <TableRow key={`${registration.registration_id}-${registration.student_id}-${index}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{registration.student_name}</div>
                          <div className="text-sm text-muted-foreground">{registration.student_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{registration.course_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{registration.level}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(registration.registered_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(registration.status)}
                      </TableCell>
                      <TableCell>
                        {registration.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegistrationAction(registration, 'approve')}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegistrationAction(registration, 'reject')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No student registrations have been submitted yet.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Confirmation Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve Registration' : 'Reject Registration'}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to {actionType} this registration?
              </DialogDescription>
            </DialogHeader>
            {selectedRegistration && (
              <div className="space-y-2">
                <p><strong>Student:</strong> {selectedRegistration.student_name}</p>
                <p><strong>Course:</strong> {selectedRegistration.course_name}</p>
                <p><strong>Level:</strong> {selectedRegistration.level}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={actionLoading}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {actionLoading ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Reject')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CourseDashboardLayout>
  )
}
