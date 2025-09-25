// Accessibility utility functions and constants

// ARIA role definitions
export const ARIA_ROLES = {
  // Landmark roles
  banner: 'banner',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  form: 'form',
  main: 'main',
  navigation: 'navigation',
  region: 'region',
  search: 'search',
  
  // Widget roles
  alert: 'alert',
  alertdialog: 'alertdialog',
  button: 'button',
  checkbox: 'checkbox',
  dialog: 'dialog',
  gridcell: 'gridcell',
  link: 'link',
  log: 'log',
  marquee: 'marquee',
  menuitem: 'menuitem',
  menuitemcheckbox: 'menuitemcheckbox',
  menuitemradio: 'menuitemradio',
  option: 'option',
  progressbar: 'progressbar',
  radio: 'radio',
  scrollbar: 'scrollbar',
  searchbox: 'searchbox',
  slider: 'slider',
  spinbutton: 'spinbutton',
  status: 'status',
  switch: 'switch',
  tab: 'tab',
  tabpanel: 'tabpanel',
  textbox: 'textbox',
  timer: 'timer',
  tooltip: 'tooltip',
  treeitem: 'treeitem',
  
  // Composite roles
  combobox: 'combobox',
  grid: 'grid',
  listbox: 'listbox',
  menu: 'menu',
  menubar: 'menubar',
  radiogroup: 'radiogroup',
  tablist: 'tablist',
  tree: 'tree',
  treegrid: 'treegrid',
  
  // Document structure roles
  article: 'article',
  columnheader: 'columnheader',
  definition: 'definition',
  directory: 'directory',
  document: 'document',
  group: 'group',
  heading: 'heading',
  img: 'img',
  list: 'list',
  listitem: 'listitem',
  math: 'math',
  note: 'note',
  presentation: 'presentation',
  row: 'row',
  rowgroup: 'rowgroup',
  rowheader: 'rowheader',
  separator: 'separator',
  table: 'table',
  term: 'term',
  toolbar: 'toolbar'
} as const

// Common ARIA attributes
export interface AriaAttributes {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  'aria-disabled'?: boolean
  'aria-required'?: boolean
  'aria-invalid'?: boolean | 'grammar' | 'spelling'
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  'aria-busy'?: boolean
  'aria-checked'?: boolean | 'mixed'
  'aria-selected'?: boolean
  'aria-pressed'?: boolean | 'mixed'
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  'aria-orientation'?: 'horizontal' | 'vertical'
  'aria-valuemin'?: number
  'aria-valuemax'?: number
  'aria-valuenow'?: number
  'aria-valuetext'?: string
  'aria-level'?: number
  'aria-setsize'?: number
  'aria-posinset'?: number
  'aria-controls'?: string
  'aria-owns'?: string
  'aria-activedescendant'?: string
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both'
  'aria-multiline'?: boolean
  'aria-multiselectable'?: boolean
  'aria-readonly'?: boolean
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other'
}

// Generate unique IDs for ARIA relationships
let idCounter = 0
export function generateId(prefix: string = 'ui'): string {
  return `${prefix}-${++idCounter}`
}

// Focus management utilities
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')
  
  return Array.from(container.querySelectorAll(selector))
}

export function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
  const focusableElements = getFocusableElements(container)
  return focusableElements[0] || null
}

export function getLastFocusableElement(container: HTMLElement): HTMLElement | null {
  const focusableElements = getFocusableElements(container)
  return focusableElements[focusableElements.length - 1] || null
}

// Keyboard event utilities
export function isNavigationKey(key: string): boolean {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)
}

export function isActivationKey(key: string): boolean {
  return ['Enter', ' '].includes(key)
}

export function isEscapeKey(key: string): boolean {
  return key === 'Escape'
}

// Screen reader utilities
export function createScreenReaderOnlyElement(text: string): HTMLElement {
  const element = document.createElement('span')
  element.textContent = text
  element.className = 'sr-only'
  element.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `
  return element
}

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcer = document.createElement('div')
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `
  
  document.body.appendChild(announcer)
  announcer.textContent = message
  
  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)
}

// Color contrast utilities
export function getContrastRatio(): number {
  // This is a simplified version - in production, use a proper color contrast library
  // Returns a value between 1 and 21
  return 4.5 // Placeholder - implement proper contrast calculation
}

export function meetsWCAGContrast(level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio()
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7
}

// Responsive utilities for accessibility
export function getPreferredMotion(): 'reduce' | 'no-preference' {
  if (typeof window === 'undefined') return 'no-preference'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference'
}

export function getPreferredColorScheme(): 'light' | 'dark' | 'no-preference' {
  if (typeof window === 'undefined') return 'no-preference'
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'no-preference'
}

export function getPreferredContrast(): 'high' | 'no-preference' {
  if (typeof window === 'undefined') return 'no-preference'
  return window.matchMedia('(prefers-contrast: high)').matches ? 'high' : 'no-preference'
}

// Touch target utilities
export function isTouchTargetAccessible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  const minSize = 44 // Minimum touch target size in pixels (WCAG guideline)
  return rect.width >= minSize && rect.height >= minSize
}

// Landmark utilities
export function createLandmark(role: keyof typeof ARIA_ROLES, label?: string): AriaAttributes {
  const attributes: AriaAttributes = {}
  if (label) {
    attributes['aria-label'] = label
  }
  return attributes
}

// Form accessibility utilities
export function createFormFieldAttributes(
  labelId?: string,
  descriptionId?: string,
  errorId?: string,
  required?: boolean,
  invalid?: boolean
): AriaAttributes {
  const attributes: AriaAttributes = {}
  
  if (labelId) attributes['aria-labelledby'] = labelId
  if (descriptionId || errorId) {
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ')
    if (describedBy) attributes['aria-describedby'] = describedBy
  }
  if (required) attributes['aria-required'] = true
  if (invalid) attributes['aria-invalid'] = true
  
  return attributes
}

// Dialog accessibility utilities
export function createDialogAttributes(
  titleId?: string,
  descriptionId?: string
): AriaAttributes {
  const attributes: AriaAttributes = {}

  if (titleId) attributes['aria-labelledby'] = titleId
  if (descriptionId) attributes['aria-describedby'] = descriptionId

  return attributes
}

// Menu accessibility utilities
export function createMenuAttributes(
  orientation: 'horizontal' | 'vertical' = 'vertical'
): AriaAttributes {
  return {
    'aria-orientation': orientation
  }
}

export function createMenuItemAttributes(
  hasSubmenu?: boolean,
  checked?: boolean,
  disabled?: boolean
): AriaAttributes {
  const attributes: AriaAttributes = {}

  if (hasSubmenu) attributes['aria-haspopup'] = 'menu'
  if (checked !== undefined) attributes['aria-checked'] = checked
  if (disabled) attributes['aria-disabled'] = true

  return attributes
}
