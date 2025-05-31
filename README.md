# 🏆 ELEV8 - Multi-Organization Gym Management System

## 🎯 System Overview

ELEV8 is a sophisticated multi-organization gym management platform built with Next.js and Supabase. The system supports multiple gyms/organizations under one platform, with role-based access control and comprehensive user management.

## 🏗️ Architecture

### Database Structure
```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────────┐
│   auth.users    │    │   profiles      │    │   organizations      │
│                 │    │                 │    │                      │
│ - id (PK)       │◄───┤ - id (FK)       │    │ - id (PK)            │
│ - email         │    │ - email         │    │ - name               │
│ - created_at    │    │ - first_name    │    │ - code (unique)      │
│                 │    │ - last_name     │    │ - created_by         │
└─────────────────┘    │ - is_app_admin  │    │ - is_active          │
                       └─────────────────┘    └──────────────────────┘
                                │                        │
                                └────────┐      ┌────────┘
                                         │      │
                              ┌──────────▼──────▼──────────┐
                              │ organization_memberships   │
                              │                            │
                              │ - id (PK)                  │
                              │ - user_id (FK)             │
                              │ - organization_id (FK)     │
                              │ - role (enum)              │
                              │ - is_active                │
                              └────────────────────────────┘
```

### Role Hierarchy
1. **App Admin** 🔧 - Global platform administrator
   - Create and manage organizations
   - Assign organization administrators
   - View all users and organizations
   - Access App Admin Dashboard

2. **Admin** 👑 - Organization administrator
   - Manage their organization
   - Add/remove members
   - Manage organization settings

3. **Staff** 🏃‍♀️ - Organization staff member
   - Limited organization management
   - Staff-specific features

4. **Member** 🎯 - Basic organization member
   - Access organization services
   - Basic member features

## 🔐 Security Features

### Row Level Security (RLS)
- **Profiles**: Users can only see their own profile; App Admins see all
- **Organizations**: Users see only organizations they belong to; App Admins see all
- **Memberships**: Users see memberships for their organizations only

### Multi-Organization Support
- Users can belong to multiple organizations
- Different roles in different organizations
- Organization-specific permissions and data isolation

## 🚀 Key Features

### ✅ Completed Features

1. **Authentication System**
   - Email/password authentication via Supabase
   - Automatic profile creation with role assignment
   - Session management with React Context

2. **App Admin Dashboard**
   - Create new organizations
   - Assign organization administrators
   - View all users and organizations
   - Organization code generation

3. **Multi-Organization Support**
   - Users can join multiple organizations
   - Role assignments per organization
   - Organization switching interface

4. **Role-Based Access Control**
   - Database-level security with RLS
   - UI components adapt to user roles
   - Secure API access patterns

### 🔄 Architecture Ready For

1. **Gym Management Features**
   - Class scheduling and booking
   - Equipment management
   - Trainer assignments
   - Member progress tracking

2. **Business Operations**
   - Membership management
   - Payment processing
   - Reporting and analytics
   - Staff scheduling

3. **Enhanced UI/UX**
   - Organization dashboards
   - Member portals
   - Mobile responsiveness
   - Real-time notifications

## 📁 Project Structure

```
elev8r/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Main auth/routing logic
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── app-admin-dashboard.tsx     # App Admin interface
│   └── organization-selector.tsx   # Multi-org navigation
├── contexts/
│   └── auth-context.tsx           # Authentication state
├── hooks/
│   └── use-profile.tsx            # Profile & org management
├── lib/
│   ├── supabase.ts               # Database client & types
│   └── utils.ts                  # Utility functions
├── supabase-schema.sql           # Complete database schema
├── DATABASE_SETUP.md             # Deployment instructions
└── SUPABASE_SETUP.md            # Configuration guide
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Context, Custom Hooks
- **Deployment**: Vercel-ready

## 📋 Setup Instructions

### 1. Database Deployment
Follow the comprehensive guide in `DATABASE_SETUP.md` to:
- Deploy the multi-organization schema to Supabase
- Set up Row Level Security policies
- Configure authentication triggers

### 2. Environment Configuration
Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Testing the System
1. Create an App Admin account
2. Create test organizations
3. Assign users as organization administrators
4. Test multi-organization workflows

## 🎯 Usage Scenarios

### Scenario 1: Gym Chain Management
- **App Admin**: Chain owner manages multiple gym locations
- **Admins**: Individual gym managers
- **Staff**: Trainers and front desk staff
- **Members**: Gym members with location-specific access

### Scenario 2: Franchise System
- **App Admin**: Franchise headquarters
- **Admins**: Franchise owners
- **Staff**: Location employees
- **Members**: Local customers

### Scenario 3: Corporate Wellness
- **App Admin**: Corporate wellness provider
- **Admins**: Company wellness coordinators
- **Staff**: Fitness instructors
- **Members**: Company employees

## 🚀 Next Development Phase

1. **Organization Dashboards**
   - Member management interfaces
   - Class scheduling systems
   - Equipment tracking

2. **Member Features**
   - Class booking
   - Progress tracking
   - Payment management

3. **Advanced Administration**
   - Reporting and analytics
   - Bulk user management
   - Organization templates

4. **Mobile Experience**
   - Responsive design optimization
   - Progressive Web App features
   - Push notifications

## 🎉 Success Metrics

The system is successfully implemented when:
- ✅ App Admins can create and manage organizations
- ✅ Users can belong to multiple organizations
- ✅ Role-based access control works correctly
- ✅ Database security policies are enforced
- ✅ Multi-organization workflows are seamless

**ELEV8 is now ready to scale to support multiple gym organizations with sophisticated role-based access control!** 🏆
