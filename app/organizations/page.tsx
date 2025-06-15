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
import { Search, Building2, Users, Shield, Loader2, Plus, ExternalLink } from 'lucide-react'

interface Organization {
  id: string
  name: string
  code: string
  description: string
  created_at: string
  member_count: number
  is_active: boolean
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { profile, getAllOrganizations } = useProfile()
  const { toast } = useToast()
  const router = useRouter()

  const isAppAdmin = profile?.is_app_admin

  useEffect(() => {
    if (!isAppAdmin) {
      setLoading(false)
      return
    }

    fetchOrganizations()
  }, [isAppAdmin])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const orgsData = await getAllOrganizations()
      console.log('Fetched organizations:', orgsData)
      setOrganizations(orgsData || [])
    } catch (error) {
      console.log('Error fetching organizations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch organizations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrganizations = organizations.filter(org => {
    const searchLower = searchTerm.toLowerCase()
    return org.name.toLowerCase().includes(searchLower) ||
           org.code.toLowerCase().includes(searchLower) ||
           (org.description && org.description.toLowerCase().includes(searchLower))
  })

  const handleOrganizationClick = (orgId: string) => {
    router.push(`/organizations/${orgId}`)
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

  return (
    <DashboardLayout currentPage="organizations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">
              Manage all organizations in the system
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.reduce((sum, org) => sum + org.member_count, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Members/Org</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.length > 0 ? Math.round(organizations.reduce((sum, org) => sum + org.member_count, 0) / organizations.length) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Organizations Management
            </CardTitle>
            <CardDescription>
              Click on any organization to view details and manage members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={fetchOrganizations} variant="outline">
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading organizations...</span>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrganizations.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No organizations found matching your search.' : 'No organizations found.'}
                  </div>
                ) : (
                  filteredOrganizations.map((org) => (
                    <Card 
                      key={org.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors border-2 hover:border-blue-200"
                      onClick={() => handleOrganizationClick(org.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            {org.name}
                          </CardTitle>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {org.code}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {org.member_count} {org.member_count === 1 ? 'member' : 'members'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {org.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {org.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(org.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
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
