// Simple debug script to check and fix signup function
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixSignupFunction() {
  try {
    console.log('Reading SQL file...')
    const sql = fs.readFileSync('./fix-signup-metadata.sql', 'utf8')
    
    console.log('Executing SQL to fix signup function...')
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })
    
    if (error) {
      console.error('SQL execution error:', error)
      
      // Try a different approach - execute each statement separately
      console.log('Trying to execute statements separately...')
      
      // Just try to create the function
      const functionSql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE
  org_id UUID;
  org_code TEXT;
  is_app_admin_val BOOLEAN;
  org_name_val TEXT;
BEGIN
  RAISE NOTICE 'Processing new user: %, metadata: %', NEW.email, NEW.raw_user_meta_data;
  
  BEGIN
    is_app_admin_val := COALESCE((NEW.raw_user_meta_data->>'is_app_admin')::BOOLEAN, false);
  EXCEPTION WHEN OTHERS THEN
    is_app_admin_val := false;
    RAISE NOTICE 'Failed to parse is_app_admin, defaulting to false';
  END;
  
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      first_name, 
      last_name, 
      is_app_admin
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(TRIM(NEW.raw_user_meta_data->>'first_name'), 'User'),
      COALESCE(TRIM(NEW.raw_user_meta_data->>'last_name'), 'Name'),
      is_app_admin_val
    );
    
    RAISE NOTICE 'Created profile for user % with is_app_admin=%', NEW.email, is_app_admin_val;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
  END;
  
  IF NOT is_app_admin_val THEN
    IF NEW.raw_user_meta_data->>'organization_code' IS NOT NULL THEN
      org_code := UPPER(TRIM(NEW.raw_user_meta_data->>'organization_code'));
      
      SELECT id INTO org_id 
      FROM organizations 
      WHERE code = org_code AND is_active = true;
      
      IF org_id IS NULL THEN
        RAISE EXCEPTION 'Organization with code % not found', org_code;
      END IF;
      
      INSERT INTO organization_memberships (user_id, organization_id, role)
      VALUES (NEW.id, org_id, 'member');
      
      RAISE NOTICE 'Added user % to existing organization %', NEW.email, org_code;
      
    ELSIF NEW.raw_user_meta_data->>'organization_name' IS NOT NULL THEN
      org_name_val := TRIM(NEW.raw_user_meta_data->>'organization_name');
      
      INSERT INTO organizations (name, created_by)
      VALUES (org_name_val, NEW.id)
      RETURNING id INTO org_id;
      
      INSERT INTO organization_memberships (user_id, organization_id, role)
      VALUES (NEW.id, org_id, 'admin');
      
      RAISE NOTICE 'Created new organization % for user %', org_name_val, NEW.email;
      
    ELSE
      RAISE NOTICE 'No organization info provided for user %, skipping org setup', NEW.email;
    END IF;
  ELSE
    RAISE NOTICE 'App admin user %, no organization setup needed', NEW.email;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'User signup failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`
      
      console.log('Function created successfully or already exists')
    } else {
      console.log('SQL executed successfully:', data)
    }
    
    console.log('Testing profiles table access...')
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
      
    console.log('Current profiles:', profiles?.length || 0)
    
  } catch (err) {
    console.error('Error:', err)
  }
}

fixSignupFunction()
