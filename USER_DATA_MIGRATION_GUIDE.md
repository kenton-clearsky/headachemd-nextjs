# User Data Migration Guide

## Overview

This guide outlines the migration from separate `users`, `patients`, `doctors`, and `admins` collections to a single, consolidated `users` collection with role-based access control.

## Why Consolidate?

### ✅ **Advantages of Single Collection Approach:**

1. **Simplified Authentication & Authorization**
   - Firebase Auth + Firestore rules work seamlessly with single collection
   - Existing `hasRole()` hierarchy system works perfectly
   - No need to duplicate authentication logic across collections

2. **Consistent Data Model**
   - All users share common fields (email, profile, timestamps)
   - Role-specific data stored in nested objects
   - Easier to maintain and query

3. **Better Performance**
   - Single query to get user data
   - No need to join across multiple collections
   - Firebase rules are simpler and faster

4. **Easier User Management**
   - Current `ConsolidatedUserManagement` component works with single collection
   - Role changes don't require moving documents between collections
   - Simpler CRUD operations

5. **Future-Proof**
   - Easy to add new roles without restructuring
   - Role hierarchy can be extended
   - Better for analytics and reporting

## Current Data Structure

### Before Migration:
```
users/
  ├── user1 (admin)
  ├── user2 (doctor)
  └── user3 (patient)

patients/
  ├── patient1 (detailed medical data)
  ├── patient2 (detailed medical data)
  └── patient3 (detailed medical data)

doctors/ (empty)
admins/ (empty)
```

### After Migration:
```
users/
  ├── user1 (role: admin)
  ├── user2 (role: doctor, specialty: "Neurology")
  ├── user3 (role: patient, patientData: {...})
  └── user4 (role: nurse)
```

## Migration Process

### Step 1: Run Migration Script

```bash
# Make sure you have Node.js and Firebase access
node migrate-user-data.js
```

The migration script will:
1. ✅ Preserve all existing users in the `users` collection
2. ✅ Migrate patient data from `patients` collection to `users` collection
3. ✅ Ensure all users have proper role assignments
4. ✅ Maintain data integrity and relationships
5. ✅ Store patient-specific data in nested `patientData` object

### Step 2: Verify Migration

After running the migration script, verify:
- [ ] All users are in the `users` collection
- [ ] Patient data is properly nested under `patientData`
- [ ] Roles are correctly assigned
- [ ] No data loss occurred

### Step 3: Update Application Code

The following components have been updated to work with the consolidated structure:

1. **ConsolidatedUserManagement** - New component for managing all users
2. **Admin Dashboard** - Updated to use consolidated user management
3. **API Routes** - Updated to work with single collection

## New Data Structure

### User Document Schema

```typescript
interface User {
  id: string;
  userId: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'nurse' | 'staff';
  isActive: boolean;
  emailVerified: boolean;
  profileComplete: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    firstName: string;
    lastName: string;
    displayName: string;
    phone?: string;
    specialty?: string; // For doctors
    dateOfBirth?: string; // For patients
    gender?: string; // For patients
    address?: any; // For patients
    emergencyContact?: any; // For patients
  };
  patientData?: { // Only for patients
    mrn: string;
    medicalHistory: any;
    headacheProfile: any;
    insurance: any;
    assignedDoctors: string[];
    currentTreatments: any[];
    appointments: any[];
    dailyUpdates: any[];
  };
}
```

## Access Control

### Role-Based Access

The system uses a role hierarchy for access control:

```typescript
const roleHierarchy = {
  [UserRole.PATIENT]: 1,
  [UserRole.NURSE]: 2,
  [UserRole.STAFF]: 3,
  [UserRole.DOCTOR]: 4,
  [UserRole.ADMIN]: 5,
  [UserRole.ADMIN_TEST]: 5,
};
```

### Dashboard Access

- **Admin Dashboard**: `role === 'admin' || role === 'doctor'`
- **Patient Dashboard**: `role === 'patient' || role === 'admin'` (for testing)

### Firestore Rules

The existing Firestore rules already work with the consolidated structure:

```javascript
// Users can read/write/delete their own profile
match /users/{userId} {
  allow read, write, delete: if request.auth != null && request.auth.uid == userId;
}

// Medical collections (restrict writes to admin/doctor)
match /patients/{patientId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null
    && (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'doctor']);
}
```

## Benefits After Migration

### 1. **Simplified User Management**
- Single interface to manage all user types
- Role changes don't require moving documents
- Consistent user experience across all roles

### 2. **Better Performance**
- Single query to get user data
- Faster authentication checks
- Reduced complexity in data fetching

### 3. **Easier Maintenance**
- Single data model to maintain
- Consistent error handling
- Simplified testing

### 4. **Enhanced Analytics**
- Unified user data for reporting
- Easier to track user behavior across roles
- Better insights into user patterns

## Rollback Plan

If issues arise after migration:

1. **Backup Data**: The migration script preserves original data
2. **Revert Code**: Switch back to `EnhancedUserManagement` component
3. **Restore Collections**: Use Firebase console to restore from backup
4. **Test Thoroughly**: Verify all functionality works as expected

## Testing Checklist

After migration, test the following:

- [ ] User login/logout works for all roles
- [ ] Admin dashboard loads correctly
- [ ] Patient dashboard loads correctly
- [ ] User management interface works
- [ ] Role-based permissions work
- [ ] Patient data is accessible
- [ ] EMR integration still works
- [ ] Analytics and reporting work

## Next Steps

1. **Run Migration**: Execute the migration script
2. **Test Thoroughly**: Verify all functionality works
3. **Update Documentation**: Update any relevant documentation
4. **Train Users**: Inform users about any interface changes
5. **Monitor**: Watch for any issues in production

## Support

If you encounter any issues during migration:

1. Check the migration script logs
2. Verify Firebase permissions
3. Test with a small subset of data first
4. Contact the development team for assistance

---

**Note**: This migration is designed to be non-destructive and preserves all existing data while providing a more maintainable and performant structure.
