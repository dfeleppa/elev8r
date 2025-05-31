# ELEV8 - Supabase Setup Instructions

## Prerequisites
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Setup Steps

### 1. Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy your Project URL and anon public key

### 2. Configure Environment Variables
1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL commands to create the necessary tables and functions
5. Verify that `organizations` and `profiles` tables were created with the role-based system

### 4. Configure Authentication
1. In your Supabase dashboard, go to Authentication → Settings
2. Configure your auth providers as needed
3. Set up email templates if desired

### 5. Test the Integration
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try creating a new account and logging in

## Features Included

### Authentication
- User registration with email/password
- User login/logout
- Automatic profile creation on signup
- Session management with React Context

### Database Integration
- User profiles table with RLS (Row Level Security)
- Automatic profile creation triggers
- Type-safe database operations

### User Types
- **App-Admin**: Platform-wide administrator (no organization required)
- **Admin**: Organization administrator with full gym management access
- **Staff**: Gym staff member with limited management access  
- **Member**: Gym member with basic access to services

## Project Structure

```
lib/
  supabase.ts          # Supabase client configuration
contexts/
  auth-context.tsx     # Authentication context provider
hooks/
  use-profile.tsx      # Hook for profile management
```

## Next Steps

1. **Deploy the database schema** to Supabase using the SQL Editor
2. **Test user registration** with different roles (member, staff, admin, app-admin)
3. **Verify organization creation and joining** functionality with organization codes
4. **Implement role-based UI components** for different access levels
5. **Add organization management features** for admins
6. **Create role-specific dashboards** and workflows
7. Set up real-time subscriptions for live updates

## Troubleshooting

- **Connection Issues**: Verify your environment variables are correct
- **Auth Errors**: Check your Supabase auth configuration
- **Database Errors**: Ensure the schema is properly set up with correct permissions
- **RLS Issues**: Verify Row Level Security policies are configured correctly
