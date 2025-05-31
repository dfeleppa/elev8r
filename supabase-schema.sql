-- ELEV8 Database Schema - Multi-Organization Role-Based Access Control System
-- Create enum for user roles (organization-specific, except app-admin)
-- Use IF NOT EXISTS to avoid conflicts with existing types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('app-admin', 'admin', 'staff', 'member');
    END IF;
END $$;

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE NOT NULL DEFAULT UPPER(LEFT(REPLACE(gen_random_uuid()::text, '-', ''), 8)),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (for basic user info, app-admin role only)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  is_app_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organization_memberships table (junction table for user-org relationships)
CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique user-organization combinations
  UNIQUE(user_id, organization_id),
  
  -- Only allow org-specific roles in memberships
  CONSTRAINT no_app_admin_in_memberships 
    CHECK (role != 'app-admin')
);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_code TEXT;
  user_role_val user_role;
BEGIN
  -- Determine if user should be app-admin
  user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member');
  
  -- Insert user profile
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
    COALESCE(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
    COALESCE(TRIM(NEW.raw_user_meta_data->>'last_name'), ''),
    user_role_val = 'app-admin'
  );
  
  -- Handle organization membership for non-app-admin users
  IF user_role_val != 'app-admin' THEN
    -- Check if user wants to join existing organization by code
    IF NEW.raw_user_meta_data->>'organization_code' IS NOT NULL THEN
      org_code := UPPER(TRIM(NEW.raw_user_meta_data->>'organization_code'));
      
      -- Find organization by code
      SELECT id INTO org_id 
      FROM organizations 
      WHERE code = org_code AND is_active = true;
      
      -- If organization not found, raise error
      IF org_id IS NULL THEN
        RAISE EXCEPTION 'Organization with code % not found', org_code;
      END IF;
      
      -- Add user to organization
      INSERT INTO organization_memberships (user_id, organization_id, role)
      VALUES (NEW.id, org_id, user_role_val);
      
    -- Otherwise, create new organization if name provided
    ELSIF NEW.raw_user_meta_data->>'organization_name' IS NOT NULL THEN
      INSERT INTO organizations (name, created_by)
      VALUES (TRIM(NEW.raw_user_meta_data->>'organization_name'), NEW.id)
      RETURNING id INTO org_id;
      
      -- Make user an admin of the new organization
      INSERT INTO organization_memberships (user_id, organization_id, role)
      VALUES (NEW.id, org_id, 'admin');
      
    ELSE
      RAISE EXCEPTION 'Organization name or code required for non-app-admin users';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on user creation (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_organizations_updated ON public.organizations;
CREATE TRIGGER on_organizations_updated
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_organization_memberships_updated ON public.organization_memberships;
CREATE TRIGGER on_organization_memberships_updated
  BEFORE UPDATE ON public.organization_memberships
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles (drop existing policies first)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "App admins can view all profiles" ON profiles;
CREATE POLICY "App admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_app_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS policies for organizations (drop existing policies first)
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

DROP POLICY IF EXISTS "App admins and org admins can update organizations" ON organizations;
CREATE POLICY "App admins and org admins can update organizations" ON organizations
  FOR UPDATE USING (
    -- App admins can update any organization
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_app_admin = true
    )
    OR
    -- Organization admins can update their own organization
    id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- RLS policies for organization_memberships (drop existing policies first)
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

DROP POLICY IF EXISTS "App admins and org admins can update memberships" ON organization_memberships;
CREATE POLICY "App admins and org admins can update memberships" ON organization_memberships
  FOR UPDATE USING (
    -- App admins can update any membership
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_app_admin = true
    )
    OR
    -- Organization admins can update memberships in their organization
    organization_id IN (
      SELECT organization_id 
      FROM organization_memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.organizations TO anon, authenticated;
GRANT ALL ON public.organization_memberships TO anon, authenticated;

-- Create indexes for performance (drop if exists first)
DROP INDEX IF EXISTS idx_profiles_is_app_admin;
CREATE INDEX idx_profiles_is_app_admin ON profiles(is_app_admin);

DROP INDEX IF EXISTS idx_organizations_code;
CREATE INDEX idx_organizations_code ON organizations(code);

DROP INDEX IF EXISTS idx_organizations_created_by;
CREATE INDEX idx_organizations_created_by ON organizations(created_by);

DROP INDEX IF EXISTS idx_memberships_user_id;
CREATE INDEX idx_memberships_user_id ON organization_memberships(user_id);

DROP INDEX IF EXISTS idx_memberships_organization_id;
CREATE INDEX idx_memberships_organization_id ON organization_memberships(organization_id);

DROP INDEX IF EXISTS idx_memberships_role;
CREATE INDEX idx_memberships_role ON organization_memberships(role);

DROP INDEX IF EXISTS idx_memberships_user_org;
CREATE INDEX idx_memberships_user_org ON organization_memberships(user_id, organization_id);

-- Create helper functions for common queries
CREATE OR REPLACE FUNCTION get_user_organizations(user_uuid UUID)
RETURNS TABLE(
  org_id UUID,
  org_name TEXT,
  org_code TEXT,
  user_role user_role,
  is_admin BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.code,
    om.role,
    om.role = 'admin'
  FROM organizations o
  JOIN organization_memberships om ON o.id = om.organization_id
  WHERE om.user_id = user_uuid AND om.is_active = true AND o.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_organization_with_admin(
  org_name TEXT,
  admin_user_id UUID
)
RETURNS TABLE(
  organization_id UUID,
  organization_code TEXT
) AS $$
DECLARE
  new_org_id UUID;
  new_org_code TEXT;
BEGIN
  -- Create the organization
  INSERT INTO organizations (name, created_by)
  VALUES (org_name, auth.uid())
  RETURNING id, code INTO new_org_id, new_org_code;
  
  -- Add the specified user as admin
  INSERT INTO organization_memberships (user_id, organization_id, role)
  VALUES (admin_user_id, new_org_id, 'admin');
  
  RETURN QUERY SELECT new_org_id, new_org_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;