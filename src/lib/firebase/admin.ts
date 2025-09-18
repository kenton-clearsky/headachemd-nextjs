import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from '@/lib/config';

// Initialize Firebase Admin only if it hasn't been initialized
let adminApp;
if (getApps().length === 0) {
  try {
    // Try to use service account credentials
    const serviceAccount: ServiceAccount = {
      projectId: config.firebaseAdmin.projectId,
      clientEmail: config.firebaseAdmin.clientEmail,
      privateKey: config.firebaseAdmin.privateKey.replace(/\\n/g, '\n'),
    };

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: config.firebaseAdmin.projectId,
    });

    console.log('✅ Firebase Admin initialized with service account');
  } catch (error) {
    console.warn('⚠️ Firebase Admin service account failed, using default credentials');
    
    // Fallback to default credentials (for development)
    adminApp = initializeApp({
      projectId: config.firebaseAdmin.projectId,
    });
  }
} else {
  adminApp = getApps()[0];
}

// Export Firebase Admin services
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export default adminApp;
