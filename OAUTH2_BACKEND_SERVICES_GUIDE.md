# 🔐 OAuth 2.0 Backend Services Authentication Guide

## **Overview: Avoiding UI Popups with Client Credentials Flow**

Based on research of SMART on FHIR specifications and eClinicalWorks implementations, here's how to implement **server-to-server authentication** without user interaction popups.

## **🎯 Key Concepts**

### **1. OAuth 2.0 Client Credentials Flow**
- **Purpose**: Server-to-server authentication without user interaction
- **Use Case**: Backend services accessing FHIR resources programmatically
- **Standard**: [RFC 6749 Section 4.4](https://tools.ietf.org/html/rfc6749#section-4.4)
- **SMART Profile**: [SMART Backend Services](https://build.fhir.org/ig/HL7/smart-app-launch/backend-services.html)

### **2. JWT-Based Authentication**
- **Method**: JSON Web Token (JWT) assertions for client authentication
- **Standard**: [RFC 7523](https://tools.ietf.org/html/rfc7523) - JWT Profile for OAuth 2.0
- **Security**: Uses public/private key pairs instead of client secrets

## **🔧 Implementation Steps**

### **Step 1: Client Registration Requirements**

For eClinicalWorks (and most FHIR servers), you need:

```javascript
// Required Registration Information
{
  client_id: "your-client-id",
  public_key: "X.509 certificate or JWK",
  redirect_uris: ["https://your-app.com/callback"], // Still required for registration
  grant_types: ["client_credentials"],
  response_types: ["token"],
  scope: "system/Patient.read system/Observation.read", // System-level scopes
  jwks_uri: "https://your-app.com/.well-known/jwks.json" // Optional but recommended
}
```

### **Step 2: Generate Public/Private Key Pair**

```bash
# Generate private key (minimum 2048 bits)
openssl genrsa -out privatekey.pem 2048

# Generate public certificate
openssl req -new -x509 -key privatekey.pem -out publickey509.pem -subj '/CN=HeadacheMD'

# Convert to JWK format (optional)
# Use online tools or libraries to convert PEM to JWK
```

### **Step 3: Create JWT Assertion**

```javascript
// JWT Header
const header = {
  alg: "RS256", // or RS384/RS512
  typ: "JWT",
  kid: "your-key-id" // Optional key identifier
};

// JWT Payload
const payload = {
  iss: "your-client-id",           // Issuer (your client ID)
  sub: "your-client-id",           // Subject (your client ID)
  aud: "https://oauth-server/token", // Audience (token endpoint)
  jti: generateUniqueId(),         // JWT ID (unique for each request)
  iat: Math.floor(Date.now() / 1000), // Issued at
  exp: Math.floor(Date.now() / 1000) + 300, // Expires in 5 minutes
};

// Sign the JWT
const jwt = signJWT(header, payload, privateKey);
```

### **Step 4: Exchange JWT for Access Token**

```javascript
// Token Request
const tokenRequest = {
  method: 'POST',
  url: 'https://oauthserver.eclinicalworks.com/oauth/oauth2/token',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data: new URLSearchParams({
    grant_type: 'client_credentials',
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: jwt,
    scope: 'system/Patient.read system/Observation.read' // System scopes only
  })
};

// Expected Response
{
  access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  token_type: "bearer",
  expires_in: 300, // 5 minutes
  scope: "system/Patient.read system/Observation.read"
}
```

### **Step 5: Use Access Token for FHIR Requests**

```javascript
// FHIR API Request
const fhirRequest = {
  method: 'GET',
  url: 'https://fhir4.healow.com/fhir/r4/DJDIBD/Patient',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Accept': 'application/fhir+json'
  }
};
```

## **🏥 eClinicalWorks Specific Implementation**

### **Key Differences for eClinicalWorks:**

1. **Whitelisting Required**: eClinicalWorks requires manual whitelisting of:
   - Your client ID
   - Your JWKS URL (if using JWK)
   - Your application

2. **Audience Parameter**: The `aud` in JWT should be:
   ```javascript
   aud: "https://oauthserver.eclinicalworks.com/oauth/oauth2/token"
   ```

3. **Scope Format**: Use system-level scopes:
   ```javascript
   scope: "system/Patient.read system/Observation.read system/Condition.read"
   ```

4. **Practice Code**: May need to be included in token request:
   ```javascript
   practice_code: "DJDIBD" // Your specific practice code
   ```

## **💻 Complete Implementation Example**

```javascript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class EClinicalWorksBackendAuth {
  constructor(config) {
    this.clientId = config.clientId;
    this.privateKey = config.privateKey;
    this.tokenEndpoint = config.tokenEndpoint;
    this.practiceCode = config.practiceCode;
  }

  generateJWT() {
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      iss: this.clientId,
      sub: this.clientId,
      aud: this.tokenEndpoint,
      jti: crypto.randomUUID(),
      iat: now,
      exp: now + 300 // 5 minutes
    };

    return jwt.sign(payload, this.privateKey, { 
      algorithm: 'RS256',
      header: { typ: 'JWT', alg: 'RS256' }
    });
  }

  async getAccessToken(scopes = ['system/Patient.read']) {
    const clientAssertion = this.generateJWT();
    
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: clientAssertion,
        scope: scopes.join(' '),
        ...(this.practiceCode && { practice_code: this.practiceCode })
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token request failed: ${response.status} ${error}`);
    }

    return await response.json();
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const tokenResponse = await this.getAccessToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${tokenResponse.access_token}`,
        'Accept': 'application/fhir+json'
      }
    });
  }
}

// Usage
const auth = new EClinicalWorksBackendAuth({
  clientId: 'p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M',
  privateKey: process.env.ECLINICALWORKS_PRIVATE_KEY,
  tokenEndpoint: 'https://oauthserver.eclinicalworks.com/oauth/oauth2/token',
  practiceCode: 'DJDIBD'
});

// Get patient data without UI popup
const patients = await auth.makeAuthenticatedRequest(
  'https://fhir4.healow.com/fhir/r4/DJDIBD/Patient'
);
```

## **🚨 Current Issue Analysis**

Based on your 401 error, the problem is likely:

1. **Client Not Registered for Backend Services**: Your client ID may only be registered for authorization code flow, not client credentials flow
2. **Missing Public Key**: eClinicalWorks needs your public key for JWT validation
3. **Scope Mismatch**: You may be using patient/user scopes instead of system scopes
4. **Whitelisting**: Your client may not be whitelisted for the specific practice/endpoint

## **📞 Next Steps with eClinicalWorks**

Contact eClinicalWorks support with:

```
Subject: Enable Backend Services (Client Credentials) for Client ID

Client ID: p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M
Request: 
1. Enable client_credentials grant type for this client
2. Register our public key for JWT validation
3. Whitelist for system-level scopes (system/Patient.read, etc.)
4. Confirm practice code DJDIBD access
5. Provide backend services documentation

Public Key: [Attach your publickey509.pem]
```

## **🔍 Testing Backend Services**

```javascript
// Test if backend services are enabled
const testBackendAuth = async () => {
  try {
    const jwt = generateJWT(); // Your JWT implementation
    
    const response = await fetch('https://oauthserver.eclinicalworks.com/oauth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt,
        scope: 'system/Patient.read'
      })
    });
    
    console.log('Backend auth status:', response.status);
    console.log('Response:', await response.text());
  } catch (error) {
    console.error('Backend auth error:', error);
  }
};
```

This approach completely eliminates the need for user interaction and OAuth popups by using server-to-server authentication.
