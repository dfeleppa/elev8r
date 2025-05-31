"use client"

import { ReactNode, useState } from 'react'
import { useProfile } from '@/hooks/use-profile'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Users, 
  Settings, 
  LogOut, 
  Shield,
  Menu,
  Bell,
  Home,
  Calendar,
  CreditCard,
  BarChart3,
  UserPlus,
  Dumbbell,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import OrganizationSelector from '@/components/organization-selector'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
  currentPage?: string
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  role?: 'admin' | 'member' | 'trainer' | 'app_admin'
  current?: boolean
}

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const { profile, organizations, loading } = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }
  const getUserRole = () => {
    if (profile?.is_app_admin) return 'App Admin'
    if (organizations?.length > 0) {
      return organizations[0].user_role
    }
    return 'User'
  }

  // Define navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: Home, current: currentPage === 'dashboard' },
      { name: 'Classes', href: '/classes', icon: Calendar, current: currentPage === 'classes' },
      { name: 'Workouts', href: '/workouts', icon: Dumbbell, current: currentPage === 'workouts' },
    ]

    if (profile?.is_app_admin) {
      return [
        { name: 'Admin Dashboard', href: '/admin', icon: Shield, current: currentPage === 'admin' },
        { name: 'Organizations', href: '/organizations', icon: Building2, current: currentPage === 'organizations' },
        { name: 'All Users', href: '/users', icon: Users, current: currentPage === 'users' },
        { name: 'Analytics', href: '/analytics', icon: BarChart3, current: currentPage === 'analytics' },
      ]
    }    // Add role-specific items for organization members
    const userRole = organizations?.[0]?.user_role
    if (userRole === 'admin') {
      baseItems.push(
        { name: 'Members', href: '/members', icon: Users, current: currentPage === 'members' },
        { name: 'Trainers', href: '/trainers', icon: UserPlus, current: currentPage === 'trainers' },
        { name: 'Billing', href: '/billing', icon: CreditCard, current: currentPage === 'billing' },
        { name: 'Analytics', href: '/analytics', icon: BarChart3, current: currentPage === 'analytics' }
      )    } else if (userRole === 'staff') {
      baseItems.push(
        { name: 'My Classes', href: '/my-classes', icon: Calendar, current: currentPage === 'my-classes' },
        { name: 'Members', href: '/members', icon: Users, current: currentPage === 'members' }
      )
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl">
          {/* Mobile sidebar content */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/Elev8rlogo.png" 
                alt="ELEV8" 
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-xl font-bold text-primary">ELEV8</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    item.current
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </a>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r shadow-sm">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/Elev8rlogo.png" 
                alt="ELEV8" 
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-xl font-bold text-primary">ELEV8</span>
            </div>
          </div>          {/* Organization selector for non-app-admins */}
          {!profile?.is_app_admin && organizations && organizations.length > 0 && (
            <div className="px-4 py-3 border-b">
              <OrganizationSelector />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    item.current
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </a>
              )
            })}
          </nav>

          {/* User info at bottom */}
          <div className="px-4 py-3 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start space-x-3 h-auto p-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={profile?.email || ''} />
                    <AvatarFallback className="text-xs">
                      {profile?.email ? getUserInitials(profile.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">                    <span className="text-sm font-medium">
                      {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getUserRole()}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header for mobile */}
        <div className="flex h-16 items-center justify-between px-4 bg-white border-b lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <img 
              src="/images/Elev8rlogo.png" 
              alt="ELEV8" 
              className="h-8 w-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <span className="text-xl font-bold text-primary">ELEV8</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={profile?.email || ''} />
                  <AvatarFallback className="text-xs">
                    {profile?.email ? getUserInitials(profile.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.email}
                    </p>
                    <Badge variant="outline" className="w-fit mt-1 text-xs">
                      {getUserRole()}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
