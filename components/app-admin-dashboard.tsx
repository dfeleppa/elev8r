'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/use-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Building, Users, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_app_admin: boolean
}

interface Organization {
  id: string
  name: string
  code: string
  created_at: string
  created_by: string
}

export default function AppAdminDashboard() {
  const { profile, loading, getAllUsers, getAllOrganizations, createOrganizationWithAdmin } = useProfile()
  const [users, setUsers] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  // Only allow app admins to access this component
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile?.is_app_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You need App Admin privileges to access this dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const users = await getAllUsers()
      setUsers(users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchOrganizations = async () => {
    setLoadingOrgs(true)
    try {
      const orgs = await getAllOrganizations()
      setOrganizations(orgs || [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
      toast({
        title: "Error", 
        description: "Failed to fetch organizations",
        variant: "destructive"
      })
    } finally {
      setLoadingOrgs(false)
    }
  }

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim() || !selectedAdminId) {
      toast({
        title: "Error",
        description: "Please provide organization name and select an admin",
        variant: "destructive"
      })
      return
    }

    setCreating(true)
    try {
      const result = await createOrganizationWithAdmin(newOrgName.trim(), selectedAdminId)
      
      if (result) {
        toast({
          title: "Success",
          description: `Organization "${newOrgName}" created with code: ${result.organization_code}`,
        })
        setNewOrgName('')
        setSelectedAdminId('')
        setIsCreateOrgOpen(false)
        fetchOrganizations() // Refresh organizations list
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchUsers()
    fetchOrganizations()
  }, [])

  const nonAdminUsers = users.filter(user => !user.is_app_admin)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">App Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage organizations and assign administrators
          </p>
        </div>
        
        <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Create a new organization and assign an administrator to manage it.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <Label htmlFor="adminSelect">Select Administrator</Label>
                <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an admin for this organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {nonAdminUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOrgOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrganization} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Organization
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organizations Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Organizations
            </CardTitle>
            <CardDescription>
              {organizations.length} organizations created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOrgs ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {organizations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No organizations created yet
                  </p>
                ) : (
                  organizations.map((org) => (
                    <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{org.name}</h4>
                        <p className="text-sm text-muted-foreground">Code: {org.code}</p>
                      </div>
                      <Badge variant="outline">
                        {new Date(org.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Users
            </CardTitle>
            <CardDescription>
              {users.length} total users ({users.filter(u => u.is_app_admin).length} app admins)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No users found
                  </p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          {user.first_name} {user.last_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {user.is_app_admin && (
                          <Badge variant="destructive">App Admin</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
