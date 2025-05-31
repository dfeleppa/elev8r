-- Manual Profile Creation for User: 673281a3-4985-414c-97a9-d44a2475fcab
-- Run this ONLY if the diagnostic shows the profile doesn't exist

-- First, disable RLS temporarily to insert the profile
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Insert the missing profile
INSERT INTO profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  is_app_admin,
  is_active,
  created_at,
  updated_at
) VALUES (
  '673281a3-4985-414c-97a9-d44a2475fcab',
  'admin@elev8.com', -- Change this to the actual email used during signup
  'Admin',
  'User',
  true, -- Set to true if this should be an app admin
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Check if the profile was created
SELECT 'Profile Created' as status;
SELECT id, email, first_name, last_name, is_app_admin, created_at
FROM profiles 
WHERE id = '673281a3-4985-414c-97a9-d44a2475fcab';
