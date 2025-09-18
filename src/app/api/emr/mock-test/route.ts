import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock EMR Testing Endpoint
 * This endpoint simulates eClinicalWorks OAuth and FHIR responses for local testing
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'oauth';
    
    switch (testType) {
      case 'oauth':
        return testOAuthFlow(request);
      case 'patient-search':
        return testPatientSearch(request);
      case 'patient-data':
        return testPatientData(request);
      case 'config':
        return testConfiguration(request);
      default:
        return NextResponse.json({
          error: 'Invalid test type',
          availableTests: ['oauth', 'patient-search', 'patient-data', 'config']
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Mock test failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}

async function testOAuthFlow(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  
  // Validate OAuth parameters
  const validation = {
    clientId: clientId ? 'VALID' : 'MISSING',
    redirectUri: redirectUri ? 'VALID' : 'MISSING',
    scope: scope ? 'VALID' : 'MISSING',
    state: state ? 'VALID' : 'MISSING',
    hasCodeChallenge: searchParams.get('code_challenge') ? 'VALID' : 'MISSING',
    hasCodeChallengeMethod: searchParams.get('code_challenge_method') ? 'VALID' : 'MISSING',
    hasAud: searchParams.get('aud') ? 'VALID' : 'MISSING',
    hasLaunch: searchParams.get('launch') ? 'VALID' : 'MISSING',
    hasPracticeCode: searchParams.get('practice_code') ? 'VALID' : 'MISSING'
  };
  
  // Check for common issues
  const issues = [];
  if (!clientId) issues.push('Missing client_id');
  if (!redirectUri) issues.push('Missing redirect_uri');
  if (!scope) issues.push('Missing scope');
  if (!state) issues.push('Missing state');
  if (!searchParams.get('code_challenge')) issues.push('Missing code_challenge (PKCE)');
  if (!searchParams.get('aud')) issues.push('Missing aud parameter');
  
  // Launch parameter is optional for standalone launch
  const launchParam = searchParams.get('launch');
  if (launchParam === 'ehr') {
    issues.push('Launch parameter set to "ehr" may cause validation errors - consider removing for standalone launch');
  }
  
  // Generate mock OAuth URL
  const mockAuthUrl = new URL('http://localhost:3000/api/emr/mock-callback');
  mockAuthUrl.searchParams.set('code', 'mock_auth_code_12345');
  mockAuthUrl.searchParams.set('state', state || 'mock_state');
  
  return NextResponse.json({
    testType: 'oauth',
    validation,
    issues,
    mockAuthUrl: mockAuthUrl.toString(),
    recommendations: [
      'Ensure all required OAuth parameters are present',
      'Verify client_id matches registered application',
      'Check redirect_uri is registered with eClinicalWorks',
      'Validate scope permissions',
      'Ensure PKCE parameters are correct'
    ]
  });
}

async function testPatientSearch(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const firstName = searchParams.get('firstName');
  const lastName = searchParams.get('lastName');
  const dateOfBirth = searchParams.get('dateOfBirth');
  
  // Mock patient search results
  const mockPatients = [
    {
      patientId: 'mock-patient-1',
      mrn: 'MRN123456',
      demographics: {
        firstName: firstName || 'John',
        lastName: lastName || 'Doe',
        dateOfBirth: dateOfBirth || '1980-01-01',
        gender: 'male',
        phone: '+1-555-0123',
        email: 'john.doe@example.com',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        }
      },
      medicalHistory: {
        allergies: ['Penicillin', 'Shellfish'],
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '200mg',
            frequency: 'As needed',
            startDate: '2024-01-01',
            isActive: true
          }
        ],
        conditions: ['Hypertension', 'Migraine']
      },
      appointments: [
        {
          id: 'apt-1',
          scheduledAt: '2024-02-01T10:00:00Z',
          type: 'Follow-up',
          provider: 'Dr. Smith',
          status: 'Scheduled'
        }
      ]
    }
  ];
  
  return NextResponse.json({
    testType: 'patient-search',
    searchCriteria: { firstName, lastName, dateOfBirth },
    results: mockPatients,
    totalResults: mockPatients.length,
    message: 'Mock patient search completed successfully'
  });
}

async function testPatientData(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || 'mock-patient-1';
  
  // Mock detailed patient data
  const mockPatientData = {
    patientId,
    mrn: 'MRN123456',
    demographics: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      gender: 'male',
      phone: '+1-555-0123',
      email: 'john.doe@example.com',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      }
    },
    medicalHistory: {
      allergies: [
        { name: 'Penicillin', severity: 'Moderate', onsetDate: '2020-01-01' },
        { name: 'Shellfish', severity: 'Severe', onsetDate: '2019-06-15' }
      ],
      medications: [
        {
          name: 'Ibuprofen',
          dosage: '200mg',
          frequency: 'As needed for pain',
          startDate: '2024-01-01',
          isActive: true,
          prescribedBy: 'Dr. Smith'
        },
        {
          name: 'Sumatriptan',
          dosage: '50mg',
          frequency: 'As needed for migraine',
          startDate: '2024-01-15',
          isActive: true,
          prescribedBy: 'Dr. Johnson'
        }
      ],
      conditions: [
        { name: 'Hypertension', status: 'Active', onsetDate: '2020-03-01' },
        { name: 'Migraine', status: 'Active', onsetDate: '2018-05-01' }
      ]
    },
    appointments: [
      {
        id: 'apt-1',
        scheduledAt: '2024-02-01T10:00:00Z',
        type: 'Follow-up',
        provider: 'Dr. Smith',
        status: 'Scheduled',
        notes: 'Routine follow-up for hypertension management'
      },
      {
        id: 'apt-2',
        scheduledAt: '2024-01-15T14:30:00Z',
        type: 'Consultation',
        provider: 'Dr. Johnson',
        status: 'Completed',
        notes: 'Migraine consultation and medication adjustment'
      }
    ],
    vitalSigns: [
      {
        date: '2024-01-15T14:30:00Z',
        bloodPressure: '140/90',
        heartRate: 72,
        temperature: 98.6,
        weight: 180
      }
    ]
  };
  
  return NextResponse.json({
    testType: 'patient-data',
    patientId,
    data: mockPatientData,
    message: 'Mock patient data retrieved successfully'
  });
}

async function testConfiguration(request: NextRequest) {
  const config = {
    environment: process.env.NODE_ENV,
    eClinicalWorks: {
      clientId: process.env.ECLINICALWORKS_CLIENT_ID ? 'SET' : 'MISSING',
      clientSecret: process.env.ECLINICALWORKS_CLIENT_SECRET ? 'SET' : 'MISSING',
      redirectUri: process.env.ECLINICALWORKS_REDIRECT_URI || 'NOT_SET',
      authUrl: process.env.ECLINICALWORKS_AUTH_URL || 'NOT_SET',
      tokenUrl: process.env.ECLINICALWORKS_TOKEN_URL || 'NOT_SET',
      fhirBaseUrl: process.env.ECLINICALWORKS_FHIR_BASE_URL || 'NOT_SET',
      practiceCode: process.env.ECLINICALWORKS_PRACTICE_CODE || 'NOT_SET'
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET'
    }
  };
  
  return NextResponse.json({
    testType: 'config',
    config,
    status: 'Configuration test completed',
    recommendations: [
      'Verify all EMR environment variables are set',
      'Check that client credentials are correct',
      'Ensure redirect URI matches registered application',
      'Validate FHIR base URL format'
    ]
  });
}
