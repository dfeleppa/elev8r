'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { useProfile } from '@/hooks/use-profile'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Users, Shield, Loader2, Building2, Plus, X } from 'lucide-react'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_app_admin: boolean
  created_at: string
  updated_at?: string
  is_active: boolean
  // Extended profile fields (will be available once database is updated)
  phone?: string
  date_of_birth?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  profile_picture_url?: string
  bio?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  medical_conditions?: string
  allergies?: string
  medications?: string
  fitness_goals?: string
  preferred_workout_time?: string
  organizations?: Array<{
    org_id: string
    org_name: string
    org_code: string
    user_role: string
    is_admin: boolean
  }>
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedOrganization, setSelectedOrganization] = useState('')
  const [selectedRole, setSelectedRole] = useState('member')
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)
  const { profile, getAllUsers, getAllOrganizations, addUserToOrganization, removeUserFromOrganization } = useProfile()
  const { toast } = useToast()

  const isAppAdmin = profile?.is_app_admin

  useEffect(() => {
    if (!isAppAdmin) {
      setLoading(false)
      return
    }

    fetchUsers()
    fetchOrganizations()
  }, [isAppAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getAllUsers()
      console.log('Fetched users in users page:', usersData)
      console.log('Sample user with organizations:', usersData?.[0]?.organizations)
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

  const fetchOrganizations = async () => {
    try {
      const orgsData = await getAllOrganizations()
      setOrganizations(orgsData || [])
    } catch (error) {
      console.log('Error fetching organizations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch organizations",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    
    // Basic info search
    const basicMatch = user.first_name?.toLowerCase().includes(searchLower) ||
                      user.last_name?.toLowerCase().includes(searchLower) ||
                      user.email?.toLowerCase().includes(searchLower)
    
    // Contact info search
    const contactMatch = user.phone?.toLowerCase().includes(searchLower) ||
                        user.address?.toLowerCase().includes(searchLower) ||
                        user.city?.toLowerCase().includes(searchLower) ||
                        user.state?.toLowerCase().includes(searchLower) ||
                        user.country?.toLowerCase().includes(searchLower)
    
    // Emergency contact search
    const emergencyMatch = user.emergency_contact_name?.toLowerCase().includes(searchLower) ||
                          user.emergency_contact_phone?.toLowerCase().includes(searchLower)
    
    // Medical info search
    const medicalMatch = user.medical_conditions?.toLowerCase().includes(searchLower) ||
                        user.allergies?.toLowerCase().includes(searchLower) ||
                        user.medications?.toLowerCase().includes(searchLower)
    
    // Fitness info search
    const fitnessMatch = user.fitness_goals?.toLowerCase().includes(searchLower) ||
                        user.preferred_workout_time?.toLowerCase().includes(searchLower)
    
    // Bio search
    const bioMatch = user.bio?.toLowerCase().includes(searchLower)    // Organization search
    const orgMatch = user.organizations?.some(org => 
      org?.org_name?.toLowerCase().includes(searchLower) ||
      org?.user_role?.toLowerCase().includes(searchLower) ||
      org?.org_code?.toLowerCase().includes(searchLower)
    ) || false
    
    return basicMatch || contactMatch || emergencyMatch || medicalMatch || fitnessMatch || bioMatch || orgMatch
  })

  const handleAssignToOrganization = async () => {
    if (!selectedUser || !selectedOrganization) return

    try {
      setAssignLoading(true)
      await addUserToOrganization(selectedUser.id, selectedOrganization, selectedRole as any)
      
      toast({
        title: "Success",
        description: `${selectedUser.first_name} ${selectedUser.last_name} has been assigned to the organization`,
      })

      // Refresh users to show updated organization assignments
      await fetchUsers()
      
      // Reset dialog state
      setAssignDialogOpen(false)
      setSelectedUser(null)
      setSelectedOrganization('')
      setSelectedRole('member')
    } catch (error) {
      console.log('Error assigning user to organization:', error)
      toast({
        title: "Error",
        description: "Failed to assign user to organization",
        variant: "destructive",
      })
    } finally {
      setAssignLoading(false)
    }
  }

  const handleRemoveFromOrganization = async (userId: string, orgId: string, orgName: string) => {
    try {
      await removeUserFromOrganization(userId, orgId)
      
      toast({
        title: "Success",
        description: `User has been removed from ${orgName}`,
      })

      // Refresh users to show updated organization assignments
      await fetchUsers()
    } catch (error) {
      console.log('Error removing user from organization:', error)
      toast({
        title: "Error",
        description: "Failed to remove user from organization",
        variant: "destructive",
      })
    }
  }

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
                  placeholder="Search users by name, email, phone, address, medical info, fitness goals, bio, organization..."
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
              </div>            ) : (
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </p>                ) : (
                  filteredUsers.map((user, index) => (
                    <div key={user?.id || `user-${index}`} className="border rounded-lg hover:bg-gray-50">
                      {/* Main User Info */}
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div>
                                <h4 className="font-medium text-lg">
                                  {user.first_name} {user.last_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                              <Badge variant={user.is_app_admin ? "default" : "secondary"}>
                                {user.is_app_admin ? "App Admin" : "User"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          {/* Basic Info */}
                          <div className="space-y-2">
                            <h5 className="font-medium text-gray-700 border-b pb-1">Basic Information</h5>
                            {user.phone && (
                              <p><span className="text-muted-foreground">Phone:</span> {user.phone}</p>
                            )}
                            {user.date_of_birth && (
                              <p><span className="text-muted-foreground">DOB:</span> {new Date(user.date_of_birth).toLocaleDateString()}</p>
                            )}                            <p><span className="text-muted-foreground">Joined:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                            <div className="flex items-center">
                              <span className="text-muted-foreground">Status:</span> 
                              <Badge variant={user.is_active ? "default" : "destructive"} className="ml-2 text-xs">
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>

                          {/* Address Info */}
                          {(user.address || user.city || user.state || user.country) && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-700 border-b pb-1">Address</h5>
                              {user.address && <p><span className="text-muted-foreground">Street:</span> {user.address}</p>}
                              {user.city && <p><span className="text-muted-foreground">City:</span> {user.city}</p>}
                              {user.state && <p><span className="text-muted-foreground">State:</span> {user.state}</p>}
                              {user.zip_code && <p><span className="text-muted-foreground">ZIP:</span> {user.zip_code}</p>}
                              {user.country && <p><span className="text-muted-foreground">Country:</span> {user.country}</p>}
                            </div>
                          )}

                          {/* Emergency Contact */}
                          {(user.emergency_contact_name || user.emergency_contact_phone) && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-700 border-b pb-1">Emergency Contact</h5>
                              {user.emergency_contact_name && (
                                <p><span className="text-muted-foreground">Name:</span> {user.emergency_contact_name}</p>
                              )}
                              {user.emergency_contact_phone && (
                                <p><span className="text-muted-foreground">Phone:</span> {user.emergency_contact_phone}</p>
                              )}
                              {user.emergency_contact_relationship && (
                                <p><span className="text-muted-foreground">Relationship:</span> {user.emergency_contact_relationship}</p>
                              )}
                            </div>
                          )}

                          {/* Medical Info */}
                          {(user.medical_conditions || user.allergies || user.medications) && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-700 border-b pb-1">Medical Information</h5>
                              {user.medical_conditions && (
                                <p><span className="text-muted-foreground">Conditions:</span> {user.medical_conditions}</p>
                              )}
                              {user.allergies && (
                                <p><span className="text-muted-foreground">Allergies:</span> {user.allergies}</p>
                              )}
                              {user.medications && (
                                <p><span className="text-muted-foreground">Medications:</span> {user.medications}</p>
                              )}
                            </div>
                          )}

                          {/* Fitness Info */}
                          {(user.fitness_goals || user.preferred_workout_time) && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-700 border-b pb-1">Fitness Information</h5>
                              {user.fitness_goals && (
                                <p><span className="text-muted-foreground">Goals:</span> {user.fitness_goals}</p>
                              )}
                              {user.preferred_workout_time && (
                                <p><span className="text-muted-foreground">Preferred Time:</span> {user.preferred_workout_time}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bio */}
                        {user.bio && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="font-medium text-gray-700 mb-2">Bio</h5>
                            <p className="text-sm text-gray-600">{user.bio}</p>
                          </div>
                        )}                        {/* Organizations Section - Always Show */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-700 flex items-center">
                              <Building2 className="h-4 w-4 mr-2" />
                              Organizations
                            </h5>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user)
                                setAssignDialogOpen(true)
                              }}
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                          {user.organizations && user.organizations.length > 0 ? (                            <div className="space-y-2">
                              {user.organizations.map((org, index) => (
                                <div key={org?.org_id || `org-${user.id}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">                                  <div className="flex-1">                                    <p className="font-medium text-sm">{org?.org_name || 'Unknown Organization'}</p>
                                    <p className="text-xs text-muted-foreground">Code: {org?.org_code || 'N/A'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {org?.user_role || 'member'}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveFromOrganization(user.id, org?.org_id || '', org?.org_name || 'Unknown')}
                                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                              <p className="text-sm text-muted-foreground text-center">
                                {user.is_app_admin ? (
                                  <>
                                    <Shield className="h-4 w-4 inline mr-1" />
                                    App Administrator - No organization assignment needed
                                  </>
                                ) : (
                                  <>
                                    <Users className="h-4 w-4 inline mr-1" />
                                    Not assigned to any organization
                                  </>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization Assignment Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign User to Organization</DialogTitle>
              <DialogDescription>
                Assign {selectedUser?.first_name} {selectedUser?.last_name} to an organization with a specific role.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="organization" className="text-sm font-medium">
                  Organization
                </label>
                <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>                  <SelectContent>
                    {organizations.map((org, index) => (
                      <SelectItem key={org?.id || `dialog-org-${index}`} value={org?.id || ''}>
                        {org?.name || 'Unknown'} ({org?.code || 'N/A'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                disabled={assignLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignToOrganization}
                disabled={!selectedOrganization || assignLoading}
              >
                {assignLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
