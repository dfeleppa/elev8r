-- Add extended profile fields to support comprehensive user information
-- This migration adds personal, contact, medical, and fitness information fields

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

-- Add indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

COMMENT ON COLUMN profiles.phone IS 'User primary phone number';
COMMENT ON COLUMN profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN profiles.address IS 'Street address';
COMMENT ON COLUMN profiles.city IS 'City of residence';
COMMENT ON COLUMN profiles.state IS 'State/Province of residence';
COMMENT ON COLUMN profiles.zip_code IS 'ZIP/Postal code';
COMMENT ON COLUMN profiles.country IS 'Country of residence';
COMMENT ON COLUMN profiles.profile_picture_url IS 'URL to user profile picture';
COMMENT ON COLUMN profiles.bio IS 'User biography/description';
COMMENT ON COLUMN profiles.emergency_contact_name IS 'Emergency contact full name';
COMMENT ON COLUMN profiles.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN profiles.emergency_contact_relationship IS 'Relationship to emergency contact';
COMMENT ON COLUMN profiles.medical_conditions IS 'Known medical conditions';
COMMENT ON COLUMN profiles.allergies IS 'Known allergies';
COMMENT ON COLUMN profiles.medications IS 'Current medications';
COMMENT ON COLUMN profiles.fitness_goals IS 'User fitness goals and objectives';
COMMENT ON COLUMN profiles.preferred_workout_time IS 'Preferred time for workouts';
