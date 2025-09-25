'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    mediaQuery.addEventListener('change', handler)

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Predefined breakpoint hooks
export function useBreakpoint() {
  const isSm = useMediaQuery('(min-width: 640px)')
  const isMd = useMediaQuery('(min-width: 768px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  const isXl = useMediaQuery('(min-width: 1280px)')
  const is2Xl = useMediaQuery('(min-width: 1536px)')

  const current = is2Xl 
    ? '2xl' 
    : isXl 
    ? 'xl' 
    : isLg 
    ? 'lg' 
    : isMd 
    ? 'md' 
    : isSm 
    ? 'sm' 
    : 'xs'

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    current
  } as const
}

// Mobile-first responsive hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

// Orientation hooks
export function useIsLandscape() {
  return useMediaQuery('(orientation: landscape)')
}

export function useIsPortrait() {
  return useMediaQuery('(orientation: portrait)')
}

// Accessibility-related media queries
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function usePrefersColorScheme() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersLight = useMediaQuery('(prefers-color-scheme: light)')
  
  return prefersDark ? 'dark' : prefersLight ? 'light' : 'no-preference'
}

export function usePrefersHighContrast() {
  return useMediaQuery('(prefers-contrast: high)')
}

// Touch device detection
export function useIsTouchDevice() {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}
