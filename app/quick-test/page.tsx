"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function QuickTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  };
  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      addResult("🔍 Starting comprehensive tests...");

      // Test 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        addResult(`❌ Auth Error: ${authError.message}`);
        return;
      }

      if (!user) {
        addResult("❌ No user logged in - need to authenticate first");
        return;
      }

      addResult(`✅ User authenticated: ${user.email} (ID: ${user.id})`);

      // Test 2: Check profile table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        addResult(`❌ Profile Error: ${profileError.message}`);
      } else {
        addResult(`✅ Profile found: ${profile.email} - is_app_admin: ${profile.is_app_admin}`);
      }

      // Test 3: Direct organization query (bypassing RLS)
      const { data: allOrgs, error: allOrgsError } = await supabase
        .from('organizations')
        .select('*');

      if (allOrgsError) {
        addResult(`❌ All Organizations Error: ${allOrgsError.message}`);
      } else {
        addResult(`📊 Total organizations in database: ${allOrgs?.length || 0}`);
        if (allOrgs && allOrgs.length > 0) {
          allOrgs.forEach(org => {
            addResult(`   📋 ${org.name} (${org.code}) - Active: ${org.is_active}`);
          });
        }
      }

      // Test 4: RLS-filtered organization query (what app admin sees)
      if (profile?.is_app_admin) {
        const { data: appAdminOrgs, error: appAdminOrgsError } = await supabase
          .from('organizations')
          .select('*')
          .eq('is_active', true);

        if (appAdminOrgsError) {
          addResult(`❌ App Admin Organizations Error: ${appAdminOrgsError.message}`);
        } else {
          addResult(`🎯 App Admin sees ${appAdminOrgs?.length || 0} organizations`);
        }
      } else {
        addResult("⚠️ User is not app admin - cannot test app admin org query");
      }

      // Test 5: Check if we can create an organization
      if (profile?.is_app_admin) {
        addResult("✅ User has app admin privileges - can create organizations");
      } else {
        addResult("⚠️ User lacks app admin privileges");
      }

    } catch (error) {
      addResult(`💥 Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };
  const makeAppAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      addResult("❌ No user logged in");
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_app_admin: true })
      .eq('id', user.id)
      .select();

    if (error) {
      addResult(`❌ Failed to make app admin: ${error.message}`);
    } else {
      addResult("✅ Successfully made user app admin! Refresh page to see changes.");
    }
  };
  const createTestOrg = async () => {
    const orgName = `Test Organization ${Date.now()}`;
    
    const { data, error } = await supabase
      .from('organizations')
      .insert([{
        name: orgName,
        description: 'Test organization for debugging',
        code: `TEST${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        is_active: true
      }])
      .select();

    if (error) {
      addResult(`❌ Failed to create organization: ${error.message}`);
    } else {
      addResult(`✅ Created test organization: ${data[0].name} (${data[0].code})`);
      // Re-run tests to see the new org
      setTimeout(runTests, 1000);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔧 Quick Database Test</h1>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={runTests}
          disabled={isRunning}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isRunning ? "Running..." : "Run Tests"}
        </button>
        
        <button 
          onClick={makeAppAdmin}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Make App Admin
        </button>
        
        <button 
          onClick={createTestOrg}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Create Test Org
        </button>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50 h-96 overflow-y-auto">
        <h2 className="font-semibold mb-2">Test Results:</h2>
        {results.length === 0 ? (
          <p className="text-gray-500">No results yet...</p>
        ) : (
          results.map((result, index) => (
            <div key={index} className="mb-1 text-sm font-mono">
              <span className="text-gray-500">[{result.time}]</span> {result.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
