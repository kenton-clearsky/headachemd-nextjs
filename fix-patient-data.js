// Simple script to fix patient data structure using client SDK
// This will work with the existing Firebase setup

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, addDoc, Timestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCRJHNyiW8NMqa1DEmEsOouA7lIfFwd9XM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "headachemd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "headachemd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "headachemd.appspot.com",
  messagingSenderId: "109987892469",
  appId: "1:109987892469:web:48875d9a9d65383ff289bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Corrected sample patient data with proper structure
const correctedPatients = [
  {
    mrn: 'MRN001',
    userId: 'user-1',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      dateOfBirth: Timestamp.fromDate(new Date('1985-03-15')),
      gender: 'female',
      address: {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Mike Johnson',
        relationship: 'spouse',
        phoneNumber: '(555) 123-4568'
      }
    },
    medicalHistory: {
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Sumatriptan 50mg', 'Propranolol 40mg'],
      chronicConditions: ['Migraine', 'Hypertension'],
      familyHistory: ['Migraine (mother)', 'Heart disease (father)']
    },
    headacheProfile: {
      onsetAge: 16,
      frequency: 'weekly',
      severity: 8,
      triggers: ['stress', 'bright lights', 'wine'],
      symptoms: ['nausea', 'photophobia', 'phonophobia'],
      location: 'unilateral',
      duration: '4-12 hours'
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BC123456789',
      groupNumber: 'GRP001'
    },
    isActive: true,
    assignedDoctors: [],
    currentTreatments: [],
    appointments: [],
    dailyUpdates: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    mrn: 'MRN002',
    userId: 'user-2',
    profile: {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@email.com',
      phone: '(555) 234-5678',
      dateOfBirth: Timestamp.fromDate(new Date('1978-11-22')),
      gender: 'male',
      address: {
        street: '456 Oak Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Lisa Chen',
        relationship: 'wife',
        phoneNumber: '(555) 234-5679'
      }
    },
    medicalHistory: {
      allergies: ['Aspirin'],
      medications: ['Rizatriptan 10mg', 'Topiramate 50mg'],
      chronicConditions: ['Tension headache', 'Anxiety'],
      familyHistory: ['Anxiety (mother)']
    },
    headacheProfile: {
      onsetAge: 25,
      frequency: 'monthly',
      severity: 6,
      triggers: ['computer work', 'lack of sleep'],
      symptoms: ['tension', 'mild nausea'],
      location: 'bilateral',
      duration: '2-4 hours'
    },
    insurance: {
      provider: 'Kaiser Permanente',
      policyNumber: 'KP987654321',
      groupNumber: 'GRP002'
    },
    isActive: true,
    assignedDoctors: [],
    currentTreatments: [],
    appointments: [],
    dailyUpdates: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    mrn: 'MRN003',
    userId: 'user-3',
    profile: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '(555) 345-6789',
      dateOfBirth: Timestamp.fromDate(new Date('1992-07-08')),
      gender: 'female',
      address: {
        street: '789 Pine St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Carlos Rodriguez',
        relationship: 'brother',
        phoneNumber: '(555) 345-6790'
      }
    },
    medicalHistory: {
      allergies: ['Latex', 'Codeine'],
      medications: ['Eletriptan 40mg', 'Amitriptyline 25mg'],
      chronicConditions: ['Cluster headache', 'Depression'],
      familyHistory: ['Depression (father)', 'Migraine (sister)']
    },
    headacheProfile: {
      onsetAge: 19,
      frequency: 'seasonal',
      severity: 9,
      triggers: ['alcohol', 'strong odors', 'altitude changes'],
      symptoms: ['severe pain', 'eye tearing', 'nasal congestion'],
      location: 'unilateral orbital',
      duration: '30 minutes - 3 hours'
    },
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET456789123',
      groupNumber: 'GRP003'
    },
    isActive: true,
    assignedDoctors: [],
    currentTreatments: [],
    appointments: [],
    dailyUpdates: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function fixPatientData() {
  try {
    console.log('🔧 Starting patient data fix...');
    
    // Delete existing patients
    console.log('🗑️ Deleting existing patients...');
    const patientsSnapshot = await getDocs(collection(db, 'patients'));
    
    const deletePromises = patientsSnapshot.docs.map(docSnapshot => {
      console.log('🗑️ Deleting patient:', docSnapshot.id);
      return deleteDoc(doc(db, 'patients', docSnapshot.id));
    });
    
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${patientsSnapshot.size} patients`);
    
    // Create new patients with correct structure
    console.log('🏥 Creating patients with correct structure...');
    for (const patientData of correctedPatients) {
      const docRef = await addDoc(collection(db, 'patients'), patientData);
      console.log(`✅ Created patient: ${patientData.profile.firstName} ${patientData.profile.lastName} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 Patient data fix complete!');
    
  } catch (error) {
    console.error('❌ Error fixing patient data:', error);
  }
}

fixPatientData();
