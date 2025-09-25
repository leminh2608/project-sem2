'use client'

import React from 'react'
import { useTheme } from '@/contexts/theme-context'
import { ThemeMode, ThemeVariant, getThemeColors } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Monitor, Palette } from 'lucide-react'

interface ThemeSwitcherProps {
  className?: string
}

function VariantColorPreview({ variant }: { variant: ThemeVariant }) {
  const colors = getThemeColors(variant, 'light')
  return (
    <div
      className="w-4 h-4 rounded-full border"
      style={{
        backgroundColor: colors.primary,
      }}
    />
  )
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme, availableVariants, availableModes } = useTheme()

  const getModeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'system':
        return <Monitor className="h-4 w-4" />
    }
  }

  const getVariantName = (variant: ThemeVariant) => {
    return variant.charAt(0).toUpperCase() + variant.slice(1)
  }

  const getModeName = (mode: ThemeMode) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mode Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {getModeIcon(theme.mode)}
            <span className="sr-only">Toggle theme mode</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableModes.map((mode) => (
            <DropdownMenuItem
              key={mode}
              onClick={() => setTheme({ mode })}
              className={theme.mode === mode ? 'bg-accent' : ''}
            >
              <div className="flex items-center gap-2">
                {getModeIcon(mode)}
                {getModeName(mode)}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Variant Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4" />
            <span className="sr-only">Change theme variant</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme Variant</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableVariants.map((variant) => (
            <DropdownMenuItem
              key={variant}
              onClick={() => setTheme({ variant })}
              className={theme.variant === variant ? 'bg-accent' : ''}
            >
              <div className="flex items-center gap-2">
                <VariantColorPreview variant={variant} />
                {getVariantName(variant)}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Compact version for smaller spaces
export function CompactThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()

  const toggleMode = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(theme.mode)
    const nextIndex = (currentIndex + 1) % modes.length
    const nextMode = modes[nextIndex]
    if (nextMode) {
      setTheme({ mode: nextMode })
    }
  }

  const getModeIcon = () => {
    switch (theme.mode) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'system':
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleMode}
      className={className}
    >
      {getModeIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

// Theme preview component for showcasing different variants
export function ThemePreview({ variant, mode }: { variant: ThemeVariant; mode: 'light' | 'dark' }) {
  const { setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme({ variant, mode })}
      className="relative w-full p-4 rounded-lg border-2 border-transparent hover:border-primary transition-colors"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <div className="text-sm font-medium">{variant}</div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <div className="w-full h-6 rounded bg-background border" />
          <div className="w-full h-6 rounded bg-primary" />
          <div className="w-full h-6 rounded bg-secondary" />
          <div className="w-full h-6 rounded bg-accent" />
        </div>
      </div>
    </button>
  )
}
