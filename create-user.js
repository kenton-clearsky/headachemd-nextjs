// Quick utility to create a Firebase user for testing
// Run with: node create-user.js

const admin = require('firebase-admin');

const serviceAccount = require('./firebase-data/auth_export/serviceAccountKey.json');

// Initialize Firebase Admin with environment variables or fallback
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || 'headachemd';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: projectId
});

async function createTestUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'kenton@test.com',
      password: 'TestPassword123!',
      displayName: 'Kenton Test User',
    });

    console.log('✅ Successfully created user:', userRecord.uid);
    console.log('📧 Email:', userRecord.email);
    console.log('🔑 Password: TestPassword123!');
    
    // Also create user profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      role: 'admin',
      profile: {
        firstName: 'Kenton',
        lastName: 'Test'
      },
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ User profile created in Firestore');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

createTestUser();
