"use client"

import { ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { useAuth } from '@/contexts/auth-context'
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
  Home, 
  Building2, 
  Building,
  Users, 
  UserCheck,
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  ChevronDown,
  BarChart3,
  Calendar,
  Dumbbell,
  UserPlus,
  CreditCard,
  MoreHorizontal,
  Bell,
  Megaphone,
  CheckSquare
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import OrganizationSelector from '@/components/organization-selector'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
  currentPage?: string
}

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const { profile, organizations, loading } = useProfile()
  const { signOut } = useAuth()
  const { toast } = useToast()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAppAdminExpanded, setIsAppAdminExpanded] = useState(true)
  const [isOrganizationExpanded, setIsOrganizationExpanded] = useState(true)
  const [expandedOrganizations, setExpandedOrganizations] = useState<Record<string, boolean>>({})
  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Success",
        description: "Signed out successfully",
      })
      // Redirect to root page after successful logout
      window.location.href = '/'
    } catch (error) {
      toast({
        title: "Error",
        description: "Error signing out",
        variant: "destructive",
      })
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

  const toggleOrganizationExpanded = (orgId: string) => {
    setExpandedOrganizations(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }))
  }

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
          
          <div className="flex h-full flex-col">
            {/* Mobile navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4">
              {/* App Admin Section - Mobile */}
              {profile?.is_app_admin && (
                <div className="space-y-1">
                  {/* App Admin Header - Mobile */}
                  <button
                    onClick={() => setIsAppAdminExpanded(!isAppAdminExpanded)}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    <div className="flex items-center">
                      <Shield className="mr-3 h-4 w-4" />
                      App Admin
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isAppAdminExpanded ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {/* App Admin Menu Items - Mobile */}
                  {isAppAdminExpanded && (
                    <div className="ml-6 space-y-1">
                      <Link
                        href="/admin"
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          pathname === '/admin'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        Dashboard
                      </Link>

                      <Link
                        href="/organizations"
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          pathname === '/organizations'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Building2 className="mr-3 h-4 w-4" />
                        Organizations
                      </Link>

                      <Link
                        href="/users"
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          pathname === '/users'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Users className="mr-3 h-4 w-4" />
                        All Users
                      </Link>

                      <Link
                        href="/analytics"
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          pathname === '/analytics'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <BarChart3 className="mr-3 h-4 w-4" />
                        Analytics
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Organization Section - Mobile */}
              <div className="space-y-1">
                {/* Organization Header - Mobile */}
                <button
                  onClick={() => setIsOrganizationExpanded(!isOrganizationExpanded)}
                  className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                >
                  <div className="flex items-center">
                    <Building className="mr-3 h-4 w-4" />
                    Organization
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isOrganizationExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Organization Menu Items - Mobile */}
                {isOrganizationExpanded && (
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/organization/dashboard"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === '/organization/dashboard'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <LayoutDashboard className="mr-3 h-4 w-4" />
                      Organization Dashboard
                    </Link>

                    <Link
                      href="/organization/staff"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === '/organization/staff'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <UserCheck className="mr-3 h-4 w-4" />
                      Staff
                    </Link>

                    <Link
                      href="/organization/members"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === '/organization/members'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Users className="mr-3 h-4 w-4" />
                      Members
                    </Link>
                  </div>
                )}
              </div>

              {/* Individual Organization Sections - Mobile */}
              {organizations && organizations.length > 0 && organizations.map((org) => (
                <div key={`mobile-${org.org_id}`} className="space-y-1">
                  {/* Organization Header - Mobile */}
                  <button
                    onClick={() => toggleOrganizationExpanded(org.org_id)}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    <div className="flex items-center">
                      <Building2 className="mr-3 h-4 w-4" />
                      <span className="truncate">{org.org_name}</span>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        expandedOrganizations[org.org_id] ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {/* Organization Menu Items - Mobile */}
                  {expandedOrganizations[org.org_id] && (
                    <div className="ml-6 space-y-1">
                      <Link
                        href={`/org/${org.org_id}/calendar`}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          pathname === `/org/${org.org_id}/calendar`
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Calendar className="mr-3 h-4 w-4" />
                        Calendar
                      </Link>

                      <Link
                        href={`/org/${org.org_id}/marketing`}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          pathname === `/org/${org.org_id}/marketing`
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Megaphone className="mr-3 h-4 w-4" />
                        Marketing
                      </Link>

                      <Link
                        href={`/org/${org.org_id}/tasks`}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          pathname === `/org/${org.org_id}/tasks`
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <CheckSquare className="mr-3 h-4 w-4" />
                        Tasks
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {/* Regular User Navigation - Mobile */}
              {!profile?.is_app_admin && (
                <Link
                  href="/dashboard"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === '/dashboard'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Home className="mr-3 h-4 w-4" />
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
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
          )}          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {/* App Admin Section - Collapsible */}
            {profile?.is_app_admin && (
              <div className="space-y-1">
                {/* App Admin Header - Clickable to expand/collapse */}
                <button
                  onClick={() => setIsAppAdminExpanded(!isAppAdminExpanded)}
                  className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
                >
                  <div className="flex items-center">
                    <Shield className="mr-3 h-4 w-4" />
                    App Admin
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isAppAdminExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* App Admin Menu Items - Collapsible */}
                {isAppAdminExpanded && (
                  <div className="ml-6 space-y-1">
                    <Link
                      href="/admin"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === '/admin'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <LayoutDashboard className="mr-3 h-4 w-4" />
                      Dashboard
                    </Link>

                    <Link
                      href="/organizations"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === '/organizations'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Building2 className="mr-3 h-4 w-4" />
                      Organizations
                    </Link>

                    <Link
                      href="/users"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === '/users'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Users className="mr-3 h-4 w-4" />
                      All Users
                    </Link>

                    <Link
                      href="/analytics"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === '/analytics'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <BarChart3 className="mr-3 h-4 w-4" />
                      Analytics
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Organization Section - Collapsible */}
            <div className="space-y-1">
              {/* Organization Header - Clickable to expand/collapse */}
              <button
                onClick={() => setIsOrganizationExpanded(!isOrganizationExpanded)}
                className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
              >
                <div className="flex items-center">
                  <Building className="mr-3 h-4 w-4" />
                  Organization
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isOrganizationExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Organization Menu Items - Collapsible */}
              {isOrganizationExpanded && (
                <div className="ml-6 space-y-1">
                  <Link
                    href="/organization/dashboard"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      pathname === '/organization/dashboard'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    Organization Dashboard
                  </Link>

                  <Link
                    href="/organization/staff"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      pathname === '/organization/staff'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <UserCheck className="mr-3 h-4 w-4" />
                    Staff
                  </Link>

                  <Link
                    href="/organization/members"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      pathname === '/organization/members'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Users className="mr-3 h-4 w-4" />
                    Members
                  </Link>
                </div>
              )}
            </div>

            {/* Individual Organization Sections - Desktop */}
            {organizations && organizations.length > 0 && organizations.map((org) => (
              <div key={`desktop-${org.org_id}`} className="space-y-1">
                {/* Organization Header - Clickable to expand/collapse */}
                <button
                  onClick={() => toggleOrganizationExpanded(org.org_id)}
                  className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
                >
                  <div className="flex items-center">
                    <Building2 className="mr-3 h-4 w-4" />
                    <span className="truncate">{org.org_name}</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      expandedOrganizations[org.org_id] ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Organization Menu Items - Collapsible */}
                {expandedOrganizations[org.org_id] && (
                  <div className="ml-6 space-y-1">
                    <Link
                      href={`/org/${org.org_id}/calendar`}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === `/org/${org.org_id}/calendar`
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Calendar className="mr-3 h-4 w-4" />
                      Calendar
                    </Link>

                    <Link
                      href={`/org/${org.org_id}/marketing`}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === `/org/${org.org_id}/marketing`
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Megaphone className="mr-3 h-4 w-4" />
                      Marketing
                    </Link>

                    <Link
                      href={`/org/${org.org_id}/tasks`}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === `/org/${org.org_id}/tasks`
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <CheckSquare className="mr-3 h-4 w-4" />
                      Tasks
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {/* Regular User Navigation */}
            {!profile?.is_app_admin && (
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === '/dashboard'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Home className="mr-3 h-4 w-4" />
                  Dashboard
                </Link>
                {/* Add other regular user menu items here */}
              </div>
            )}
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
      </div>      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header bar */}
        <div className="flex h-16 items-center justify-between px-4 bg-white border-b">
          {/* Mobile menu button (only visible on mobile) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
            {/* Mobile logo and organization (only visible on mobile) */}
          <div className="flex items-center space-x-3 lg:hidden">
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
            
            {/* Mobile organization indicator */}
            {organizations && organizations.length > 0 && (
              <div className="flex items-center">
                <Badge variant="outline" className="text-xs">
                  {organizations.length === 1 
                    ? organizations[0].org_name 
                    : `${organizations.length} Orgs`
                  }
                </Badge>
              </div>
            )}
          </div>{/* Desktop: Organization indicator */}
          <div className="hidden lg:flex items-center space-x-3 flex-1">
            {organizations && organizations.length > 0 ? (
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {organizations.length === 1 ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {organizations[0].org_name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({organizations[0].user_role})
                    </span>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-2">
                        <Badge variant="outline" className="text-xs mr-2">
                          {organizations.length} Organizations
                        </Badge>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuLabel>Your Organizations</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {organizations.map((org) => (
                        <DropdownMenuItem key={org.org_id} className="flex flex-col items-start">
                          <div className="font-medium">{org.org_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {org.org_code} • {org.user_role}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ) : (
              !profile?.is_app_admin && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs">No organization assigned</span>
                </div>
              )
            )}
          </div>

          {/* Profile section (always visible) */}
          <div className="flex items-center space-x-4">
            {/* Profile info and dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={profile?.email || ''} />
                    <AvatarFallback className="text-xs">
                      {profile?.email ? getUserInitials(profile.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
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
                  <span>Account Info</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>            {/* Settings menu (3 dots) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Help & Support</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
