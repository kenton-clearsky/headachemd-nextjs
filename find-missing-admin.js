#!/usr/bin/env node

/**
 * Find Firebase Auth users with admin@ emails that are missing from Firestore
 */

require('dotenv').config({ path: '.env.development' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (privateKey && privateKey.length > 500) {
        console.log('🔑 Using service account credentials');
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
      } else {
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

async function findMissingAdminUsers() {
  try {
    console.log('🔍 Searching for Firebase Auth users with admin@ emails...\n');
    
    const db = initializeFirebaseAdmin();
    
    // Get all users from Firebase Auth
    console.log('📋 Fetching all Firebase Auth users...');
    const listUsersResult = await admin.auth().listUsers();
    
    console.log(`📊 Found ${listUsersResult.users.length} total users in Firebase Auth\n`);
    
    // Filter for admin@ emails
    const adminUsers = listUsersResult.users.filter(user => 
      user.email && user.email.startsWith('admin@')
    );
    
    console.log(`🔍 Found ${adminUsers.length} users with admin@ emails:`);
    
    for (const authUser of adminUsers) {
      console.log(`\n👤 Checking: ${authUser.email}`);
      console.log(`   UID: ${authUser.uid}`);
      console.log(`   Email Verified: ${authUser.emailVerified}`);
      console.log(`   Disabled: ${authUser.disabled}`);
      console.log(`   Created: ${new Date(authUser.metadata.creationTime)}`);
      
      // Check if exists in Firestore
      const userDoc = await db.collection('users').doc(authUser.uid).get();
      
      if (userDoc.exists) {
        const data = userDoc.data();
        console.log(`   ✅ EXISTS in Firestore - Role: ${data.role}`);
      } else {
        console.log(`   ❌ MISSING from Firestore`);
        console.log(`   🔧 Creating Firestore document...`);
        
        // Create the missing Firestore document
        const userData = {
          userId: authUser.uid,
          email: authUser.email,
          role: 'admin',
          profile: {
            firstName: 'Admin',
            lastName: 'User',
            displayName: authUser.displayName || 'Admin User',
            phone: authUser.phoneNumber || '',
            specialty: '',
            dateOfBirth: '',
            gender: '',
            address: null,
            emergencyContact: null
          },
          isActive: !authUser.disabled,
          emailVerified: authUser.emailVerified,
          profileComplete: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: null
        };
        
        await db.collection('users').doc(authUser.uid).set(userData);
        console.log(`   ✅ Created Firestore document for ${authUser.email}`);
      }
    }
    
    if (adminUsers.length === 0) {
      console.log('ℹ️ No users found with admin@ email addresses in Firebase Auth');
    }
    
    console.log('\n🎉 Sync complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findMissingAdminUsers();
