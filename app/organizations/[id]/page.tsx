'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { useProfile } from '@/hooks/use-profile'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Building2, Users, Shield, Loader2, Calendar, Mail, UserCheck, Search } from 'lucide-react'

interface OrganizationMember {
  user_id: string
  role: string
  joined_at: string
  is_active: boolean
  profiles: {
    id: string
    email: string
    first_name: string
    last_name: string
    is_app_admin: boolean
  }
}

interface OrganizationDetail {
  id: string
  name: string
  code: string
  description: string
  created_at: string
  created_by: string
  is_active: boolean
  members: OrganizationMember[]
}

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { profile, getOrganizationById } = useProfile()
  const { toast } = useToast()
  const router = useRouter()

  const isAppAdmin = profile?.is_app_admin

  useEffect(() => {
    if (!isAppAdmin) {
      setLoading(false)
      return
    }

    fetchOrganization()
  }, [params.id, isAppAdmin])

  const fetchOrganization = async () => {
    try {
      setLoading(true)
      const orgData = await getOrganizationById(params.id)
      console.log('Fetched organization detail:', orgData)
      setOrganization(orgData)
    } catch (error) {
      console.log('Error fetching organization:', error)
      toast({
        title: "Error",
        description: "Failed to fetch organization details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = organization?.members.filter(member => {
    const searchLower = searchTerm.toLowerCase()
    return member.profiles.first_name.toLowerCase().includes(searchLower) ||
           member.profiles.last_name.toLowerCase().includes(searchLower) ||
           member.profiles.email.toLowerCase().includes(searchLower) ||
           member.role.toLowerCase().includes(searchLower)
  }) || []

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'default'
      case 'coach':
      case 'trainer':
        return 'secondary'
      case 'member':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (!isAppAdmin) {
    return (
      <DashboardLayout currentPage="organizations">
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

  if (loading) {
    return (
      <DashboardLayout currentPage="organizations">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading organization details...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!organization) {
    return (
      <DashboardLayout currentPage="organizations">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Organization Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The organization you're looking for doesn't exist or has been deleted.
            </p>
            <Button 
              onClick={() => router.push('/organizations')} 
              className="mt-4"
              variant="outline"
            >
              Back to Organizations
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage="organizations">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.push('/organizations')} 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Organizations
          </Button>
        </div>

        {/* Organization Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{organization.code}</Badge>
                  <span className="text-muted-foreground text-sm">
                    {organization.members.length} {organization.members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </div>
            </div>
            {organization.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {organization.description}
              </p>
            )}
          </div>
        </div>

        {/* Organization Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organization.members.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organization.members.filter(m => m.role.toLowerCase() === 'admin').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coaches</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organization.members.filter(m => ['coach', 'trainer'].includes(m.role.toLowerCase())).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {new Date(organization.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Organization Members
            </CardTitle>
            <CardDescription>
              All members of {organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={fetchOrganization} variant="outline">
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No members found matching your search.' : 'No members in this organization.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">
                            {member.profiles.first_name} {member.profiles.last_name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {member.profiles.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                      {member.profiles.is_app_admin && (
                        <Badge variant="destructive">App Admin</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
