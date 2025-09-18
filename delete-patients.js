const admin = require('firebase-admin');

const serviceAccount = require('./firebase-data/auth_export/serviceAccountKey.json');

// Initialize Firebase Admin with environment variables or fallback
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || 'headachemd';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: projectId
});

const db = admin.firestore();

async function deleteAllPatients() {
  try {
    console.log('🗑️ Deleting existing patient data...');
    
    // Get all patients
    const patientsSnapshot = await db.collection('patients').get();
    
    if (patientsSnapshot.empty) {
      console.log('📋 No patients found to delete');
      return;
    }
    
    // Delete all patient documents
    const batch = db.batch();
    patientsSnapshot.docs.forEach((doc) => {
      console.log('🗑️ Marking patient for deletion:', doc.id);
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Deleted ${patientsSnapshot.size} patients`);
    
    // Also delete related appointments and treatments
    const appointmentsSnapshot = await db.collection('appointments').get();
    if (!appointmentsSnapshot.empty) {
      const appointmentsBatch = db.batch();
      appointmentsSnapshot.docs.forEach((doc) => {
        appointmentsBatch.delete(doc.ref);
      });
      await appointmentsBatch.commit();
      console.log(`✅ Deleted ${appointmentsSnapshot.size} appointments`);
    }
    
    const treatmentsSnapshot = await db.collection('treatments').get();
    if (!treatmentsSnapshot.empty) {
      const treatmentsBatch = db.batch();
      treatmentsSnapshot.docs.forEach((doc) => {
        treatmentsBatch.delete(doc.ref);
      });
      await treatmentsBatch.commit();
      console.log(`✅ Deleted ${treatmentsSnapshot.size} treatments`);
    }
    
    console.log('🎉 All existing data deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error deleting patients:', error);
  } finally {
    process.exit(0);
  }
}

deleteAllPatients();
