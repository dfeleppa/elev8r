'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      </div>
    </DashboardLayout>
  )
}
