import { test, expect } from '@playwright/test';

test.describe('Debug Users API', () => {
  test('Debug Firebase users API 500 error', async ({ page, request }) => {
    const baseUrl = 'https://headachemd-nextjs-sznczbmgha-uc.a.run.app';
    
    console.log('🔍 Testing users API endpoint...');
    
    // Test the API endpoint directly
    const response = await request.get(`${baseUrl}/api/admin/users`);
    
    console.log('📊 Response status:', response.status());
    console.log('📊 Response headers:', response.headers());
    
    if (response.status() !== 200) {
      const responseText = await response.text();
      console.log('❌ Error response body:', responseText);
      
      // Try to parse as JSON for better error details
      try {
        const errorData = JSON.parse(responseText);
        console.log('❌ Parsed error data:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('❌ Could not parse error response as JSON');
      }
    } else {
      const responseData = await response.json();
      console.log('✅ Success response:', JSON.stringify(responseData, null, 2));
      console.log('📊 Number of users:', responseData.users?.length || 0);
    }
    
    // Also test the admin page to see the full flow
    console.log('🌐 Testing admin page...');
    await page.goto(`${baseUrl}/admin`);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if there are any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 Browser console error:', msg.text());
      } else if (msg.type() === 'log') {
        console.log('📝 Browser console log:', msg.text());
      }
    });
    
    // Look for the User Management tab and click it
    const userManagementTab = page.locator('text=User Management').first();
    if (await userManagementTab.isVisible()) {
      console.log('👆 Clicking User Management tab...');
      await userManagementTab.click();
      
      // Wait a bit for the API call to complete
      await page.waitForTimeout(3000);
      
      // Check for any error messages on the page
      const errorElements = page.locator('[data-testid="error"], .error, [role="alert"]');
      const errorCount = await errorElements.count();
      
      if (errorCount > 0) {
        console.log('❌ Found error elements on page:');
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorElements.nth(i).textContent();
          console.log(`  Error ${i + 1}:`, errorText);
        }
      }
      
      // Check if users are loaded
      const userRows = page.locator('tbody tr');
      const userCount = await userRows.count();
      console.log('👥 Number of user rows displayed:', userCount);
      
      if (userCount === 0) {
        console.log('⚠️ No users displayed - checking for loading states...');
        const loadingElements = page.locator('[data-testid="loading"], .loading, .MuiCircularProgress-root');
        const loadingCount = await loadingElements.count();
        console.log('⏳ Loading elements found:', loadingCount);
      }
    } else {
      console.log('❌ User Management tab not found');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-users-api.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-users-api.png');
  });
  
  test('Test direct API call with detailed logging', async ({ request }) => {
    const baseUrl = 'https://headachemd-nextjs-sznczbmgha-uc.a.run.app';
    
    console.log('🔍 Making direct API call to /api/admin/users...');
    
    try {
      const response = await request.get(`${baseUrl}/api/admin/users`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📊 Response details:');
      console.log('  Status:', response.status());
      console.log('  Status Text:', response.statusText());
      console.log('  Headers:', Object.fromEntries(Object.entries(response.headers())));
      
      const responseText = await response.text();
      console.log('📄 Raw response body length:', responseText.length);
      console.log('📄 Raw response body (first 500 chars):', responseText.substring(0, 500));
      
      if (response.status() === 200) {
        try {
          const data = JSON.parse(responseText);
          console.log('✅ Successfully parsed JSON response');
          console.log('📊 Response structure:', Object.keys(data));
          console.log('👥 Number of users:', data.users?.length || 'undefined');
          
          if (data.users && data.users.length > 0) {
            console.log('👤 First user sample:', JSON.stringify(data.users[0], null, 2));
          }
        } catch (parseError) {
          console.log('❌ Failed to parse response as JSON:', parseError);
        }
      } else {
        console.log('❌ API returned error status');
      }
      
    } catch (error) {
      console.log('💥 Request failed with error:', error);
    }
  });
});
