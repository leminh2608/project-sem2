'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeConfig, ThemeMode, ThemeVariant, generateThemeCSS, getThemeColors } from '@/lib/themes'
import { getSystemTheme } from '@/lib/utils'

interface ThemeContextType {
  theme: ThemeConfig
  setTheme: (theme: Partial<ThemeConfig>) => void
  resolvedMode: 'light' | 'dark'
  availableVariants: ThemeVariant[]
  availableModes: ThemeMode[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeConfig
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = { mode: 'system', variant: 'default' },
  storageKey = 'ui-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme)
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light')

  const availableVariants: ThemeVariant[] = React.useMemo(() => [
    'default',
    'blue',
    'green',
    'purple',
    'orange',
    'red',
    'rose',
    'slate'
  ], [])

  const availableModes: ThemeMode[] = ['light', 'dark', 'system']

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey)
      if (storedTheme) {
        const parsedTheme = JSON.parse(storedTheme) as ThemeConfig
        setThemeState(parsedTheme)
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }
  }, [storageKey])

  // Apply theme to DOM function
  const applyThemeToDOM = React.useCallback((variant: ThemeVariant, mode: 'light' | 'dark') => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    availableVariants.forEach(v => {
      root.classList.remove(`theme-${v}`)
    })

    // Add new theme classes
    root.classList.add(mode)
    root.classList.add(`theme-${variant}`)

    // Apply CSS variables
    const colors = getThemeColors(variant, mode)
    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--${cssKey}`, value)
    })
  }, [availableVariants])

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme.mode === 'system') {
        const systemTheme = getSystemTheme()
        setResolvedMode(systemTheme)
        applyThemeToDOM(theme.variant, systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme.mode, theme.variant, applyThemeToDOM])

  // Apply theme when theme changes
  useEffect(() => {
    const mode = theme.mode === 'system' ? getSystemTheme() : theme.mode
    setResolvedMode(mode)
    applyThemeToDOM(theme.variant, mode)
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(theme))
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [theme, storageKey, applyThemeToDOM])

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }))
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedMode,
    availableVariants,
    availableModes,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook for getting theme colors
export function useThemeColors() {
  const { theme, resolvedMode } = useTheme()
  return getThemeColors(theme.variant, resolvedMode)
}

// Hook for generating theme CSS
export function useThemeCSS() {
  const { theme, resolvedMode } = useTheme()
  return generateThemeCSS(theme.variant, resolvedMode)
}
