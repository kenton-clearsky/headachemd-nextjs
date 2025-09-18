import { NextRequest, NextResponse } from 'next/server';
import { emrIntegrationService } from '@/lib/emr/integration';
import { EMRSystem } from '@/types/auth';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // For development/testing, always use a mock user ID
    // In production, this would need proper JWT token validation
    const userId = config.isDevelopment ? 'dev-user-1' : 'authenticated-user';
    
    console.log('🔍 EMR Search API called with userId:', userId);
    console.log('🔍 Config isDevelopment:', config.isDevelopment);

    const { searchParams } = new URL(request.url);
    const system = (searchParams.get('system') as EMRSystem) || EMRSystem.ECLINICALWORKS;
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const dateOfBirth = searchParams.get('dateOfBirth');

    if (!firstName || !lastName || !dateOfBirth) {
      console.log('❌ Missing required parameters:', { firstName, lastName, dateOfBirth });
      return NextResponse.json({ 
        error: 'Missing required parameters: firstName, lastName, dateOfBirth' 
      }, { status: 400 });
    }

    console.log('🔍 Search parameters:', { firstName, lastName, dateOfBirth, system });

    console.log('🚀 Calling emrIntegrationService.searchPatients...');
    const results = await emrIntegrationService.searchPatients(
      userId,
      system,
      { firstName, lastName, dateOfBirth }
    );

    console.log('✅ EMR search results:', results.length, 'patients found');
    console.log('📊 Results preview:', results.slice(0, 2)); // Log first 2 results for debugging
    return NextResponse.json(results);
  } catch (error) {
    console.error('❌ EMR patient search error:', error);
    console.error('❌ Error stack:', (error as Error).stack);
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
