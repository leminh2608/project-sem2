'use client'

import React from 'react'
import { DashboardHeader } from './dashboard-header'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardMainContent } from './dashboard-main-content'
import { DashboardSidePanel } from './dashboard-side-panel'
import { cn } from '@/lib/utils'


interface DashboardLayoutProps {
  children: React.ReactNode
  
  // Header props
  headerTitle?: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
  
  // Main content props
  pageTitle?: string
  pageDescription?: string
  breadcrumbs?: Array<{
    title: string
    href?: string
  }>
  pageActions?: React.ReactNode
  
  // Side panel props
  sidePanelOpen?: boolean
  sidePanelTitle?: string
  sidePanelDescription?: string
  sidePanelContent?: React.ReactNode
  onSidePanelClose?: () => void
  onSidePanelSave?: () => void
  onSidePanelReset?: () => void
  sidePanelLoading?: boolean
  
  // Layout props
  sidebarCollapsed?: boolean
  className?: string
}

export function DashboardLayout({
  children,
  headerTitle,
  user,
  pageTitle,
  pageDescription,
  breadcrumbs,
  pageActions,
  sidePanelOpen = false,
  sidePanelTitle = "",
  sidePanelDescription,
  sidePanelContent,
  onSidePanelClose,
  onSidePanelSave,
  onSidePanelReset,
  sidePanelLoading = false,
  sidebarCollapsed = false,
  className
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(!sidebarCollapsed)
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
    <div className={cn("flex h-screen w-full bg-background overflow-hidden", className)}>
      {/* Desktop Sidebar */}
      <DashboardSidebar
        className={cn(
          "hidden md:flex flex-shrink-0 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}
        isCollapsed={!isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main content area including header */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <DashboardHeader
          title={headerTitle}
          user={user}
          onMenuToggle={toggleMobileMenu}
        />

        {/* Main Content */}
        <DashboardMainContent
          title={pageTitle}
          description={pageDescription}
          breadcrumbs={breadcrumbs}
          actions={pageActions}
        >
          {children}
        </DashboardMainContent>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          <div className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden">
            <DashboardSidebar onClose={closeMobileMenu} />
          </div>
        </>
      )}

      {/* Side Panel */}
      {sidePanelOpen && onSidePanelClose && (
        <DashboardSidePanel
          isOpen={sidePanelOpen}
          onClose={onSidePanelClose}
          title={sidePanelTitle}
          description={sidePanelDescription}
          onSave={onSidePanelSave}
          onReset={onSidePanelReset}
          loading={sidePanelLoading}
        >
          {sidePanelContent}
        </DashboardSidePanel>
      )}
    </div>
  )
}

// Hook for managing dashboard state
export function useDashboardLayout() {
  const [sidePanel, setSidePanel] = React.useState({
    isOpen: false,
    title: '',
    description: '',
    content: null as React.ReactNode,
    loading: false
  })

  const openSidePanel = (config: {
    title: string
    description?: string
    content: React.ReactNode
  }) => {
    setSidePanel({
      isOpen: true,
      title: config.title,
      description: config.description || '',
      content: config.content,
      loading: false
    })
  }

  const closeSidePanel = () => {
    setSidePanel(prev => ({ ...prev, isOpen: false }))
  }

  const setSidePanelLoading = (loading: boolean) => {
    setSidePanel(prev => ({ ...prev, loading }))
  }

  return {
    sidePanel,
    openSidePanel,
    closeSidePanel,
    setSidePanelLoading
  }
}
