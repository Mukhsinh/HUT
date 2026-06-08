# User Management Setup - Panitia User Implementation

## Summary
Added a new user account `panitia@hutibi.com` with restricted permissions on the `/keuangan` page.

## New User Credentials
- **Email**: panitia@hutibi.com
- **Password**: adminuser
- **Role**: Panitia
- **Permissions**: 
  - ✅ Can access all pages (dashboard, events, gallery, reports, finance)
  - ✅ Can view financial reports and download them
  - ✅ Can view transaction history
  - ❌ **Cannot add/record transactions** on `/keuangan`
  - ❌ **Cannot edit transaction history** on `/keuangan`

## Existing User
- **Email**: sarahsafitri33@gmail.com
- **Password**: Pekalongan33
- **Role**: Admin
- **Permissions**: Full access to all features including transaction management

## Files Modified/Created

### 1. **src/app/login/page.tsx** (Modified)
- Updated authentication logic to support multiple users
- Added role-based login system
- Session now stores role and email information as JSON

### 2. **src/lib/permissions.ts** (New)
- Central permission management utility
- Functions:
  - `getSessionFromCookie()` - Parse session from cookie
  - `canEditTransactions()` - Check if user can edit transactions (admin only)
  - `canAddTransactions()` - Check if user can add transactions (admin only)
  - `canDownloadReports()` - Check if user can download reports (both roles)
  - `canAccessPage()` - Check if user can access page (both roles)
  - `getRoleFromCookie()` - Get user role from cookie

### 3. **src/hooks/useUserPermissions.ts** (New)
- React hook for client-side permission checking
- Returns: `{ role, isLoading, isAdmin, isPanitia }`
- Automatically reads session from cookies on mount

### 4. **src/components/UserBadge.tsx** (New)
- Dynamic user display component
- Shows user initial and name based on logged-in user
- Replaces hardcoded "Sarah" references
- Used in sidebar and header

### 5. **src/app/keuangan/page.tsx** (Modified)
- Integrated permission checking
- "Catat Transaksi" button:
  - Disabled for panitia users with lock icon
  - Enabled for admin users with plus icon
  - Includes hover tooltip explaining access restriction
- "Edit" buttons in transaction history:
  - Only visible for admin users
  - Hidden for panitia users

### 6. **src/app/layout.tsx** (Modified)
- Replaced hardcoded user display with `<UserBadge />` component
- Dynamic user information in sidebar and headers
- Updated imports to include UserBadge component

### 7. **src/middleware.ts** (Minor cleanup)
- Removed incomplete config export to prevent build errors

## How It Works

### Login Flow
1. User enters email and password
2. System checks credentials against both user accounts
3. If matched, sets `auth_session` cookie with JSON containing `{ role, email }`
4. Redirects to dashboard

### Permission Flow
1. Pages requiring permissions use `useUserPermissions()` hook
2. Hook reads cookie and determines user role
3. Components conditionally render or disable based on role
4. Panitia users see disabled "Catat Transaksi" and "Edit" buttons on `/keuangan`

### Session Structure
```json
{
  "role": "admin" | "panitia",
  "email": "user@email.com"
}
```

## Testing Checklist

- [ ] Login with admin credentials (sarahsafitri33@gmail.com / Pekalongan33)
  - [ ] Can see all pages
  - [ ] Can add transactions in `/keuangan`
  - [ ] Can edit transactions in `/keuangan`
  - [ ] User badge shows "Sarah"

- [ ] Login with panitia credentials (panitia@hutibi.com / adminuser)
  - [ ] Can see all pages
  - [ ] **Cannot** add transactions (button disabled with lock icon)
  - [ ] **Cannot** edit transactions (edit button not visible)
  - [ ] Can view transaction history
  - [ ] User badge shows "Panitia"
  - [ ] Can download reports (if implemented)

- [ ] Mobile and desktop views work correctly
  - [ ] User badge displays correctly on sidebar (desktop)
  - [ ] User badge displays correctly on header (mobile)

## Future Enhancements
- Integrate with Supabase Auth for production
- Add more granular permissions (per transaction, per category)
- Implement audit logging for transaction changes
- Add logout functionality
- Add user management dashboard for admins
- Implement session timeout
