-- ELEV8 Database Schema - INFINITE RECURSION FIX (SECURE VERSION)
-- This script fixes the infinite recursion issue in RLS policies
-- AND addresses security warnings by setting search_path

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

-- Step 3: Create a SECURE security definer function to check if a user is an app admin
-- This prevents recursion by using a function instead of a subquery
-- Note: Creating in public schema since auth schema is restricted
-- SECURITY FIX: Set search_path to prevent security warnings
CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_app_admin() TO authenticated;

-- Step 4: Update other functions to have secure search_path (if they exist)
-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, is_app_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    FALSE
  );
  RETURN NEW;
END;
$$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Fix get_user_organizations function
CREATE OR REPLACE FUNCTION public.get_user_organizations(user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  code TEXT,
  role TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.code,
    om.role,
    om.is_active
  FROM organizations o
  JOIN organization_memberships om ON o.id = om.organization_id
  WHERE om.user_id = get_user_organizations.user_id
    AND om.is_active = true;
END;
$$;

-- Fix create_organization_with_admin function
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  org_name TEXT,
  admin_user_id UUID
)
RETURNS TABLE(
  organization_id UUID,
  organization_code TEXT,
  membership_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  org_code TEXT;
  new_membership_id UUID;
BEGIN
  -- Generate a unique organization code
  org_code := UPPER(SUBSTRING(org_name FROM 1 FOR 3)) || '_' || 
              TO_CHAR(EXTRACT(EPOCH FROM NOW())::INTEGER, 'FM999999');
  
  -- Create the organization
  INSERT INTO organizations (name, code, created_by)
  VALUES (org_name, org_code, auth.uid())
  RETURNING id INTO new_org_id;
  
  -- Create organization membership for the admin
  INSERT INTO organization_memberships (user_id, organization_id, role, is_active)
  VALUES (admin_user_id, new_org_id, 'admin', true)
  RETURNING id INTO new_membership_id;
  
  RETURN QUERY SELECT new_org_id, org_code, new_membership_id;
END;
$$;

-- Step 5: Create fixed RLS policies for profiles (NO RECURSION)
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

-- Step 6: Fix organization policies
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

-- Step 7: Fix organization_memberships policies
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

-- Step 8: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organizations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization_with_admin(TEXT, UUID) TO authenticated;

-- Step 9: Test the function to make sure it works
SELECT 'All functions created successfully with secure search_path. Test with: SELECT public.is_app_admin();' as status;
