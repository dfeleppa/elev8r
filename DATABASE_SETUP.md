# 🚀 Database Setup Instructions - ELEV8 Multi-Organization System

## 📋 Overview

This guide will help you deploy the complete multi-organization database schema to Supabase. The system supports App Admins who can create organizations and assign administrators, with users able to have different roles in different organizations.

## 🔧 Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project: `https://pzqrhtcpbmvwxxifwfez.supabase.co`
3. Navigate to the **SQL Editor** tab in the left sidebar

## 📊 Step 2: Deploy the Schema

1. Open the file `supabase-schema.sql` in your project
2. Copy the entire contents of the file (306 lines)
3. In the Supabase SQL Editor, paste the SQL code
4. Click **RUN** to execute the schema

**✅ This will create:**
- `user_role` enum type (`app-admin`, `admin`, `staff`, `member`)
- `organizations` table with auto-generated codes
- `profiles` table for user information
- `organization_memberships` junction table for multi-org support
- Database triggers for automatic profile creation
- Row Level Security (RLS) policies for secure access
- Helper functions for common operations
- Performance indexes

## 🔍 Step 3: Verify Setup

After running the SQL, verify these tables exist in **Database > Tables**:
- ✅ `organizations`
- ✅ `profiles` 
- ✅ `organization_memberships`

Check that the enum type exists in **Database > Types**:
- ✅ `user_role`

## 🧪 Step 4: Test the Application

### 4.1 Start Development Server
```powershell
npm run dev
```

### 4.2 Access the Application
Go to `http://localhost:3000`

### 4.3 Create First App Admin
1. Click **"Sign up"**
2. Fill in the form:
   - **Role**: App Admin
   - **Email**: `admin@test.com`
   - **Password**: `password123`
   - **Name**: `Admin User`
3. Click **"Create Account"**
4. Check your email and confirm the account

### 4.4 Sign In as App Admin
1. Sign in with the admin credentials
2. You should see the **App Admin Dashboard** with:
   - Organizations management panel
   - Users management panel
   - "Create Organization" button

### 4.5 Create Test Organization
1. Click **"Create Organization"**
2. Enter organization name: `Test Gym`
3. You'll need another user to assign as admin - create one first:
   - Sign out and create a regular user account
   - Use role "Admin" and create an organization (they'll be admin of their own org)
   - Sign back in as App Admin
4. Select the user as administrator
5. Click **"Create Organization"**
6. Note the organization code generated

## 🏗️ Architecture Features

### 🔐 Security (Row Level Security)
- App Admins can see all organizations and users
- Regular users can only see organizations they belong to
- Organization admins can manage their own organization
- Automatic user profile creation on signup

### 🏢 Multi-Organization Support
- Users can belong to multiple organizations
- Different roles in different organizations
- Organization-specific permissions
- Unique organization codes for joining

### 👥 Role Hierarchy
1. **App Admin** - Global system administrator
2. **Admin** - Organization administrator
3. **Staff** - Organization staff member
4. **Member** - Basic organization member

## 🔄 Next Steps

After successful setup:

1. **Create More Organizations**
   - Use App Admin dashboard to create organizations
   - Assign different users as administrators

2. **Build Organization Features**
   - Member management within organizations
   - Organization-specific dashboards
   - Role-based UI components

3. **Add Business Logic**
   - Gym class scheduling
   - Membership management
   - Staff scheduling
   - Equipment tracking

4. **Enhance UI**
   - Organization switching
   - Role-based navigation
   - Member dashboards

## 🛠️ Database Functions Available

- `get_user_organizations(user_uuid)` - Get all organizations for a user
- `create_organization_with_admin(org_name, admin_user_id)` - Create org with admin
- Automatic profile creation trigger on user signup
- Organization code generation

## 🔧 Troubleshooting

### Schema Deployment Issues
- Ensure you're signed in to the correct Supabase project
- Check for any SQL syntax errors in the editor
- Verify no existing tables with same names

### Authentication Issues
- Confirm email verification is working
- Check Supabase Auth settings
- Verify environment variables in `.env.local`

### Permission Issues
- Ensure RLS policies are active
- Check user roles are assigned correctly
- Verify database grants are in place

## ✅ Success Indicators

You've successfully set up the system when:
- ✅ App Admin can create organizations
- ✅ Organizations get unique codes
- ✅ Users can be assigned as organization administrators
- ✅ Role-based dashboards work correctly
- ✅ Multi-organization membership functions

The ELEV8 platform is now ready for multi-organization gym management! 🎉
