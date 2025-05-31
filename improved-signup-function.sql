-- Simplified and Safe User Signup Function
-- This version has better error handling and logging

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE
  org_id UUID;
  org_code TEXT;
  user_role_val user_role;
  org_name_val TEXT;
BEGIN
  -- Log the incoming user data
  RAISE NOTICE 'Processing new user: %, metadata: %', NEW.email, NEW.raw_user_meta_data;
  
  -- Determine user role with fallback
  BEGIN
    user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member');
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'member';
    RAISE NOTICE 'Failed to parse role, defaulting to member';
  END;
  
  -- Insert user profile with error handling
  BEGIN
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
      COALESCE(TRIM(NEW.raw_user_meta_data->>'first_name'), 'User'),
      COALESCE(TRIM(NEW.raw_user_meta_data->>'last_name'), 'Name'),
      user_role_val = 'app-admin'
    );
    
    RAISE NOTICE 'Created profile for user %', NEW.email;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
  END;
  
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
      
      RAISE NOTICE 'Added user % to existing organization %', NEW.email, org_code;
      
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
      
      RAISE NOTICE 'Created new organization % for user %', org_name_val, NEW.email;
      
    ELSE
      RAISE NOTICE 'No organization info provided for user %, skipping org setup', NEW.email;
    END IF;
  ELSE
    RAISE NOTICE 'App admin user %, no organization setup needed', NEW.email;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'User signup failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
