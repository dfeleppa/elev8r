'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/use-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Crown } from 'lucide-react'

export default function OrganizationSelector() {
  const { profile, organizations, loading } = useProfile()
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">Loading organizations...</div>
        </CardContent>
      </Card>
    )
  }

  if (!profile || profile.is_app_admin) {
    return null // App admins don't need organization selector
  }

  const selectedOrg = organizations.find(org => org.org_id === selectedOrgId)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Building2 className="h-5 w-5" />
          Your Organizations
        </CardTitle>
        <CardDescription>
          Select an organization to access its features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {organizations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              You are not a member of any organizations yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact an App Admin to get added to an organization.
            </p>
          </div>
        ) : (
          <>
            <div>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.org_id} value={org.org_id}>
                      <div className="flex items-center gap-2">
                        <span>{org.org_name}</span>
                        {org.is_admin && (
                          <Crown className="h-3 w-3 text-yellow-600" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrg && (
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedOrg.org_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Code: {selectedOrg.org_code}
                      </p>
                    </div>
                    <Badge 
                      variant={selectedOrg.is_admin ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {selectedOrg.is_admin && <Crown className="h-3 w-3" />}
                      {selectedOrg.user_role}
                    </Badge>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Organization features will be available here
                  </p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Member of {organizations.length} organization{organizations.length !== 1 ? 's' : ''}</span>
              </div>
              {organizations.some(org => org.is_admin) && (
                <div className="flex items-center gap-2 text-sm text-yellow-700 mt-1">
                  <Crown className="h-4 w-4" />
                  <span>Administrator of {organizations.filter(org => org.is_admin).length} organization{organizations.filter(org => org.is_admin).length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
