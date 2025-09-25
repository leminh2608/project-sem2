'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Package,
  PackageOpen,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  Home,
  FileText,
  Truck,
  ShoppingCart,
  Archive,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react'

interface MenuItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: string | number
  children?: MenuItem[]
}

interface DashboardSidebarProps {
  onClose?: () => void
  className?: string
  onToggle?: () => void
  isCollapsed?: boolean
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Tổng quan',
    icon: Home,
    href: '/dashboard'
  },
  {
    id: 'inventory',
    title: 'Quản lý kho',
    icon: Package,
    children: [
      {
        id: 'inventory-list',
        title: 'Danh sách hàng hóa',
        icon: Package,
        href: '/inventory'
      },
      {
        id: 'categories',
        title: 'Danh mục sản phẩm',
        icon: Archive,
        href: '/categories'
      },
      {
        id: 'suppliers',
        title: 'Nhà cung cấp',
        icon: Truck,
        href: '/suppliers'
      }
    ]
  },
  {
    id: 'transactions',
    title: 'Giao dịch kho',
    icon: TrendingUp,
    children: [
      {
        id: 'inbound',
        title: 'Nhập kho',
        icon: PackageOpen,
        href: '/inbound',
        badge: 5
      },
      {
        id: 'outbound',
        title: 'Xuất kho',
        icon: ShoppingCart,
        href: '/outbound',
        badge: 3
      },
      {
        id: 'transfers',
        title: 'Chuyển kho',
        icon: Truck,
        href: '/transfers'
      }
    ]
  },
  {
    id: 'reports',
    title: 'Báo cáo',
    icon: BarChart3,
    children: [
      {
        id: 'inventory-report',
        title: 'Báo cáo tồn kho',
        icon: FileText,
        href: '/reports/inventory'
      },
      {
        id: 'transaction-report',
        title: 'Báo cáo giao dịch',
        icon: FileText,
        href: '/reports/transactions'
      },
      {
        id: 'analytics',
        title: 'Phân tích dữ liệu',
        icon: BarChart3,
        href: '/reports/analytics'
      }
    ]
  },
  {
    id: 'alerts',
    title: 'Cảnh báo',
    icon: AlertTriangle,
    href: '/alerts',
    badge: 12
  },
  {
    id: 'users',
    title: 'Quản lý người dùng',
    icon: Users,
    href: '/users'
  },
  {
    id: 'settings',
    title: 'Cài đặt hệ thống',
    icon: Settings,
    href: '/settings'
  }
]

export function DashboardSidebar({ onClose, className, onToggle, isCollapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['inventory', 'transactions'])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const active = item.href ? isActive(item.href) : false

    if (hasChildren) {
      return (
        <div key={item.id}>
          <Button
            variant="ghost"
            className={cn(
              "w-full h-10 px-3 flex items-center",
              isCollapsed ? "justify-center" : "justify-start",
              level > 0 && !isCollapsed && "ml-4 w-[calc(100%-1rem)]",
              "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => toggleExpanded(item.id)}
          >
            <item.icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span className="flex-1 text-left">{item.title}</span>}
            {!isCollapsed && item.badge && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            {!isCollapsed && (isExpanded ? (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="ml-2 h-4 w-4 shrink-0" />
            ))}
          </Button>
          {!isCollapsed && isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link key={item.id} href={item.href || '#'}>
        <Button
          variant="ghost"
          className={cn(
            "w-full h-10 px-3 flex items-center",
            isCollapsed ? "justify-center" : "justify-start",
            level > 0 && !isCollapsed && "ml-4 w-[calc(100%-1rem)]",
            active
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={onClose}
        >
          <item.icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="flex-1 text-left">{item.title}</span>}
          {!isCollapsed && item.badge && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    )
  }

  return (
    <aside className={cn(
      "flex flex-col h-screen max-h-screen bg-background shadow-md transition-all duration-300 ease-in-out overflow-hidden",
      className
    )}>
      {/* Header - Fixed height */}
      <div className={cn(
        "flex-shrink-0 p-4 flex items-center gap-3 border-b",
        isCollapsed && "px-2 justify-center"
      )}>
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
          <Package className="h-5 w-5 text-primary-foreground" />
        </div>
        {!isCollapsed && <h2 className="text-lg font-semibold truncate">Hệ thống Quản lý</h2>}
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full px-3 dashboard-scroll">
          <div className="space-y-1 py-4">
            {menuItems.map(item => renderMenuItem(item))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer - Fixed height */}
      <div className="flex-shrink-0 p-3 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full h-10 px-3 flex items-center",
            isCollapsed ? "justify-center" : "justify-start",
            "hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={onToggle}
        >
          {isCollapsed ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">Thu gọn</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
