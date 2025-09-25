'use client'

import { useEffect, useRef, useState } from 'react'

// Focus management hook
export function useFocusManagement() {
  const focusableElementsSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  const getFocusableElements = (container: HTMLElement) => {
    return Array.from(container.querySelectorAll(focusableElementsSelector)) as HTMLElement[]
  }

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }

  return {
    getFocusableElements,
    trapFocus
  }
}

// Focus trap hook for modals and overlays
export function useFocusTrap(active: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)
  const { trapFocus } = useFocusManagement()

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const cleanup = trapFocus(container)

    // Focus first focusable element
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    firstFocusable?.focus()

    return cleanup
  }, [active, trapFocus])

  return containerRef
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  items: HTMLElement[],
  options: {
    loop?: boolean
    orientation?: 'horizontal' | 'vertical' | 'both'
    onSelect?: (index: number) => void
  } = {}
) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const { loop = true, orientation = 'both', onSelect } = options

  const handleKeyDown = (e: KeyboardEvent) => {
    const { key } = e
    let newIndex = currentIndex

    switch (key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault()
          newIndex = currentIndex + 1
          if (newIndex >= items.length) {
            newIndex = loop ? 0 : items.length - 1
          }
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault()
          newIndex = currentIndex - 1
          if (newIndex < 0) {
            newIndex = loop ? items.length - 1 : 0
          }
        }
        break
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault()
          newIndex = currentIndex + 1
          if (newIndex >= items.length) {
            newIndex = loop ? 0 : items.length - 1
          }
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault()
          newIndex = currentIndex - 1
          if (newIndex < 0) {
            newIndex = loop ? items.length - 1 : 0
          }
        }
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = items.length - 1
        break
      case 'Enter':
      case ' ':
        if (currentIndex >= 0) {
          e.preventDefault()
          onSelect?.(currentIndex)
        }
        break
    }

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
      setCurrentIndex(newIndex)
      items[newIndex]?.focus()
    }
  }

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown
  }
}

// Screen reader announcements
export function useAnnouncer() {
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const element = document.createElement('div')
    element.setAttribute('aria-live', 'polite')
    element.setAttribute('aria-atomic', 'true')
    element.style.position = 'absolute'
    element.style.left = '-10000px'
    element.style.width = '1px'
    element.style.height = '1px'
    element.style.overflow = 'hidden'
    
    document.body.appendChild(element)
    setAnnouncer(element)

    return () => {
      document.body.removeChild(element)
    }
  }, [])

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcer) {
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = message
    }
  }

  return { announce }
}

// Reduced motion detection and handling
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// High contrast mode detection
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersHighContrast
}

// ARIA attributes helper
export function useAriaAttributes(
  element: HTMLElement | null,
  attributes: Record<string, string | boolean | undefined>
) {
  useEffect(() => {
    if (!element) return

    Object.entries(attributes).forEach(([key, value]) => {
      if (value === undefined) {
        element.removeAttribute(key)
      } else {
        element.setAttribute(key, String(value))
      }
    })
  }, [element, attributes])
}

// Live region management
export function useLiveRegion(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (regionRef.current && message) {
      regionRef.current.textContent = message
    }
  }, [message])

  const liveRegionProps = {
    ref: regionRef,
    'aria-live': priority,
    'aria-atomic': 'true',
    className: 'sr-only'
  }

  return liveRegionProps
}
