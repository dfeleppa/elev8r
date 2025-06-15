'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { useAuth } from '@/contexts/auth-context'
import { useProfile } from '@/hooks/use-profile'
import { supabase } from '@/lib/supabase'

export default function TestAppAdminPage() {
  const { user, signUp, signIn, signOut } = useAuth()
  const { profile, getAllOrganizations } = useProfile()
  const [testResults, setTestResults] = useState<any>({})
  const [isRunning, setIsRunning] = useState(false)

  const runFullTest = async () => {
    setIsRunning(true)
    const results: any = {}

    try {
      // Step 1: Test current user status
      results.currentUser = user ? {
        id: user.id,
        email: user.email,
        is_authenticated: true
      } : null

      results.currentProfile = profile

      // Step 2: If we have an app admin, test organization fetching
      if (profile?.is_app_admin) {
        try {
          const orgs = await getAllOrganizations()
          results.organizationFetch = {
            success: true,
            count: orgs?.length || 0,
            organizations: orgs
          }

          // Test direct query
          const { data: directOrgs, error } = await supabase
            .from('organizations')
            .select('*')
          results.directOrgQuery = {
            success: !error,
            count: directOrgs?.length || 0,
            organizations: directOrgs,
            error: error?.message
          }

          // Test creating a test organization
          if (orgs?.length === 0) {
            try {
              const { data: newOrg, error: createError } = await supabase
                .from('organizations')
                .insert([{
                  name: 'Test Gym Organization',
                  description: 'A test organization created for debugging'
                }])
                .select()
                .single()

              results.testOrgCreation = {
                success: !createError,
                organization: newOrg,
                error: createError?.message
              }
            } catch (err) {
              results.testOrgCreation = {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error'
              }
            }
          }

        } catch (err) {
          results.organizationFetch = {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          }
        }
      }

      // Step 3: Test database connectivity
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
        results.databaseConnectivity = {
          success: !error,
          error: error?.message
        }
      } catch (err) {
        results.databaseConnectivity = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error'
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const createTestAppAdmin = async () => {
    try {
      const testEmail = 'test-admin@elev8r.test'
      const testPassword = 'test123456'
      
      await signUp(testEmail, testPassword, {
        first_name: 'Test',
        last_name: 'Admin',
        role: 'app-admin'
      })
      
      alert('Test app admin account created! Check your console for details.')
    } catch (error) {
      alert('Error creating test account: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const createTestOrganization = async () => {
    if (!profile?.is_app_admin) {
      alert('You must be an app admin to create organizations')
      return
    }

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: 'Debug Test Gym',
          description: 'Test organization for debugging purposes',
          created_by: user?.id
        }])
        .select()
        .single()

      if (error) throw error
      
      alert('Test organization created successfully!')
      runFullTest() // Re-run test to see results
    } catch (error) {
      alert('Error creating organization: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }
  // Enhanced test account creation functions
  const createQuickTestAccount = async (type: 'app-admin' | 'admin' | 'coach' | 'member') => {
    try {
      const timestamp = Date.now()
      const testEmail = `test-${type}-${timestamp}@elev8r.test`
      const testPassword = 'test123456'
      
      let metadata: any = {
        first_name: 'Test',
        last_name: type.charAt(0).toUpperCase() + type.slice(1)
      }

      // Set role-specific metadata
      if (type === 'app-admin') {
        metadata.is_app_admin = true
      }

      console.log(`Creating ${type} account:`, testEmail)
      
      const result = await signUp(testEmail, testPassword, metadata)
      
      if (result?.user) {
        // If we have a user but they need email confirmation, let's create the profile directly
        if (result.user && !result.user.email_confirmed_at) {
          console.log('User created but not confirmed, creating profile directly...')
          
          // Create profile directly in database
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: result.user.id,
              email: testEmail,
              first_name: metadata.first_name,
              last_name: metadata.last_name,
              is_app_admin: type === 'app-admin',
              is_active: true
            })

          if (profileError) {
            console.log('Profile creation error:', profileError)
          } else {
            console.log('Profile created successfully')
          }
        }
        
        alert(`✅ ${type} account created successfully!\nEmail: ${testEmail}\nPassword: ${testPassword}\n\nYou can now sign in with these credentials.`)
      }
    } catch (error) {
      console.log('Account creation error:', error)
      alert('❌ Error creating account: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Function to manually confirm user (for testing)
  const confirmUserManually = async (userId: string) => {
    try {
      // This would typically require admin privileges in Supabase
      // For now, we'll create the profile directly as a workaround
      console.log('Manually confirming user:', userId)
      
      // Update the user's email_confirmed_at field
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true
      })
      
      if (error) {
        console.log('Manual confirmation error:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.log('Manual confirmation exception:', error)
      return false
    }
  }

  return (
    <DashboardLayout currentPage="test-admin">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>App Admin Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runFullTest} disabled={isRunning}>
              {isRunning ? 'Running Tests...' : 'Run Full Diagnostic'}
            </Button>
            
            {!user && (
              <Button onClick={createTestAppAdmin} variant="outline">
                Create Test App Admin
              </Button>
            )}
            
            {profile?.is_app_admin && (
              <Button onClick={createTestOrganization} variant="outline">
                Create Test Organization
              </Button>
            )}
            
            {user && (
              <Button onClick={signOut} variant="destructive">
                Sign Out
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Current Status</h3>
              <div className="text-sm space-y-1">
                <p>User: {user?.email || 'Not logged in'}</p>
                <p>Profile: {profile ? `${profile.first_name} ${profile.last_name}` : 'No profile'}</p>
                <p>Is App Admin: {profile?.is_app_admin ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-x-auto bg-gray-100 p-4 rounded">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>        </Card>
      )}

      {/* Quick Test Account Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Test Account Creation</CardTitle>
          <CardDescription>
            Create test accounts with different roles instantly (no email verification needed)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={() => createQuickTestAccount('app-admin')} 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="font-medium">App Admin</div>
              <div className="text-xs text-muted-foreground">Full Access</div>
            </Button>
            
            <Button 
              onClick={() => createQuickTestAccount('admin')} 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="font-medium">Admin</div>
              <div className="text-xs text-muted-foreground">Org Admin</div>
            </Button>
            
            <Button 
              onClick={() => createQuickTestAccount('coach')} 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="font-medium">Coach</div>
              <div className="text-xs text-muted-foreground">Trainer</div>
            </Button>
            
            <Button 
              onClick={() => createQuickTestAccount('member')} 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="font-medium">Member</div>
              <div className="text-xs text-muted-foreground">Basic User</div>
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> All test accounts use password: <code className="bg-blue-100 px-1 rounded">test123456</code>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Email format: test-[role]-[timestamp]@elev8r.test
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
