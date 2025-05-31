-- Database Diagnostic Script
-- Run this in Supabase SQL Editor to check current state

-- Check 1: Do the tables exist?
SELECT 'Tables Check' as check_type;
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename IN ('profiles', 'organizations', 'organization_memberships');

-- Check 2: Do the enum types exist?
SELECT 'Enum Types Check' as check_type;
SELECT typname 
FROM pg_type 
WHERE typname IN ('user_role');

-- Check 3: Check if the user profile exists
SELECT 'Profile Check for User ID: 673281a3-4985-414c-97a9-d44a2475fcab' as check_type;
SELECT id, email, first_name, last_name, is_app_admin, created_at
FROM profiles 
WHERE id = '673281a3-4985-414c-97a9-d44a2475fcab';

-- Check 4: Check all profiles (limit 5)
SELECT 'All Profiles (limit 5)' as check_type;
SELECT id, email, first_name, last_name, is_app_admin, created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 5;

-- Check 5: Check RLS policies on profiles table
SELECT 'RLS Policies on Profiles' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check 6: Check if RLS is enabled
SELECT 'RLS Status' as check_type;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'organizations', 'organization_memberships');

-- Check 7: Check triggers
SELECT 'Triggers Check' as check_type;
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%user%' OR trigger_name LIKE '%profile%';

-- Check 8: Check functions
SELECT 'Functions Check' as check_type;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('handle_new_user', 'get_user_organizations', 'create_organization_with_admin');

-- Check 9: Test auth.uid() function (should return null when run from SQL editor)
SELECT 'Auth UID Test' as check_type;
SELECT auth.uid() as current_user_id;

-- Check 10: Count records in each table
SELECT 'Record Counts' as check_type;
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM organizations) as organizations_count,
  (SELECT COUNT(*) FROM organization_memberships) as memberships_count;
