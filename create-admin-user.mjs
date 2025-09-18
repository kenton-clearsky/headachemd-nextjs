// Create an admin user for testing the dashboard
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, Timestamp, memoryLocalCache } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRJHNyiW8NMqa1DEmEsOouA7lIfFwd9XM",
  authDomain: "headachemd.firebaseapp.com",
  projectId: "headachemd",
  storageBucket: "headachemd.appspot.com",
  messagingSenderId: "109987892469",
  appId: "1:109987892469:web:48875d9a9d65383ff289bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, { 
  localCache: memoryLocalCache()
});

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@headachemd.org', 
      'headache123!'
    );
    
    const firebaseUser = userCredential.user;
    console.log('✅ Created Firebase user:', firebaseUser.uid);
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      email: 'admin@headachemd.org',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      },
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Created admin profile in Firestore');
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@headachemd.org');
    console.log('🔑 Password: headache123!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin user already exists - you can try logging in');
    }
    
    process.exit(1);
  }
}

createAdminUser();
