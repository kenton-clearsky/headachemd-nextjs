import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, Firestore, memoryLocalCache, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import { config } from '@/lib/config';

// Get configuration from centralized service
const firebaseConfig = config.firebase;
const useFirebaseEmulators = config.useFirebaseEmulators;

// Initialize Firebase only if it hasn't been initialized
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
let db: Firestore;

// Use memory cache only to avoid persistence layer conflicts
db = initializeFirestore(app, { 
  localCache: memoryLocalCache()
});

export { db };
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Connect to real Firebase cloud
console.log('🌐 Firebase connecting to cloud:', firebaseConfig.projectId);

// Add error handling for authentication
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ User authenticated:', user.email);
  } else {
    console.log('ℹ️ No user authenticated');
  }
}, (error) => {
  console.error('❌ Firebase auth error:', error);
});

if (config.debug.enableLogging) {
  console.log('📋 Full Firebase config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket
  });
}

export default app;
