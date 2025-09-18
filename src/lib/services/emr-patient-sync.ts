import { EMRPatientData } from '@/lib/emr/integration';
import { 
  Patient, 
  PatientProfile, 
  MedicalHistory, 
  Treatment, 
  Appointment, 
  HeadacheFrequency, 
  HeadacheLocation,
  TreatmentType,
  SmokingStatus,
  AlcoholUse,
  AllergySeverity
} from '@/types/medical';
import { Gender } from '@/types/auth';

/**
 * Service to sync patient data from EMR to HeadacheMD format
 */
export class EMRPatientSyncService {
  /**
   * Convert EMR FHIR patient data to HeadacheMD patient format
   */
  static convertEMRToHeadacheMDPatient(emrData: EMRPatientData): Patient {
    const { demographics } = emrData;
    const emrMedicalHistory = emrData.medicalHistory;
    
    // Extract headache-related conditions from EMR
    const headacheConditions = emrMedicalHistory.conditions.filter(condition => 
      condition.toLowerCase().includes('headache') ||
      condition.toLowerCase().includes('migraine') ||
      condition.toLowerCase().includes('tension') ||
      condition.toLowerCase().includes('cluster')
    );

    // Map EMR medications to headache treatments
    const headacheMedications = emrMedicalHistory.medications.filter(med =>
      this.isHeadacheMedication(med.name)
    );

    const profile: PatientProfile = {
      firstName: demographics.firstName,
      lastName: demographics.lastName,
      dateOfBirth: new Date(demographics.dateOfBirth),
      gender: this.mapGender(demographics.gender),
      phone: demographics.phone,
      email: demographics.email,
      address: {
        street: emrData.demographics.address?.street || '',
        city: emrData.demographics.address?.city || '',
        state: emrData.demographics.address?.state || '',
        zipCode: emrData.demographics.address?.zipCode || '',
        country: 'USA', // Default country as it's not in EMR data
      },
      emergencyContact: {
        name: 'Not Provided', // Will need to be updated separately
        relationship: 'Other',
        phone: demographics.phone || '', // Use patient's phone as fallback
      },
      allergies: (typeof emrMedicalHistory.allergies === 'object' ? emrMedicalHistory.allergies : []).map(a => ({
        allergen: typeof a === 'string' ? a : (a as any).substance || 'Unknown',
        reaction: typeof a === 'object' && (a as any).reaction ? (a as any).reaction : 'Unknown',
        severity: AllergySeverity.MODERATE,
      })),
      medications: emrMedicalHistory.medications?.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        startDate: new Date(med.startDate),
        prescribedBy: (med as any).prescriber || 'EMR Import',
        indication: (med as any).indication || 'Headache',
        isActive: med.isActive,
      })) || [],
    };

    const medicalHistory: MedicalHistory = {
      chiefComplaint: 'Chronic headaches',
      historyOfPresentIllness: (emrMedicalHistory as any).chiefComplaint || 'Patient presents with headache concerns',
      pastMedicalHistory: emrMedicalHistory.conditions || [],
      familyHistory: [],
      socialHistory: {
        smokingStatus: SmokingStatus.NEVER,
        alcoholUse: AlcoholUse.OCCASIONAL,
        occupation: 'Not specified',
        exerciseFrequency: 'Weekly',
        stressLevel: 5,
      },
      reviewOfSystems: {
        constitutional: false,
        cardiovascular: false,
        respiratory: false,
        gastrointestinal: false,
        genitourinary: false,
        musculoskeletal: false,
        neurological: true,
        psychiatric: false,
        endocrine: false,
        hematologic: false,
        allergic: false,
      },
      headacheHistory: {
        onsetAge: 25,
        frequency: this.inferHeadacheFrequency(headacheConditions),
        duration: '4-72 hours',
        intensity: 7,
        location: [HeadacheLocation.TEMPORAL, HeadacheLocation.FRONTAL],
        triggers: this.extractTriggers(emrMedicalHistory),
        relievingFactors: ['Rest', 'Dark room', 'Medication'],
        associatedSymptoms: ['Nausea', 'Photophobia', 'Phonophobia'],
        previousTreatments: headacheMedications.map(med => ({
          treatment: med.name,
          duration: '6 months',
          effectiveness: 5,
        })),
        familyHistoryOfHeadaches: false,
      },
    };

    const patient: Patient = {
      id: `emr-${emrData.patientId}`,
      userId: `emr-user-${emrData.patientId}`,
      mrn: emrData.mrn,
      profile,
      medicalHistory,
      currentTreatments: [],
      appointments: [],
      dailyUpdates: [],
      isActive: true,
      assignedDoctors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return patient;
  }

  /**
   * Sync EMR appointments to HeadacheMD format
   */
  static convertEMRAppointments(emrData: EMRPatientData) {
    return emrData.appointments.map(apt => ({
      id: apt.id,
      patientId: `emr-${emrData.patientId}`,
      providerId: apt.provider,
      scheduledAt: new Date(apt.scheduledAt),
      type: apt.type,
      status: apt.status,
      notes: `EMR Appointment - ${apt.type}`,
      isHeadacheRelated: this.isHeadacheAppointment(apt.type),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  /**
   * Check if medication is commonly used for headaches
   */
  private static isHeadacheMedication(medicationName: string): boolean {
    const headacheMeds = [
      'sumatriptan', 'rizatriptan', 'zolmitriptan', 'eletriptan',
      'topiramate', 'propranolol', 'amitriptyline', 'valproate',
      'ibuprofen', 'naproxen', 'acetaminophen', 'aspirin',
      'botox', 'onabotulinumtoxina', 'aimovig', 'emgality',
      'ajovy', 'nurtec', 'ubrelvy', 'reyvow'
    ];
    
    return headacheMeds.some(med => 
      medicationName.toLowerCase().includes(med.toLowerCase())
    );
  }

  /**
   * Map EMR gender to HeadacheMD gender enum
   */
  private static mapGender(emrGender: string): Gender {
    switch (emrGender.toLowerCase()) {
      case 'male': case 'm': return Gender.MALE;
      case 'female': case 'f': return Gender.FEMALE;
      case 'other': return Gender.OTHER;
      default: return Gender.PREFER_NOT_TO_SAY;
    }
  }

  /**
   * Infer primary headache type from conditions
   */
  private static inferHeadacheType(conditions: string[]): string {
    for (const condition of conditions) {
      const lower = condition.toLowerCase();
      if (lower.includes('migraine')) return 'Migraine';
      if (lower.includes('tension')) return 'Tension-type headache';
      if (lower.includes('cluster')) return 'Cluster headache';
    }
    return 'Unspecified headache';
  }

  /**
   * Infer headache frequency from conditions/history
   */
  private static inferHeadacheFrequency(conditions: string[]): HeadacheFrequency {
    // This would ideally come from Observation data
    // For now, default to weekly
    return HeadacheFrequency.WEEKLY;
  }

  /**
   * Extract potential headache triggers from medical history
   */
  private static extractTriggers(medicalHistory: any): string[] {
    // This would be enhanced with more sophisticated NLP
    const commonTriggers = ['stress', 'sleep', 'weather', 'food', 'hormonal'];
    return commonTriggers.slice(0, 2); // Default triggers
  }

  /**
   * Map medication to treatment type
   */
  private static mapMedicationToTreatmentType(medicationName: string): TreatmentType {
    const lower = medicationName.toLowerCase();
    
    if (lower.includes('sumatriptan') || lower.includes('rizatriptan')) {
      return TreatmentType.MEDICATION;
    }
    if (lower.includes('botox')) {
      return TreatmentType.INJECTION;
    }
    if (lower.includes('topiramate') || lower.includes('propranolol')) {
      return TreatmentType.MEDICATION;
    }
    
    return TreatmentType.MEDICATION;
  }

  /**
   * Check if appointment is headache-related
   */
  private static isHeadacheAppointment(appointmentType: string): boolean {
    const headacheTypes = ['neurology', 'headache', 'migraine', 'pain'];
    return headacheTypes.some(type => 
      appointmentType.toLowerCase().includes(type)
    );
  }

  /**
   * Create mock EMR patient data for testing
   */
  static createMockEMRPatient(): EMRPatientData {
    return {
      patientId: 'emr-test-001',
      mrn: 'MRN-EMR-001',
      demographics: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        dateOfBirth: '1985-03-15',
        gender: 'female',
        phone: '555-0123',
        email: 'sarah.johnson@email.com',
        address: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101'
        }
      },
      medicalHistory: {
        allergies: ['Penicillin'],
        medications: [
          {
            name: 'Sumatriptan 50mg',
            dosage: '50mg',
            frequency: 'As needed',
            startDate: '2024-01-15',
            isActive: true
          },
          {
            name: 'Topiramate 25mg',
            dosage: '25mg',
            frequency: 'Daily',
            startDate: '2023-12-01',
            isActive: true
          }
        ],
        conditions: ['Migraine with aura', 'Hypertension']
      },
      appointments: [
        {
          id: 'apt-001',
          scheduledAt: '2024-12-15T10:00:00Z',
          type: 'Neurology Follow-up',
          provider: 'Dr. Smith',
          status: 'scheduled'
        }
      ]
    };
  }
}
