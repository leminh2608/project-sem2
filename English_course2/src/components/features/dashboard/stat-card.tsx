'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'warning' | 'destructive'
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = 'default' 
}: StatCardProps) {
  const colorClasses = {
    default: 'text-green-500',
    warning: 'text-yellow-500',
    destructive: 'text-red-500'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${colorClasses[variant]}`}>
          {change} so với tháng trước
        </p>
      </CardContent>
    </Card>
  )
}
