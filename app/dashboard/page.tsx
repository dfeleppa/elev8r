'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { useProfile } from '@/hooks/use-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Calendar, Activity, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { profile, organizations, loading } = useProfile()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Not Authenticated</h1>
          <p className="text-muted-foreground mt-2">
            Please log in to access the dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile.first_name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{profile.first_name} {profile.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <div className="flex items-center gap-2">
                  {profile.is_app_admin ? (
                    <Badge variant="destructive">App Admin</Badge>
                  ) : (
                    <Badge variant="secondary">User</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={profile.is_active ? "default" : "secondary"}>
                  {profile.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizations Card */}
        {organizations && organizations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Your Organizations
              </CardTitle>
              <CardDescription>
                Organizations you're a member of
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organizations.map((org) => (
                  <div key={org.org_id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h3 className="font-medium">{org.org_name}</h3>
                      <p className="text-sm text-muted-foreground">Code: {org.org_code}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={org.user_role === 'admin' ? 'default' : 'secondary'}>
                        {org.user_role}
                      </Badge>
                      {org.is_admin && (
                        <p className="text-xs text-muted-foreground mt-1">Admin Access</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* App Admin Features */}
        {profile.is_app_admin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                App Admin Features
              </CardTitle>
              <CardDescription>
                System-wide administration tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <h3 className="font-medium">Manage Organizations</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View and manage all organizations in the system
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <h3 className="font-medium">User Management</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View and manage all users across organizations
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <h3 className="font-medium">System Analytics</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View system-wide metrics and analytics
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <h3 className="font-medium">Diagnostic Tools</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Access debugging and diagnostic tools
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
                <h3 className="font-medium">View Classes</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  See upcoming classes and schedules
                </p>
              </div>
              <div className="p-4 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
                <h3 className="font-medium">My Workouts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your fitness progress
                </p>
              </div>
              <div className="p-4 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
                <h3 className="font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your account settings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
