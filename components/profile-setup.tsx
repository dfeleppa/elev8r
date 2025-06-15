"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useProfile } from '@/hooks/use-profile'
import { supabase } from '@/lib/supabase'

export function ProfileSetup() {
  const { user } = useAuth()
  const { createProfile } = useProfile()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isAppAdmin, setIsAppAdmin] = useState(false)
  const [orgMode, setOrgMode] = useState<'create' | 'join' | 'none'>('none')
  const [organizationName, setOrganizationName] = useState('')
  const [organizationCode, setOrganizationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill data from user metadata if available
  useEffect(() => {
    if (user?.user_metadata) {
      const metadata = user.user_metadata
      setFirstName(metadata.first_name || '')
      setLastName(metadata.last_name || '')
      setIsAppAdmin(metadata.is_app_admin || false)
      setOrganizationName(metadata.organization_name || '')
      setOrganizationCode(metadata.organization_code || '')
      
      if (metadata.organization_name) {
        setOrgMode('create')
      } else if (metadata.organization_code) {
        setOrgMode('join')
      }
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please fill in all required fields')
      return
    }

    if (!isAppAdmin && orgMode === 'create' && !organizationName.trim()) {
      setError('Organization name is required')
      return
    }

    if (!isAppAdmin && orgMode === 'join' && !organizationCode.trim()) {
      setError('Organization code is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create profile first
      const profile = await createProfile({
        email: user?.email || '',
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        is_app_admin: isAppAdmin,
        is_active: true
      })
      
      // Handle organization setup if not app admin
      if (!isAppAdmin && profile) {
        if (orgMode === 'create' && organizationName.trim()) {
          console.log('Creating organization:', organizationName)
          
          // Use the existing RPC function
          const { data: orgResult, error: orgError } = await supabase
            .rpc('create_organization_with_admin', {
              org_name: organizationName.trim(),
              admin_user_id: user?.id
            })
          
          if (orgError) {
            console.error('Organization creation failed:', orgError)
            setError('Profile created but organization creation failed')
          } else {
            console.log('Organization created successfully:', orgResult)
          }
          
        } else if (orgMode === 'join' && organizationCode.trim()) {
          console.log('Joining organization:', organizationCode)
          
          // Find and join organization
          const { data: org, error: findError } = await supabase
            .from('organizations')
            .select('id')
            .eq('code', organizationCode.toUpperCase())
            .eq('is_active', true)
            .single()
          
          if (findError || !org) {
            setError('Organization not found with that code')
          } else {
            // Add user to organization
            const { error: joinError } = await supabase
              .from('organization_memberships')
              .insert({
                user_id: user?.id,
                organization_id: org.id,
                role: 'member'
              })
            
            if (joinError) {
              console.error('Failed to join organization:', joinError)
              setError('Profile created but failed to join organization')
            }
          }
        }
      }
      
      // Refresh the page to reload with the new profile
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          We need a bit more information to set up your account.
        </CardDescription>
      </CardHeader>
      <CardContent>        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Account Type:</Label>
            <Select value={isAppAdmin ? "app-admin" : "user"} onValueChange={(value) => setIsAppAdmin(value === "app-admin")}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="app-admin">App Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {isAppAdmin 
                ? "Platform administrator with full system access" 
                : "Regular user with access to organization features"
              }
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          {!isAppAdmin && (
            <>
              <div className="space-y-3">
                <Label>Organization:</Label>
                <RadioGroup
                  value={orgMode}
                  onValueChange={(value: 'create' | 'join' | 'none') => setOrgMode(value)}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="create" id="create" />
                      <Label htmlFor="create">Create New Organization</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Start a new organization and become its administrator
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="join" id="join" />
                      <Label htmlFor="join">Join Existing Organization</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Join an existing organization using an invitation code
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">Join without an organization</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Complete setup without joining any organization (you can join one later)
                    </p>
                  </div>
                </RadioGroup>
              </div>

              {orgMode === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Enter your organization's name"
                    required
                  />
                </div>
              )}

              {orgMode === 'join' && (
                <div className="space-y-2">
                  <Label htmlFor="organizationCode">Organization Code</Label>
                  <Input
                    id="organizationCode"
                    value={organizationCode}
                    onChange={(e) => setOrganizationCode(e.target.value)}
                    placeholder="Enter organization code to join"
                    required
                  />
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Setting up...' : 'Complete Setup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
