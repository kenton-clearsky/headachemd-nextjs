import { NextRequest, NextResponse } from 'next/server';
import { emrIntegrationService } from '@/lib/emr/integration';
import { EMRSystem } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const system = (searchParams.get('system') as EMRSystem) || EMRSystem.ECLINICALWORKS;
    
    // Test EMR configuration
    const config = emrIntegrationService.getConfig(system);
    if (!config) {
      return NextResponse.json({ 
        error: `EMR system ${system} not configured`,
        available: Object.values(EMRSystem)
      }, { status: 400 });
    }

    // Generate auth URL to test OAuth2 flow
    const authUrl = await emrIntegrationService.generateAuthUrl(system, 'test-user-1');
    
    // Test basic connectivity (without authentication)
    const connectivityTest = await testEMRConnectivity(config);
    
    return NextResponse.json({
      system,
      status: 'configured',
      config: {
        clientId: config.clientId ? '***configured***' : 'missing',
        clientSecret: config.clientSecret ? '***configured***' : 'missing',
        authUrl: config.authUrl,
        tokenUrl: config.tokenUrl,
        apiBaseUrl: config.apiBaseUrl,
        scopes: config.scopes
      },
      authUrl,
      connectivity: connectivityTest,
      nextSteps: [
        'Visit the authUrl to start OAuth2 flow',
        'Complete authentication in EMR system',
        'Return to callback URL to complete flow',
        'Test patient data retrieval'
      ]
    });
  } catch (error) {
    console.error('EMR test error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}

async function testEMRConnectivity(config: any) {
  try {
    // Test if the FHIR endpoint is reachable
    const response = await fetch(`${config.apiBaseUrl}/metadata`, {
      method: 'GET',
      headers: {
        'Accept': 'application/fhir+json',
        'User-Agent': 'HeadacheMD/1.0.0'
      }
    });
    
    if (response.ok) {
      const metadata = await response.json();
      return {
        status: 'reachable',
        fhirVersion: metadata.fhirVersion || 'unknown',
        software: metadata.software?.name || 'unknown'
      };
    } else {
      return {
        status: 'unreachable',
        httpStatus: response.status,
        error: response.statusText
      };
    }
  } catch (error) {
    return {
      status: 'error',
      error: (error as Error).message
    };
  }
}
