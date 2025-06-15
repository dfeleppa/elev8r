-- Run this in the Supabase SQL Editor to add extended profile fields
-- This will allow the users page to display comprehensive profile information

-- Add extended profile fields to the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Emergency contact information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Medical information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medications TEXT;

-- Fitness information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitness_goals TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_workout_time TEXT;

-- Add some sample data for testing (optional)
UPDATE profiles 
SET 
  phone = CASE 
    WHEN email LIKE '%admin%' THEN '+1-555-0101'
    WHEN email LIKE '%test%' THEN '+1-555-0102'
    ELSE '+1-555-' || LPAD((random() * 9999)::int::text, 4, '0')
  END,
  city = CASE 
    WHEN email LIKE '%admin%' THEN 'New York'
    WHEN email LIKE '%test%' THEN 'San Francisco'
    ELSE 'Sample City'
  END,
  state = CASE 
    WHEN email LIKE '%admin%' THEN 'NY'
    WHEN email LIKE '%test%' THEN 'CA'
    ELSE 'XX'
  END,
  bio = CASE 
    WHEN is_app_admin THEN 'Administrator with extensive system access and management responsibilities.'
    ELSE 'Active user of the ELEV8R platform with various fitness and wellness goals.'
  END,
  fitness_goals = CASE 
    WHEN email LIKE '%admin%' THEN 'Maintain overall health and wellness'
    WHEN email LIKE '%test%' THEN 'Weight loss and strength training'
    ELSE 'General fitness and health improvement'
  END
WHERE id IS NOT NULL;
