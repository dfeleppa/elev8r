-- Updated signup function to handle new metadata structure
-- This version handles is_app_admin instead of role

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE
  org_id UUID;
  org_code TEXT;
  is_app_admin_val BOOLEAN;
  org_name_val TEXT;
BEGIN
  -- Log the incoming user data
  RAISE NOTICE 'Processing new user: %, metadata: %', NEW.email, NEW.raw_user_meta_data;
  
  -- Get is_app_admin flag with fallback
  BEGIN
    is_app_admin_val := COALESCE((NEW.raw_user_meta_data->>'is_app_admin')::BOOLEAN, false);
  EXCEPTION WHEN OTHERS THEN
    is_app_admin_val := false;
    RAISE NOTICE 'Failed to parse is_app_admin, defaulting to false';
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
      is_app_admin_val
    );
    
    RAISE NOTICE 'Created profile for user % with is_app_admin=%', NEW.email, is_app_admin_val;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
  END;
  
  -- Handle organization setup for non-app-admin users
  IF NOT is_app_admin_val THEN
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
      
      -- Add user to organization as member by default
      INSERT INTO organization_memberships (user_id, organization_id, role)
      VALUES (NEW.id, org_id, 'member');
      
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

-- Create or recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
