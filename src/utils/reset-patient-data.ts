import { db } from '@/lib/firebase/config';
import { collection, getDocs, deleteDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { config } from '@/lib/config';

// Update any hardcoded values to use config
const adminEmail = config.app.infoEmail;

// Sample patient data with correct structure
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

export async function deleteAllPatients() {
  try {
    console.log('🗑️ Deleting existing patient data...');
    
    // Get all patients
    const patientsSnapshot = await getDocs(collection(db, 'patients'));
    
    if (patientsSnapshot.empty) {
      console.log('📋 No patients found to delete');
      return;
    }
    
    // Delete all patient documents
    const deletePromises = patientsSnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'patients', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${patientsSnapshot.size} patients`);
    
    // Also delete related appointments and treatments
    const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
    if (!appointmentsSnapshot.empty) {
      const appointmentDeletePromises = appointmentsSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'appointments', docSnapshot.id))
      );
      await Promise.all(appointmentDeletePromises);
      console.log(`✅ Deleted ${appointmentsSnapshot.size} appointments`);
    }
    
    const treatmentsSnapshot = await getDocs(collection(db, 'treatments'));
    if (!treatmentsSnapshot.empty) {
      const treatmentDeletePromises = treatmentsSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'treatments', docSnapshot.id))
      );
      await Promise.all(treatmentDeletePromises);
      console.log(`✅ Deleted ${treatmentsSnapshot.size} treatments`);
    }
    
    console.log('🎉 All existing data deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error deleting patients:', error);
    throw error;
  }
}

export async function createSamplePatients() {
  try {
    console.log('🏥 Creating sample patients with correct structure...');
    
    for (const patientData of samplePatients) {
      const docRef = await addDoc(collection(db, 'patients'), patientData);
      console.log(`✅ Created patient: ${patientData.profile.firstName} ${patientData.profile.lastName} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 Sample patients created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample patients:', error);
    throw error;
  }
}

export async function resetPatientData() {
  try {
    await deleteAllPatients();
    await createSamplePatients();
    console.log('🎉 Patient data reset complete!');
  } catch (error) {
    console.error('❌ Error resetting patient data:', error);
    throw error;
  }
}
