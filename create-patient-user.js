// Create a Firebase user that matches one of our sample patients
// This will allow testing the patient portal with real data

const admin = require('firebase-admin');

// Initialize Firebase Admin (simplified setup)
const serviceAccount = {
  projectId: 'headachemd',
  // Using simplified setup for development
};

// Check if app is already initialized
let app;
if (admin.apps.length === 0) {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'headachemd'
  });
  console.log('✅ Firebase Admin initialized');
} else {
  app = admin.app();
  console.log('✅ Using existing Firebase Admin app');
}

const auth = admin.auth();
const db = admin.firestore();

async function createPatientUser() {
  try {
    console.log('👤 Creating patient user for Sarah Johnson...');
    
    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: 'sarah.johnson@email.com',
      password: 'patient123',
      displayName: 'Sarah Johnson',
      emailVerified: true
    });
    
    console.log('✅ Created Firebase user:', userRecord.uid);
    
    // Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: 'sarah.johnson@email.com',
      role: 'patient',
      profile: {
        firstName: 'Sarah',
        lastName: 'Johnson'
      },
      isActive: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    console.log('✅ Created user profile in Firestore');
    
    // Update the patient record to link to this user
    const patientsSnapshot = await db.collection('patients')
      .where('profile.email', '==', 'sarah.johnson@email.com')
      .get();
    
    if (!patientsSnapshot.empty) {
      const patientDoc = patientsSnapshot.docs[0];
      await patientDoc.ref.update({
        userId: userRecord.uid,
        updatedAt: admin.firestore.Timestamp.now()
      });
      console.log('✅ Linked patient record to Firebase user');
    }
    
    console.log('🎉 Patient user created successfully!');
    console.log('📧 Email: sarah.johnson@email.com');
    console.log('🔑 Password: patient123');
    console.log('👤 Role: patient');
    
  } catch (error) {
    console.error('❌ Error creating patient user:', error);
  } finally {
    process.exit(0);
  }
}

createPatientUser();
