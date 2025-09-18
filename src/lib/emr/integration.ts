import { EMRSystem, EMRSession, EMRAuthRequest } from "@/types/auth";
import {
  logAuditEvent,
  AuditAction,
  AuditResource,
  RiskLevel,
} from "@/lib/hipaa/audit";
import { encryptPHI, decryptPHI } from "@/lib/hipaa/encryption";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import axios, { AxiosInstance } from "axios";
import { config } from "@/lib/config";

export interface EMRConfig {
  system: EMRSystem;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  apiBaseUrl: string;
  scopes: string[];
}

export interface EMRPatientData {
  patientId: string;
  mrn: string;
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  medicalHistory: {
    allergies: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: string;
      isActive: boolean;
    }>;
    conditions: string[];
  };
  appointments: Array<{
    id: string;
    scheduledAt: string;
    type: string;
    provider: string;
    status: string;
  }>;
}

export class EMRIntegrationService {
  private static instance: EMRIntegrationService;
  private configs: Map<EMRSystem, EMRConfig>;

  private constructor() {
    this.configs = new Map();
    this.initializeConfigs();
  }

  public static getInstance(): EMRIntegrationService {
    if (!EMRIntegrationService.instance) {
      EMRIntegrationService.instance = new EMRIntegrationService();
    }
    return EMRIntegrationService.instance;
  }

  private initializeConfigs(): void {
    // Epic EMR Configuration
    this.configs.set(EMRSystem.EPIC, {
      system: EMRSystem.EPIC,
      clientId: process.env.EMR_EPIC_CLIENT_ID || "",
      clientSecret: process.env.EMR_EPIC_CLIENT_SECRET || "",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/emr/callback/epic`,
      authUrl: "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize",
      tokenUrl: "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
      apiBaseUrl: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
      scopes: ["patient/*.read", "launch/patient", "offline_access"],
    });

    // Cerner EMR Configuration
    this.configs.set(EMRSystem.CERNER, {
      system: EMRSystem.CERNER,
      clientId: process.env.EMR_CERNER_CLIENT_ID || "",
      clientSecret: process.env.EMR_CERNER_CLIENT_SECRET || "",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/emr/callback/cerner`,
      authUrl:
        "https://authorization.cerner.com/tenants/oauth2/protocol/oauth2/authorize",
      tokenUrl:
        "https://authorization.cerner.com/tenants/oauth2/protocol/oauth2/token",
      apiBaseUrl:
        "https://fhir-ehr.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
      scopes: ["patient/*.read", "launch/patient", "offline_access"],
    });

    // Allscripts EMR Configuration
    this.configs.set(EMRSystem.ALLSCRIPTS, {
      system: EMRSystem.ALLSCRIPTS,
      clientId: process.env.EMR_ALLSCRIPTS_CLIENT_ID || "",
      clientSecret: process.env.EMR_ALLSCRIPTS_CLIENT_SECRET || "",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/emr/callback/allscripts`,
      authUrl: "https://open.allscripts.com/fhir/r4/oauth2/authorize",
      tokenUrl: "https://open.allscripts.com/fhir/r4/oauth2/token",
      apiBaseUrl: "https://open.allscripts.com/fhir/r4",
      scopes: ["patient/*.read", "launch/patient", "offline_access"],
    });

    // eClinicalWorks EMR Configuration (env-driven; defaults are placeholders)
    this.configs.set(EMRSystem.ECLINICALWORKS, {
      system: EMRSystem.ECLINICALWORKS,
      clientId: (process.env.EMR_ECLINICALWORKS_CLIENT_ID || process.env.ECLINICALWORKS_CLIENT_ID || "").trim().replace(/\s+/g, ''),
      clientSecret: (process.env.EMR_ECLINICALWORKS_CLIENT_SECRET || process.env.ECLINICALWORKS_CLIENT_SECRET || "").trim(),
      redirectUri: process.env.ECLINICALWORKS_REDIRECT_URI || "https://www.headachemd.org",
      authUrl:
        process.env.ECLINICALWORKS_AUTH_URL ||
        "https://oauthserver.eclinicalworks.com/oauth/oauth2/authorize",
      tokenUrl:
        process.env.ECLINICALWORKS_TOKEN_URL ||
        "https://oauthserver.eclinicalworks.com/oauth/oauth2/token",
      apiBaseUrl:
        process.env.ECLINICALWORKS_FHIR_BASE_URL ||
        "https://fhir.eclinicalworks.com/ecwopendev/fhir/R4",
      scopes: [
        // SMART on FHIR recommended scopes for Standalone Patient Launch
        "launch/patient",
        "openid",
        "profile",
        "offline_access",
        // Minimal resource read scopes used by our integration
        "patient/Patient.read",
        "patient/Appointment.read",
        "patient/MedicationRequest.read",
        "patient/AllergyIntolerance.read",
        "patient/Condition.read",
        "patient/Observation.read",
        "patient/DiagnosticReport.read",
        "patient/Encounter.read",
      ],
    });

    // Alternative eClinicalWorks Sandbox Configuration
    this.configs.set(EMRSystem.ECLINICALWORKS_SANDBOX, {
      system: EMRSystem.ECLINICALWORKS_SANDBOX,
      clientId: "demo-client-id",
      clientSecret: "demo-client-secret",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/emr/callback/eclinicalworks`,
      authUrl: "https://fhir.eclinicalworks.com/ecwopendev/oauth2/authorize",
      tokenUrl: "https://fhir.eclinicalworks.com/ecwopendev/oauth2/token",
      apiBaseUrl: "https://fhir.eclinicalworks.com/ecwopendev/fhir/R4",
      scopes: [
        "launch/patient",
        "openid",
        "profile",
        "offline_access",
        "patient/Patient.read",
      ],
    });
  }

  /**
   * Get EMR configuration for a system
   */
  getConfig(system: EMRSystem): EMRConfig | undefined {
    return this.configs.get(system);
  }

  /**
   * Generate OAuth2 authorization URL for EMR system
   */
  async generateAuthUrl(
    system: EMRSystem,
    userId: string,
    patientContext?: string
  ): Promise<string> {
    const config = this.configs.get(system);
    if (!config) {
      throw new Error(`EMR system ${system} not configured`);
    }

    console.log('🔧 OAuth Configuration:', {
      system: config.system,
      clientId: config.clientId ? 'SET' : 'MISSING',
      clientSecret: config.clientSecret ? 'SET' : 'MISSING',
      redirectUri: config.redirectUri,
      authUrl: config.authUrl,
      scopes: config.scopes,
    });

    console.log('🔧 Environment Variables:', {
      ECLINICALWORKS_CLIENT_ID: process.env.ECLINICALWORKS_CLIENT_ID ? 'SET' : 'MISSING',
      EMR_ECLINICALWORKS_CLIENT_ID: process.env.EMR_ECLINICALWORKS_CLIENT_ID ? 'SET' : 'MISSING',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });

    // Check for required OAuth parameters
    if (!config.clientId) {
      throw new Error(`EMR OAuth client_id not configured for ${system}. Please set ECLINICALWORKS_CLIENT_ID environment variable.`);
    }
    if (!config.redirectUri) {
      throw new Error(`EMR OAuth redirect_uri not configured for ${system}. Please set NEXT_PUBLIC_APP_URL environment variable.`);
    }

    // PKCE support (enabled if env USE_PKCE=true or if server expects it)
    const usePkce =
      (process.env.USE_PKCE || process.env.ECLINICALWORKS_USE_PKCE) === "true";
    const codeVerifier = usePkce ? this.generateCodeVerifier() : undefined;
    const codeChallenge =
      usePkce && codeVerifier
        ? await this.generateCodeChallenge(codeVerifier)
        : undefined;

    const state = this.generateState(userId, system, codeVerifier);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.clientId.trim().replace(/\s+/g, ''),
      redirect_uri: config.redirectUri.trim(),
      scope: config.scopes.join(" ").trim(),
      state: state.trim(),
      // Only include launch when present; some servers reject empty launch
      aud: config.apiBaseUrl.trim(),
    });

    // Try different OAuth configurations for eClinicalWorks
    if (system === EMRSystem.ECLINICALWORKS) {
      console.log('🔧 eClinicalWorks specific OAuth configuration with PKCE');
      
      // eClinicalWorks specific parameters - use standalone launch scopes
      params.set('scope', 'launch/patient openid profile offline_access patient/Patient.read'.trim());
      
      // Add aud parameter for eClinicalWorks (required for SMART on FHIR)
      // Use the full FHIR URL as required by eClinicalWorks
      params.set('aud', config.apiBaseUrl.trim());
      
      // Add additional parameters that eClinicalWorks expects
      params.set('response_mode', 'query');
      
      // For eClinicalWorks, handle launch parameter based on context
      // For standalone launch (no EHR context), don't include launch parameter
      // For EHR launch, include proper launch context
      if (patientContext && patientContext !== 'ehr') {
        // If we have a specific patient context, use it
        params.set('launch', patientContext);
      } else if (patientContext === 'ehr') {
        // For EHR launch, we need a valid launch token
        // For now, skip launch parameter to avoid validation errors
        console.log('🔧 Skipping launch parameter for eClinicalWorks to avoid validation errors');
      }
      // If no patientContext, this is a standalone launch - no launch parameter needed
      
      // Add practice code if available (required by Healow)
      const practiceCode = process.env.ECLINICALWORKS_PRACTICE_CODE || 'DJDIBD';
      if (practiceCode) {
        params.set('practice_code', practiceCode);
      }
      
      // Add nonce parameter (required for PKCE)
      const nonce = this.generateNonce();
      params.set('nonce', nonce);
      
      // Force PKCE for eClinicalWorks (recommended by support)
      console.log('🔧 Forcing PKCE for eClinicalWorks as recommended by support');
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
      
      // Update state to include code verifier and nonce
      const stateWithPkce = this.generateState(userId, system, codeVerifier, nonce);
      params.set('state', stateWithPkce);
      
      console.log('🔧 Modified OAuth parameters for eClinicalWorks:', {
        response_type: params.get('response_type'),
        client_id: params.get('client_id'),
        redirect_uri: params.get('redirect_uri'),
        scope: params.get('scope'),
        state: params.get('state'),
        aud: params.get('aud'),
        response_mode: params.get('response_mode'),
        code_challenge: params.get('code_challenge'),
        code_challenge_method: params.get('code_challenge_method'),
      });
    }
    
    // Include OIDC nonce when requesting openid profile scopes (only for non-eClinicalWorks systems)
    if (system !== EMRSystem.ECLINICALWORKS && config.scopes.includes("openid")) {
      params.set("nonce", this.generateNonce());
    }
    
    // Add launch parameter for non-eClinicalWorks systems
    if (system !== EMRSystem.ECLINICALWORKS && patientContext) {
      params.set("launch", patientContext);
    }
    
    // Add PKCE parameters for non-eClinicalWorks systems
    if (system !== EMRSystem.ECLINICALWORKS && usePkce && codeChallenge) {
      params.set("code_challenge", codeChallenge);
      params.set("code_challenge_method", "S256");
    }

    // Log auth URL generation
    await logAuditEvent({
      userId,
      action: AuditAction.ACCESS,
      resource: AuditResource.EMR_AUTH,
      details: {
        description: `EMR auth URL generated for ${system}`,
        accessMethod: "web_browser",
        emrSystem: system,
        patientContext: patientContext || null,
      },
      ipAddress: "system",
      userAgent: "system",
      sessionId: await this.generateSessionId(),
      success: true,
      riskLevel: RiskLevel.LOW,
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;
    console.log('🔗 Generated OAuth URL:', authUrl);
    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    system: EMRSystem,
    code: string,
    state: string
  ): Promise<EMRSession> {
    const config = this.configs.get(system);
    if (!config) {
      throw new Error(`EMR system ${system} not configured`);
    }

    const { userId, codeVerifier } = this.parseState(state);

    try {
      const response = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenData = await response.json();

      const session: EMRSession = {
        system,
        accessToken: encryptPHI(tokenData.access_token),
        refreshToken: tokenData.refresh_token
          ? encryptPHI(tokenData.refresh_token)
          : undefined,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        patientContext: tokenData.patient || undefined,
      };

      // Save session to database
      await this.saveEMRSession(userId, session);

      // Log successful token exchange
      await logAuditEvent({
        userId,
        action: AuditAction.ACCESS,
        resource: AuditResource.EMR_AUTH,
        details: {
          description: `EMR token exchange successful for ${system}`,
          accessMethod: "web_browser",
          emrSystem: system,
        },
        ipAddress: "system",
        userAgent: "system",
        sessionId: await this.generateSessionId(),
        success: true,
        riskLevel: RiskLevel.LOW,
      });

      return session;
    } catch (error) {
      // Log failed token exchange
      await logAuditEvent({
        userId,
        action: AuditAction.ACCESS_FAILED,
        resource: AuditResource.EMR_AUTH,
        details: {
          description: `EMR token exchange failed for ${system}`,
          accessMethod: "web_browser",
          emrSystem: system,
          error: (error as Error).message,
        },
        ipAddress: "system",
        userAgent: "system",
        sessionId: await this.generateSessionId(),
        success: false,
        riskLevel: RiskLevel.MEDIUM,
        errorMessage: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Search for patients by name and date of birth
   */
  async searchPatients(
    userId: string,
    system: EMRSystem,
    searchParams: { firstName: string; lastName: string; dateOfBirth: string }
  ): Promise<EMRPatientData[]> {
    console.log('🔍 EMRIntegrationService.searchPatients called with:', {
      userId,
      system,
      searchParams,
      isDevelopment: config.isDevelopment
    });

    const emrConfig = this.configs.get(system);
    if (!emrConfig) {
      throw new Error(`EMR system ${system} not configured`);
    }

    console.log('🏥 Making real EMR API call to:', emrConfig.apiBaseUrl);
    console.log('🔧 EMR Config details:', {
      system: emrConfig.system,
      apiBaseUrl: emrConfig.apiBaseUrl,
      authUrl: emrConfig.authUrl,
      hasClientId: !!emrConfig.clientId,
      hasClientSecret: !!emrConfig.clientSecret,
    });
    
    try {
      const { firstName, lastName, dateOfBirth } = searchParams;
      
      // For eClinicalWorks, we'll try to make a direct API call
      // In a real implementation, you would need proper OAuth authentication
      const searchUrl = new URL(`${emrConfig.apiBaseUrl}/Patient`);
      searchUrl.searchParams.set('given', firstName);
      searchUrl.searchParams.set('family', lastName);
      searchUrl.searchParams.set('birthdate', dateOfBirth);
      searchUrl.searchParams.set('_count', '10');
      searchUrl.searchParams.set('_format', 'json'); // Ensure JSON format
      searchUrl.searchParams.set('_sort', 'family,given'); // Sort results

      console.log('🔍 Making FHIR Patient search request to:', searchUrl.toString());

      // Try to get an existing session first, if available
      let accessToken = null;
      try {
        const session = await this.getEMRSession(userId, system);
        if (session && session.accessToken) {
          accessToken = decryptPHI(session.accessToken);
          console.log('🔑 Using existing EMR session for authenticated request');
        }
      } catch (sessionError) {
        console.log('⚠️ No existing EMR session found, trying unauthenticated request');
      }

      // Make the API call with or without authentication
      const headers: Record<string, string> = {
        Accept: "application/fhir+json",
        'Content-Type': 'application/fhir+json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('🔐 Making authenticated EMR API request');
      } else {
        console.log('🔓 Making unauthenticated EMR API request (may require authentication)');
      }

      const response = await fetch(searchUrl.toString(), {
        headers,
      });

      console.log('📊 EMR API response status:', response.status);
      console.log('📊 EMR API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ EMR API error response:', errorText);
        
        if (response.status === 401) {
          throw new Error("Authentication required. Please use the 'Start OAuth' button to authenticate with eClinicalWorks first.");
        } else if (response.status === 403) {
          throw new Error("Access forbidden. Please check your eClinicalWorks API permissions and authentication status.");
        } else if (response.status === 404) {
          throw new Error("EMR endpoint not found. Please verify the eClinicalWorks FHIR base URL configuration.");
        } else if (response.status >= 500) {
          throw new Error("EMR server error. Please try again later or contact eClinicalWorks support.");
        } else {
          throw new Error(`EMR API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      const searchResults = await response.json();
      console.log('✅ EMR API search results received:', searchResults);

      // Transform FHIR Bundle to our format
      const patients: EMRPatientData[] = (searchResults.entry || []).map((entry: any) => {
        const patient = entry.resource;
        return {
          patientId: patient.id,
          mrn: patient.identifier?.find((id: any) => 
            id.type?.coding?.[0]?.code === 'MR' || 
            id.type?.coding?.[0]?.code === 'MRN'
          )?.value || patient.identifier?.[0]?.value || "",
          demographics: {
            firstName: patient.name?.[0]?.given?.[0] || "",
            lastName: patient.name?.[0]?.family || "",
            dateOfBirth: patient.birthDate || "",
            gender: patient.gender || "",
            phone: patient.telecom?.find((t: any) => t.system === "phone")?.value || "",
            email: patient.telecom?.find((t: any) => t.system === "email")?.value || "",
            address: {
              street: patient.address?.[0]?.line?.[0] || "",
              city: patient.address?.[0]?.city || "",
              state: patient.address?.[0]?.state || "",
              zipCode: patient.address?.[0]?.postalCode || "",
            },
          },
          medicalHistory: {
            allergies: [],
            medications: [],
            conditions: [],
          },
          appointments: [],
        };
      });

      console.log('✅ Transformed patient data:', patients.length, 'patients found');
      return patients;

    } catch (error) {
      console.error('❌ Real EMR API call failed:', error);
      
      // If the real API call fails, provide helpful error information
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          throw new Error("EMR authentication required. Please use the 'Start OAuth' button to authenticate with eClinicalWorks first.");
        } else if (error.message.includes('Access forbidden')) {
          throw new Error("EMR access forbidden. Please check your eClinicalWorks API permissions and authentication status.");
        } else {
          throw new Error(`EMR API call failed: ${error.message}`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Get mock patient search results for development/testing
   */
  private getMockPatientSearchResults(searchParams: { firstName: string; lastName: string; dateOfBirth: string }): EMRPatientData[] {
    const { firstName, lastName, dateOfBirth } = searchParams;
    
    // Define multiple test patients for different scenarios
    const testPatients = [
      {
        firstName: "Sarah",
        lastName: "Johnson", 
        dateOfBirth: "1985-03-15",
        patientId: "mock-patient-sarah-001",
        mrn: "MRN001234",
        gender: "female",
        phone: "(555) 123-4567",
        email: "sarah.johnson@email.com",
        allergies: ["Penicillin", "Shellfish"],
        medications: [
          {
            name: "Sumatriptan",
            dosage: "50mg", 
            frequency: "As needed for migraines",
            startDate: "2024-01-15",
            isActive: true,
          },
          {
            name: "Propranolol",
            dosage: "40mg",
            frequency: "Twice daily",
            startDate: "2024-02-01", 
            isActive: true,
          },
        ],
        conditions: ["Migraine with Aura", "Essential Hypertension"],
        appointments: [
          {
            id: "appt-001",
            scheduledAt: "2024-12-15T10:00:00Z",
            type: "Neurology Follow-up",
            provider: "Dr. Emily Smith, MD",
            status: "scheduled",
          },
          {
            id: "appt-002", 
            scheduledAt: "2025-01-20T14:30:00Z",
            type: "Headache Clinic",
            provider: "Dr. Michael Chen, MD",
            status: "scheduled",
          },
        ],
      },
      {
        firstName: "Michael",
        lastName: "Chen",
        dateOfBirth: "1978-09-22",
        patientId: "mock-patient-michael-002",
        mrn: "MRN005678",
        gender: "male",
        phone: "(555) 987-6543",
        email: "michael.chen@email.com",
        allergies: ["Aspirin", "Latex"],
        medications: [
          {
            name: "Topiramate",
            dosage: "100mg",
            frequency: "Twice daily",
            startDate: "2024-03-01",
            isActive: true,
          },
        ],
        conditions: ["Chronic Migraine", "Medication Overuse Headache"],
        appointments: [
          {
            id: "appt-003",
            scheduledAt: "2024-12-20T09:00:00Z", 
            type: "Pain Management",
            provider: "Dr. Sarah Williams, MD",
            status: "scheduled",
          },
        ],
      },
      {
        firstName: "Emily",
        lastName: "Rodriguez",
        dateOfBirth: "1992-07-08",
        patientId: "mock-patient-emily-003",
        mrn: "MRN009876",
        gender: "female", 
        phone: "(555) 456-7890",
        email: "emily.rodriguez@email.com",
        allergies: ["Codeine"],
        medications: [
          {
            name: "Rizatriptan",
            dosage: "10mg",
            frequency: "As needed",
            startDate: "2024-04-10",
            isActive: true,
          },
          {
            name: "Magnesium Oxide",
            dosage: "400mg",
            frequency: "Daily",
            startDate: "2024-05-01",
            isActive: true,
          },
        ],
        conditions: ["Episodic Migraine", "Tension-Type Headache"],
        appointments: [
          {
            id: "appt-004",
            scheduledAt: "2024-12-18T11:00:00Z",
            type: "Preventive Care",
            provider: "Dr. James Wilson, MD", 
            status: "scheduled",
          },
        ],
      },
    ];

    // Find matching patient or return the searched patient with mock data
    const matchingPatient = testPatients.find(
      p => p.firstName.toLowerCase() === firstName.toLowerCase() && 
           p.lastName.toLowerCase() === lastName.toLowerCase() &&
           p.dateOfBirth === dateOfBirth
    );

    if (matchingPatient) {
      return [{
        patientId: matchingPatient.patientId,
        mrn: matchingPatient.mrn,
        demographics: {
          firstName: matchingPatient.firstName,
          lastName: matchingPatient.lastName,
          dateOfBirth: matchingPatient.dateOfBirth,
          gender: matchingPatient.gender,
          phone: matchingPatient.phone,
          email: matchingPatient.email,
          address: {
            street: "123 Medical Center Dr",
            city: "Boston",
            state: "MA",
            zipCode: "02101",
          },
        },
        medicalHistory: {
          allergies: matchingPatient.allergies,
          medications: matchingPatient.medications,
          conditions: matchingPatient.conditions,
        },
        appointments: matchingPatient.appointments,
      }];
    }

    // If no exact match, return a generic mock patient with the searched name/DOB
    return [{
      patientId: `mock-patient-${firstName.toLowerCase()}-${Date.now()}`,
      mrn: `MRN${Math.floor(Math.random() * 900000) + 100000}`,
      demographics: {
        firstName,
        lastName,
        dateOfBirth,
        gender: "unknown",
        phone: "(555) 000-0000",
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        address: {
          street: "456 Test St",
          city: "Boston",
          state: "MA",
          zipCode: "02101",
        },
      },
      medicalHistory: {
        allergies: ["No known allergies"],
        medications: [],
        conditions: [],
      },
      appointments: [],
    }];
  }

  /**
   * Fetch patient data from EMR system
   */
  async fetchPatientData(
    userId: string,
    system: EMRSystem,
    patientId: string
  ): Promise<EMRPatientData> {
    const session = await this.getEMRSession(userId, system);
    if (!session) {
      throw new Error("No active EMR session found");
    }

    const config = this.configs.get(system);
    if (!config) {
      throw new Error(`EMR system ${system} not configured`);
    }

    try {
      const accessToken = decryptPHI(session.accessToken);

      // Use axios for eClinicalWorks; use fetch for others
      let patientData: any;
      let medicationsData: any = { entry: [] };
      let appointmentsData: any = { entry: [] };

      if (system === EMRSystem.ECLINICALWORKS) {
        const client = this.getAxiosClient(config.apiBaseUrl, accessToken);
        const [demoRes, medsRes, apptRes, allergiesRes, conditionsRes, observationsRes] = await Promise.all([
          client.get(`/Patient/${patientId}`),
          client.get(`/MedicationRequest`, { params: { patient: patientId, _count: 50 } }),
          client.get(`/Appointment`, { params: { patient: patientId, _count: 50 } }),
          client.get(`/AllergyIntolerance`, { params: { patient: patientId, _count: 50 } }),
          client.get(`/Condition`, { params: { patient: patientId, _count: 50 } }),
          client.get(`/Observation`, { params: { patient: patientId, _count: 50 } }),
        ]);
        patientData = demoRes.data;
        medicationsData = medsRes.data || { entry: [] };
        appointmentsData = apptRes.data || { entry: [] };
        
        // Store additional data for comprehensive patient information
        const allergiesData = allergiesRes.data || { entry: [] };
        const conditionsData = conditionsRes.data || { entry: [] };
        const observationsData = observationsRes.data || { entry: [] };
        
        // Add additional data to patientData for processing
        patientData._additionalData = {
          allergies: allergiesData,
          conditions: conditionsData,
          observations: observationsData,
        };
      } else {
        // Fetch patient demographics
        const demographicsResponse = await fetch(
          `${config.apiBaseUrl}/Patient/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/fhir+json",
            },
          }
        );

        if (!demographicsResponse.ok) {
          throw new Error(
            `Failed to fetch patient demographics: ${demographicsResponse.statusText}`
          );
        }

        patientData = await demographicsResponse.json();

        // Fetch medications
        const medicationsResponse = await fetch(
          `${config.apiBaseUrl}/MedicationRequest?patient=${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/fhir+json",
            },
          }
        );

        medicationsData = medicationsResponse.ok
          ? await medicationsResponse.json()
          : { entry: [] };

        // Fetch appointments
        const appointmentsResponse = await fetch(
          `${config.apiBaseUrl}/Appointment?patient=${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/fhir+json",
            },
          }
        );

        appointmentsData = appointmentsResponse.ok
          ? await appointmentsResponse.json()
          : { entry: [] };
      }

      // Transform FHIR data to our format
      const transformedData: EMRPatientData = {
        patientId,
        mrn: patientData.identifier?.[0]?.value || "",
        demographics: {
          firstName: patientData.name?.[0]?.given?.[0] || "",
          lastName: patientData.name?.[0]?.family || "",
          dateOfBirth: patientData.birthDate || "",
          gender: patientData.gender || "",
          phone:
            patientData.telecom?.find((t: any) => t.system === "phone")
              ?.value || "",
          email:
            patientData.telecom?.find((t: any) => t.system === "email")
              ?.value || "",
          address: {
            street: patientData.address?.[0]?.line?.[0] || "",
            city: patientData.address?.[0]?.city || "",
            state: patientData.address?.[0]?.state || "",
            zipCode: patientData.address?.[0]?.postalCode || "",
          },
        },
        medicalHistory: {
          allergies: patientData._additionalData?.allergies?.entry?.map((entry: any) => {
            const allergy = entry.resource;
            return allergy.code?.coding?.[0]?.display || 
                   allergy.code?.text || 
                   allergy.substance?.coding?.[0]?.display || 
                   "Unknown allergy";
          }) || [],
          medications:
            medicationsData.entry?.map((entry: any) => ({
              name: entry.resource.medicationCodeableConcept?.text || 
                    entry.resource.medicationCodeableConcept?.coding?.[0]?.display || "",
              dosage: entry.resource.dosageInstruction?.[0]?.text || 
                     entry.resource.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value + 
                     " " + entry.resource.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || "",
              frequency:
                entry.resource.dosageInstruction?.[0]?.timing?.repeat
                  ?.frequency || 
                entry.resource.dosageInstruction?.[0]?.timing?.code?.text || "",
              startDate: entry.resource.authoredOn || entry.resource.dateWritten || "",
              isActive: entry.resource.status === "active",
            })) || [],
          conditions: patientData._additionalData?.conditions?.entry?.map((entry: any) => {
            const condition = entry.resource;
            return condition.code?.coding?.[0]?.display || 
                   condition.code?.text || 
                   "Unknown condition";
          }) || [],
        },
        appointments:
          appointmentsData.entry?.map((entry: any) => ({
            id: entry.resource.id,
            scheduledAt: entry.resource.start || "",
            type: entry.resource.serviceType?.[0]?.text || "",
            provider:
              entry.resource.participant?.find((p: any) =>
                p.actor?.reference?.includes("Practitioner")
              )?.actor?.display || "",
            status: entry.resource.status,
          })) || [],
      };

      // Log successful data fetch
      await logAuditEvent({
        userId,
        action: AuditAction.READ,
        resource: AuditResource.EMR_DATA,
        resourceId: patientId,
        details: {
          description: `Patient data fetched from ${system}`,
          accessMethod: "web_browser",
          emrSystem: system,
          dataTypes: ["demographics", "medications", "appointments"],
        },
        ipAddress: "system",
        userAgent: "system",
        sessionId: await this.generateSessionId(),
        success: true,
        riskLevel: RiskLevel.LOW,
      });

      return transformedData;
    } catch (error) {
      // Log failed data fetch
      await logAuditEvent({
        userId,
        action: AuditAction.READ_FAILED,
        resource: AuditResource.EMR_DATA,
        resourceId: patientId,
        details: {
          description: `Failed to fetch patient data from ${system}`,
          accessMethod: "web_browser",
          emrSystem: system,
          error: (error as Error).message,
        },
        ipAddress: "system",
        userAgent: "system",
        sessionId: await this.generateSessionId(),
        success: false,
        riskLevel: RiskLevel.MEDIUM,
        errorMessage: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Create a new Patient in the EMR (FHIR Patient resource)
   */
  async createPatient(
    userId: string,
    system: EMRSystem,
    patientResource: Record<string, any>
  ): Promise<{ id: string; resource: any }> {
    const session = await this.getEMRSession(userId, system);
    if (!session) {
      throw new Error("No active EMR session found");
    }
    const config = this.configs.get(system);
    if (!config) {
      throw new Error(`EMR system ${system} not configured`);
    }
    const accessToken = decryptPHI(session.accessToken);

    try {
      if (system === EMRSystem.ECLINICALWORKS) {
        const client = this.getAxiosClient(config.apiBaseUrl, accessToken);
        const response = await client.post("/Patient", patientResource, {
          headers: { "Content-Type": "application/fhir+json" },
        });
        const created = response.data;
        const id = created.id || created.entry?.[0]?.resource?.id || "";

        await logAuditEvent({
          userId,
          action: AuditAction.CREATE,
          resource: AuditResource.EMR_DATA,
          details: {
            description: `Created Patient in ${system}`,
            accessMethod: "web_browser",
            emrSystem: system,
          },
          ipAddress: "system",
          userAgent: "system",
          sessionId: await this.generateSessionId(),
          success: true,
          riskLevel: RiskLevel.LOW,
        });

        return { id, resource: created };
      }

      // Default to fetch for other systems
      const response = await fetch(`${config.apiBaseUrl}/Patient`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/fhir+json",
          Accept: "application/fhir+json",
        },
        body: JSON.stringify(patientResource),
      });

      if (!response.ok) {
        throw new Error(`Failed to create patient: ${response.statusText}`);
      }
      const created = await response.json();
      const id = created.id || "";
      return { id, resource: created };
    } catch (error) {
      await logAuditEvent({
        userId,
        action: AuditAction.CREATE,
        resource: AuditResource.EMR_DATA,
        details: {
          description: `Failed to create Patient in ${system}`,
          accessMethod: "web_browser",
          emrSystem: system,
          error: (error as Error).message,
        },
        ipAddress: "system",
        userAgent: "system",
        sessionId: await this.generateSessionId(),
        success: false,
        riskLevel: RiskLevel.MEDIUM,
        errorMessage: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get configured axios client for an EMR base URL
   */
  private getAxiosClient(baseURL: string, accessToken: string): AxiosInstance {
    const client = axios.create({ baseURL });
    client.interceptors.request.use((config) => {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      config.headers["Accept"] = "application/fhir+json";
      return config;
    });
    return client;
  }

  /**
   * Refresh EMR access token
   */
  async refreshToken(userId: string, system: EMRSystem): Promise<EMRSession> {
    const session = await this.getEMRSession(userId, system);
    if (!session?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const config = this.configs.get(system);
    if (!config) {
      throw new Error(`EMR system ${system} not configured`);
    }

    try {
      const refreshToken = decryptPHI(session.refreshToken);

      const response = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokenData = await response.json();

      const updatedSession: EMRSession = {
        ...session,
        accessToken: encryptPHI(tokenData.access_token),
        refreshToken: tokenData.refresh_token
          ? encryptPHI(tokenData.refresh_token)
          : session.refreshToken,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      };

      // Update session in database
      await this.saveEMRSession(userId, updatedSession);

      return updatedSession;
    } catch (error) {
      throw new Error(`Token refresh failed: ${(error as Error).message}`);
    }
  }

  /**
   * Save EMR session to database
   */
  private async saveEMRSession(
    userId: string,
    session: EMRSession
  ): Promise<void> {
    await setDoc(doc(db, "emr_sessions", `${userId}_${session.system}`), {
      userId,
      system: session.system,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: Timestamp.fromDate(session.expiresAt),
      patientContext: session.patientContext,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  /**
   * Get EMR session from database
   */
  private async getEMRSession(
    userId: string,
    system: EMRSystem
  ): Promise<EMRSession | null> {
    console.log('🔍 getEMRSession called with:', { userId, system });
    
    try {
      const docRef = doc(db, "emr_sessions", `${userId}_${system}`);
      console.log('📋 Firestore doc reference:', docRef.path);
      
      const sessionDoc = await getDoc(docRef);
      console.log('📄 Firestore getDoc result:', {
        exists: sessionDoc.exists(),
        hasData: sessionDoc.exists() ? 'Yes' : 'No'
      });

      if (!sessionDoc.exists()) {
        console.log('❌ No EMR session found in Firestore');
        return null;
      }

      const data = sessionDoc.data();
      console.log('✅ EMR session data retrieved successfully');
      return {
        system: data.system,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt.toDate(),
        patientContext: data.patientContext,
      };
    } catch (error) {
      console.error('❌ Firebase error in getEMRSession:', error);
      throw error;
    }
  }

  /**
   * Generate state parameter for OAuth2
   */
  private generateState(
    userId: string,
    system: EMRSystem,
    codeVerifier?: string,
    nonce?: string
  ): string {
    const stateData = {
      userId,
      system,
      timestamp: Date.now(),
      nonce: nonce || Math.random().toString(36).substring(2),
      codeVerifier,
    };

    return Buffer.from(JSON.stringify(stateData)).toString("base64");
  }

  /**
   * Generate nonce for OAuth2 PKCE
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Parse state parameter from OAuth2 callback
   */
  private parseState(state: string): {
    userId: string;
    system: EMRSystem;
    codeVerifier?: string;
  } {
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      return {
        userId: stateData.userId,
        system: stateData.system,
        codeVerifier: stateData.codeVerifier,
      };
    } catch (error) {
      throw new Error("Invalid state parameter");
    }
  }

  /**
   * Generate session ID for audit logging
   */
  private async generateSessionId(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}_${random}`;
  }


  /**
   * PKCE helpers
   */
  private generateCodeVerifier(): string {
    // 43-128 characters, unreserved URL-safe
    const random = Buffer.from(
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 256))
    );
    return random
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    // Use subtle crypto if available; fallback to node crypto
    try {
      // @ts-ignore
      const digest = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(digest));
      const hash = Buffer.from(hashArray);
      return hash
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    } catch {
      const nodeCrypto = await import("crypto");
      const hash = nodeCrypto
        .createHash("sha256")
        .update(verifier)
        .digest("base64");
      return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
  }
}

// Export singleton instance
export const emrIntegrationService = EMRIntegrationService.getInstance();
