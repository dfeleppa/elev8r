"use client"

import { ReactNode } from 'react'
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
import { 
  Building2, 
  Users, 
  Settings, 
  LogOut, 
  Shield,
  Menu,
  Bell
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { OrganizationSelector } from '@/components/organization-selector'

interface AuthenticatedLayoutProps {
  children: ReactNode
  showOrgSelector?: boolean
}

export function AuthenticatedLayout({ 
  children, 
  showOrgSelector = true 
}: AuthenticatedLayoutProps) {
  const { profile, userOrganizations, loading } = useProfile()

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
    if (userOrganizations?.length > 0) {
      // Show the role from the first organization for simplicity
      return userOrganizations[0].role
    }
    return 'User'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/Elev8rlogo.png" 
                alt="ELEV8" 
                className="h-8 w-8"
                onError={(e) => {
                  // Fallback to text if image doesn't load
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-xl font-bold text-primary">ELEV8</span>
            </div>
            
            {profile?.is_app_admin && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Shield className="mr-1 h-3 w-3" />
                App Admin
              </Badge>
            )}
          </div>

          {/* Organization Selector */}
          {showOrgSelector && !profile?.is_app_admin && (
            <div className="flex-1 max-w-sm mx-4">
              <OrganizationSelector />
            </div>
          )}

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Menu */}
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
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'User'}
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
                {profile?.is_app_admin && (
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
