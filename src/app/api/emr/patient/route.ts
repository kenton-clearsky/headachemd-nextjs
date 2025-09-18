import { NextRequest, NextResponse } from 'next/server';
import { emrIntegrationService } from '@/lib/emr/integration';
import { EMRSystem } from '@/types/auth';
import { authService } from '@/lib/auth/auth';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id || (config.isDevelopment ? 'dev-user-1' : undefined);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const systemParam = (searchParams.get('system') as EMRSystem) || EMRSystem.ECLINICALWORKS;
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
    }

    const data = await emrIntegrationService.fetchPatientData(
      userId,
      systemParam,
      patientId
    );
    return NextResponse.json(data);
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
    const { system = EMRSystem.ECLINICALWORKS, resource } = body || {};
    if (!resource) {
      return NextResponse.json({ error: 'Missing FHIR resource body' }, { status: 400 });
    }

    const result = await emrIntegrationService.createPatient(
      userId,
      system as EMRSystem,
      resource
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


