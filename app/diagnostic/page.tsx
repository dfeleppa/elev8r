'use client'

import { useProfile } from '@/hooks/use-profile'
import { useAuth } from '@/contexts/auth-context'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DiagnosticPage() {
  const { user } = useAuth()
  const { profile, loading, getAllOrganizations } = useProfile()
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [orgTestResult, setOrgTestResult] = useState<any>(null)

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        user: user ? {
          id: user.id,
          email: user.email,
          authenticated: true
        } : null,
        profile: profile,
        loading: loading
      }

      // Test organization fetching
      if (profile?.is_app_admin) {
        try {
          const orgs = await getAllOrganizations()
          results.organizationsTest = {
            success: true,
            count: orgs?.length || 0,
            organizations: orgs
          }
        } catch (error) {
          results.organizationsTest = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }

        // Also test direct Supabase query
        try {
          const { data: directOrgs, error: directError } = await supabase
            .from('organizations')
            .select('*')
            .eq('is_active', true)
          
          results.directSupabaseTest = {
            success: !directError,
            count: directOrgs?.length || 0,
            organizations: directOrgs,
            error: directError?.message
          }
        } catch (error) {
          results.directSupabaseTest = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      setDiagnostics(results)
    }

    if (!loading) {
      runDiagnostics()
    }
  }, [user, profile, loading, getAllOrganizations])

  if (loading) {
    return <div className="p-6">Loading diagnostics...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Diagnostics</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(diagnostics.user, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Profile Data</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(diagnostics.profile, null, 2)}
          </pre>
        </div>

        {diagnostics.organizationsTest && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">getAllOrganizations() Test</h2>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(diagnostics.organizationsTest, null, 2)}
            </pre>
          </div>
        )}

        {diagnostics.directSupabaseTest && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Direct Supabase Query Test</h2>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(diagnostics.directSupabaseTest, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Full Diagnostic Data</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
