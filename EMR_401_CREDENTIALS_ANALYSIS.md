# EMR 401 Unauthorized Error - Credentials Analysis

## 🚨 **Current Status:**
- ✅ **OAuth URL**: Correctly using new client ID `p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M`
- ✅ **No Launch Parameter**: Fixed duplicate launch parameter issue
- ❌ **401 Unauthorized**: Still getting authentication error

## 🔍 **Root Cause Analysis:**

### 1. **Credentials Mismatch**
The 401 error suggests the new credentials might not be valid with eClinicalWorks:

**New Credentials (from user):**
- Client ID: `p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M`
- Secret: `S8otD2UmerYQ4aCBpHZboByPLR-5cMKnKl4xlTqUHFYlGf3w-XVL0GZpRapWEkkV`

**Old Credentials (from Postman collection):**
- Client ID: `KmtVNTrliDQCC18Ru-QNwnPzj72of2lDndUXQBsdR6k`
- Secret: `u6vUKiO83CUFn3AtT-UFtx7p7ooESxY_UrUNI0yVTxmQINwGp9XElEVvOOD7kyPC`

### 2. **Possible Issues:**

#### A. **Invalid Credentials**
- The new credentials might not be registered with eClinicalWorks
- The credentials might be for a different environment (sandbox vs production)
- The credentials might have expired or been revoked

#### B. **Configuration Mismatch**
- The redirect URI might not match what's registered with eClinicalWorks
- The scopes might not be approved for this client
- The practice code might be incorrect

#### C. **Environment Issues**
- The credentials might be for a different eClinicalWorks environment
- The FHIR base URL might be incorrect

## 🔧 **Recommended Solutions:**

### 1. **Verify Credentials with eClinicalWorks**
- Contact eClinicalWorks support to verify the new credentials are valid
- Check if the credentials are for the correct environment (sandbox vs production)
- Verify the redirect URI is registered: `http://localhost:3000/api/emr/callback/eclinicalworks`

### 2. **Test with Postman Collection Credentials**
Let's temporarily test with the old credentials to see if the OAuth flow works:

```bash
# Update environment to use old credentials temporarily
ECLINICALWORKS_CLIENT_ID=KmtVNTrliDQCC18Ru-QNwnPzj72of2lDndUXQBsdR6k
ECLINICALWORKS_CLIENT_SECRET=u6vUKiO83CUFn3AtT-UFtx7p7ooESxY_UrUNI0yVTxmQINwGp9XElEVvOOD7kyPC
```

### 3. **Check eClinicalWorks Configuration**
- Verify the practice code `DJDIBD` is correct
- Check if the FHIR base URL `https://fhir4.healow.com/fhir/r4/DJDIBD` is correct
- Ensure the scopes are approved: `launch/patient openid profile offline_access patient/Patient.read`

### 4. **Debug OAuth Parameters**
The current OAuth URL structure looks correct:
```
https://oauthserver.eclinicalworks.com/oauth/oauth2/authorize?
  response_type=code&
  client_id=p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M&
  redirect_uri=http://localhost:3000/api/emr/callback/eclinicalworks&
  scope=launch/patient+openid+profile+offline_access+patient/Patient.read&
  state=[state]&
  aud=https://fhir4.healow.com/fhir/r4/DJDIBD&
  response_mode=query&
  practice_code=DJDIBD&
  nonce=[nonce]&
  code_challenge=[pkce_challenge]&
  code_challenge_method=S256
```

## 🧪 **Next Steps:**

1. **Test with old credentials** to verify the OAuth flow works
2. **Contact eClinicalWorks support** to verify new credentials
3. **Check eClinicalWorks developer portal** for correct configuration
4. **Verify redirect URI registration** with eClinicalWorks

## 📋 **Current OAuth Configuration:**
- ✅ Client ID: `p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M`
- ✅ Redirect URI: `http://localhost:3000/api/emr/callback/eclinicalworks`
- ✅ Scopes: `launch/patient openid profile offline_access patient/Patient.read`
- ✅ Practice Code: `DJDIBD`
- ✅ FHIR Base URL: `https://fhir4.healow.com/fhir/r4/DJDIBD`
- ✅ PKCE: Enabled with S256
- ✅ Response Mode: `query`
