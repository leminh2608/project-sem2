'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  Calendar,
  Users,
  BarChart3,
  Settings,
  GraduationCap,
  ClipboardList,
  UserCheck,
  Bell,
  PanelLeftClose,
  PanelRightClose,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface MenuItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: number
  children?: MenuItem[]
  roles?: string[]
}

interface CourseDashboardSidebarProps {
  onClose?: () => void
  className?: string
  onToggle?: () => void
  isCollapsed?: boolean
  userRole?: string
}

const getMenuItemsForRole = (role: string): MenuItem[] => {
  const commonItems = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      href: '/notifications',
      roles: ['admin', 'teacher', 'student']
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      href: '/settings',
      roles: ['admin', 'teacher', 'student']
    }
  ]

  switch (role) {
    case 'admin':
      return [
        {
          id: 'admin-dashboard',
          title: 'Dashboard',
          icon: Home,
          href: '/admin/dashboard',
          roles: ['admin']
        },
        {
          id: 'admin-courses',
          title: 'Course Management',
          icon: BookOpen,
          roles: ['admin'],
          children: [
            {
              id: 'admin-courses-list',
              title: 'All Courses',
              icon: BookOpen,
              href: '/admin/courses',
              roles: ['admin']
            },
            {
              id: 'admin-registrations',
              title: 'Registrations',
              icon: ClipboardList,
              href: '/admin/registrations',
              roles: ['admin']
            }
          ]
        },
        {
          id: 'admin-schedules',
          title: 'Schedules',
          icon: Calendar,
          href: '/admin/schedules',
          roles: ['admin']
        },
        {
          id: 'admin-analytics',
          title: 'Analytics',
          icon: BarChart3,
          href: '/admin/analytics',
          roles: ['admin']
        },
        {
          id: 'admin-users',
          title: 'User Management',
          icon: Users,
          href: '/admin/users',
          roles: ['admin']
        },
        ...commonItems
      ]

    case 'teacher':
      return [
        {
          id: 'teacher-dashboard',
          title: 'Dashboard',
          icon: Home,
          href: '/teacher/dashboard',
          roles: ['teacher']
        },
        {
          id: 'teacher-classes',
          title: 'My Classes',
          icon: Users,
          href: '/teacher/classes',
          roles: ['teacher']
        },
        {
          id: 'teacher-attendance',
          title: 'Attendance',
          icon: UserCheck,
          href: '/teacher/attendance',
          roles: ['teacher']
        },
        {
          id: 'teacher-schedule',
          title: 'My Schedule',
          icon: Calendar,
          href: '/teacher/schedule',
          roles: ['teacher']
        },
        ...commonItems
      ]

    case 'student':
      return [
        {
          id: 'student-dashboard',
          title: 'Dashboard',
          icon: Home,
          href: '/student/dashboard',
          roles: ['student']
        },
        {
          id: 'student-courses',
          title: 'Browse Courses',
          icon: BookOpen,
          href: '/student/courses/browse',
          roles: ['student']
        },
        {
          id: 'student-schedule',
          title: 'My Schedule',
          icon: Calendar,
          href: '/student/schedule',
          roles: ['student']
        },
        ...commonItems
      ]

    default:
      return commonItems
  }
}

export function CourseDashboardSidebar({ 
  onClose, 
  className, 
  onToggle, 
  isCollapsed = false,
  userRole = 'student'
}: CourseDashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['admin-courses'])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const hasAccess = (item: MenuItem) => {
    return !item.roles || item.roles.includes(userRole)
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!hasAccess(item)) return null

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const active = item.href ? isActive(item.href) : false

    if (hasChildren) {
      return (
        <div key={item.id}>
          <Button
            variant="ghost"
            className={cn(
              "w-full h-10 px-3 flex items-center",
              isCollapsed ? "justify-center" : "justify-start",
              level > 0 && !isCollapsed && "ml-4 w-[calc(100%-1rem)]",
              "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => !isCollapsed && toggleExpanded(item.id)}
          >
            <item.icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3")} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
            {!isCollapsed && item.badge && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Button>
          {!isCollapsed && isExpanded && item.children && (
            <div className="ml-4 space-y-1">
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link key={item.id} href={item.href || '#'}>
        <Button
          variant="ghost"
          className={cn(
            "w-full h-10 px-3 flex items-center",
            isCollapsed ? "justify-center" : "justify-start",
            level > 0 && !isCollapsed && "ml-4 w-[calc(100%-1rem)]",
            active
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={onClose}
        >
          <item.icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="flex-1 text-left">{item.title}</span>}
          {!isCollapsed && item.badge && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    )
  }

  const menuItems = getMenuItemsForRole(userRole)
  const filteredMenuItems = menuItems.filter(item => hasAccess(item))

  return (
    <aside className={cn(
      "flex flex-col h-full bg-background shadow-md transition-all duration-300 ease-in-out overflow-hidden border-r",
      className
    )}>
      {/* Header - Fixed height - Simplified since main header is above */}
      
        

      {/* Scrollable Menu Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full px-3">
          <div className="space-y-1 py-4">
            {filteredMenuItems.map(item => renderMenuItem(item))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer - Fixed height */}
      {onToggle && (
        <div className="flex-shrink-0 p-3 border-t">
          <Button
            variant="ghost"
            className={cn(
              "w-full h-10 px-3 flex items-center",
              isCollapsed ? "justify-center" : "justify-start",
              "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={onToggle}
          >
            {isCollapsed ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">Collapse</span>
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  )
}
