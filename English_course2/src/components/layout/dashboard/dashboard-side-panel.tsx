'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { X, Save, RotateCcw } from 'lucide-react'

interface DashboardSidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onSave?: () => void
  onReset?: () => void
  saveLabel?: string
  resetLabel?: string
  showActions?: boolean
  loading?: boolean
}

export function DashboardSidePanel({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'lg',
  onSave,
  onReset,
  saveLabel = "Lưu",
  resetLabel = "Đặt lại",
  showActions = true,
  loading = false
}: DashboardSidePanelProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'w-2/3 max-w-none',
    xl: 'max-w-xl'
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-none",
          sizeClasses[size],
          "flex flex-col p-0",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          "data-[state=closed]:duration-300 data-[state=open]:duration-300",
          "data-[state=open]:ease-out data-[state=closed]:ease-in",
          className
        )}
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-lg font-semibold truncate">
              {title}
            </SheetTitle>
            {description && (
              <SheetDescription className="mt-1 text-sm text-muted-foreground">
                {description}
              </SheetDescription>
            )}
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full dashboard-scroll">
            <div className="px-6 py-4">
              {children}
            </div>
          </ScrollArea>
        </div>

        {/* Actions */}
        {showActions && (onSave || onReset) && (
          <>
            <Separator />
            <div className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                {onReset && (
                  <Button
                    variant="outline"
                    onClick={onReset}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {resetLabel}
                  </Button>
                )}
                {onSave && (
                  <Button
                    onClick={onSave}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Đang lưu..." : saveLabel}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Form wrapper component for side panel
export function SidePanelForm({
  children,
  onSubmit,
  className
}: {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", className)}>
      {children}
    </form>
  )
}

// Section component for organizing form content
export function SidePanelSection({
  title,
  description,
  children,
  className
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-sm font-medium text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

// Quick action buttons for common operations
export function SidePanelQuickActions({
  actions,
  className
}: {
  actions: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    icon?: React.ComponentType<{ className?: string }>
    disabled?: boolean
  }>
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outline'}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          className="flex items-center gap-2"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      ))}
    </div>
  )
}
