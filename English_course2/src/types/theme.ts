// Theme-specific type definitions

import { ThemeMode, ThemeVariant, ThemeConfig, ThemeColors } from '@/lib/themes'

// Extended theme configuration with additional options
export interface ExtendedThemeConfig extends ThemeConfig {
  animations?: boolean
  reducedMotion?: boolean
  highContrast?: boolean
  fontSize?: FontSize
  borderRadius?: BorderRadius
}

// Font size variants
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl'

// Border radius variants
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Theme context type with additional utilities
export interface ThemeContextValue {
  theme: ExtendedThemeConfig
  setTheme: (theme: Partial<ExtendedThemeConfig>) => void
  resolvedMode: 'light' | 'dark'
  availableVariants: ThemeVariant[]
  availableModes: ThemeMode[]
  toggleMode: () => void
  resetTheme: () => void
  isSystemTheme: boolean
}

// CSS custom properties mapping
export interface CSSCustomProperties {
  '--background': string
  '--foreground': string
  '--card': string
  '--card-foreground': string
  '--popover': string
  '--popover-foreground': string
  '--primary': string
  '--primary-foreground': string
  '--secondary': string
  '--secondary-foreground': string
  '--muted': string
  '--muted-foreground': string
  '--accent': string
  '--accent-foreground': string
  '--destructive': string
  '--destructive-foreground': string
  '--border': string
  '--input': string
  '--ring': string
  '--radius': string
}

// Theme variant metadata
export interface ThemeVariantMeta {
  name: string
  description: string
  preview: {
    primary: string
    secondary: string
    accent: string
  }
  category: 'neutral' | 'colorful' | 'monochrome'
}

// Theme variants with metadata
export type ThemeVariantWithMeta = {
  [K in ThemeVariant]: ThemeVariantMeta
}

// Theme provider props
export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ExtendedThemeConfig
  storageKey?: string
  enableSystem?: boolean
  enableAnimations?: boolean
  attribute?: 'class' | 'data-theme'
  value?: Record<string, string>
}

// Theme hook return type
export interface UseThemeReturn extends ThemeContextValue {
  colors: ThemeColors
  cssVariables: CSSCustomProperties
  isDark: boolean
  isLight: boolean
}

// Theme switcher component props
export interface ThemeSwitcherProps {
  className?: string
  variant?: 'default' | 'compact' | 'dropdown'
  showVariants?: boolean
  showModes?: boolean
  align?: 'start' | 'center' | 'end'
}

// Theme preview component props
export interface ThemePreviewProps {
  variant: ThemeVariant
  mode: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  showLabel?: boolean
}

// Color scheme utilities
export interface ColorScheme {
  name: string
  colors: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
}

// Theme generation utilities
export interface ThemeGeneratorOptions {
  baseColor: string
  variant: ThemeVariant
  mode: 'light' | 'dark'
  contrast?: 'low' | 'normal' | 'high'
  saturation?: 'low' | 'normal' | 'high'
}

// Theme validation
export interface ThemeValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Theme export/import types
export interface ThemeExport {
  version: string
  theme: ExtendedThemeConfig
  colors: Record<'light' | 'dark', ThemeColors>
  metadata: {
    name: string
    description?: string
    author?: string
    createdAt: string
  }
}

// Animation preferences
export interface AnimationConfig {
  duration: 'fast' | 'normal' | 'slow'
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  reducedMotion: boolean
}

// Accessibility preferences
export interface AccessibilityConfig {
  highContrast: boolean
  reducedMotion: boolean
  focusVisible: boolean
  screenReaderOptimizations: boolean
}

// Complete theme configuration with all options
export interface CompleteThemeConfig extends Omit<ExtendedThemeConfig, 'animations'> {
  animations: AnimationConfig
  accessibility: AccessibilityConfig
  customColors?: Record<string, string>
  customFonts?: Record<string, string>
}
