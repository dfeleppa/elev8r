"use client"

import React, { useState } from 'react'
import { Menu, Search, Bell, Sun, Moon, User, ChevronDown, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { useProfile } from '@/hooks/use-profile'
import { getRoleDisplayName, getRoleColorClass } from '@/utils/permissions'
import OrganizationSelector from '@/components/organization-selector'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

interface HeaderProps {
  toggleSidebar: () => void
  sidebarCollapsed: boolean
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { profile, organizations } = useProfile()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return user?.email?.split('@')[0] || 'User'
  }

  // Get user role for display
  const getUserRole = () => {
    if (profile?.is_app_admin) return 'app-admin'
    // Get role from current organization membership
    // This would need to be implemented based on your organization membership structure
    return 'member' // Default for now
  }

  const userRole = getUserRole()
  return (
    <header className="header-gradient">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-4 md:ml-6 relative">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  id="search"
                  className="search-enhanced block w-full pl-10 pr-3 py-2.5 border rounded-lg leading-5 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none sm:text-sm transition-all duration-200"
                  placeholder="Search members, classes, reports..."
                  type="search"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">          {/* Organization Selector - only show for non-app-admins */}
          {!profile?.is_app_admin && organizations && organizations.length > 0 && (
            <div className="hidden md:block">
              <OrganizationSelector />
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          {/* Notifications */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
                aria-label="View notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="p-2">
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-8">
                  No notifications
                </p>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* User Menu */}
          <Popover open={showUserMenu} onOpenChange={setShowUserMenu}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-auto p-1"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  <User size={20} />
                </div>
                <div className="ml-2 hidden md:block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {getUserDisplayName()}
                  </span>
                  <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${getRoleColorClass(userRole)}`}>
                    {getRoleDisplayName(userRole)}
                  </div>
                </div>
                <ChevronDown size={16} className="ml-1 text-gray-500 dark:text-gray-400 hidden md:block" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="py-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <SettingsIcon size={16} className="mr-2" />
                  Settings
                </Button>
                <Separator className="my-1" />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}

export default Header
