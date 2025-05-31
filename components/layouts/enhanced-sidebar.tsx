"use client"

import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  Users,
  Settings, 
  HelpCircle, 
  LogOut, 
  Layers,
  UserCog,
  CalendarRange,
  Newspaper,
  Share2,
  ShoppingBag,
  Users2,
  Calendar,
  PenTool,
  LineChart,
  Cog,
  Dumbbell,
  Clock,
  Home,
  User,
  CreditCard,
  Receipt,
  Package,
  Ticket,
  PieChart,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  CheckSquare,
  Wrench,
  Crown,
  BarChart2,
  Shield,
  Database,
  Server,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useProfile } from '@/hooks/use-profile'
import { hasPermission } from '@/utils/permissions'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/supabase'

interface SidebarProps {
  collapsed: boolean
}

interface MenuItem {
  icon: React.ReactNode
  title: string
  path?: string
  isDropdown?: boolean
  subItems?: MenuItem[]
  onClick?: () => void
}

const EnhancedSidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { profile } = useProfile()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    )
  }

  const handleLogout = async () => {
    await signOut()
  }

  // Get user role
  const getUserRole = (): UserRole => {
    if (profile?.is_app_admin) return 'app-admin'
    // TODO: Get role from current organization membership
    return 'member' // Default for now
  }

  const userRole = getUserRole()

  // Filter menu items based on user role
  const filterMenuItems = (items: MenuItem[], role: UserRole): MenuItem[] => {
    return items.filter(item => {
      // Check if user has permission to access this path
      if (item.path && !hasPermission(role, item.path)) {
        return false
      }
      
      // Filter sub-items if they exist
      if (item.subItems) {
        item.subItems = filterMenuItems(item.subItems, role)
        // Keep parent item if it has accessible sub-items or if parent itself is accessible
        return item.subItems.length > 0 || (item.path ? hasPermission(role, item.path) : true)
      }
      
      return true
    })
  }

  const appAdminMenuItems: MenuItem[] = [
    { icon: <Shield size={20} />, title: 'App Admin Dashboard', path: '/admin' },
    { icon: <Building2 size={20} />, title: 'Organizations', path: '/organizations' },
    { icon: <Users size={20} />, title: 'All Users', path: '/users' },
    { icon: <BarChart2 size={20} />, title: 'System Analytics', path: '/system-analytics' }
  ]

  const adminMenuItems: MenuItem[] = [
    { icon: <LayoutDashboard size={20} />, title: 'Dashboard', path: '/dashboard' },
    { 
      icon: <CalendarRange size={20} />, 
      title: 'Planning', 
      path: '/planning',
      subItems: [
        { icon: <Newspaper size={20} />, title: 'Marketing', path: '/planning/marketing' },
        { 
          icon: <Share2 size={20} />, 
          title: 'Social Media',
          path: '/planning/social-media',
          isDropdown: true,
          subItems: [
            { icon: <Calendar size={20} />, title: 'Planner', path: '/planning/social-media' },
            { icon: <PenTool size={20} />, title: 'Content', path: '/planning/social-media/content' },
            { icon: <LineChart size={20} />, title: 'Statistics', path: '/planning/social-media/statistics' },
            { icon: <Cog size={20} />, title: 'Settings', path: '/planning/social-media/settings' }
          ]
        },
        { icon: <ShoppingBag size={20} />, title: 'Events & Apparel', path: '/planning/events' },
        { icon: <Users2 size={20} />, title: 'Retention', path: '/planning/retention' }
      ]
    },
    { icon: <Users size={20} />, title: 'Members', path: '/members' },
    { icon: <UserCog size={20} />, title: 'Staff', path: '/staff' },
    { icon: <Crown size={20} />, title: 'Admin Management', path: '/admin-management' },
    { icon: <CalendarDays size={20} />, title: 'Coaching Schedule', path: '/coaching-schedule' },
    { icon: <Wrench size={20} />, title: 'Programming Setup', path: '/programming-setup' },
    { 
      icon: <CreditCard size={20} />, 
      title: 'Billing',
      path: '/billing',
      isDropdown: true,
      subItems: [
        { icon: <LayoutGrid size={20} />, title: 'Billing Dashboard', path: '/billing/dashboard' },
        { icon: <CreditCard size={20} />, title: 'Billing Setup', path: '/billing/setup' },
        { icon: <Receipt size={20} />, title: 'Invoices', path: '/billing/invoices' },
        { icon: <Users size={20} />, title: 'Memberships', path: '/billing/memberships' },
        { icon: <Package size={20} />, title: 'Products', path: '/billing/products' },
        { icon: <Ticket size={20} />, title: 'Coupons', path: '/billing/coupons' },
        { icon: <PieChart size={20} />, title: 'Reports-Billing', path: '/billing/reports' }
      ]
    },
    { icon: <BarChart2 size={20} />, title: 'Analytics', path: '/analytics' }
  ]

  const coachMenuItems: MenuItem[] = [
    { icon: <ClipboardList size={20} />, title: 'Programming', path: '/coach/programming' },
    { icon: <TrendingUp size={20} />, title: 'Results', path: '/coach/results' },
    { icon: <CheckSquare size={20} />, title: 'Attendance', path: '/coach/attendance' }
  ]

  const memberMenuItems: MenuItem[] = [
    { icon: <Home size={20} />, title: 'My Dashboard', path: '/member/dashboard' },
    { icon: <Dumbbell size={20} />, title: 'Daily Workouts', path: '/member/workouts' },
    { icon: <Clock size={20} />, title: 'Class Schedule', path: '/member/schedule' },
    { icon: <User size={20} />, title: 'Account Info', path: '/member/account' }
  ]

  const bottomMenuItems: MenuItem[] = [
    { icon: <Settings size={20} />, title: 'Settings', path: '/settings' },
    { icon: <HelpCircle size={20} />, title: 'Help & Support', path: '/help' },
    { icon: <LogOut size={20} />, title: 'Logout', onClick: handleLogout }
  ]

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => (
      <div key={item.path || item.title}>
        {item.isDropdown ? (
          <button
            onClick={() => item.path && toggleExpanded(item.path)}
            className={cn(
              "flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
              collapsed ? 'justify-center' : ''
            )}
          >
            <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="ml-3 flex-1">{item.title}</span>
                {item.path && expandedItems.includes(item.path) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </>
            )}
          </button>
        ) : item.onClick ? (
          <button
            onClick={item.onClick}
            className={cn(
              "flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
              collapsed ? 'justify-center' : ''
            )}
          >
            <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
            {!collapsed && <span className="ml-3">{item.title}</span>}
          </button>
        ) : item.path ? (
          <Link
            href={item.path}
            className={cn(
              "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200",
              collapsed ? 'justify-center' : '',
              pathname === item.path
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
            {!collapsed && <span className="ml-3">{item.title}</span>}
          </Link>
        ) : null}
        
        {!collapsed && item.subItems && (
          <div className={cn(
            "ml-8 mt-1 space-y-1",
            item.isDropdown && item.path && !expandedItems.includes(item.path) ? 'hidden' : ''
          )}>
            {item.subItems.map((subItem) => (
              <div key={subItem.path || subItem.title}>
                {subItem.isDropdown ? (
                  <button
                    onClick={() => subItem.path && toggleExpanded(subItem.path)}
                    className="flex items-center w-full px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="text-gray-500 dark:text-gray-400">{subItem.icon}</span>
                    <span className="ml-3 flex-1">{subItem.title}</span>
                    {subItem.path && expandedItems.includes(subItem.path) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                ) : subItem.path ? (
                  <Link
                    href={subItem.path}
                    className={cn(
                      "flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-200",
                      pathname === subItem.path
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    <span className="text-gray-500 dark:text-gray-400">{subItem.icon}</span>
                    <span className="ml-3">{subItem.title}</span>
                  </Link>
                ) : null}
                
                {subItem.subItems && subItem.path && expandedItems.includes(subItem.path) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {subItem.subItems.map((nestedItem) => (
                      nestedItem.path ? (
                        <Link
                          key={nestedItem.path}
                          href={nestedItem.path}
                          className={cn(
                            "flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-200",
                            pathname === nestedItem.path
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          )}
                        >
                          <span className="text-gray-500 dark:text-gray-400">{nestedItem.icon}</span>
                          <span className="ml-3">{nestedItem.title}</span>
                        </Link>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ))
  }

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <div className={cn("flex items-center", collapsed ? 'justify-center' : 'px-4')}>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
          </div>
          {!collapsed && (
            <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">
              ELEV8
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* App Admin Section */}
        {userRole === 'app-admin' && (
          <div className="mb-4">
            {!collapsed && (
              <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                App Admin
              </h3>
            )}
            {renderMenuItems(filterMenuItems(appAdminMenuItems, userRole))}
          </div>
        )}

        {/* Admin Section */}
        {(userRole === 'admin' || userRole === 'app-admin') && (
          <div className="mb-4">
            {userRole === 'app-admin' && <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>}
            {!collapsed && (
              <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin
              </h3>
            )}
            {renderMenuItems(filterMenuItems(adminMenuItems, userRole))}
          </div>
        )}

        {/* Coach Section */}
        {(userRole === 'admin' || userRole === 'staff' || userRole === 'app-admin') && (
          <>
            {(userRole === 'admin' || userRole === 'app-admin') && <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>}
            <div className="mb-4">
              {!collapsed && (
                <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Coach
                </h3>
              )}
              {renderMenuItems(filterMenuItems(coachMenuItems, userRole))}
            </div>
          </>
        )}

        {/* Member Section */}
        {(userRole === 'admin' || userRole === 'staff' || userRole === 'member' || userRole === 'app-admin') && (
          <>
            {(userRole === 'admin' || userRole === 'staff' || userRole === 'app-admin') && <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>}
            <div>
              {!collapsed && (
                <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Member
                </h3>
              )}
              {renderMenuItems(filterMenuItems(memberMenuItems, userRole))}
            </div>
          </>
        )}
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        {renderMenuItems(filterMenuItems(bottomMenuItems, userRole))}
      </div>
    </aside>
  )
}

export default EnhancedSidebar
