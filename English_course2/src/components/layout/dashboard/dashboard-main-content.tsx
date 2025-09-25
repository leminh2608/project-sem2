'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  title: string
  href?: string
}

interface DashboardMainContentProps {
  children: React.ReactNode
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  className?: string
  actions?: React.ReactNode
}

export function DashboardMainContent({
  children,
  title,
  description,
  breadcrumbs,
  className,
  actions
}: DashboardMainContentProps) {
  return (
    <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden", className)}>
      {/* Page Header - Fixed height */}
      {(title || breadcrumbs || actions) && (
        <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 py-4">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb className="mb-4">
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink href={item.href}>
                            {item.title}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{item.title}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}

            {/* Title and Actions */}
            {(title || actions) && (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {actions}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full dashboard-scroll">
          <div className="px-4 py-6">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// Wrapper component for content sections
export function ContentSection({
  children,
  title,
  description,
  className,
  actions
}: {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  actions?: React.ReactNode
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
    </section>
  )
}

// Grid layout for dashboard cards
export function DashboardGrid({
  children,
  columns = 3,
  className
}: {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn(
      "grid gap-4",
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  )
}

// Empty state component
export function EmptyState({
  title = "Không có dữ liệu",
  description = "Chưa có dữ liệu để hiển thị",
  icon: Icon,
  action
}: {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {description}
      </p>
      {action && action}
    </div>
  )
}
