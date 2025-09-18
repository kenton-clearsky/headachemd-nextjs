// Create an admin user for testing the dashboard
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { doc, setDoc, Timestamp } = require('firebase/firestore');

// We'll use the client SDK since admin SDK setup is complex
const { auth, db } = require('./src/lib/firebase/client.ts');

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
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin user already exists - you can try logging in');
    }
  }
}

createAdminUser();
