'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Users,
  User,
  BookOpen
} from 'lucide-react'

interface ScheduleItem {
  schedule_id: number
  class_id: number
  class_name: string
  course_name: string
  lesson_date: string
  start_time: string
  end_time: string
  room_or_link?: string
  level?: string
  teacher_name?: string
  student_count?: number
  day_of_week?: string
}

interface WeekInfo {
  weekOffset: number
  startDate: string
  endDate: string
  displayRange: string
}

interface WeeklyScheduleProps {
  schedule: ScheduleItem[]
  weekInfo: WeekInfo
  onWeekChange: (offset: number) => void
  loading?: boolean
  userRole?: 'admin' | 'teacher' | 'student'
  title?: string
}

export function WeeklySchedule({
  schedule,
  weekInfo,
  onWeekChange,
  loading = false,
  userRole = 'student',
  title = 'Weekly Schedule'
}: WeeklyScheduleProps) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  // Group schedule items by day
  const scheduleByDay = React.useMemo(() => {
    const grouped: { [key: string]: ScheduleItem[] } = {}
    
    daysOfWeek.forEach(day => {
      grouped[day] = []
    })
    
    schedule.forEach(item => {
      const date = new Date(item.lesson_date)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
      if (grouped[dayName]) {
        grouped[dayName].push(item)
      }
    })
    
    // Sort items within each day by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })
    
    return grouped
  }, [schedule])

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } catch {
      return time
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateStr
    }
  }

  const getItemIcon = () => {
    switch (userRole) {
      case 'admin':
        return <BookOpen className="h-4 w-4" />
      case 'teacher':
        return <Users className="h-4 w-4" />
      case 'student':
        return <Clock className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const renderScheduleItem = (item: ScheduleItem) => (
    <div 
      key={`${item.schedule_id}-${item.class_id}`}
      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getItemIcon()}
          <div>
            <h4 className="font-medium text-sm">{item.course_name}</h4>
            {item.class_name && (
              <p className="text-xs text-muted-foreground">{item.class_name}</p>
            )}
          </div>
        </div>
        {item.level && (
          <Badge variant="secondary" className="text-xs">
            {item.level}
          </Badge>
        )}
      </div>
      
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Clock className="h-3 w-3" />
          <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
        </div>
        
        {item.room_or_link && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{item.room_or_link}</span>
          </div>
        )}
        
        {userRole === 'admin' && item.teacher_name && (
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3" />
            <span>{item.teacher_name}</span>
          </div>
        )}
        
        {(userRole === 'admin' || userRole === 'teacher') && item.student_count !== undefined && (
          <div className="flex items-center space-x-2">
            <Users className="h-3 w-3" />
            <span>{item.student_count} students</span>
          </div>
        )}
        
        {userRole === 'student' && item.teacher_name && (
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3" />
            <span>{item.teacher_name}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange(weekInfo.weekOffset - 1)}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange(weekInfo.weekOffset + 1)}
              disabled={loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Week of {weekInfo.displayRange}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {daysOfWeek.map(day => (
              <div key={day} className="space-y-2">
                <h3 className="font-medium text-sm">{day}</h3>
                <div className="h-16 bg-muted/30 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {daysOfWeek.map(day => {
              const daySchedule = scheduleByDay[day] || []
              const weekStart = new Date(weekInfo.startDate)
              const dayIndex = daysOfWeek.indexOf(day)
              const currentDate = new Date(weekStart.getTime() + (dayIndex * 24 * 60 * 60 * 1000))
              
              return (
                <div key={day} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{day}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(currentDate.toISOString())}
                    </span>
                  </div>
                  
                  {daySchedule.length > 0 ? (
                    <div className="space-y-2">
                      {daySchedule.map(renderScheduleItem)}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
                      No classes scheduled
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
