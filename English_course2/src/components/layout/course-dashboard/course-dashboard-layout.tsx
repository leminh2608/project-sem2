'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { CourseDashboardSidebar } from './course-dashboard-sidebar'
import { cn } from '@/lib/utils'

interface CourseDashboardLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  pageDescription?: string
  breadcrumbs?: Array<{
    title: string
    href?: string
  }>
  pageActions?: React.ReactNode
  className?: string
}

export function CourseDashboardLayout({
  children,
  pageTitle,
  pageDescription,
  breadcrumbs,
  pageActions,
  className
}: CourseDashboardLayoutProps) {
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className={cn("min-h-screen w-full bg-background", className)}>
      {/* Main Website Header */}
      <Header />

      {/* Dashboard Content */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Desktop Sidebar */}
        <CourseDashboardSidebar
          className={cn(
            "hidden md:flex flex-shrink-0 transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-64" : "w-20"
          )}
          isCollapsed={!isSidebarOpen}
          onToggle={toggleSidebar}
          userRole={session?.user?.role}
        />

        {/* Main content area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              {/* Page Header - Simplified without breadcrumbs */}
              {(pageTitle || pageActions) && (
                <div className="mb-6">
                  {/* Page Title and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {pageTitle && (
                        <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
                      )}
                      {pageDescription && (
                        <p className="mt-1 text-sm text-muted-foreground">{pageDescription}</p>
                      )}
                    </div>
                    {pageActions && (
                      <div className="mt-4 sm:mt-0">
                        {pageActions}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Page Content */}
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMobileMenu}
            />
            <div className="fixed left-0 top-16 bottom-0 w-64 z-50 md:hidden">
              <CourseDashboardSidebar
                onClose={closeMobileMenu}
                userRole={session?.user?.role}
              />
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle Button - Only visible when sidebar is hidden */}
      <button
        onClick={toggleMobileMenu}
        className="fixed bottom-4 right-4 z-30 md:hidden bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  )
}
