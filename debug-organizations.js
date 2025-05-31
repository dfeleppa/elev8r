// Debug script to check organizations and user profile
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugOrganizations() {
  try {
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Current user:', user?.email || 'No user')
    
    if (!user) {
      console.log('No authenticated user found')
      return
    }

    // Check user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    console.log('User profile:', { profile, profileError })

    // Check organizations (bypass RLS for debugging)
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
    
    console.log('Organizations query result:', { orgs, orgsError })

    // Check if we can see organizations with RLS
    console.log('Testing RLS-enabled query...')
    const { data: rlsOrgs, error: rlsError } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
    
    console.log('RLS query result:', { rlsOrgs, rlsError })

  } catch (error) {
    console.error('Debug error:', error)
  }
}

debugOrganizations()
