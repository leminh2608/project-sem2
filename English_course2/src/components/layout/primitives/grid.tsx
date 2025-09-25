import React from 'react'
import { cn } from '@/lib/utils'

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
}

const gridGaps = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
}

const colSpans = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  12: 'col-span-12'
}

const rowSpans = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
  5: 'row-span-5',
  6: 'row-span-6'
}

export function Grid({ 
  cols = 12, 
  gap = 'md', 
  responsive = true, 
  className, 
  children, 
  ...props 
}: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        gridCols[cols],
        gridGaps[gap],
        responsive && cols > 1 && 'grid-cols-1 sm:grid-cols-2 lg:' + gridCols[cols],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function GridItem({ 
  colSpan = 1, 
  rowSpan = 1, 
  className, 
  children, 
  ...props 
}: GridItemProps) {
  return (
    <div
      className={cn(
        colSpans[colSpan],
        rowSpans[rowSpan],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
