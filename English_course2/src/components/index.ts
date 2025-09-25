// Main component library exports
export * from './ui'
export * from './layout'
// Theme components
export { ThemeSwitcher, CompactThemeSwitcher, ThemePreview } from './shared/theme-switcher'

// Context exports
export { ThemeProvider, useTheme, useThemeColors, useThemeCSS } from '@/contexts/theme-context'

// Hook exports
export * from '@/hooks/use-media-query'
export * from '@/hooks/use-accessibility'
