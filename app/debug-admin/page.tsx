"use client";

import React, { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';

export default function DebugAdminPage() {
  const { profile, loading, getAllOrganizations } = useProfile();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [rawOrganizations, setRawOrganizations] = useState<any[]>([]);
  const [profileTableData, setProfileTableData] = useState<any>(null);
  const [orgQueryError, setOrgQueryError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  useEffect(() => {
    const checkAuth = async () => {
      addTestResult('Starting authentication check...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      setSupabaseUser(user);
      
      if (userError) {
        addTestResult(`Auth error: ${userError.message}`);
        return;
      }
      
      if (!user) {
        addTestResult('No user logged in');
        return;
      }
      
      addTestResult(`User authenticated: ${user.email} (ID: ${user.id})`);
      
      // Check profile table directly
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      addTestResult(`Profile query result: ${profileError ? `Error - ${profileError.message}` : 'Success'}`);
      setProfileTableData(profileData);
      
      if (profileData) {
        addTestResult(`Profile found - is_app_admin: ${profileData.is_app_admin}`);
      }
      
      // Try to fetch organizations directly without RLS
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*');
      
      addTestResult(`Direct organizations query: ${error ? `Error - ${error.message}` : `Success - ${orgs?.length || 0} organizations found`}`);
      setRawOrganizations(orgs || []);
      setOrgQueryError(error?.message || null);
      
      // Try the getAllOrganizations hook function
      try {
        addTestResult('Testing getAllOrganizations hook...');
        const hookOrgs = await getAllOrganizations();
        addTestResult(`Hook organizations result: ${hookOrgs?.length || 0} organizations`);
        setOrganizations(hookOrgs || []);
      } catch (err) {
        addTestResult(`Hook organizations error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    if (!loading) {
      checkAuth();
    }
  }, [getAllOrganizations, loading]);
  const testCreateOrganization = async () => {
    addTestResult('Testing organization creation...');
    const { data, error } = await supabase
      .from('organizations')
      .insert([
        {
          name: `Test Org ${Date.now()}`,
          description: 'Test organization created for debugging',
          website: 'https://example.com',
          is_active: true
        }
      ])
      .select();
    
    const message = error 
      ? `Create organization failed: ${error.message}` 
      : `Organization created successfully: ${data?.[0]?.name}`;
    addTestResult(message);
    
    // Refresh organizations
    window.location.reload();
  };

  const testMakeAppAdmin = async () => {
    if (!supabaseUser) {
      addTestResult('Cannot make app admin: No user logged in');
      return;
    }
      addTestResult('Making current user app admin...');
    const { data, error } = await supabase
      .from('profiles')
      .upsert([
        {
          id: supabaseUser.id,
          email: supabaseUser.email,
          is_app_admin: true,
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    const message = error 
      ? `Make app admin failed: ${error.message}` 
      : `Successfully made user app admin`;
    addTestResult(message);
    
    // Refresh page
    window.location.reload();
  };

  const testRLSPolicies = async () => {
    if (!supabaseUser) {
      addTestResult('Cannot test RLS: No user logged in');
      return;
    }
      addTestResult('Testing RLS policies...');
    
    // Test with and without app admin access
    const queries = [
      { name: 'organizations (all)', query: supabase.from('organizations').select('*') },
      { name: 'organizations (active)', query: supabase.from('organizations').select('*').eq('is_active', true) },
      { name: 'profiles (self)', query: supabase.from('profiles').select('*').eq('id', supabaseUser.id) }
    ];
    
    for (const { name, query } of queries) {
      const { data, error } = await query;
      addTestResult(`RLS test ${name}: ${error ? `Error - ${error.message}` : `Success - ${data?.length || 0} rows`}`);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">App Admin Debug Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Status */}
        <div className="space-y-4">
          <div className="border p-4 rounded-lg bg-white shadow">
            <h2 className="text-xl font-semibold mb-3">Current Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>User:</strong> {supabaseUser?.email || 'Not logged in'}</p>
              <p><strong>Profile Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Profile Exists:</strong> {profile ? 'Yes' : 'No'}</p>
              <p><strong>Is App Admin:</strong> {profile?.is_app_admin ? 'Yes' : 'No'}</p>
              <p><strong>Hook Organizations:</strong> {organizations.length}</p>
              <p><strong>Direct Organizations:</strong> {rawOrganizations.length}</p>
            </div>
          </div>

          <div className="border p-4 rounded-lg bg-white shadow">
            <h2 className="text-xl font-semibold mb-3">Test Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={testMakeAppAdmin}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Make Current User App Admin
              </button>
              <button 
                onClick={testCreateOrganization}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Create Test Organization
              </button>
              <button 
                onClick={testRLSPolicies}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
              >
                Test RLS Policies
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="border p-4 rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-3">Test Results</h2>
          <div className="bg-gray-100 p-3 rounded max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm mb-1 font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Data Details */}
      <div className="mt-6 space-y-4">
        {profileTableData && (
          <div className="border p-4 rounded-lg bg-white shadow">
            <h2 className="text-xl font-semibold mb-3">Profile Table Data</h2>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(profileTableData, null, 2)}
            </pre>
          </div>
        )}

        {rawOrganizations.length > 0 && (
          <div className="border p-4 rounded-lg bg-white shadow">
            <h2 className="text-xl font-semibold mb-3">Raw Organizations ({rawOrganizations.length})</h2>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto max-h-48 overflow-y-auto">
              {JSON.stringify(rawOrganizations, null, 2)}
            </pre>
          </div>
        )}

        {organizations.length > 0 && (
          <div className="border p-4 rounded-lg bg-white shadow">
            <h2 className="text-xl font-semibold mb-3">Hook Organizations ({organizations.length})</h2>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto max-h-48 overflow-y-auto">
              {JSON.stringify(organizations, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
