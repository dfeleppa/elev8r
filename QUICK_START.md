# 🚀 Quick Start Guide - ELEV8 Platform

## Immediate Next Steps

### 1. 📊 Deploy Database Schema (CRITICAL)
**You have Supabase dashboard open at: `https://pzqrhtcpbmvwxxifwfez.supabase.co`**

1. Click **SQL Editor** in left sidebar
2. Copy ALL content from `supabase-schema.sql` (306 lines)
3. Paste into SQL Editor
4. Click **RUN**

✅ This creates your complete multi-organization database!

### 2. 🖥️ Start Development Server
**Double-click:** `start-dev.bat`

**OR run manually:**
```bash
cd "C:\Users\Daniel\elev8r"
npm run dev
```

🌐 **Visit:** `http://localhost:3000`

### 3. 🧪 Test the Platform

#### Create App Admin (Super User)
- Click **"Sign up"** 
- **Role:** App Admin
- **Email:** `admin@elev8.test`
- **Password:** `admin123456`
- **Name:** Super Admin

#### Create Organization Admin
- Sign out, then **"Sign up"** again
- **Role:** Admin
- **Organization Name:** Elite Fitness Gym
- **Email:** `manager@elitefitness.test`
- **Password:** `admin123456`
- **Name:** John Manager

#### Test Organization Joining
- Sign out, then **"Sign up"** again
- **Role:** Staff
- **Organization Code:** [Use code from Elite Fitness]
- **Email:** `staff@elitefitness.test`
- **Password:** `staff123456`
- **Name:** Jane Trainer

## 🎯 What You Should See

### ✅ App Admin Dashboard
- Global organizations view
- Create organization button
- Manage all users
- Full system access

### ✅ Organization Admin Dashboard
- Organization member management
- Organization-specific features
- Staff management tools

### ✅ Enhanced Features
- 🌙 Dark/light theme toggle
- 🔍 Enhanced search bar
- 🔔 Notifications popover
- 👤 User menu with role badges
- 🏢 Organization selector
- 📱 Responsive mobile design

## 🎉 Success Indicators

- [ ] Database schema deployed without errors
- [ ] Development server starts successfully
- [ ] App Admin can create organizations
- [ ] Users can join organizations with codes
- [ ] Role-based navigation shows correctly
- [ ] Theme switching works
- [ ] Dashboard displays appropriate content

## 🆘 Troubleshooting

### Database Issues
- Ensure you're logged into correct Supabase project
- Check for SQL syntax errors in editor
- Verify environment variables in `.env.local`

### Server Issues
- Check Node.js installation
- Verify all npm packages installed
- Check port 3000 is available

### Authentication Issues
- Confirm email verification settings in Supabase
- Check Auth policies are enabled
- Verify user creation triggers

## 📞 Ready for Next Phase!
Once testing is complete, you'll be ready to add:
- Member management features
- Class scheduling system
- Equipment tracking
- Billing and subscription management

**Your ELEV8 platform is ready to elevate gym management! 🏋️‍♂️**
