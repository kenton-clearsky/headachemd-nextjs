#!/usr/bin/env node

/**
 * Comprehensive audit of Firebase Auth vs Firestore users
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

async function auditUsers() {
  try {
    console.log('🔍 Comprehensive User Audit\n');
    
    const db = initializeFirebaseAdmin();
    
    // Get all users from Firebase Auth
    console.log('📋 Fetching Firebase Auth users...');
    const listUsersResult = await admin.auth().listUsers();
    const authUsers = listUsersResult.users;
    
    // Get all users from Firestore
    console.log('📋 Fetching Firestore users...');
    const firestoreSnapshot = await db.collection('users').get();
    const firestoreUsers = {};
    firestoreSnapshot.docs.forEach(doc => {
      firestoreUsers[doc.id] = doc.data();
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Firebase Auth users: ${authUsers.length}`);
    console.log(`   Firestore users: ${firestoreSnapshot.size}`);
    
    // Find users with "admin" in email
    console.log(`\n🔍 Users with "admin" in email address:`);
    const adminEmailUsers = authUsers.filter(user => 
      user.email && user.email.toLowerCase().includes('admin')
    );
    
    if (adminEmailUsers.length === 0) {
      console.log('   ℹ️ No users found with "admin" in email');
    } else {
      adminEmailUsers.forEach(user => {
        const inFirestore = firestoreUsers[user.uid] ? '✅' : '❌';
        const role = firestoreUsers[user.uid]?.role || 'N/A';
        console.log(`   ${inFirestore} ${user.email} (${user.uid}) - Role: ${role}`);
      });
    }
    
    // Find users missing from Firestore
    console.log(`\n❌ Firebase Auth users MISSING from Firestore:`);
    const missingFromFirestore = authUsers.filter(user => !firestoreUsers[user.uid]);
    
    if (missingFromFirestore.length === 0) {
      console.log('   ✅ All Firebase Auth users exist in Firestore');
    } else {
      missingFromFirestore.forEach(user => {
        console.log(`   📧 ${user.email || 'No email'} (${user.uid})`);
        console.log(`      Created: ${new Date(user.metadata.creationTime)}`);
        console.log(`      Email Verified: ${user.emailVerified}`);
        console.log(`      Disabled: ${user.disabled}`);
      });
      
      console.log(`\n🔧 Would you like to sync these ${missingFromFirestore.length} users to Firestore? (Y/n)`);
    }
    
    // Find Firestore users missing from Auth (orphaned)
    console.log(`\n⚠️ Firestore users MISSING from Firebase Auth (orphaned):`);
    const authUserIds = new Set(authUsers.map(user => user.uid));
    const orphanedUsers = Object.keys(firestoreUsers).filter(uid => !authUserIds.has(uid));
    
    if (orphanedUsers.length === 0) {
      console.log('   ✅ No orphaned Firestore users found');
    } else {
      orphanedUsers.forEach(uid => {
        const userData = firestoreUsers[uid];
        console.log(`   📧 ${userData.email || 'No email'} (${uid}) - Role: ${userData.role}`);
      });
    }
    
    // Show all admin role users
    console.log(`\n👑 All users with admin role in Firestore:`);
    const adminRoleUsers = Object.entries(firestoreUsers).filter(([uid, data]) => data.role === 'admin');
    
    if (adminRoleUsers.length === 0) {
      console.log('   ℹ️ No admin role users found in Firestore');
    } else {
      adminRoleUsers.forEach(([uid, data]) => {
        const inAuth = authUserIds.has(uid) ? '✅' : '❌';
        console.log(`   ${inAuth} ${data.email} (${uid})`);
        console.log(`      Name: ${data.profile?.firstName} ${data.profile?.lastName}`);
        console.log(`      Active: ${data.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

auditUsers();
