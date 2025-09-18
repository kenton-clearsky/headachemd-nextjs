import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  orderBy,
  limit 
} from 'firebase/firestore';
import { logAuditEvent, AuditAction, AuditResource, RiskLevel } from '@/lib/hipaa/audit';
import { encryptPHI, decryptPHI } from '@/lib/hipaa/encryption';
import { DailyUpdate, Patient } from '@/types/medical';
import type { User } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const userSnap = await getDoc(doc(db, 'users', uid));
    const user = userSnap.exists() ? (userSnap.data() as User) : null;
    
    if (!user || user.role !== 'patient') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data, lastSyncTimestamp } = body;

    // Get client IP and user agent for audit logging
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log sync attempt
    await logAuditEvent({
      userId: user.id,
      userRole: user.role,
      action: AuditAction.ACCESS,
      resource: AuditResource.MOBILE_SYNC,
      details: {
        description: `Mobile sync initiated: ${action}`,
        accessMethod: 'mobile_app',
        deviceInfo: userAgent,
        syncAction: action
      },
      ipAddress: clientIP,
      userAgent,
      sessionId: await generateSessionId(),
      success: true,
      riskLevel: RiskLevel.LOW
    });

    switch (action) {
      case 'sync_daily_update':
        return await handleDailyUpdateSync(user.id, data, clientIP, userAgent);
      
      case 'sync_patient_data':
        return await handlePatientDataSync(user.id, lastSyncTimestamp, clientIP, userAgent);
      
      case 'sync_treatments':
        return await handleTreatmentSync(user.id, lastSyncTimestamp, clientIP, userAgent);
      
      case 'sync_appointments':
        return await handleAppointmentSync(user.id, lastSyncTimestamp, clientIP, userAgent);
      
      default:
        return NextResponse.json({ error: 'Invalid sync action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Mobile sync error:', error);
    
    // Log failed sync attempt
    await logAuditEvent({
      action: AuditAction.ACCESS_FAILED,
      resource: AuditResource.MOBILE_SYNC,
      details: {
        description: `Mobile sync failed: ${(error as Error).message}`,
        accessMethod: 'mobile_app'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: await generateSessionId(),
      success: false,
      riskLevel: RiskLevel.MEDIUM,
      errorMessage: (error as Error).message
    });

    return NextResponse.json(
      { error: 'Sync failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function handleDailyUpdateSync(
  userId: string, 
  updateData: any, 
  clientIP: string, 
  userAgent: string
) {
  try {
    // Validate update data
    const { painLevel, headacheFrequency, triggers, medications, sleepHours, stressLevel, exerciseMinutes, notes } = updateData;
    
    if (painLevel < 1 || painLevel > 10) {
      throw new Error('Invalid pain level');
    }

    // Create daily update document
    const dailyUpdate: DailyUpdate = {
      id: `${userId}_${new Date().toISOString().split('T')[0]}`,
      patientId: userId,
      date: new Date(),
      painLevel,
      headacheFrequency: headacheFrequency || 0,
      triggers: triggers || [],
      medications: medications || [],
      sleepHours: sleepHours || 0,
      stressLevel: stressLevel || 0,
      exerciseMinutes: exerciseMinutes || 0,
      notes: notes ? encryptPHI(notes) : undefined,
      mood: calculateMood(painLevel, stressLevel),
      functionalStatus: calculateFunctionalStatus(painLevel),
      createdAt: new Date()
    };

    // Save to Firestore
    await setDoc(doc(db, 'daily_updates', dailyUpdate.id), {
      ...dailyUpdate,
      date: Timestamp.fromDate(dailyUpdate.date),
      createdAt: Timestamp.fromDate(dailyUpdate.createdAt)
    });

    // Log successful update
    await logAuditEvent({
      userId,
      action: AuditAction.CREATE,
      resource: AuditResource.DAILY_UPDATE,
      resourceId: dailyUpdate.id,
      details: {
        description: 'Daily update synced from mobile app',
        accessMethod: 'mobile_app',
        painLevel,
        headacheFrequency
      },
      ipAddress: clientIP,
      userAgent,
      sessionId: await generateSessionId(),
      success: true,
      riskLevel: RiskLevel.LOW
    });

    return NextResponse.json({
      success: true,
      message: 'Daily update synced successfully',
      updateId: dailyUpdate.id
    });

  } catch (error) {
    throw new Error(`Daily update sync failed: ${(error as Error).message}`);
  }
}

async function handlePatientDataSync(
  userId: string, 
  lastSyncTimestamp: string, 
  clientIP: string, 
  userAgent: string
) {
  try {
    // Get patient data
    const patientDoc = await getDoc(doc(db, 'patients', userId));
    
    if (!patientDoc.exists()) {
      throw new Error('Patient not found');
    }

    const patientData = patientDoc.data();
    
    // Decrypt sensitive data
    const decryptedPatient: Patient = {
      ...patientData,
      id: userId,
      userId: patientData.userId || userId,
      mrn: patientData.mrn || '',
      profile: {
        ...patientData.profile,
        phone: patientData.profile.phone ? decryptPHI(patientData.profile.phone) : undefined,
        dateOfBirth: patientData.profile.dateOfBirth ? new Date(decryptPHI(patientData.profile.dateOfBirth)) : undefined
      },
      medicalHistory: patientData.medicalHistory || {
        chiefComplaint: '',
        historyOfPresentIllness: '',
        pastMedicalHistory: [],
        familyHistory: [],
        socialHistory: {
          smokingStatus: 'never',
          alcoholUse: 'none',
          occupation: '',
          exerciseFrequency: '',
          stressLevel: 5
        },
        reviewOfSystems: {
          constitutional: false,
          cardiovascular: false,
          respiratory: false,
          gastrointestinal: false,
          genitourinary: false,
          musculoskeletal: false,
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
      currentTreatments: patientData.currentTreatments || [],
      appointments: patientData.appointments || [],
      dailyUpdates: patientData.dailyUpdates || [],
      isActive: patientData.isActive !== false,
      assignedDoctors: patientData.assignedDoctors || [],
      createdAt: patientData.createdAt.toDate(),
      updatedAt: patientData.updatedAt.toDate()
    };

    // Get recent daily updates
    const updatesQuery = query(
      collection(db, 'daily_updates'),
      where('patientId', '==', userId),
      orderBy('date', 'desc'),
      limit(30)
    );

    const updatesSnapshot = await getDocs(updatesQuery);
    const dailyUpdates = updatesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        notes: data.notes ? decryptPHI(data.notes) : undefined
      };
    });

    return NextResponse.json({
      success: true,
      patient: decryptedPatient,
      dailyUpdates,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    throw new Error(`Patient data sync failed: ${(error as Error).message}`);
  }
}

async function handleTreatmentSync(
  userId: string, 
  lastSyncTimestamp: string, 
  clientIP: string, 
  userAgent: string
) {
  try {
    // Get active treatments
    const treatmentsQuery = query(
      collection(db, 'treatments'),
      where('patientId', '==', userId),
      where('status', 'in', ['active', 'planned'])
    );

    const treatmentsSnapshot = await getDocs(treatmentsQuery);
    const treatments = treatmentsSnapshot.docs.map(doc => ({
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    }));

    return NextResponse.json({
      success: true,
      treatments,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    throw new Error(`Treatment sync failed: ${(error as Error).message}`);
  }
}

async function handleAppointmentSync(
  userId: string, 
  lastSyncTimestamp: string, 
  clientIP: string, 
  userAgent: string
) {
  try {
    // Get upcoming appointments
    const now = new Date();
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', userId),
      where('scheduledAt', '>=', Timestamp.fromDate(now)),
      orderBy('scheduledAt', 'asc')
    );

    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map(doc => ({
      ...doc.data(),
      scheduledAt: doc.data().scheduledAt.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    }));

    return NextResponse.json({
      success: true,
      appointments,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    throw new Error(`Appointment sync failed: ${(error as Error).message}`);
  }
}

function calculateMood(painLevel: number, stressLevel: number): number {
  const average = (painLevel + stressLevel) / 2;
  if (average <= 2) return 5; // Excellent
  if (average <= 4) return 4; // Good
  if (average <= 6) return 3; // Fair
  if (average <= 8) return 2; // Poor
  return 1; // Very Poor
}

function calculateFunctionalStatus(painLevel: number): number {
  if (painLevel <= 2) return 5; // Normal Function
  if (painLevel <= 4) return 4; // Mildly Limited
  if (painLevel <= 6) return 3; // Moderately Limited
  if (painLevel <= 8) return 2; // Severely Limited
  return 1; // Unable to Function
}

async function generateSessionId(): Promise<string> {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}_${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const lastSync = searchParams.get('lastSync');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get client IP for audit logging
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const sessionId = request.headers.get('x-session-id') || 'mobile-session';

    // Log mobile data access
    await logAuditEvent({
      userId,
      action: AuditAction.ACCESS,
      resource: AuditResource.MOBILE_SYNC,
      details: {
        description: 'Mobile data fetch',
        action: 'fetch_updates',
        accessMethod: 'mobile_app'
      },
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId,
      success: true,
      riskLevel: RiskLevel.LOW
    });

    // Fetch updates since last sync (this would query Firestore)
    const updates = {
      dailyUpdates: [],
      appointments: [],
      medications: [],
      lastSyncTimestamp: new Date().toISOString(),
      hasMoreData: false,
    };

    return NextResponse.json(updates, { status: 200 });
  } catch (error) {
    console.error('Mobile fetch error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch updates',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
