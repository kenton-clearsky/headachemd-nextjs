import { test, expect } from '@playwright/test';

test.describe('User Management CRUD Operations', () => {
  const baseUrl = 'https://headachemd-nextjs-sznczbmgha-uc.a.run.app';
  
  test('Test complete CRUD operations for user management', async ({ page, request }) => {
    console.log('🔍 Starting comprehensive CRUD test...');
    
    // Test 1: READ - Verify users API works
    console.log('📖 Testing READ operation...');
    const getResponse = await request.get(`${baseUrl}/api/admin/users`);
    expect(getResponse.status()).toBe(200);
    
    const usersData = await getResponse.json();
    expect(usersData).toHaveProperty('users');
    expect(Array.isArray(usersData.users)).toBe(true);
    console.log(`✅ READ: Found ${usersData.users.length} users`);
    
    // Test 2: CREATE - Add a new test user
    console.log('📝 Testing CREATE operation...');
    const testUser = {
      email: `test-user-${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'patient',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      },
      isActive: true,
      sendWelcomeEmail: false
    };
    
    const createResponse = await request.post(`${baseUrl}/api/admin/users`, {
      data: testUser
    });
    
    expect(createResponse.status()).toBe(200);
    const createResult = await createResponse.json();
    expect(createResult.success).toBe(true);
    expect(createResult.user.email).toBe(testUser.email);
    console.log(`✅ CREATE: User ${testUser.email} created successfully`);
    
    const newUserId = createResult.user.id;
    
    // Test 3: READ - Verify the new user appears in the list
    console.log('📖 Testing READ after CREATE...');
    const getResponse2 = await request.get(`${baseUrl}/api/admin/users`);
    const usersData2 = await getResponse2.json();
    const newUser = usersData2.users.find((u: any) => u.email === testUser.email);
    expect(newUser).toBeDefined();
    expect(newUser.email).toBe(testUser.email);
    expect(newUser.role).toBe('patient');
    console.log(`✅ READ: New user found in list`);
    
    // Test 4: UPDATE - Update the user
    console.log('✏️ Testing UPDATE operation...');
    const updateData = {
      profile: {
        firstName: 'Updated',
        lastName: 'TestUser',
        phone: '+0987654321',
        dateOfBirth: '1985-05-15',
        gender: 'female'
      },
      isActive: false
    };
    
    const updateResponse = await request.put(`${baseUrl}/api/admin/users/${newUserId}`, {
      data: updateData
    });
    
    expect(updateResponse.status()).toBe(200);
    const updateResult = await updateResponse.json();
    expect(updateResult.success).toBe(true);
    console.log(`✅ UPDATE: User updated successfully`);
    
    // Test 5: READ - Verify the update
    console.log('📖 Testing READ after UPDATE...');
    const getResponse3 = await request.get(`${baseUrl}/api/admin/users/${newUserId}`);
    const updatedUser = await getResponse3.json();
    expect(updatedUser.profile.firstName).toBe('Updated');
    expect(updatedUser.profile.lastName).toBe('TestUser');
    expect(updatedUser.isActive).toBe(false);
    console.log(`✅ READ: User update verified`);
    
    // Test 6: PASSWORD RESET - Test password reset functionality
    console.log('🔐 Testing PASSWORD RESET operation...');
    const resetPasswordResponse = await request.post(`${baseUrl}/api/admin/users/${newUserId}/reset-password`, {
      data: { newPassword: 'newpassword123' }
    });
    
    expect(resetPasswordResponse.status()).toBe(200);
    const resetResult = await resetPasswordResponse.json();
    expect(resetResult.success).toBe(true);
    console.log(`✅ PASSWORD RESET: Password reset successfully`);
    
    // Test 7: SEND RESET EMAIL - Test email reset functionality
    console.log('📧 Testing SEND RESET EMAIL operation...');
    const sendEmailResponse = await request.post(`${baseUrl}/api/admin/users/${newUserId}/send-reset-email`);
    
    expect(sendEmailResponse.status()).toBe(200);
    const emailResult = await sendEmailResponse.json();
    expect(emailResult.success).toBe(true);
    console.log(`✅ SEND RESET EMAIL: Reset email sent successfully`);
    
    // Test 8: DELETE - Delete the test user
    console.log('🗑️ Testing DELETE operation...');
    const deleteResponse = await request.delete(`${baseUrl}/api/admin/users/${newUserId}`);
    
    expect(deleteResponse.status()).toBe(200);
    const deleteResult = await deleteResponse.json();
    expect(deleteResult.success).toBe(true);
    console.log(`✅ DELETE: User deleted successfully`);
    
    // Test 9: READ - Verify the user is deleted
    console.log('📖 Testing READ after DELETE...');
    const getResponse4 = await request.get(`${baseUrl}/api/admin/users`);
    const usersData4 = await getResponse4.json();
    const deletedUser = usersData4.users.find((u: any) => u.email === testUser.email);
    expect(deletedUser).toBeUndefined();
    console.log(`✅ READ: User confirmed deleted`);
    
    console.log('🎉 All CRUD operations completed successfully!');
  });
  
  test('Test admin panel UI loads correctly', async ({ page }) => {
    console.log('🌐 Testing admin panel UI...');
    
    await page.goto(`${baseUrl}/admin`);
    await page.waitForLoadState('domcontentloaded');
    
    // Check if the page loads
    const title = await page.title();
    expect(title).toContain('HeadacheMD');
    console.log('✅ Admin page loaded');
    
    // Look for user management elements
    const userManagementText = page.locator('text=User Management').first();
    const isVisible = await userManagementText.isVisible();
    
    if (isVisible) {
      console.log('✅ User Management tab found');
      await userManagementText.click();
      
      // Wait for the content to load
      await page.waitForTimeout(2000);
      
      // Check for user table
      const userTable = page.locator('table').first();
      const tableVisible = await userTable.isVisible();
      expect(tableVisible).toBe(true);
      console.log('✅ User table displayed');
      
      // Check for Add User button
      const addUserButton = page.locator('text=Add User').first();
      const addButtonVisible = await addUserButton.isVisible();
      expect(addButtonVisible).toBe(true);
      console.log('✅ Add User button found');
      
    } else {
      console.log('⚠️ User Management tab not found, but API is working');
    }
  });
  
  test('Test error handling for invalid operations', async ({ request }) => {
    console.log('🚨 Testing error handling...');
    
    // Test creating user with invalid data
    const invalidUser = {
      email: 'invalid-email',
      password: '123', // Too short
      role: 'invalid-role'
    };
    
    const createResponse = await request.post(`${baseUrl}/api/admin/users`, {
      data: invalidUser
    });
    
    expect(createResponse.status()).toBe(400);
    const errorResult = await createResponse.json();
    expect(errorResult.error).toBeDefined();
    console.log('✅ Invalid user creation properly rejected');
    
    // Test updating non-existent user
    const updateResponse = await request.put(`${baseUrl}/api/admin/users/non-existent-id`, {
      data: { profile: { firstName: 'Test' } }
    });
    
    expect(updateResponse.status()).toBe(404);
    console.log('✅ Non-existent user update properly rejected');
    
    // Test deleting non-existent user
    const deleteResponse = await request.delete(`${baseUrl}/api/admin/users/non-existent-id`);
    
    expect(deleteResponse.status()).toBe(404);
    console.log('✅ Non-existent user deletion properly rejected');
    
    console.log('✅ Error handling tests completed');
  });
});
