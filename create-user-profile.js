// Quick script to create user profile in Firestore for existing Firebase Auth user
// Run with: node create-user-profile.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase config (using your real project)
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
const db = getFirestore(app);

async function createUserProfile() {
  try {
    // Your Firebase Auth user UID
    const userUID = '4iJBlA0sOaOgHDX69jMCrCrEZdH3';
    
    const userProfile = {
      email: 'kenton@clearskyinnovations.ai',
      role: 'admin',
      profile: {
        firstName: 'Kenton',
        lastName: 'Grinde',
        title: 'System Administrator'
      },
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: Timestamp.now()
    };

    await setDoc(doc(db, 'users', userUID), userProfile);
    
    console.log('✅ Successfully created user profile in Firestore!');
    console.log('📧 Email:', userProfile.email);
    console.log('👤 Role:', userProfile.role);
    console.log('🆔 UID:', userUID);
    
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
  }
}

createUserProfile();
