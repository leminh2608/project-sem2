'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CourseDashboardLayout } from '@/components/layout/course-dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Calendar, 
  BookOpen, 
  Users, 
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react'

interface Notification {
  notification_id: number
  type: string
  title: string
  message: string
  data?: any
  is_read: boolean
  created_at: string
}

interface NotificationStats {
  total: number
  unread: number
  read: number
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    read: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [error, setError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        const data = await response.json()

        if (response.ok) {
          setNotifications(data.notifications || [])
          setStats(data.stats || stats)
        } else {
          setError(data.error || 'Failed to load notifications')
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        setError('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchNotifications()
    }
  }, [session])

  // Filter notifications based on active tab
  useEffect(() => {
    let filtered = notifications

    switch (activeTab) {
      case 'unread':
        filtered = notifications.filter(n => !n.is_read)
        break
      case 'read':
        filtered = notifications.filter(n => n.is_read)
        break
      default:
        filtered = notifications
    }

    setFilteredNotifications(filtered)
  }, [activeTab, notifications])

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.notification_id === notificationId 
              ? { ...n, is_read: true }
              : n
          )
        )
        setStats(prev => ({
          ...prev,
          unread: prev.unread - 1,
          read: prev.read + 1
        }))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        )
        setStats(prev => ({
          ...prev,
          unread: 0,
          read: prev.total
        }))
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(n => n.notification_id !== notificationId)
        )
        setStats(prev => ({
          total: prev.total - 1,
          unread: prev.unread - (notifications.find(n => n.notification_id === notificationId)?.is_read ? 0 : 1),
          read: prev.read - (notifications.find(n => n.notification_id === notificationId)?.is_read ? 1 : 0)
        }))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'class_assignment':
        return <Users className="h-5 w-5 text-blue-600" />
      case 'schedule_change':
        return <Calendar className="h-5 w-5 text-orange-600" />
      case 'course_update':
        return <BookOpen className="h-5 w-5 text-green-600" />
      case 'system':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
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
    { title: 'Notifications' }
  ]

  return (
    <CourseDashboardLayout
      pageTitle="Notifications"
      pageDescription="Stay updated with your latest notifications"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Notification Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BellOff className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.unread}
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
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.read}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Notifications</CardTitle>
                <CardDescription>
                  {filteredNotifications.length} notifications
                </CardDescription>
              </div>
              {stats.unread > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
                <TabsTrigger value="read">Read ({stats.read})</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div 
                        key={notification.notification_id} 
                        className={`border rounded-lg p-4 transition-colors ${
                          !notification.is_read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getNotificationIcon(notification.type)}
                              <h4 className="font-semibold">{notification.title}</h4>
                              {!notification.is_read && (
                                <Badge variant="secondary">New</Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-700 mb-3">{notification.message}</p>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{formatDate(notification.created_at)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.is_read && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => markAsRead(notification.notification_id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteNotification(notification.notification_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {activeTab === 'unread' ? 'No unread notifications' : 
                       activeTab === 'read' ? 'No read notifications' : 'No notifications'}
                    </h3>
                    <p className="text-gray-600">
                      {activeTab === 'unread' ? 'All caught up! You have no unread notifications.' :
                       activeTab === 'read' ? 'No notifications have been read yet.' :
                       'You don\'t have any notifications yet.'}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </CourseDashboardLayout>
  )
}
