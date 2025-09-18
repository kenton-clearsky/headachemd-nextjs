/**
 * eClinicalWorks Backend Services Authentication
 * Implements OAuth 2.0 Client Credentials flow with JWT assertions
 * for server-to-server authentication without user interaction
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface BackendAuthConfig {
  clientId: string;
  privateKey: string;
  tokenEndpoint: string;
  fhirBaseUrl: string;
  practiceCode?: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export class EClinicalWorksBackendAuth {
  private clientId: string;
  private privateKey: string;
  private tokenEndpoint: string;
  private fhirBaseUrl: string;
  private practiceCode?: string;
  private cachedToken?: {
    token: string;
    expiresAt: number;
  };

  constructor(config: BackendAuthConfig) {
    this.clientId = config.clientId;
    this.privateKey = config.privateKey;
    this.tokenEndpoint = config.tokenEndpoint;
    this.fhirBaseUrl = config.fhirBaseUrl;
    this.practiceCode = config.practiceCode;
  }

  /**
   * Generate JWT assertion for client authentication
   */
  private generateJWT(): string {
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      iss: this.clientId,           // Issuer (client ID)
      sub: this.clientId,           // Subject (client ID)
      aud: this.tokenEndpoint,      // Audience (token endpoint)
      jti: crypto.randomUUID(),     // JWT ID (unique identifier)
      iat: now,                     // Issued at
      exp: now + 300,               // Expires in 5 minutes
    };

    console.log('🔐 Generating JWT with payload:', {
      ...payload,
      jti: payload.jti.substring(0, 8) + '...',
    });

    try {
      return jwt.sign(payload, this.privateKey, { 
        algorithm: 'RS256',
        header: { 
          typ: 'JWT', 
          alg: 'RS256' 
        }
      });
    } catch (error) {
      console.error('❌ JWT generation failed:', error);
      throw new Error(`JWT generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Exchange JWT for access token using client credentials flow
   */
  async getAccessToken(scopes: string[] = ['system/Patient.read']): Promise<AccessTokenResponse> {
    // Check if we have a valid cached token
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      console.log('✅ Using cached access token');
      return {
        access_token: this.cachedToken.token,
        token_type: 'bearer',
        expires_in: Math.floor((this.cachedToken.expiresAt - Date.now()) / 1000)
      };
    }

    console.log('🔄 Requesting new access token...');
    console.log('📋 Token request details:', {
      endpoint: this.tokenEndpoint,
      clientId: this.clientId,
      scopes: scopes,
      practiceCode: this.practiceCode
    });

    try {
      const clientAssertion = this.generateJWT();
      
      const requestBody = new URLSearchParams({
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: clientAssertion,
        scope: scopes.join(' ')
      });

      // Add practice code if provided
      if (this.practiceCode) {
        requestBody.append('practice_code', this.practiceCode);
      }

      console.log('📤 Making token request...');
      
      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'HeadacheMD/1.0'
        },
        body: requestBody
      });

      console.log('📊 Token response status:', response.status, response.statusText);

      const responseText = await response.text();
      console.log('📄 Token response body:', responseText);

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText} - ${responseText}`);
      }

      const tokenResponse: AccessTokenResponse = JSON.parse(responseText);
      
      // Cache the token (subtract 30 seconds for safety margin)
      if (tokenResponse.expires_in) {
        this.cachedToken = {
          token: tokenResponse.access_token,
          expiresAt: Date.now() + (tokenResponse.expires_in - 30) * 1000
        };
      }

      console.log('✅ Access token obtained successfully');
      console.log('📋 Token details:', {
        token_type: tokenResponse.token_type,
        expires_in: tokenResponse.expires_in,
        scope: tokenResponse.scope,
        token_preview: tokenResponse.access_token.substring(0, 20) + '...'
      });

      return tokenResponse;
      
    } catch (error) {
      console.error('❌ Token request failed:', error);
      throw error;
    }
  }

  /**
   * Make authenticated FHIR API request
   */
  async makeAuthenticatedRequest(
    endpoint: string, 
    options: RequestInit = {},
    scopes?: string[]
  ): Promise<Response> {
    console.log('🌐 Making authenticated FHIR request to:', endpoint);
    
    try {
      const tokenResponse = await this.getAccessToken(scopes);
      
      const url = endpoint.startsWith('http') ? endpoint : `${this.fhirBaseUrl}/${endpoint}`;
      
      console.log('📤 FHIR request details:', {
        url,
        method: options.method || 'GET',
        hasAuth: !!tokenResponse.access_token
      });

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${tokenResponse.access_token}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        }
      });

      console.log('📊 FHIR response status:', response.status, response.statusText);
      
      return response;
      
    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      throw error;
    }
  }

  /**
   * Get patient data using backend services
   */
  async getPatients(searchParams?: Record<string, string>): Promise<any> {
    console.log('👥 Fetching patients with backend services...');
    
    let endpoint = 'Patient';
    
    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      endpoint += `?${params.toString()}`;
    }

    const response = await this.makeAuthenticatedRequest(
      endpoint,
      { method: 'GET' },
      ['system/Patient.read']
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Patient search failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Patients retrieved successfully:', data.total || 0, 'patients');
    
    return data;
  }

  /**
   * Test the backend services connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    console.log('🧪 Testing backend services connection...');
    
    try {
      // First, try to get an access token
      const tokenResponse = await this.getAccessToken(['system/Patient.read']);
      
      if (!tokenResponse.access_token) {
        return {
          success: false,
          message: 'Failed to obtain access token',
          details: tokenResponse
        };
      }

      // Then, try to make a simple FHIR request
      const response = await this.makeAuthenticatedRequest('metadata');
      
      if (response.ok) {
        const metadata = await response.json();
        return {
          success: true,
          message: 'Backend services connection successful',
          details: {
            fhirVersion: metadata.fhirVersion,
            software: metadata.software?.name,
            implementation: metadata.implementation?.description
          }
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `FHIR request failed: ${response.status} ${response.statusText}`,
          details: { error: errorText }
        };
      }
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }
}

/**
 * Create backend auth instance from environment variables
 */
export function createBackendAuth(): EClinicalWorksBackendAuth {
  const clientId = process.env.ECLINICALWORKS_CLIENT_ID || process.env.EMR_ECLINICALWORKS_CLIENT_ID;
  const privateKey = process.env.ECLINICALWORKS_PRIVATE_KEY;
  const tokenEndpoint = process.env.ECLINICALWORKS_TOKEN_URL || 'https://oauthserver.eclinicalworks.com/oauth/oauth2/token';
  const fhirBaseUrl = process.env.ECLINICALWORKS_FHIR_BASE_URL || 'https://fhir4.healow.com/fhir/r4/DJDIBD';
  const practiceCode = process.env.ECLINICALWORKS_PRACTICE_CODE || 'DJDIBD';

  if (!clientId) {
    throw new Error('ECLINICALWORKS_CLIENT_ID environment variable is required');
  }

  if (!privateKey) {
    throw new Error('ECLINICALWORKS_PRIVATE_KEY environment variable is required');
  }

  return new EClinicalWorksBackendAuth({
    clientId,
    privateKey,
    tokenEndpoint,
    fhirBaseUrl,
    practiceCode
  });
}
