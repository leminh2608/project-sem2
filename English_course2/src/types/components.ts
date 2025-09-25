// Component-specific type definitions

import React from 'react'
import { BaseComponentProps, Size, Spacing, InteractiveProps } from './index'

// Layout component types
export interface ContainerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centerContent?: boolean
  fluid?: boolean
}

export interface GridProps extends BaseComponentProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: Spacing
  responsive?: boolean
  autoFit?: boolean
  minItemWidth?: string
}

export interface GridItemProps extends BaseComponentProps {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6
  colStart?: number
  rowStart?: number
}

export interface StackProps extends BaseComponentProps {
  direction?: 'vertical' | 'horizontal'
  spacing?: Spacing
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  divider?: React.ReactNode
}

export interface FlexProps extends BaseComponentProps {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  gap?: Spacing
  grow?: boolean
  shrink?: boolean
}

// Form component types
export interface FormFieldProps extends BaseComponentProps {
  label?: string
  description?: string
  error?: string | string[]
  required?: boolean
  disabled?: boolean
  hint?: string
  labelPosition?: 'top' | 'left' | 'hidden'
}

export interface FormGroupProps extends BaseComponentProps {
  spacing?: 'sm' | 'md' | 'lg'
  orientation?: 'vertical' | 'horizontal'
}

export interface FormSectionProps extends BaseComponentProps {
  title?: string
  description?: string
  showSeparator?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
}

// Navigation component types
export interface NavbarProps extends BaseComponentProps {
  variant?: 'default' | 'floating' | 'bordered'
  position?: 'static' | 'sticky' | 'fixed'
  blur?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  height?: 'sm' | 'md' | 'lg'
}

export interface SidebarProps extends BaseComponentProps {
  variant?: 'default' | 'floating' | 'bordered'
  position?: 'left' | 'right'
  width?: 'sm' | 'md' | 'lg'
  collapsible?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  overlay?: boolean
}

export interface NavigationItemProps extends BaseComponentProps, InteractiveProps {
  active?: boolean
  icon?: React.ReactNode
  badge?: string | number
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

// Feedback component types
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: Size
  variant?: 'default' | 'dots' | 'pulse' | 'bars'
  color?: string
  speed?: 'slow' | 'normal' | 'fast'
}

export interface AlertProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info'
  title?: string
  description?: string
  icon?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}

export interface ProgressProps extends BaseComponentProps {
  value?: number
  max?: number
  size?: Size
  variant?: 'default' | 'success' | 'warning' | 'error'
  showValue?: boolean
  animated?: boolean
}

// Data display component types
export interface DataTableProps<T = Record<string, unknown>> extends BaseComponentProps {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  emptyState?: React.ReactNode
  onRowClick?: (item: T, index: number) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  sortable?: boolean
  selectable?: boolean
  selectedRows?: T[]
  onSelectionChange?: (selectedRows: T[]) => void
  pagination?: PaginationConfig
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T
  header: string | React.ReactNode
  sortable?: boolean
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  align?: 'left' | 'center' | 'right'
  sticky?: boolean
  render?: (value: unknown, item: T, index: number) => React.ReactNode
  headerRender?: () => React.ReactNode
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export interface EmptyStateProps extends BaseComponentProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  size?: Size
}

// Overlay component types
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  footer?: React.ReactNode
  centered?: boolean
}

export interface DrawerProps extends BaseComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  size?: Size
  overlay?: boolean
}

export interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  variant?: 'default' | 'destructive'
  loading?: boolean
}

// Input component types
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: Size
  variant?: 'default' | 'filled' | 'flushed'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
  error?: boolean
  loading?: boolean
}

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: Size
  variant?: 'default' | 'filled' | 'flushed'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  error?: boolean
  autoResize?: boolean
}

export interface SelectProps<T = string> {
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  size?: Size
  variant?: 'default' | 'filled' | 'flushed'
  children: React.ReactNode
}

// Utility component types
export interface VisuallyHiddenProps extends BaseComponentProps {
  asChild?: boolean
}

export interface PortalProps {
  children: React.ReactNode
  container?: HTMLElement | null
}

export interface FocusTrapProps extends BaseComponentProps {
  active?: boolean
  initialFocus?: React.RefObject<HTMLElement>
  finalFocus?: React.RefObject<HTMLElement>
}

// Animation and transition types
export interface TransitionProps {
  show: boolean
  appear?: boolean
  enter?: string
  enterFrom?: string
  enterTo?: string
  leave?: string
  leaveFrom?: string
  leaveTo?: string
  duration?: number
  delay?: number
}

// Responsive design types
export interface ResponsiveValue<T> {
  base?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}
