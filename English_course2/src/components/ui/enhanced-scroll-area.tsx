'use client'

import React from 'react'
import { ScrollArea, ScrollBar } from './scroll-area'
import { cn } from '@/lib/utils'

interface EnhancedScrollAreaProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'dashboard' | 'minimal'
  orientation?: 'vertical' | 'horizontal' | 'both'
  hideScrollbar?: boolean
  autoHide?: boolean
  smoothScroll?: boolean
  maxHeight?: string | number
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
  scrollToTop?: boolean
  scrollToBottom?: boolean
}

export function EnhancedScrollArea({
  children,
  className,
  variant = 'dashboard',
  orientation = 'vertical',
  hideScrollbar = false,
  autoHide = true,
  smoothScroll = true,
  maxHeight,
  onScroll,
  scrollToTop = false,
  scrollToBottom = false
}: EnhancedScrollAreaProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto scroll to top/bottom when requested
  React.useEffect(() => {
    if (scrollToTop && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: smoothScroll ? 'smooth' : 'auto' })
    }
  }, [scrollToTop, smoothScroll])

  React.useEffect(() => {
    if (scrollToBottom && scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: smoothScroll ? 'smooth' : 'auto' 
      })
    }
  }, [scrollToBottom, smoothScroll])

  const scrollAreaClasses = cn(
    'relative',
    autoHide && 'group',
    smoothScroll && 'scroll-smooth',
    className
  )

  const viewportClasses = cn(
    'size-full rounded-[inherit]',
    maxHeight && typeof maxHeight === 'string' ? `max-h-[${maxHeight}]` : '',
    maxHeight && typeof maxHeight === 'number' ? `max-h-[${maxHeight}px]` : ''
  )

  const variantClasses = {
    default: '',
    dashboard: 'dashboard-scroll',
    minimal: 'scrollbar-thin'
  }

  return (
    <ScrollArea
      ref={scrollRef}
      className={cn(scrollAreaClasses, variantClasses[variant])}
      onScroll={onScroll}
    >
      <div className={viewportClasses}>
        {children}
      </div>
      {!hideScrollbar && orientation !== 'horizontal' && (
        <ScrollBar
          className={cn(
            autoHide && 'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
          )}
        />
      )}
      {!hideScrollbar && orientation !== 'vertical' && (
        <ScrollBar
          orientation="horizontal"
          className={cn(
            autoHide && 'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
          )}
        />
      )}
    </ScrollArea>
  )
}

// Hook for scroll utilities
export function useScrollUtils() {
  const scrollToElement = React.useCallback((
    elementId: string, 
    behavior: ScrollBehavior = 'smooth',
    block: ScrollLogicalPosition = 'start'
  ) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior, block })
    }
  }, [])

  const scrollToTop = React.useCallback((
    container?: HTMLElement,
    behavior: ScrollBehavior = 'smooth'
  ) => {
    const target = container || window
    if (target === window) {
      window.scrollTo({ top: 0, behavior })
    } else {
      target.scrollTo({ top: 0, behavior })
    }
  }, [])

  const scrollToBottom = React.useCallback((
    container?: HTMLElement,
    behavior: ScrollBehavior = 'smooth'
  ) => {
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior })
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior })
    }
  }, [])

  const isScrolledToBottom = React.useCallback((
    container?: HTMLElement,
    threshold: number = 10
  ) => {
    const target = container || document.documentElement
    const scrollTop = target === document.documentElement ? window.pageYOffset : target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target === document.documentElement ? window.innerHeight : target.clientHeight
    
    return scrollHeight - scrollTop - clientHeight < threshold
  }, [])

  const getScrollPercentage = React.useCallback((
    container?: HTMLElement
  ) => {
    const target = container || document.documentElement
    const scrollTop = target === document.documentElement ? window.pageYOffset : target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target === document.documentElement ? window.innerHeight : target.clientHeight
    
    return Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
  }, [])

  return {
    scrollToElement,
    scrollToTop,
    scrollToBottom,
    isScrolledToBottom,
    getScrollPercentage
  }
}

// Scroll position tracker hook
export function useScrollPosition(threshold: number = 10) {
  const [scrollPosition, setScrollPosition] = React.useState({
    x: 0,
    y: 0,
    isAtTop: true,
    isAtBottom: false,
    percentage: 0
  })

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const scrollLeft = window.pageXOffset
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      
      const isAtTop = scrollTop <= threshold
      const isAtBottom = scrollHeight - scrollTop - clientHeight <= threshold
      const percentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)

      setScrollPosition({
        x: scrollLeft,
        y: scrollTop,
        isAtTop,
        isAtBottom,
        percentage: isNaN(percentage) ? 0 : percentage
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrollPosition
}

// Infinite scroll hook
export function useInfiniteScroll(
  callback: () => void,
  threshold: number = 100,
  enabled: boolean = true
) {
  React.useEffect(() => {
    if (!enabled) return

    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        callback()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [callback, threshold, enabled])
}
