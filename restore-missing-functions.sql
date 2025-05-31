-- Restore Missing Functions Fix
-- This restores the get_user_organizations function that was dropped during the nuclear RLS fix

-- Create the get_user_organizations function that the useProfile hook needs
CREATE OR REPLACE FUNCTION public.get_user_organizations(user_uuid UUID)
RETURNS TABLE(
  org_id UUID,
  org_name TEXT,
  org_code TEXT,
  user_role user_role,
  is_admin BOOLEAN
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
    om.role = 'admin'
  FROM organizations o
  JOIN organization_memberships om ON o.id = om.organization_id
  WHERE om.user_id = user_uuid AND om.is_active = true AND o.is_active = true;
END;
$$;

-- Create the create_organization_with_admin function
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  org_name TEXT,
  admin_user_id UUID
)
RETURNS TABLE(
  organization_id UUID,
  organization_code TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  new_org_code TEXT;
BEGIN
  -- Generate a unique organization code
  new_org_code := UPPER(SUBSTRING(org_name FROM 1 FOR 3)) || '_' || 
                  TO_CHAR(EXTRACT(EPOCH FROM NOW())::INTEGER, 'FM999999');
  
  -- Create the organization
  INSERT INTO organizations (name, code, created_by)
  VALUES (org_name, new_org_code, auth.uid())
  RETURNING id INTO new_org_id;
  
  -- Add the specified user as admin
  INSERT INTO organization_memberships (user_id, organization_id, role)
  VALUES (admin_user_id, new_org_id, 'admin');
  
  RETURN QUERY SELECT new_org_id, new_org_code;
END;
$$;

-- Create the handle_new_user function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id UUID;
  org_code TEXT;
  user_role_val user_role;
  org_name_val TEXT;
BEGIN
  -- Determine user role with fallback
  BEGIN
    user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member');
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'member';
  END;
  
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
  
  -- Handle organization setup for non-app-admin users
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
      org_name_val := TRIM(NEW.raw_user_meta_data->>'organization_name');
      
      -- Create organization
      INSERT INTO organizations (name, created_by)
      VALUES (org_name_val, NEW.id)
      RETURNING id INTO org_id;
      
      -- Make user an admin of the new organization
      INSERT INTO organization_memberships (user_id, organization_id, role)
      VALUES (NEW.id, org_id, 'admin');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the handle_updated_at function for timestamps
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_organizations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization_with_admin(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated;

-- Ensure the trigger exists for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure updated_at triggers exist
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_organizations_updated_at ON organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_memberships_updated_at ON organization_memberships;
CREATE TRIGGER set_memberships_updated_at
  BEFORE UPDATE ON organization_memberships
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

SELECT 'Missing functions restored successfully. Test with: SELECT public.get_user_organizations(auth.uid());' as status;
