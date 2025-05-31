-- Emergency RLS Fix - Immediate Solution for Infinite Recursion
-- Run this IMMEDIATELY in Supabase SQL Editor to fix the infinite recursion

-- Step 1: DISABLE RLS temporarily to fix the recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "App admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "App admins can update all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "App admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "App admins and org admins can update organizations" ON organizations;

DROP POLICY IF EXISTS "Users can view memberships in their organizations" ON organization_memberships;
DROP POLICY IF EXISTS "App admins can create memberships" ON organization_memberships;
DROP POLICY IF EXISTS "App admins and org admins can update memberships" ON organization_memberships;

-- Step 3: Create a SECURITY DEFINER function to safely check app admin status
CREATE OR REPLACE FUNCTION public.check_is_app_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Direct query with security definer bypasses RLS
  SELECT COALESCE(p.is_app_admin, FALSE) INTO is_admin
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
  RETURN is_admin;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_is_app_admin() TO authenticated;

-- Step 4: Re-enable RLS with SAFE policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;

-- Step 5: Create SAFE RLS policies using the function
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "App admins view all profiles" ON profiles
  FOR SELECT USING (public.check_is_app_admin());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
CREATE POLICY "View organizations" ON organizations
  FOR SELECT USING (
    public.check_is_app_admin() OR
    id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "App admin create orgs" ON organizations
  FOR INSERT WITH CHECK (public.check_is_app_admin());

-- Memberships policies  
CREATE POLICY "View memberships" ON organization_memberships
  FOR SELECT USING (
    public.check_is_app_admin() OR
    organization_id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "App admin create memberships" ON organization_memberships
  FOR INSERT WITH CHECK (public.check_is_app_admin());

-- Step 6: Ensure permissions are granted
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.organizations TO anon, authenticated;
GRANT ALL ON public.organization_memberships TO anon, authenticated;

-- Test function
SELECT 'Emergency RLS fix applied. Test with: SELECT public.check_is_app_admin();' as status;
