# eClinicalWorks Developer Support Request

**Subject:** OAuth Client Registration Request - HeadacheMD EMR Integration

---

## Contact Information
- **Company:** HeadacheMD
- **Application Name:** HeadacheMD - Headache Management Platform
- **Contact Email:** [YOUR_EMAIL]
- **Phone:** [YOUR_PHONE]

## Integration Overview
We are developing a headache management platform that integrates with eClinicalWorks EMR systems to provide seamless patient data access for healthcare providers. Our application follows SMART on FHIR standards and requires OAuth 2.0 authentication to access patient data.

## Current Configuration Details

### OAuth Client Information
- **Client ID:** `j3_WJLf7vqL96PrIpLh5TBD2UnWqLgmloNEfxWVuQOc`
- **Client Secret:** `AxHqEmOuFWfrS91vY3hil8LBS2kn2SNHBDOk_dxWhOcVGG5RtwRI3NiqfnBuQ0rC`

### OAuth Endpoints
- **Authorization URL:** `https://oauthserver.eclinicalworks.com/oauth/oauth2/authorize`
- **Token URL:** `https://oauthserver.eclinicalworks.com/oauth/oauth2/token`
- **FHIR Base URL:** `https://fhir4.healow.com/fhir/r4/DJDIBD`

### Redirect URI
- **Production Redirect URI:** `https://salmon-lucky-recently.ngrok-free.app/api/emr/callback/eclinicalworks`
- **Note:** This is currently using ngrok for development. We will provide the final production URL once deployed.

### Required Scopes
We require the following OAuth scopes for our integration:
- `launch/patient` - For SMART on FHIR patient context
- `openid` - For OpenID Connect authentication
- `profile` - For user profile information
- `offline_access` - For refresh token functionality
- `patient/Patient.read` - To read patient demographic data
- `patient/Appointment.read` - To access appointment information
- `patient/MedicationRequest.read` - To access medication data

## Current Issue
When attempting to initiate the OAuth flow, we receive a **403 Forbidden** error with the following response:
```json
{
  "error_description": "invalid_request",
  "error": "403",
  "error_uri": "http://www.hl7.org/fhir/smart-app-launch/"
}
```

## Technical Details

### OAuth Request Parameters
Our OAuth authorization request includes:
- `response_type=code`
- `client_id=j3_WJLf7vqL96PrIpLh5TBD2UnWqLgmloNEfxWVuQOc`
- `redirect_uri=https://salmon-lucky-recently.ngrok-free.app/api/emr/callback/eclinicalworks`
- `scope=launch/patient openid profile offline_access patient/Patient.read patient/Appointment.read patient/MedicationRequest.read`
- `state=[generated_state_parameter]`
- `aud=https://fhir4.healow.com/fhir/r4/DJDIBD`
- `nonce=[generated_nonce]`

### Application Architecture
- **Framework:** Next.js 15.4.6
- **Authentication:** OAuth 2.0 with PKCE support
- **FHIR Version:** R4
- **Integration Type:** SMART on FHIR Standalone Patient Launch

## Request
We need assistance with:

1. **Client Registration Verification:** Please confirm if our OAuth client is properly registered in your system
2. **Redirect URI Whitelisting:** Please whitelist our redirect URI for OAuth callbacks
3. **Scope Permissions:** Please verify that our requested scopes are approved for our client
4. **Environment Access:** Please confirm if we should be using sandbox or production endpoints

## Questions
1. Are these credentials for sandbox or production environment?
2. Do we need to register our application through a specific developer portal?
3. Are there any additional steps required for client activation?
4. What is the expected timeline for client registration approval?

## Compliance & Security
- Our application follows HIPAA compliance requirements
- We implement proper data encryption and secure token storage
- All patient data access is logged and audited
- We follow SMART on FHIR security best practices

## Additional Information
- **Development Environment:** Currently using ngrok for testing
- **Production Deployment:** Will be deployed to a secure cloud environment
- **Expected Go-Live Date:** [YOUR_TIMELINE]
- **Expected Volume:** [YOUR_USAGE_ESTIMATES]

## Contact for Technical Issues
- **Technical Contact:** [YOUR_NAME]
- **Email:** [YOUR_EMAIL]
- **Phone:** [YOUR_PHONE]

Thank you for your assistance. We look forward to establishing a successful integration with eClinicalWorks.

Best regards,
[YOUR_NAME]
[YOUR_TITLE]
HeadacheMD Development Team

---

**P.S.** If you need any additional technical documentation or have specific requirements for the integration, please let us know. We are committed to following all eClinicalWorks integration guidelines and best practices.
