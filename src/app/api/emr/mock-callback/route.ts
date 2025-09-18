import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock EMR OAuth Callback
 * This endpoint simulates the eClinicalWorks OAuth callback for testing
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      return NextResponse.json({
        error: 'OAuth Error',
        errorCode: error,
        errorDescription,
        state,
        message: 'Mock OAuth callback received error'
      }, { status: 400 });
    }
    
    if (!code || !state) {
      return NextResponse.json({
        error: 'Missing Parameters',
        message: 'Missing code or state parameter',
        receivedParams: {
          code: code ? 'PRESENT' : 'MISSING',
          state: state ? 'PRESENT' : 'MISSING'
        }
      }, { status: 400 });
    }
    
    // Simulate token exchange
    const mockTokenResponse = {
      access_token: 'mock_access_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock_refresh_token_' + Date.now(),
      scope: 'launch/patient openid profile offline_access',
      patient: 'mock-patient-1',
      aud: 'https://fhir4.healow.com/fhir/r4'
    };
    
    // Simulate patient data retrieval
    const mockPatientData = {
      patientId: 'mock-patient-1',
      mrn: 'MRN123456',
      demographics: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        phone: '+1-555-0123',
        email: 'john.doe@example.com'
      }
    };
    
    return NextResponse.json({
      success: true,
      message: 'Mock OAuth callback successful',
      oauth: {
        code,
        state,
        tokenResponse: mockTokenResponse
      },
      patient: mockPatientData,
      nextSteps: [
        'Token exchange completed successfully',
        'Patient data retrieved',
        'Ready for FHIR API calls',
        'Integration test passed'
      ]
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Mock Callback Error',
      message: (error as Error).message,
      details: 'Failed to process mock OAuth callback'
    }, { status: 500 });
  }
}
