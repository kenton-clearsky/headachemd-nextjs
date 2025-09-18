import { test, expect } from '@playwright/test';

test.describe('Simple CRUD Test', () => {
  const baseUrl = 'https://headachemd-nextjs-sznczbmgha-uc.a.run.app';
  
  test('Test individual CRUD operations step by step', async ({ request }) => {
    console.log('🔍 Testing individual CRUD operations...');
    
    // Step 1: Test READ (GET all users)
    console.log('📖 Step 1: Testing READ operation...');
    const getResponse = await request.get(`${baseUrl}/api/admin/users`);
    console.log('GET /api/admin/users status:', getResponse.status());
    
    if (getResponse.status() === 200) {
      const usersData = await getResponse.json();
      console.log(`✅ READ: Found ${usersData.users.length} users`);
      
      // Step 2: Test CREATE (POST new user)
      console.log('📝 Step 2: Testing CREATE operation...');
      const testUser = {
        email: `test-crud-${Date.now()}@example.com`,
        password: 'testpassword123',
        role: 'patient',
        profile: {
          firstName: 'Test',
          lastName: 'CRUD',
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
      console.log('POST /api/admin/users status:', createResponse.status());
      
      if (createResponse.status() === 200) {
        const createResult = await createResponse.json();
        console.log(`✅ CREATE: User created with ID: ${createResult.user.id}`);
        const newUserId = createResult.user.id;
        
        // Step 3: Test READ individual user (GET by ID)
        console.log('📖 Step 3: Testing READ individual user...');
        const getIndividualResponse = await request.get(`${baseUrl}/api/admin/users/${newUserId}`);
        console.log(`GET /api/admin/users/${newUserId} status:`, getIndividualResponse.status());
        
        if (getIndividualResponse.status() === 200) {
          const individualUser = await getIndividualResponse.json();
          console.log(`✅ READ individual: User found - ${individualUser.email}`);
          
          // Step 4: Test UPDATE (PUT user)
          console.log('✏️ Step 4: Testing UPDATE operation...');
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
          console.log(`PUT /api/admin/users/${newUserId} status:`, updateResponse.status());
          
          if (updateResponse.status() === 200) {
            console.log('✅ UPDATE: User updated successfully');
            
            // Step 5: Test PASSWORD RESET
            console.log('🔐 Step 5: Testing PASSWORD RESET...');
            const resetPasswordResponse = await request.post(`${baseUrl}/api/admin/users/${newUserId}/reset-password`, {
              data: { newPassword: 'newpassword123' }
            });
            console.log(`POST /api/admin/users/${newUserId}/reset-password status:`, resetPasswordResponse.status());
            
            if (resetPasswordResponse.status() === 200) {
              console.log('✅ PASSWORD RESET: Password reset successfully');
              
              // Step 6: Test SEND RESET EMAIL
              console.log('📧 Step 6: Testing SEND RESET EMAIL...');
              const sendEmailResponse = await request.post(`${baseUrl}/api/admin/users/${newUserId}/send-reset-email`);
              console.log(`POST /api/admin/users/${newUserId}/send-reset-email status:`, sendEmailResponse.status());
              
              if (sendEmailResponse.status() === 200) {
                console.log('✅ SEND RESET EMAIL: Reset email sent successfully');
                
                // Step 7: Test DELETE
                console.log('🗑️ Step 7: Testing DELETE operation...');
                const deleteResponse = await request.delete(`${baseUrl}/api/admin/users/${newUserId}`);
                console.log(`DELETE /api/admin/users/${newUserId} status:`, deleteResponse.status());
                
                if (deleteResponse.status() === 200) {
                  console.log('✅ DELETE: User deleted successfully');
                  console.log('🎉 All CRUD operations completed successfully!');
                } else {
                  const deleteError = await deleteResponse.text();
                  console.log('❌ DELETE failed:', deleteError);
                }
              } else {
                const emailError = await sendEmailResponse.text();
                console.log('❌ SEND RESET EMAIL failed:', emailError);
              }
            } else {
              const resetError = await resetPasswordResponse.text();
              console.log('❌ PASSWORD RESET failed:', resetError);
            }
          } else {
            const updateError = await updateResponse.text();
            console.log('❌ UPDATE failed:', updateError);
          }
        } else {
          const individualError = await getIndividualResponse.text();
          console.log('❌ READ individual failed:', individualError);
        }
      } else {
        const createError = await createResponse.text();
        console.log('❌ CREATE failed:', createError);
      }
    } else {
      const getError = await getResponse.text();
      console.log('❌ READ failed:', getError);
    }
  });
});
