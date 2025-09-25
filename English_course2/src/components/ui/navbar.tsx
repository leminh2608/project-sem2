import React from 'react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/layout'

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'floating' | 'bordered'
  position?: 'static' | 'sticky' | 'fixed'
  blur?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const variantClasses = {
  default: 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  floating: 'bg-background/80 backdrop-blur-md border rounded-lg mx-4 mt-4',
  bordered: 'bg-background border-b'
}

const positionClasses = {
  static: 'relative',
  sticky: 'sticky top-0 z-50',
  fixed: 'fixed top-0 left-0 right-0 z-50'
}

export function Navbar({
  variant = 'default',
  position = 'sticky',
  blur = true,
  maxWidth = 'full',
  className,
  children,
  ...props
}: NavbarProps) {
  return (
    <nav
      className={cn(
        'w-full',
        positionClasses[position],
        variantClasses[variant],
        blur && 'backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <Container size={maxWidth} className="flex items-center justify-between py-4">
        {children}
      </Container>
    </nav>
  )
}

// Navbar components
export function NavbarBrand({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center space-x-2', className)} {...props}>
      {children}
    </div>
  )
}

export function NavbarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center space-x-6', className)} {...props}>
      {children}
    </div>
  )
}

export function NavbarItem({ 
  active = false, 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { active?: boolean }) {
  return (
    <div
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary',
        active ? 'text-primary' : 'text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
