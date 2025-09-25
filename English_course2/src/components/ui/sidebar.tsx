import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'floating' | 'bordered'
  position?: 'left' | 'right'
  width?: 'sm' | 'md' | 'lg'
  collapsible?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const variantClasses = {
  default: 'bg-background border-r',
  floating: 'bg-background/80 backdrop-blur-md border rounded-lg m-4',
  bordered: 'bg-background border'
}

const widthClasses = {
  sm: 'w-48',
  md: 'w-64',
  lg: 'w-80'
}

const collapsedWidthClasses = {
  sm: 'w-12',
  md: 'w-16',
  lg: 'w-20'
}

export function Sidebar({
  variant = 'default',
  position = 'left',
  width = 'md',
  collapsible = false,
  collapsed = false,
  onCollapsedChange,
  className,
  children,
  ...props
}: SidebarProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-full transition-all duration-300',
        variantClasses[variant],
        collapsed ? collapsedWidthClasses[width] : widthClasses[width],
        position === 'right' && 'order-last',
        className
      )}
      {...props}
    >
      {collapsible && (
        <div className="flex justify-end p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapsedChange?.(!collapsed)}
          >
            {collapsed ? '→' : '←'}
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1">
        {children}
      </ScrollArea>
    </div>
  )
}

// Sidebar components
export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 border-b', className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex-1 p-4', className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 border-t mt-auto', className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarNav({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <nav className={cn('space-y-1', className)} {...props}>
      {children}
    </nav>
  )
}

export function SidebarNavItem({ 
  active = false, 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { active?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors',
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
