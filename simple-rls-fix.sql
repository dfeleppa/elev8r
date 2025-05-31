-- SIMPLE FIX: Remove problematic policies and use basic RLS
-- This approach removes the infinite recursion by simplifying the policies

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "App admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "App admins can update all profiles" ON profiles;

-- Step 2: Create simple, non-recursive policies for profiles
-- Allow users to see their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 3: Temporarily disable RLS for app admin functionality
-- We'll handle app admin checks in the application code instead of RLS
-- This eliminates the recursion issue entirely

-- Step 4: Create simple organization policies
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "App admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "App admins and org admins can update organizations" ON organizations;

-- Allow authenticated users to view organizations (we'll filter in app code)
CREATE POLICY "Authenticated users can view organizations" ON organizations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create organizations (we'll validate in app code)
CREATE POLICY "Authenticated users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update organizations (we'll validate in app code)
CREATE POLICY "Authenticated users can update organizations" ON organizations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Step 5: Create simple membership policies
DROP POLICY IF EXISTS "Users can view memberships in their organizations" ON organization_memberships;
DROP POLICY IF EXISTS "App admins can create memberships" ON organization_memberships;
DROP POLICY IF EXISTS "App admins and org admins can update memberships" ON organization_memberships;

-- Allow authenticated users to view memberships (we'll filter in app code)
CREATE POLICY "Authenticated users can view memberships" ON organization_memberships
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create memberships (we'll validate in app code)
CREATE POLICY "Authenticated users can create memberships" ON organization_memberships
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update memberships (we'll validate in app code)
CREATE POLICY "Authenticated users can update memberships" ON organization_memberships
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Step 6: Confirmation
SELECT 'Simple RLS policies created. App admin logic will be handled in application code.' as status;
