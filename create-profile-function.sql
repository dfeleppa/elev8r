-- Create a function that can create profiles with proper security
-- This bypasses RLS by running as SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  is_app_admin BOOLEAN DEFAULT false
)
RETURNS TABLE(
  profile_id UUID,
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Insert the profile
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    is_app_admin,
    is_active
  )
  VALUES (
    user_id,
    user_email,
    TRIM(first_name),
    TRIM(last_name),
    is_app_admin,
    true
  );
  
  RETURN QUERY SELECT user_id, true, 'Profile created successfully'::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT user_id, false, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
