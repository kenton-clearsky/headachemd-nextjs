import { db } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp,
  DocumentData 
} from 'firebase/firestore';
import { 
  Patient, 
  DailyUpdate, 
  Treatment,
  HeadacheFrequency,
  TreatmentType,
  TreatmentStatus
} from '@/types/medical';

// Analytics data interfaces
export interface PatientMetrics {
  totalPatients: number;
  newPatientsThisMonth: number;
  activePatients: number;
  ageDistribution: Array<{ group: string; count: number; percentage: number }>;
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
  headacheTypes: Array<{ type: string; count: number; percentage: number }>;
}

export interface TreatmentAnalytics {
  treatmentType: string;
  patientCount: number;
  averagePainReduction: number;
  successRate: number;
  adherenceRate: number;
  sideEffectRate: number;
}

export interface PainTrendData {
  date: string;
  averagePain: number;
  maxPain: number;
  minPain: number;
  medicationTaken: boolean;
  patientCount: number;
}

export interface HeadachePatternData {
  date: string;
  frequency: number;
  intensity: number;
  triggers: string[];
}

export interface TriggerAnalysis {
  trigger: string;
  occurrences: number;
  averageIntensity: number;
  patientCount: number;
}

export interface TimePatternData {
  hour: number;
  frequency: number;
  day: string;
}

/**
 * Fetch and aggregate patient metrics from Firestore
 */
export async function fetchPatientMetrics(): Promise<PatientMetrics> {
  try {
    const patientsRef = collection(db, 'patients');
    const snapshot = await getDocs(patientsRef);
    
    const patients: Patient[] = [];
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      patients.push(convertFirestoreToPatient(doc.id, data));
    });
    
    // Calculate age distribution
    const ageGroups = { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 };
    const genderCount = { 'male': 0, 'female': 0, 'other': 0, 'prefer_not_to_say': 0 };
    const headacheTypes: { [key: string]: number } = {};
    
    let activeCount = 0;
    let newThisMonth = 0;
    
    patients.forEach(patient => {
      // Age calculation
      const age = calculateAge(patient.profile.dateOfBirth);
      if (age <= 30) ageGroups['18-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else ageGroups['60+']++;
      
      // Gender
      const gender = patient.profile.gender || 'Other';
      genderCount[gender as keyof typeof genderCount]++;
      
      // Active status
      if (patient.isActive) activeCount++;
      
      // New patients this month
      if (patient.createdAt >= monthAgo) newThisMonth++;
      
      // Headache types (from history)
      const headacheType = determineHeadacheType(patient);
      headacheTypes[headacheType] = (headacheTypes[headacheType] || 0) + 1;
    });
    
    const total = patients.length || 1;
    
    return {
      totalPatients: total,
      newPatientsThisMonth: newThisMonth,
      activePatients: activeCount,
      ageDistribution: Object.entries(ageGroups).map(([group, count]) => ({
        group,
        count,
        percentage: Math.round((count / total) * 100)
      })),
      genderDistribution: Object.entries(genderCount).map(([gender, count]) => ({
        gender,
        count,
        percentage: Math.round((count / total) * 100)
      })),
      headacheTypes: Object.entries(headacheTypes).map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100)
      }))
    };
  } catch (error) {
    console.error('Error fetching patient metrics:', error);
    throw error;
  }
}

/**
 * Fetch treatment effectiveness analytics
 */
export async function fetchTreatmentAnalytics(): Promise<TreatmentAnalytics[]> {
  try {
    const treatmentsRef = collection(db, 'treatments');
    const dailyUpdatesRef = collection(db, 'dailyUpdates');
    
    const [treatmentsSnapshot, updatesSnapshot] = await Promise.all([
      getDocs(treatmentsRef),
      getDocs(query(dailyUpdatesRef, orderBy('date', 'desc'), limit(1000)))
    ]);
    
    // Group treatments by type
    const treatmentGroups: { [key: string]: any[] } = {};
    treatmentsSnapshot.forEach(doc => {
      const treatment = doc.data();
      const type = treatment.type || 'Unknown';
      if (!treatmentGroups[type]) treatmentGroups[type] = [];
      treatmentGroups[type].push({ id: doc.id, ...treatment });
    });
    
    // Analyze daily updates for treatment effectiveness
    const updatesByPatient: { [key: string]: any[] } = {};
    updatesSnapshot.forEach(doc => {
      const update = doc.data();
      const patientId = update.patientId;
      if (!updatesByPatient[patientId]) updatesByPatient[patientId] = [];
      updatesByPatient[patientId].push(update);
    });
    
    const analytics: TreatmentAnalytics[] = [];
    
    for (const [type, treatments] of Object.entries(treatmentGroups)) {
      const patientIds = new Set(treatments.map(t => t.patientId));
      const patientCount = patientIds.size;
      
      let totalPainReduction = 0;
      let successfulTreatments = 0;
      let adherentPatients = 0;
      let patientsWithSideEffects = 0;
      
      patientIds.forEach(patientId => {
        const updates = updatesByPatient[patientId] || [];
        if (updates.length > 1) {
          const firstPain = updates[updates.length - 1].painLevel || 0;
          const lastPain = updates[0].painLevel || 0;
          const reduction = ((firstPain - lastPain) / firstPain) * 100;
          
          totalPainReduction += Math.max(0, reduction);
          if (reduction > 30) successfulTreatments++;
          
          // Check adherence (at least 80% of days with updates)
          const expectedDays = 30;
          const actualDays = updates.filter((u, i, arr) => 
            i === 0 || !isSameDay(new Date(u.date), new Date(arr[i-1].date))
          ).length;
          if (actualDays / expectedDays > 0.8) adherentPatients++;
          
          // Check for side effects mentioned in notes
          const hasSideEffects = updates.some(u => 
            u.notes?.toLowerCase().includes('side effect') ||
            u.notes?.toLowerCase().includes('nausea') ||
            u.notes?.toLowerCase().includes('dizzy')
          );
          if (hasSideEffects) patientsWithSideEffects++;
        }
      });
      
      analytics.push({
        treatmentType: type,
        patientCount,
        averagePainReduction: patientCount > 0 ? Math.round(totalPainReduction / patientCount) : 0,
        successRate: patientCount > 0 ? Math.round((successfulTreatments / patientCount) * 100) : 0,
        adherenceRate: patientCount > 0 ? Math.round((adherentPatients / patientCount) * 100) : 0,
        sideEffectRate: patientCount > 0 ? Math.round((patientsWithSideEffects / patientCount) * 100) : 0
      });
    }
    
    return analytics;
  } catch (error) {
    console.error('Error fetching treatment analytics:', error);
    throw error;
  }
}

/**
 * Fetch pain level trends over time
 */
export async function fetchPainTrends(days: number = 30): Promise<{
  aggregatedData: PainTrendData[];
  patientData: Array<{
    patientId: string;
    patientName: string;
    painTrend: Array<{ date: string; painLevel: number }>;
    averagePain: number;
    improvement: number;
  }>;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const updatesRef = collection(db, 'dailyUpdates');
    const q = query(
      updatesRef,
      where('date', '>=', Timestamp.fromDate(startDate)),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(q);
    const updatesByDate: { [date: string]: any[] } = {};
    const updatesByPatient: { [patientId: string]: any[] } = {};
    
    snapshot.forEach(doc => {
      const update = doc.data();
      const dateStr = new Date(update.date.toDate()).toLocaleDateString();
      
      if (!updatesByDate[dateStr]) updatesByDate[dateStr] = [];
      updatesByDate[dateStr].push(update);
      
      if (!updatesByPatient[update.patientId]) updatesByPatient[update.patientId] = [];
      updatesByPatient[update.patientId].push(update);
    });
    
    // Aggregate data by date
    const aggregatedData: PainTrendData[] = Object.entries(updatesByDate).map(([date, updates]) => {
      const painLevels = updates.map(u => u.painLevel || 0).filter(p => p > 0);
      const medicationCount = updates.filter(u => 
        u.medications && u.medications.length > 0
      ).length;
      
      return {
        date,
        averagePain: painLevels.length > 0 ? 
          Math.round(painLevels.reduce((a, b) => a + b, 0) / painLevels.length * 10) / 10 : 0,
        maxPain: painLevels.length > 0 ? Math.max(...painLevels) : 0,
        minPain: painLevels.length > 0 ? Math.min(...painLevels) : 0,
        medicationTaken: medicationCount > 0,
        patientCount: new Set(updates.map(u => u.patientId)).size
      };
    });
    
    // Get patient data
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    const patientsMap: { [id: string]: string } = {};
    
    patientsSnapshot.forEach(doc => {
      const patient = doc.data();
      patientsMap[doc.id] = `${patient.profile?.firstName || ''} ${patient.profile?.lastName || ''}`.trim() || 'Unknown';
    });
    
    // Calculate per-patient trends
    const patientData = Object.entries(updatesByPatient).map(([patientId, updates]) => {
      const sortedUpdates = updates.sort((a, b) => 
        a.date.toDate().getTime() - b.date.toDate().getTime()
      );
      
      const painTrend = sortedUpdates.map(u => ({
        date: new Date(u.date.toDate()).toLocaleDateString(),
        painLevel: u.painLevel || 0
      }));
      
      const painLevels = painTrend.map(p => p.painLevel).filter(p => p > 0);
      const averagePain = painLevels.length > 0 ? 
        painLevels.reduce((a, b) => a + b, 0) / painLevels.length : 0;
      
      // Calculate improvement (first vs last pain level)
      const firstPain = painLevels[0] || 0;
      const lastPain = painLevels[painLevels.length - 1] || 0;
      const improvement = firstPain > 0 ? ((firstPain - lastPain) / firstPain) * 100 : 0;
      
      return {
        patientId,
        patientName: patientsMap[patientId] || 'Unknown',
        painTrend,
        averagePain: Math.round(averagePain * 10) / 10,
        improvement: Math.round(improvement)
      };
    });
    
    return { aggregatedData, patientData };
  } catch (error) {
    console.error('Error fetching pain trends:', error);
    throw error;
  }
}

/**
 * Fetch headache patterns and triggers
 */
export async function fetchHeadachePatterns(): Promise<{
  frequencyData: HeadachePatternData[];
  triggerData: TriggerAnalysis[];
  timePatternData: TimePatternData[];
}> {
  try {
    const updatesRef = collection(db, 'dailyUpdates');
    const last90Days = new Date();
    last90Days.setDate(last90Days.getDate() - 90);
    
    const q = query(
      updatesRef,
      where('date', '>=', Timestamp.fromDate(last90Days)),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(q);
    
    const frequencyByDate: { [date: string]: any } = {};
    const triggerCount: { [trigger: string]: any } = {};
    const timePatterns: { [key: string]: number } = {};
    
    snapshot.forEach(doc => {
      const update = doc.data();
      const date = new Date(update.date.toDate());
      const dateStr = date.toLocaleDateString();
      const hour = date.getHours();
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      
      // Frequency data
      if (!frequencyByDate[dateStr]) {
        frequencyByDate[dateStr] = {
          date: dateStr,
          totalFrequency: 0,
          totalIntensity: 0,
          count: 0,
          triggers: []
        };
      }
      
      frequencyByDate[dateStr].totalFrequency += update.headacheFrequency || 0;
      frequencyByDate[dateStr].totalIntensity += update.painLevel || 0;
      frequencyByDate[dateStr].count++;
      
      // Trigger analysis
      if (update.triggers && Array.isArray(update.triggers)) {
        update.triggers.forEach((trigger: string) => {
          if (!triggerCount[trigger]) {
            triggerCount[trigger] = {
              trigger,
              occurrences: 0,
              totalIntensity: 0,
              patients: new Set()
            };
          }
          triggerCount[trigger].occurrences++;
          triggerCount[trigger].totalIntensity += update.painLevel || 0;
          triggerCount[trigger].patients.add(update.patientId);
          
          frequencyByDate[dateStr].triggers.push(trigger);
        });
      }
      
      // Time patterns
      if (update.headacheFrequency > 0) {
        const timeKey = `${day}-${hour}`;
        timePatterns[timeKey] = (timePatterns[timeKey] || 0) + 1;
      }
    });
    
    // Format frequency data
    const frequencyData: HeadachePatternData[] = Object.values(frequencyByDate).map((data: any) => ({
      date: data.date,
      frequency: data.totalFrequency / Math.max(1, data.count),
      intensity: data.totalIntensity / Math.max(1, data.count),
      triggers: [...new Set(data.triggers as string[])]
    }));
    
    // Format trigger data
    const triggerData: TriggerAnalysis[] = Object.values(triggerCount).map((data: any) => ({
      trigger: data.trigger,
      occurrences: data.occurrences,
      averageIntensity: Math.round(data.totalIntensity / Math.max(1, data.occurrences) * 10) / 10,
      patientCount: data.patients.size
    }));
    
    // Format time pattern data
    const timePatternData: TimePatternData[] = [];
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        timePatternData.push({
          hour,
          day,
          frequency: timePatterns[key] || 0
        });
      }
    });
    
    return { frequencyData, triggerData, timePatternData };
  } catch (error) {
    console.error('Error fetching headache patterns:', error);
    throw error;
  }
}

// Helper functions
function convertFirestoreToPatient(id: string, data: DocumentData): Patient {
  return {
    id,
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
      address: data.profile?.address || {},
      emergencyContact: data.profile?.emergencyContact || {},
      allergies: data.profile?.allergies || [],
      medications: data.profile?.medications || []
    },
    medicalHistory: data.medicalHistory || {},
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
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function determineHeadacheType(patient: Patient): string {
  const frequency = patient.medicalHistory?.headacheHistory?.frequency;
  const intensity = patient.medicalHistory?.headacheHistory?.intensity || 0;
  const symptoms = patient.medicalHistory?.headacheHistory?.associatedSymptoms || [];
  
  if (symptoms.includes('aura') || symptoms.includes('nausea')) return 'Migraine';
  if (frequency === HeadacheFrequency.DAILY) return 'Tension';
  if (intensity >= 9) return 'Cluster';
  return 'Other';
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}