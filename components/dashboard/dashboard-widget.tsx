import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building2, Shield, UserCheck } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  activeMembers: number;
  myOrganizations: number;
}

interface DashboardWidgetProps {
  userRole: string;
  isAppAdmin: boolean;
  userName: string;
  currentOrganization?: string;
}

export function DashboardWidget({ userRole, isAppAdmin, userName, currentOrganization }: DashboardWidgetProps) {
  const [stats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    activeMembers: 0,
    myOrganizations: 0
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'app-admin': return <Shield className="h-4 w-4" />;
      case 'admin': return <UserCheck className="h-4 w-4" />;
      case 'staff': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'app-admin': return 'destructive';
      case 'admin': return 'default';
      case 'staff': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {userName}!
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getRoleBadgeVariant(userRole)} className="flex items-center gap-1">
              {getRoleIcon(userRole)}
              {userRole.charAt(0).toUpperCase() + userRole.slice(1).replace('-', ' ')}
            </Badge>
            {currentOrganization && (
              <Badge variant="outline">
                <Building2 className="h-3 w-3 mr-1" />
                {currentOrganization}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isAppAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Across all organizations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
                <p className="text-xs text-muted-foreground">
                  Total registered gyms
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {isAppAdmin ? 'System-wide' : 'In your organization'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              Organizations you belong to
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {isAppAdmin && (
              <>
                <Button variant="outline" className="justify-start">
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </>
            )}
            
            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Button variant="outline" className="justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </Button>
                <Button variant="outline" className="justify-start">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </>
            )}
            
            <Button variant="outline" className="justify-start">
              <Shield className="mr-2 h-4 w-4" />
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Getting Started</CardTitle>
          <CardDescription>
            Your ELEV8 gym management platform is ready!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
              </div>
              <div>
                <p className="font-medium">Database Schema Deployed</p>
                <p className="text-sm text-muted-foreground">Multi-organization support is active</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
              </div>
              <div>
                <p className="font-medium">Enhanced Layout Active</p>
                <p className="text-sm text-muted-foreground">Role-based navigation and theming enabled</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <p className="font-medium">Ready for Testing</p>
                <p className="text-sm text-muted-foreground">Create organizations and test multi-user workflows</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
