'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from 'lucide-react'

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  startTime?: string
  endTime?: string
  location?: string
  teacher?: string
  type?: 'class' | 'exam' | 'meeting' | 'other'
  color?: string
  description?: string
}

interface MonthlyCalendarProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  className?: string
  showWeekends?: boolean
  highlightToday?: boolean
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const EVENT_COLORS = {
  class: 'bg-blue-100 text-blue-800 border-blue-200',
  exam: 'bg-red-100 text-red-800 border-red-200',
  meeting: 'bg-green-100 text-green-800 border-green-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function MonthlyCalendar({
  events = [],
  onEventClick,
  onDateClick,
  className,
  showWeekends = true,
  highlightToday = true
}: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const { year, month } = useMemo(() => ({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth()
  }), [currentDate])

  const firstDayOfMonth = useMemo(() => new Date(year, month, 1), [year, month])
  const lastDayOfMonth = useMemo(() => new Date(year, month + 1, 0), [year, month])
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarDays = useMemo(() => {
    const days = []
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      })
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      })
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      })
    }
    
    return days
  }, [year, month, firstDayOfWeek, daysInMonth])

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const displayDays = showWeekends ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(1, 6)
  const filteredCalendarDays = showWeekends 
    ? calendarDays 
    : calendarDays.filter((_, index) => index % 7 !== 0 && index % 7 !== 6)

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {MONTHS[month]} {year}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-8 px-3"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {displayDays.map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {filteredCalendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day.date)
            const isCurrentDay = isToday(day.date) && highlightToday
            
            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] p-1 border rounded-md cursor-pointer transition-colors hover:bg-muted/50",
                  day.isCurrentMonth ? "bg-background" : "bg-muted/20",
                  isCurrentDay && "bg-primary/10 border-primary"
                )}
                onClick={() => onDateClick?.(day.date)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  day.isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  isCurrentDay && "text-primary font-bold"
                )}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs p-1 rounded border cursor-pointer hover:opacity-80",
                        event.color || EVENT_COLORS[event.type || 'other']
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event)
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.startTime && (
                        <div className="flex items-center gap-1 opacity-75">
                          <Clock className="h-3 w-3" />
                          <span>{event.startTime}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Event detail component for displaying event information
export function EventDetail({ event }: { event: CalendarEvent }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-lg">{event.title}</h3>
        <p className="text-sm text-muted-foreground">
          {event.date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      {(event.startTime || event.endTime) && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {event.startTime} {event.endTime && `- ${event.endTime}`}
          </span>
        </div>
      )}
      
      {event.location && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{event.location}</span>
        </div>
      )}
      
      {event.teacher && (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{event.teacher}</span>
        </div>
      )}
      
      {event.description && (
        <div>
          <p className="text-sm text-muted-foreground">{event.description}</p>
        </div>
      )}
      
      <Badge variant="outline" className={EVENT_COLORS[event.type || 'other']}>
        {event.type || 'Event'}
      </Badge>
    </div>
  )
}
