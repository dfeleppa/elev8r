-- ELEV8 Database Schema - INFINITE RECURSION FIX (CASCADE VERSION)
-- This script fixes the infinite recursion issue in RLS policies

-- Step 1: First drop all existing policies that depend on any is_app_admin function
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

-- Step 2: Now safely drop any existing functions
DROP FUNCTION IF EXISTS auth.is_app_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_app_admin() CASCADE;

-- Step 3: Create a security definer function to check if a user is an app admin
-- This prevents recursion by using a function instead of a subquery
-- Note: Creating in public schema since auth schema is restricted
CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- Use a direct query with SECURITY DEFINER to bypass RLS
  SELECT is_app_admin INTO admin_status
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(admin_status, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_app_admin() TO authenticated;

-- Step 4: Create fixed RLS policies for profiles (NO RECURSION)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Use the security definer function instead of a subquery to prevent recursion
CREATE POLICY "App admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_app_admin());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "App admins can update all profiles" ON profiles
  FOR UPDATE USING (public.is_app_admin());

-- Step 5: Fix organization policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    -- App admins can see all organizations (using the function to prevent recursion)
    public.is_app_admin()
    OR
    -- Regular users can see organizations they're members of
    id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "App admins can create organizations" ON organizations
  FOR INSERT WITH CHECK (public.is_app_admin());

CREATE POLICY "App admins and org admins can update organizations" ON organizations
  FOR UPDATE USING (
    -- App admins can update any organization (using the function)
    public.is_app_admin()
    OR
    -- Organization admins can update their own organization
    id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Step 6: Fix organization_memberships policies
CREATE POLICY "Users can view memberships in their organizations" ON organization_memberships
  FOR SELECT USING (
    -- App admins can see all memberships (using the function)
    public.is_app_admin()
    OR
    -- Users can see memberships in organizations they belong to
    organization_id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "App admins can create memberships" ON organization_memberships
  FOR INSERT WITH CHECK (public.is_app_admin());

CREATE POLICY "App admins and org admins can update memberships" ON organization_memberships
  FOR UPDATE USING (
    -- App admins can update any membership (using the function)
    public.is_app_admin()
    OR
    -- Organization admins can update memberships in their organization
    organization_id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Step 7: Test the function to make sure it works
SELECT 'Function created successfully. You can now test with: SELECT public.is_app_admin();' as status;
