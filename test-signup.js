// Test signup process and RPC functions
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Please set environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRPCFunctions() {
  try {
    console.log('Testing RPC functions...')
    
    // Test if create_user_profile function exists
    const { data: profileResult, error: profileError } = await supabase
      .rpc('create_user_profile', {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_app_admin: false
      })
    
    console.log('Profile function test:', { profileResult, profileError })
    
    // Test organization functions
    const { data: orgResult, error: orgError } = await supabase
      .rpc('create_organization_for_user', {
        user_id: '00000000-0000-0000-0000-000000000000',
        org_name: 'Test Org'
      })
    
    console.log('Organization function test:', { orgResult, orgError })
    
  } catch (err) {
    console.error('Test error:', err)
  }
}

testRPCFunctions()
