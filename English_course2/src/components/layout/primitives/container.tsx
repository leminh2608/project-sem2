import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centerContent?: boolean
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
}

export function Container({ 
  size = 'lg', 
  centerContent = false, 
  className, 
  children, 
  ...props 
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        centerContent && 'flex items-center justify-center min-h-screen',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
