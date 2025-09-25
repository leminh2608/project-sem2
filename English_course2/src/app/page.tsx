'use client'

import React from 'react'
import { ThemeProvider } from '@/contexts/theme-context'
import { AuthProvider } from '@/components/providers/session-provider'
import { MainLayout } from '@/components/layout'
import {
  HeroSection,
  MissionSection,
  FacultySection,
  CoursesSection,
  TestimonialsSection
} from '@/components/homepage'
import { Toaster } from '@/components/ui/sonner'

export default function HomePage() {
  return (
    <ThemeProvider defaultTheme={{ mode: 'system', variant: 'default' }}>
      <AuthProvider>
        <MainLayout>
          <HeroSection />
          <MissionSection />
          <FacultySection />
          <CoursesSection />
          <TestimonialsSection />
          <Toaster />
        </MainLayout>
      </AuthProvider>
    </ThemeProvider>
  )
}
