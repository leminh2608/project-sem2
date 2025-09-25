import React from 'react'
import { cn } from '@/lib/utils'

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg'
}

const spacingClasses = {
  sm: 'space-y-3',
  md: 'space-y-4',
  lg: 'space-y-6'
}

export function FormGroup({ 
  spacing = 'md', 
  className, 
  children, 
  ...props 
}: FormGroupProps) {
  return (
    <div
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </div>
  )
}
