// Script to query Firestore and see what data exists
// Run with: node query-firestore.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase config
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

async function queryAllCollections() {
  console.log('🔍 Querying Firestore database: headachemd\n');

  try {
    // Check users collection
    console.log('👥 === USERS COLLECTION ===');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 Total users: ${usersSnapshot.size}`);
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  🆔 ${doc.id}`);
      console.log(`  📧 Email: ${data.email}`);
      console.log(`  👤 Role: ${data.role}`);
      console.log(`  👤 Name: ${data.profile?.firstName} ${data.profile?.lastName}`);
      console.log(`  ✅ Active: ${data.isActive}`);
      console.log('  ---');
    });

    // Check patients collection
    console.log('\n🏥 === PATIENTS COLLECTION ===');
    const patientsSnapshot = await getDocs(collection(db, 'patients'));
    console.log(`📊 Total patients: ${patientsSnapshot.size}`);
    
    if (patientsSnapshot.size > 0) {
      patientsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  🆔 ${doc.id}`);
        console.log(`  👤 Name: ${data.firstName} ${data.lastName}`);
        console.log(`  📧 Email: ${data.email}`);
        console.log(`  📅 DOB: ${data.dateOfBirth}`);
        console.log(`  📱 Phone: ${data.phoneNumber}`);
        console.log('  ---');
      });
    } else {
      console.log('  ⚠️ No patients found in database');
    }

    // Check appointments collection
    console.log('\n📅 === APPOINTMENTS COLLECTION ===');
    const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
    console.log(`📊 Total appointments: ${appointmentsSnapshot.size}`);
    
    if (appointmentsSnapshot.size > 0) {
      appointmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  🆔 ${doc.id}`);
        console.log(`  👤 Patient: ${data.patientId}`);
        console.log(`  📅 Date: ${data.scheduledDate}`);
        console.log(`  ⏰ Time: ${data.scheduledTime}`);
        console.log(`  📋 Type: ${data.appointmentType}`);
        console.log('  ---');
      });
    } else {
      console.log('  ⚠️ No appointments found in database');
    }

    // Check treatments collection
    console.log('\n💊 === TREATMENTS COLLECTION ===');
    const treatmentsSnapshot = await getDocs(collection(db, 'treatments'));
    console.log(`📊 Total treatments: ${treatmentsSnapshot.size}`);
    
    if (treatmentsSnapshot.size > 0) {
      treatmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  🆔 ${doc.id}`);
        console.log(`  👤 Patient: ${data.patientId}`);
        console.log(`  💊 Treatment: ${data.treatmentName}`);
        console.log(`  📅 Date: ${data.startDate}`);
        console.log('  ---');
      });
    } else {
      console.log('  ⚠️ No treatments found in database');
    }

    // Check for other collections
    console.log('\n📋 === COLLECTION SUMMARY ===');
    console.log(`👥 Users: ${usersSnapshot.size} documents`);
    console.log(`🏥 Patients: ${patientsSnapshot.size} documents`);
    console.log(`📅 Appointments: ${appointmentsSnapshot.size} documents`);
    console.log(`💊 Treatments: ${treatmentsSnapshot.size} documents`);

  } catch (error) {
    console.error('❌ Error querying Firestore:', error);
  }
}

queryAllCollections();
