import React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  showSeparator?: boolean
}

export function FormSection({
  title,
  description,
  showSeparator = true,
  className,
  children,
  ...props
}: FormSectionProps) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-lg font-medium leading-6">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
      {showSeparator && <Separator className="my-6" />}
    </div>
  )
}
