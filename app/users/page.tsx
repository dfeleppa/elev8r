'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { useProfile } from '@/hooks/use-profile'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Users, Shield, Loader2, Building2 } from 'lucide-react'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_app_admin: boolean
  created_at: string
  organizations?: Array<{
    id: string
    name: string
    role: string
    code: string
  }>
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { profile, getAllUsers } = useProfile()
  const { toast } = useToast()

  const isAppAdmin = profile?.is_app_admin

  useEffect(() => {
    if (!isAppAdmin) {
      setLoading(false)
      return
    }

    fetchUsers()
  }, [isAppAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getAllUsers()
      console.log('Fetched users in users page:', usersData)
      setUsers(usersData || [])
    } catch (error) {
      console.log('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    const nameMatch = user.first_name.toLowerCase().includes(searchLower) ||
                     user.last_name.toLowerCase().includes(searchLower) ||
                     user.email.toLowerCase().includes(searchLower)
    
    const orgMatch = user.organizations?.some(org => 
      org.name.toLowerCase().includes(searchLower) ||
      org.role.toLowerCase().includes(searchLower)
    ) || false
    
    return nameMatch || orgMatch
  })

  if (!isAppAdmin) {
    return (
      <DashboardLayout currentPage="users">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need app admin privileges to view this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage="users">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
            <p className="text-muted-foreground">
              Manage all users in the system
            </p>
          </div>
        </div>        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">App Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.is_app_admin).length}
              </div>
            </CardContent>
          </Card>          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.organizations && user.organizations.length > 0).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => !user.is_app_admin && (!user.organizations || user.organizations.length === 0)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
            <CardDescription>
              Search and manage all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />                <Input
                  placeholder="Search users by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={fetchUsers} variant="outline">
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading users...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </p>
                ) : (                  filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium">
                              {user.first_name} {user.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.organizations && user.organizations.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {user.organizations.map((org, index) => (
                                  <div key={org.id} className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      {org.name} ({org.role})
                                    </Badge>
                                    {index < user.organizations!.length - 1 && (
                                      <span className="text-muted-foreground">•</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {(!user.organizations || user.organizations.length === 0) && !user.is_app_admin && (
                              <p className="text-xs text-muted-foreground mt-1">No organization assigned</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={user.is_app_admin ? "default" : "secondary"}>
                          {user.is_app_admin ? "App Admin" : "User"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
