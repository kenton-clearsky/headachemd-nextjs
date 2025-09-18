import { NextRequest, NextResponse } from 'next/server';
import { emrIntegrationService } from '@/lib/emr/integration';
import { EMRSystem } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const system = (searchParams.get('system') as EMRSystem) || EMRSystem.ECLINICALWORKS;
    
    console.log('🧪 Enhanced EMR Test API called for system:', system);
    
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
    
    // Test patient search with mock data (to verify API structure)
    let searchTest = null;
    try {
      const searchResults = await emrIntegrationService.searchPatients(
        'test-user-1',
        system,
        { firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01' }
      );
      searchTest = {
        status: 'success',
        resultsCount: searchResults.length,
        sampleResult: searchResults[0] || null
      };
    } catch (searchError) {
      searchTest = {
        status: 'error',
        error: (searchError as Error).message,
        requiresAuth: (searchError as Error).message.includes('Authentication required')
      };
    }
    
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
      searchTest,
      improvements: {
        enhancedScopes: config.scopes.length > 4,
        additionalDataFetch: true,
        improvedErrorHandling: true,
        betterOAuthParams: true
      },
      nextSteps: [
        'Visit the authUrl to start OAuth2 flow',
        'Complete authentication in EMR system',
        'Return to callback URL to complete flow',
        'Test patient data retrieval with real data',
        'Verify additional medical data (allergies, conditions)'
      ]
    });
  } catch (error) {
    console.error('Enhanced EMR test error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}

async function testEMRConnectivity(config: any) {
  try {
    console.log('🔍 Testing connectivity to:', config.apiBaseUrl);
    
    const response = await fetch(`${config.apiBaseUrl}/metadata`, {
      method: 'GET',
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: `HTTP ${response.status}: ${response.statusText}`,
        reachable: false
      };
    }

    const metadata = await response.json();
    return {
      status: 'reachable',
      fhirVersion: metadata.fhirVersion || 'Unknown',
      software: metadata.software?.name || 'Unknown',
      message: 'Successfully connected to EMR system'
    };
  } catch (error) {
    console.error('Connectivity test failed:', error);
    return {
      status: 'error',
      message: (error as Error).message,
      reachable: false
    };
  }
}
