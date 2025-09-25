import React from 'react'
import { cn } from '@/lib/utils'

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean
}

export function VisuallyHidden({ 
  asChild = false, 
  className, 
  children, 
  ...props 
}: VisuallyHiddenProps) {
  const Component = asChild ? React.Fragment : 'span'
  
  const visuallyHiddenStyles = cn(
    'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
    '[clip:rect(0,0,0,0)]',
    className
  )

  if (asChild) {
    return (
      <>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ className?: string }>, {
                className: cn((child.props as { className?: string }).className, visuallyHiddenStyles),
                ...props
              })
            : child
        )}
      </>
    )
  }

  return (
    <Component className={visuallyHiddenStyles} {...props}>
      {children}
    </Component>
  )
}
