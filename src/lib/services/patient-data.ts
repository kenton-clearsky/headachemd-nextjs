import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Patient, DailyUpdate, Treatment, Appointment } from '@/types/medical';

/**
 * Get patient data by user email (linking Firebase Auth to patient records)
 */
export async function getPatientByUserEmail(email: string): Promise<Patient | null> {
  try {
    console.log('🔍 Fetching patient data for user email:', email);
    
    const patientsQuery = query(
      collection(db, 'patients'),
      where('profile.email', '==', email),
      limit(1)
    );
    
    const snapshot = await getDocs(patientsQuery);
    
    if (snapshot.empty) {
      console.log('❌ No patient record found for email:', email);
      return null;
    }
    
    const patientDoc = snapshot.docs[0];
    const data = patientDoc.data();
    
    console.log('✅ Found patient record:', patientDoc.id);
    
    // Convert Firestore data to Patient type
    const patient: Patient = {
      id: patientDoc.id,
      userId: data.userId || '',
      mrn: data.mrn || '',
      profile: {
        firstName: data.profile?.firstName || '',
        lastName: data.profile?.lastName || '',
        dateOfBirth: data.profile?.dateOfBirth?.toDate ? data.profile.dateOfBirth.toDate() : 
                     (data.profile?.dateOfBirth instanceof Date ? data.profile.dateOfBirth : 
                     (typeof data.profile?.dateOfBirth === 'string' ? new Date(data.profile.dateOfBirth) : new Date())),
        gender: data.profile?.gender || 'other',
        phone: data.profile?.phone || '',
        email: data.profile?.email || '',
        address: data.profile?.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        emergencyContact: data.profile?.emergencyContact || {
          name: '',
          relationship: '',
          phoneNumber: ''
        },
        insurance: data.profile?.insurance,
        preferredLanguage: data.profile?.preferredLanguage,
        allergies: data.profile?.allergies || [],
        medications: data.profile?.medications || []
      },
      medicalHistory: data.medicalHistory || {
        allergies: [],
        medications: [],
        chronicConditions: [],
        familyHistory: [],
        surgicalHistory: [],
        socialHistory: {
          smokingStatus: 'never',
          alcoholUse: 'none',
          exerciseFrequency: 'none',
          occupation: '',
          maritalStatus: 'single'
        },
        reviewOfSystems: {
          constitutional: false,
          cardiovascular: false,
          respiratory: false,
          gastrointestinal: false,
          genitourinary: false,
          musculoskeletal: false,
          integumentary: false,
          neurological: false,
          psychiatric: false,
          endocrine: false,
          hematologic: false,
          allergic: false
        },
        headacheHistory: {
          onsetAge: 0,
          frequency: 'occasional',
          duration: '',
          intensity: 5,
          location: [],
          triggers: [],
          relievingFactors: [],
          associatedSymptoms: [],
          previousTreatments: [],
          familyHistoryOfHeadaches: false
        }
      },
      currentTreatments: data.currentTreatments || [],
      appointments: data.appointments || [],
      dailyUpdates: data.dailyUpdates || [],
      isActive: data.isActive !== false,
      assignedDoctors: data.assignedDoctors || [],
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : 
                 (data.createdAt instanceof Date ? data.createdAt : 
                 (typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date())),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                 (data.updatedAt instanceof Date ? data.updatedAt : 
                 (typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : new Date()))
    };
    
    return patient;
  } catch (error) {
    console.error('❌ Error fetching patient by email:', error);
    return null;
  }
}

/**
 * Get daily updates for a specific patient
 */
export async function getPatientDailyUpdates(patientId: string): Promise<DailyUpdate[]> {
  try {
    console.log('📊 Fetching daily updates for patient:', patientId);
    
    const updatesQuery = query(
      collection(db, 'dailyUpdates'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
      limit(30) // Last 30 days
    );
    
    const snapshot = await getDocs(updatesQuery);
    const updates: DailyUpdate[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      updates.push({
        id: doc.id,
        patientId: data.patientId,
        date: data.date?.toDate ? data.date.toDate() : 
              (data.date instanceof Date ? data.date : 
              (typeof data.date === 'string' ? new Date(data.date) : new Date())),
        painLevel: data.painLevel || 0,
        headacheFrequency: data.headacheFrequency || 0,
        triggers: data.triggers || [],
        medications: data.medications || [],
        sleepHours: data.sleepHours || 0,
        stressLevel: data.stressLevel || 0,
        exerciseMinutes: data.exerciseMinutes || 0,
        notes: data.notes || '',
        mood: data.mood || 'neutral',
        functionalStatus: data.functionalStatus || 'normal',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : 
                   (data.createdAt instanceof Date ? data.createdAt : 
                   (typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date()))
      });
    });
    
    console.log('✅ Found', updates.length, 'daily updates');
    return updates;
  } catch (error) {
    console.error('❌ Error fetching daily updates:', error);
    return [];
  }
}

/**
 * Get treatments for a specific patient
 */
export async function getPatientTreatments(patientId: string): Promise<Treatment[]> {
  try {
    console.log('💊 Fetching treatments for patient:', patientId);
    
    const treatmentsQuery = query(
      collection(db, 'treatments'),
      where('patientId', '==', patientId),
      orderBy('startDate', 'desc')
    );
    
    const snapshot = await getDocs(treatmentsQuery);
    const treatments: Treatment[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      treatments.push({
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId || '',
        type: data.type || 'medication',
        description: data.description || '',
        startDate: data.startDate?.toDate ? data.startDate.toDate() : 
                   (data.startDate instanceof Date ? data.startDate : 
                   (typeof data.startDate === 'string' ? new Date(data.startDate) : new Date())),
        endDate: data.endDate?.toDate ? data.endDate.toDate() : 
                 (data.endDate instanceof Date ? data.endDate : 
                 (typeof data.endDate === 'string' ? new Date(data.endDate) : null)),
        status: data.status || 'active',
        notes: data.notes || '',
        outcomes: data.outcomes || [],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : 
                   (data.createdAt instanceof Date ? data.createdAt : 
                   (typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date())),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                   (data.updatedAt instanceof Date ? data.updatedAt : 
                   (typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : new Date()))
      });
    });
    
    console.log('✅ Found', treatments.length, 'treatments');
    return treatments;
  } catch (error) {
    console.error('❌ Error fetching treatments:', error);
    return [];
  }
}

/**
 * Get appointments for a specific patient
 */
export async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
  try {
    console.log('📅 Fetching appointments for patient:', patientId);
    
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('scheduledDate', 'desc'),
      limit(20)
    );
    
    const snapshot = await getDocs(appointmentsQuery);
    const appointments: Appointment[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId || '',
        type: data.type || 'initial_consultation',
        status: data.status || 'scheduled',
        scheduledAt: data.scheduledAt?.toDate ? data.scheduledAt.toDate() : 
                     (data.scheduledDate?.toDate ? data.scheduledDate.toDate() : 
                     (data.scheduledAt instanceof Date ? data.scheduledAt : 
                     (data.scheduledDate instanceof Date ? data.scheduledDate : 
                     (typeof data.scheduledAt === 'string' ? new Date(data.scheduledAt) : 
                     (typeof data.scheduledDate === 'string' ? new Date(data.scheduledDate) : new Date()))))),
        duration: data.duration || 30,
        location: data.location || '',
        notes: data.notes || '',
        visitSummary: data.visitSummary,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : 
                   (data.createdAt instanceof Date ? data.createdAt : 
                   (typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date())),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                   (data.updatedAt instanceof Date ? data.updatedAt : 
                   (typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : new Date()))
      });
    });
    
    console.log('✅ Found', appointments.length, 'appointments');
    return appointments;
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    return [];
  }
}
