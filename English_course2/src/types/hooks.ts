// Hook-specific type definitions

import { RefObject } from 'react'
import { AsyncState, FormValues, FormErrors, FormTouched } from './utils'

// useLocalStorage hook types
export interface UseLocalStorageOptions<T> {
  defaultValue?: T
  serializer?: {
    read: (value: string) => T
    write: (value: T) => string
  }
}

export type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prevValue: T) => T)) => void,
  () => void
]

// useSessionStorage hook types
export type UseSessionStorageReturn<T> = UseLocalStorageReturn<T>

// useToggle hook types
export type UseToggleReturn = [boolean, (value?: boolean) => void]

// useCounter hook types
export interface UseCounterOptions {
  min?: number
  max?: number
  step?: number
}

export interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
  set: (value: number) => void
}

// useDisclosure hook types
export interface UseDisclosureReturn {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onToggle: () => void
}

// useClipboard hook types
export interface UseClipboardOptions {
  timeout?: number
  format?: 'text/plain' | 'text/html'
}

export interface UseClipboardReturn {
  value: string
  onCopy: (text: string) => Promise<void>
  hasCopied: boolean
  isSupported: boolean
}

// useDebounce hook types
export type UseDebounceReturn<T> = T

// useThrottle hook types
export type UseThrottleReturn<T> = T

// usePrevious hook types
export type UsePreviousReturn<T> = T | undefined

// useAsync hook types
export interface UseAsyncOptions {
  immediate?: boolean
}

export interface UseAsyncReturn<T, Args extends unknown[] = unknown[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T>
  reset: () => void
}

// useForm hook types
export interface UseFormOptions<T extends FormValues> {
  initialValues: T
  validate?: (values: T) => FormErrors<T> | Promise<FormErrors<T>>
  onSubmit: (values: T) => void | Promise<void>
}

export interface UseFormReturn<T extends FormValues> {
  values: T
  errors: FormErrors<T>
  touched: FormTouched<T>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  setFieldValue: (field: keyof T, value: T[keyof T]) => void
  setFieldError: (field: keyof T, error: string) => void
  setFieldTouched: (field: keyof T, touched: boolean) => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  handleReset: () => void
  validateField: (field: keyof T) => Promise<void>
  validateForm: () => Promise<void>
}

// useMediaQuery hook types
export type UseMediaQueryReturn = boolean

// useBreakpoint hook types
export interface UseBreakpointReturn {
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2Xl: boolean
  current: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

// useWindowSize hook types
export interface UseWindowSizeReturn {
  width: number | undefined
  height: number | undefined
}

// useElementSize hook types
export interface UseElementSizeReturn {
  width: number
  height: number
  ref: RefObject<HTMLElement>
}

// useOnClickOutside hook types
export type UseOnClickOutsideHandler = (event: MouseEvent | TouchEvent) => void

// useKeyPress hook types
export interface UseKeyPressOptions {
  target?: RefObject<HTMLElement>
  eventType?: 'keydown' | 'keyup'
}

export type UseKeyPressReturn = boolean

// useHover hook types
export interface UseHoverReturn {
  isHovered: boolean
  ref: RefObject<HTMLElement>
}

// useFocus hook types
export interface UseFocusReturn {
  isFocused: boolean
  ref: RefObject<HTMLElement>
}

// useIntersectionObserver hook types
export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export interface UseIntersectionObserverReturn {
  ref: RefObject<HTMLElement>
  entry: IntersectionObserverEntry | undefined
  isIntersecting: boolean
}

// useVirtualizer hook types
export interface UseVirtualizerOptions<T = unknown> {
  items: T[]
  itemHeight: number | ((index: number, item: T) => number)
  containerHeight: number
  overscan?: number
}

export interface UseVirtualizerReturn<T> {
  virtualItems: Array<{
    index: number
    start: number
    size: number
    item: T
  }>
  totalSize: number
  scrollToIndex: (index: number) => void
  scrollElementRef: RefObject<HTMLElement>
}

// usePagination hook types
export interface UsePaginationOptions {
  total: number
  pageSize: number
  currentPage?: number
  siblingCount?: number
  boundaryCount?: number
}

export interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  pages: (number | 'ellipsis')[]
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
}

// useSort hook types
export interface UseSortOptions<T> {
  data: T[]
  defaultSortKey?: keyof T
  defaultSortDirection?: 'asc' | 'desc'
}

export interface UseSortReturn<T> {
  sortedData: T[]
  sortKey: keyof T | null
  sortDirection: 'asc' | 'desc'
  sort: (key: keyof T) => void
  resetSort: () => void
}

// useFilter hook types
export interface UseFilterOptions<T> {
  data: T[]
  filterFn?: (item: T, query: string) => boolean
}

export interface UseFilterReturn<T> {
  filteredData: T[]
  query: string
  setQuery: (query: string) => void
  clearQuery: () => void
}

// useSelection hook types
export interface UseSelectionOptions<T> {
  items: T[]
  getItemId?: (item: T) => string | number
  multiple?: boolean
}

export interface UseSelectionReturn<T> {
  selectedItems: T[]
  selectedIds: Set<string | number>
  isSelected: (item: T) => boolean
  isAllSelected: boolean
  isPartiallySelected: boolean
  select: (item: T) => void
  deselect: (item: T) => void
  toggle: (item: T) => void
  selectAll: () => void
  deselectAll: () => void
  setSelected: (items: T[]) => void
}

// useUndo hook types
export interface UseUndoOptions {
  maxHistorySize?: number
}

export interface UseUndoReturn<T> {
  state: T
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  set: (newState: T) => void
  reset: (newState: T) => void
  clear: () => void
}

// useIdle hook types
export interface UseIdleOptions {
  timeout?: number
  events?: string[]
  initialState?: boolean
}

export type UseIdleReturn = boolean

// useNetworkState hook types
export interface UseNetworkStateReturn {
  online: boolean
  downlink?: number
  effectiveType?: string
  rtt?: number
  saveData?: boolean
}

// useBattery hook types
export interface UseBatteryReturn {
  supported: boolean
  loading: boolean
  level?: number
  charging?: boolean
  chargingTime?: number
  dischargingTime?: number
}

// useGeolocation hook types
export interface UseGeolocationOptions extends PositionOptions {
  immediate?: boolean
}

export interface UseGeolocationReturn {
  loading: boolean
  accuracy: number | null
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  latitude: number | null
  longitude: number | null
  speed: number | null
  timestamp: number | null
  error: GeolocationPositionError | null
  getCurrentPosition: () => void
}

// usePermission hook types
export type PermissionName = 
  | 'geolocation'
  | 'notifications'
  | 'camera'
  | 'microphone'
  | 'clipboard-read'
  | 'clipboard-write'

export interface UsePermissionReturn {
  state: PermissionState | 'unsupported'
  isSupported: boolean
  request: () => Promise<PermissionState>
}
