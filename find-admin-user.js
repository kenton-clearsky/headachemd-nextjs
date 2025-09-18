#!/usr/bin/env node

/**
 * Find and sync admin user from Firebase Auth to Firestore
 */

require('dotenv').config({ path: '.env.development' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      // Check if we have a complete private key (production) or should use ADC (local dev)
      if (privateKey && privateKey.length > 500) {
        // Production: Use service account credentials
        console.log('🔑 Using service account credentials');
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
      } else {
        // Local development: Use Application Default Credentials
        console.log('🔑 Using Application Default Credentials for local development');
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'headachemd',
        });
      }
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
      throw error;
    }
  }
  return admin.firestore();
}

async function findAdminUser() {
  try {
    console.log('🔍 Searching for admin@headachemd.org user...\n');
    
    const db = initializeFirebaseAdmin();
    
    // Check Firebase Auth
    console.log('📋 Checking Firebase Authentication...');
    try {
      const userRecord = await admin.auth().getUserByEmail('admin@headachemd.org');
      console.log('✅ Found in Firebase Auth:');
      console.log(`   UID: ${userRecord.uid}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Email Verified: ${userRecord.emailVerified}`);
      console.log(`   Disabled: ${userRecord.disabled}`);
      console.log(`   Created: ${new Date(userRecord.metadata.creationTime)}`);
      
      // Check Firestore
      console.log('\n📋 Checking Firestore users collection...');
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      
      if (userDoc.exists) {
        console.log('✅ Found in Firestore:');
        const data = userDoc.data();
        console.log(`   Email: ${data.email}`);
        console.log(`   Role: ${data.role}`);
        console.log(`   Name: ${data.profile?.firstName} ${data.profile?.lastName}`);
        console.log(`   Active: ${data.isActive}`);
      } else {
        console.log('❌ NOT found in Firestore users collection');
        console.log('\n🔧 Creating Firestore user document...');
        
        // Create the missing Firestore document
        const userData = {
          userId: userRecord.uid,
          email: userRecord.email,
          role: 'admin',
          profile: {
            firstName: 'Admin',
            lastName: 'User',
            displayName: 'Admin User',
            phone: '',
            specialty: '',
            dateOfBirth: '',
            gender: '',
            address: null,
            emergencyContact: null
          },
          isActive: !userRecord.disabled,
          emailVerified: userRecord.emailVerified,
          profileComplete: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: null
        };
        
        await db.collection('users').doc(userRecord.uid).set(userData);
        console.log('✅ Created Firestore user document');
      }
      
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log('❌ admin@headachemd.org NOT found in Firebase Auth');
        console.log('\n🔧 You can create it using the API:');
        console.log('POST /api/admin/users with:');
        console.log(JSON.stringify({
          email: 'admin@headachemd.org',
          password: 'headache123!',
          role: 'admin',
          profile: {
            firstName: 'Admin',
            lastName: 'User'
          },
          isActive: true
        }, null, 2));
      } else {
        throw authError;
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findAdminUser();
