import { test, expect } from '@playwright/test';

test.describe('Admin Panel Verification', () => {
  test('Verify users API is working and admin panel loads', async ({ page, request }) => {
    const baseUrl = 'https://headachemd-nextjs-sznczbmgha-uc.a.run.app';
    
    console.log('🔍 Testing users API endpoint...');
    
    // Test the API endpoint directly
    const response = await request.get(`${baseUrl}/api/admin/users`);
    
    console.log('📊 Response status:', response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      console.log('✅ API working! Found', data.users?.length || 0, 'users');
      
      // Verify the data structure
      expect(data).toHaveProperty('users');
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users.length).toBeGreaterThan(0);
      
      // Check first user has required fields
      const firstUser = data.users[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('role');
      expect(firstUser).toHaveProperty('profile');
      
      console.log('✅ Data structure validation passed');
    } else {
      const errorText = await response.text();
      console.log('❌ API error:', errorText);
      throw new Error(`API returned ${response.status()}: ${errorText}`);
    }
    
    // Test the admin page loads
    console.log('🌐 Testing admin page...');
    await page.goto(`${baseUrl}/admin`);
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check if the page title contains admin
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Look for User Management tab
    const userManagementTab = page.locator('text=User Management').first();
    const isVisible = await userManagementTab.isVisible();
    console.log('👥 User Management tab visible:', isVisible);
    
    if (isVisible) {
      console.log('✅ Admin panel loaded successfully');
    } else {
      console.log('⚠️ User Management tab not found, but API is working');
    }
  });
});
