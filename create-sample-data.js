// Script to create sample patient data for testing
// Run with: node create-sample-data.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

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

// Sample patient data
const samplePatients = [
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
      medications: ['Rizatriptan 10mg', 'Topiramate 25mg'],
      chronicConditions: ['Cluster headache', 'Sleep apnea'],
      familyHistory: ['Diabetes (father)']
    },
    headacheProfile: {
      onsetAge: 25,
      frequency: 'daily',
      severity: 9,
      triggers: ['alcohol', 'sleep deprivation', 'strong odors'],
      symptoms: ['severe pain', 'restlessness', 'nasal congestion'],
      location: 'orbital',
      duration: '30-90 minutes'
    },
    insurance: {
      provider: 'Kaiser Permanente',
      policyNumber: 'KP987654321',
      groupNumber: 'GRP002'
    },
    isActive: true,
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
      chronicConditions: ['Tension headache', 'Anxiety'],
      familyHistory: ['Migraine (sister)', 'Depression (mother)']
    },
    headacheProfile: {
      onsetAge: 14,
      frequency: 'bi-weekly',
      severity: 6,
      triggers: ['hormonal changes', 'weather changes', 'caffeine withdrawal'],
      symptoms: ['throbbing pain', 'neck tension', 'fatigue'],
      location: 'bilateral',
      duration: '2-6 hours'
    },
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET456789123',
      groupNumber: 'GRP003'
    },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    mrn: 'MRN004',
    userId: 'user-4',
    profile: {
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.thompson@email.com',
      phone: '(555) 456-7890',
      dateOfBirth: Timestamp.fromDate(new Date('1970-12-03')),
      gender: 'male',
      address: {
        street: '321 Elm Dr',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Nancy Thompson',
        relationship: 'wife',
        phoneNumber: '(555) 456-7891'
      }
    },
    medicalHistory: {
      allergies: ['Sulfa drugs'],
      medications: ['Frovatriptan 2.5mg', 'Verapamil 120mg'],
      chronicConditions: ['Chronic migraine', 'High blood pressure'],
      familyHistory: ['Stroke (father)', 'Migraine (mother)']
    },
    headacheProfile: {
      onsetAge: 22,
      frequency: 'daily',
      severity: 7,
      triggers: ['stress', 'skipped meals', 'weather pressure'],
      symptoms: ['pulsating pain', 'nausea', 'visual aura'],
      location: 'frontal',
      duration: '6-24 hours'
    },
    insurance: {
      provider: 'United Healthcare',
      policyNumber: 'UHC789123456',
      groupNumber: 'GRP004'
    },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    mrn: 'MRN005',
    userId: 'user-5',
    profile: {
      firstName: 'Jessica',
      lastName: 'Williams',
      email: 'jessica.williams@email.com',
      phone: '(555) 567-8901',
      dateOfBirth: Timestamp.fromDate(new Date('1988-09-17')),
      gender: 'female',
      address: {
        street: '654 Maple Ln',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Robert Williams',
        relationship: 'husband',
        phoneNumber: '(555) 567-8902'
      }
    },
    medicalHistory: {
      allergies: ['Ibuprofen'],
      medications: ['Naratriptan 2.5mg', 'Gabapentin 300mg'],
      chronicConditions: ['Hemiplegic migraine', 'Fibromyalgia'],
      familyHistory: ['Migraine (mother)', 'Arthritis (grandmother)']
    },
    headacheProfile: {
      onsetAge: 12,
      frequency: 'monthly',
      severity: 9,
      triggers: ['hormones', 'chocolate', 'aged cheese'],
      symptoms: ['weakness', 'speech difficulty', 'visual disturbance'],
      location: 'unilateral',
      duration: '12-48 hours'
    },
    insurance: {
      provider: 'Cigna',
      policyNumber: 'CIG321654987',
      groupNumber: 'GRP005'
    },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Sample appointments
const sampleAppointments = [
  {
    patientId: 'patient_1', // Will be updated with actual patient ID
    doctorId: '4iJBlA0sOaOgHDX69jMCrCrEZdH3', // Your admin user ID
    scheduledDate: '2025-08-15',
    scheduledTime: '10:00',
    appointmentType: 'initial_consultation',
    status: 'scheduled',
    duration: 60,
    notes: 'New patient consultation for chronic headaches',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    patientId: 'patient_2',
    doctorId: '4iJBlA0sOaOgHDX69jMCrCrEZdH3',
    scheduledDate: '2025-08-16',
    scheduledTime: '14:30',
    appointmentType: 'follow_up',
    status: 'scheduled',
    duration: 30,
    notes: 'Follow-up for cluster headache treatment',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Sample treatments
const sampleTreatments = [
  {
    patientId: 'patient_1',
    treatmentName: 'Sumatriptan Therapy',
    dosage: '50mg',
    frequency: 'as needed',
    startDate: '2025-08-01',
    endDate: null,
    prescribedBy: '4iJBlA0sOaOgHDX69jMCrCrEZdH3',
    status: 'active',
    notes: 'For acute migraine episodes',
    sideEffects: [],
    effectiveness: 8,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    patientId: 'patient_2',
    treatmentName: 'Oxygen Therapy',
    dosage: '100% O2 at 12-15 L/min',
    frequency: 'during attacks',
    startDate: '2025-07-15',
    endDate: null,
    prescribedBy: '4iJBlA0sOaOgHDX69jMCrCrEZdH3',
    status: 'active',
    notes: 'High-flow oxygen for cluster headache relief',
    sideEffects: [],
    effectiveness: 9,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function createSampleData() {
  try {
    console.log('🏥 Creating sample patients...');
    
    // Create patients and store their IDs
    const patientIds = [];
    for (let i = 0; i < samplePatients.length; i++) {
      const patient = samplePatients[i];
      const docRef = await addDoc(collection(db, 'patients'), patient);
      patientIds.push(docRef.id);
      console.log(`✅ Created patient: ${patient.firstName} ${patient.lastName} (ID: ${docRef.id})`);
    }

    console.log('\n📅 Creating sample appointments...');
    
    // Update appointments with real patient IDs
    for (let i = 0; i < sampleAppointments.length && i < patientIds.length; i++) {
      const appointment = {
        ...sampleAppointments[i],
        patientId: patientIds[i]
      };
      const docRef = await addDoc(collection(db, 'appointments'), appointment);
      console.log(`✅ Created appointment for patient ${patientIds[i]} (ID: ${docRef.id})`);
    }

    console.log('\n💊 Creating sample treatments...');
    
    // Update treatments with real patient IDs
    for (let i = 0; i < sampleTreatments.length && i < patientIds.length; i++) {
      const treatment = {
        ...sampleTreatments[i],
        patientId: patientIds[i]
      };
      const docRef = await addDoc(collection(db, 'treatments'), treatment);
      console.log(`✅ Created treatment for patient ${patientIds[i]} (ID: ${docRef.id})`);
    }

    console.log('\n🎉 === SAMPLE DATA CREATION COMPLETE ===');
    console.log(`👥 Created ${samplePatients.length} patients`);
    console.log(`📅 Created ${sampleAppointments.length} appointments`);
    console.log(`💊 Created ${sampleTreatments.length} treatments`);
    console.log('\n✅ Your admin dashboard should now show sample data!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

createSampleData();
