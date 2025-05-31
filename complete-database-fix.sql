-- Complete Database Fix - Run this in Supabase SQL Editor
-- This addresses profile fetching issues and RLS policy problems

-- Step 1: Ensure all required policies exist for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 2: Add App Admin policies for profiles
DROP POLICY IF EXISTS "App admins can view all profiles" ON profiles;
CREATE POLICY "App admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_app_admin = true
    )
  );

DROP POLICY IF EXISTS "App admins can update all profiles" ON profiles;
CREATE POLICY "App admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_app_admin = true
    )
  );

-- Step 3: Add policies for organizations table
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    -- App admins can see all organizations
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_app_admin = true
    )
    OR
    -- Regular users can see organizations they're members of
    id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "App admins can create organizations" ON organizations;
CREATE POLICY "App admins can create organizations" ON organizations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_app_admin = true
    )
  );

-- Step 4: Add policies for organization_memberships table
DROP POLICY IF EXISTS "Users can view memberships in their organizations" ON organization_memberships;
CREATE POLICY "Users can view memberships in their organizations" ON organization_memberships
  FOR SELECT USING (
    -- App admins can see all memberships
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_app_admin = true
    )
    OR
    -- Users can see memberships in organizations they belong to
    organization_id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "App admins can create memberships" ON organization_memberships;
CREATE POLICY "App admins can create memberships" ON organization_memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_app_admin = true
    )
  );

-- Step 5: Grant necessary permissions (ensure these are set)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.organizations TO anon, authenticated;
GRANT ALL ON public.organization_memberships TO anon, authenticated;

-- Step 6: Test query to see if profile exists for the user
-- You can run this manually to check: SELECT * FROM profiles WHERE id = '673281a3-4985-414c-97a9-d44a2475fcab';
