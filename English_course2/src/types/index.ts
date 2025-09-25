// Core type definitions for the UI library

import { type VariantProps } from 'class-variance-authority'
import { type buttonVariants } from '@/components/ui/button'
import { type badgeVariants } from '@/components/ui/badge'

// Base component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Size variants used across components
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Common spacing values
export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Color variants
export type ColorVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'destructive' 
  | 'muted'

// Layout props
export interface LayoutProps {
  padding?: Spacing
  margin?: Spacing
  gap?: Spacing
}

// Responsive breakpoint values
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Component variant props from shadcn/ui
export type ButtonVariants = VariantProps<typeof buttonVariants>
export type BadgeVariants = VariantProps<typeof badgeVariants>

// Form field states
export type FieldState = 'idle' | 'loading' | 'success' | 'error'

// Animation variants
export type AnimationVariant = 'none' | 'fade' | 'slide' | 'scale' | 'bounce'

// Position variants
export type Position = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'

// Alignment options
export type Alignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type Justification = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

// Direction options
export type Direction = 'horizontal' | 'vertical'
export type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse'

// Component state types
export interface ComponentState {
  isLoading?: boolean
  isDisabled?: boolean
  isError?: boolean
  isSuccess?: boolean
}

// Event handler types
export type ClickHandler = (event: React.MouseEvent) => void
export type ChangeHandler<T = string> = (value: T) => void
export type SubmitHandler = (event: React.FormEvent) => void

// Generic component props with common patterns
export interface InteractiveProps {
  onClick?: ClickHandler
  onFocus?: (event: React.FocusEvent) => void
  onBlur?: (event: React.FocusEvent) => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  disabled?: boolean
  tabIndex?: number
}

// Form component props
export interface FormFieldProps extends BaseComponentProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

// Data table types
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T
  header: string
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, item: T, index: number) => React.ReactNode
}

export interface TableProps<T = Record<string, unknown>> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  emptyState?: React.ReactNode
  onRowClick?: (item: T, index: number) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
}

// Modal and overlay types
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  size?: Size
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

// Navigation types
export interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
  children?: NavigationItem[]
}

// Theme-aware component props
export interface ThemeAwareProps {
  variant?: ColorVariant
  size?: Size
}

// Utility types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Component ref types
export type ComponentRef<T extends HTMLElement = HTMLDivElement> = React.Ref<T>

// Polymorphic component types
export type AsChild = { asChild?: boolean }
export type PolymorphicProps<T extends React.ElementType> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

// Error boundary types
export interface ErrorInfo {
  componentStack: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}
