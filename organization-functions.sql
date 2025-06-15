-- Functions for handling organization operations during signup

CREATE OR REPLACE FUNCTION public.create_organization_for_user(
  user_id UUID,
  org_name TEXT
)
RETURNS TABLE(
  organization_id UUID,
  organization_code TEXT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  new_org_id UUID;
  new_org_code TEXT;
BEGIN
  -- Create the organization
  INSERT INTO organizations (name, created_by)
  VALUES (TRIM(org_name), user_id)
  RETURNING id, code INTO new_org_id, new_org_code;
  
  -- Add user as admin
  INSERT INTO organization_memberships (user_id, organization_id, role)
  VALUES (user_id, new_org_id, 'admin');
  
  RETURN QUERY SELECT new_org_id, new_org_code, true, 'Organization created successfully'::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.join_organization_by_code(
  user_id UUID,
  org_code TEXT
)
RETURNS TABLE(
  organization_id UUID,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  found_org_id UUID;
BEGIN
  -- Find organization by code
  SELECT id INTO found_org_id
  FROM organizations
  WHERE code = UPPER(TRIM(org_code)) AND is_active = true;
  
  IF found_org_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, false, 'Organization not found'::TEXT;
    RETURN;
  END IF;
  
  -- Add user as member
  INSERT INTO organization_memberships (user_id, organization_id, role)
  VALUES (user_id, found_org_id, 'member');
  
  RETURN QUERY SELECT found_org_id, true, 'Joined organization successfully'::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, false, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_organization_for_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_organization_by_code TO authenticated;
