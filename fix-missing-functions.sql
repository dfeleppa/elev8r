-- Missing Functions Fix - Add to your existing database
-- This adds the missing functions that the application needs

-- Function to get user organizations (used by useProfile hook)
CREATE OR REPLACE FUNCTION get_user_organizations(user_uuid UUID)
RETURNS TABLE(
  org_id UUID,
  org_name TEXT,
  org_code TEXT,
  user_role user_role,
  is_admin BOOLEAN
) 
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create organization with admin
CREATE OR REPLACE FUNCTION create_organization_with_admin(
  org_name TEXT,
  admin_user_id UUID
)
RETURNS TABLE(
  organization_id UUID,
  organization_code TEXT
) 
SET search_path = public
AS $$
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

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
