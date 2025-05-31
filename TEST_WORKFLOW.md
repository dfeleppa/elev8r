# 🧪 ELEV8 Testing Workflow

## Phase 1: Database Schema Deployment
✅ **COMPLETE** - Schema deployed via Supabase SQL Editor

## Phase 2: Authentication & User Creation Testing

### Test 1: Create App Admin
1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000`
3. Click **"Sign up"**
4. Create App Admin:
   - **Role**: App Admin
   - **Email**: `admin@elev8.test`
   - **Password**: `admin123456`
   - **First Name**: `Super`
   - **Last Name**: `Admin`
5. Confirm email (check Supabase Auth dashboard)
6. Sign in and verify App Admin dashboard appears

### Test 2: Create Organization Admin
1. Sign out from App Admin
2. Click **"Sign up"**
3. Create Organization Admin:
   - **Role**: Admin
   - **Organization Name**: `Elite Fitness Gym`
   - **Email**: `admin@elitefitness.test`
   - **Password**: `admin123456`
   - **First Name**: `John`
   - **Last Name**: `Manager`
4. Verify new organization created with unique code
5. Sign in and verify Organization Admin dashboard

### Test 3: Join Existing Organization
1. Sign out and sign up again
2. Create Staff member:
   - **Role**: Staff
   - **Organization Code**: [Use code from Elite Fitness Gym]
   - **Email**: `staff@elitefitness.test`
   - **Password**: `staff123456`
   - **First Name**: `Jane`
   - **Last Name**: `Trainer`
3. Verify user joins existing organization

### Test 4: App Admin Organization Management
1. Sign in as App Admin
2. Navigate to Organizations section
3. Create new organization: `Downtown CrossFit`
4. Assign John Manager as admin
5. Verify organization shows up in system

## Phase 3: UI/UX Testing

### Test 5: Role-Based Navigation
- **App Admin**: Should see all navigation items
- **Admin**: Should see organization management items
- **Staff**: Should see limited staff items
- **Member**: Should see basic member items

### Test 6: Theme Toggle
- Test dark/light mode switching
- Verify persistence across page refreshes
- Check all components render correctly in both themes

### Test 7: Organization Switching
- Users with multiple organization memberships
- Test organization selector in header
- Verify context switching works correctly

## Phase 4: Advanced Features Testing

### Test 8: Multi-Organization User
1. Sign in as App Admin
2. Add existing user to multiple organizations
3. Test organization switching functionality
4. Verify role-based permissions in each org

### Test 9: Search Functionality
- Test global search in header
- Verify placeholder text appears
- Test search functionality (when implemented)

### Test 10: Notifications System
- Test notifications popover
- Verify notification badge appears
- Test notification interactions (when implemented)

## Success Criteria ✅

- [ ] App Admin can create and manage organizations
- [ ] Organization Admins can manage their organization
- [ ] Users can join organizations via codes
- [ ] Role-based navigation works correctly
- [ ] Theme switching persists
- [ ] Multi-organization membership works
- [ ] Database permissions enforce security
- [ ] All layouts render properly
- [ ] Authentication flow works end-to-end

## Next Development Phase

After successful testing:
1. **Member Management Pages**
   - Add/edit/remove organization members
   - Bulk member operations
   - Member profile management

2. **Gym-Specific Features**
   - Class scheduling system
   - Equipment management
   - Membership plans
   - Check-in/check-out system

3. **Advanced Organization Features**
   - Organization settings
   - Billing management
   - Reports and analytics
   - Staff scheduling

4. **Enhanced UI Components**
   - Data tables with sorting/filtering
   - Charts and graphs
   - File upload capabilities
   - Real-time updates
