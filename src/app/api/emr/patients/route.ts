import { NextRequest, NextResponse } from 'next/server';
import { EMRPatientSyncService } from '@/lib/services/emr-patient-sync';
import { authService } from '@/lib/auth/auth';
import { config } from '@/lib/config';

// In-memory storage for test patients (in production, this would be a database)
let testPatients: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id || (config.isDevelopment ? 'dev-user-1' : undefined);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return all test patients
    return NextResponse.json({
      success: true,
      patients: testPatients,
      count: testPatients.length
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id || (config.isDevelopment ? 'dev-user-1' : undefined);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, patientData } = body;

    if (action === 'generate_mock') {
      // Generate a mock EMR patient
      const mockPatient = EMRPatientSyncService.createMockEMRPatient();
      const patientId = `test-patient-${Date.now()}`;
      
      const testPatient = {
        id: patientId,
        emrData: mockPatient,
        headacheMDData: EMRPatientSyncService.convertEMRToHeadacheMDPatient(mockPatient),
        createdAt: new Date().toISOString(),
        createdBy: userId
      };

      testPatients.push(testPatient);
      
      return NextResponse.json({
        success: true,
        patient: testPatient,
        message: 'Mock EMR patient generated successfully'
      }, { status: 201 });
    }

    if (action === 'create_custom' && patientData) {
      // Create custom patient from provided data
      const patientId = `custom-patient-${Date.now()}`;
      
      const testPatient = {
        id: patientId,
        emrData: patientData,
        headacheMDData: EMRPatientSyncService.convertEMRToHeadacheMDPatient(patientData),
        createdAt: new Date().toISOString(),
        createdBy: userId
      };

      testPatients.push(testPatient);
      
      return NextResponse.json({
        success: true,
        patient: testPatient,
        message: 'Custom EMR patient created successfully'
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id || (config.isDevelopment ? 'dev-user-1' : undefined);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (patientId === 'all') {
      // Clear all test patients
      testPatients = [];
      return NextResponse.json({
        success: true,
        message: 'All test patients cleared'
      });
    }

    if (patientId) {
      // Delete specific patient
      const index = testPatients.findIndex(p => p.id === patientId);
      if (index !== -1) {
        testPatients.splice(index, 1);
        return NextResponse.json({
          success: true,
          message: 'Patient deleted successfully'
        });
      }
    }

    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
