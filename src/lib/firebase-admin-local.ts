import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin for local development
 * This version tries multiple authentication methods
 */
export function initializeFirebaseAdminLocal() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  try {
    // Method 1: Try using service account credentials (production method)
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (privateKey && privateKey.length > 500) { // Only if we have a complete key
      console.log('🔑 Using service account credentials');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } else {
      // Method 2: Use Application Default Credentials (local development)
      console.log('🔑 Using Application Default Credentials for local development');
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'headachemd',
      });
    }

    console.log('✅ Firebase Admin initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw error;
  }
}

export default initializeFirebaseAdminLocal;
