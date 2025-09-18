# EMR 401 Unauthorized Error Analysis

## 🚨 **Current Issue:**
- **Error**: `net::ERR_HTTP_RESPONSE_CODE_FAILURE 401 (Unauthorized)`
- **OAuth URL**: Contains old client ID `ajuwN0Gs3bbFrhuCN9-K8SiOd9V-sytBU1gTJSMuTow`
- **Expected Client ID**: `KmtVNTrliDQCC18Ru-QNwnPzj72of2lDndUXQBsdR6k`

## 🔍 **Root Cause Analysis:**

### 1. **Environment Variable Priority Issue**
The EMR integration code checks for environment variables in this order:
```typescript
clientId: (process.env.EMR_ECLINICALWORKS_CLIENT_ID || process.env.ECLINICALWORKS_CLIENT_ID || "").trim().replace(/\s+/g, ''),
```

### 2. **Current Environment Status**
- ✅ `.env.development` has correct `ECLINICALWORKS_CLIENT_ID=KmtVNTrliDQCC18Ru-QNwnPzj72of2lDndUXQBsdR6k`
- ❌ No `EMR_ECLINICALWORKS_CLIENT_ID` variable found
- ❌ Server is still using old client ID in OAuth URL generation

### 3. **Possible Causes**
1. **Environment Caching**: Server process cached old environment variables
2. **Multiple Environment Files**: Different env file being loaded
3. **Environment Variable Override**: System-level environment variables
4. **Build Cache**: Next.js build cache containing old values

## 🔧 **Solutions to Try:**

### Solution 1: Add Missing Environment Variable
Add the `EMR_ECLINICALWORKS_CLIENT_ID` variable to `.env.development`:

```bash
# Add this line to .env.development
EMR_ECLINICALWORKS_CLIENT_ID=KmtVNTrliDQCC18Ru-QNwnPzj72of2lDndUXQBsdR6k
EMR_ECLINICALWORKS_CLIENT_SECRET=u6vUKiO83CUFn3AtT-UFtx7p7ooESxY_UrUNI0yVTxmQINwGp9XElEVvOOD7kyPC
```

### Solution 2: Clear Next.js Cache
```bash
rm -rf .next
npm run dev:mock
```

### Solution 3: Check System Environment Variables
```bash
env | grep -i eclinical
```

### Solution 4: Force Environment Reload
Restart the server with explicit environment variable:
```bash
ECLINICALWORKS_CLIENT_ID=KmtVNTrliDQCC18Ru-QNwnPzj72of2lDndUXQBsdR6k npm run dev:mock
```

## 📊 **Current OAuth URL Analysis:**

**Generated URL** (from logs):
```
https://oauthserver.eclinicalworks.com/oauth/oauth2/authorize?
  response_type=code&
  client_id=ajuwN0Gs3bbFrhuCN9-K8SiOd9V-sytBU1gTJSMuTow&  ← WRONG CLIENT ID
  redirect_uri=http://localhost:3000/api/emr/callback/eclinicalworks&
  scope=launch/patient+openid+profile+offline_access+patient/Patient.read&
  state=[base64-state]&
  aud=https://fhir4.healow.com/fhir/r4/DJDIBD&
  response_mode=query&
  practice_code=DJDIBD&
  nonce=[nonce]&
  code_challenge=[pkce-challenge]&
  code_challenge_method=S256
```

**Expected URL**:
```
https://oauthserver.eclinicalworks.com/oauth/oauth2/authorize?
  response_type=code&
  client_id=KmtVNTrliDQCC18Ru-QNwnPzj72of2lDndUXQBsdR6k&  ← CORRECT CLIENT ID
  redirect_uri=http://localhost:3000/api/emr/callback/eclinicalworks&
  scope=launch/patient+openid+profile+offline_access+patient/Patient.read&
  state=[base64-state]&
  aud=https://fhir4.healow.com/fhir/r4/DJDIBD&
  response_mode=query&
  practice_code=DJDIBD&
  nonce=[nonce]&
  code_challenge=[pkce-challenge]&
  code_challenge_method=S256
```

## ✅ **Progress Made:**
1. ✅ Fixed launch parameter validation error
2. ✅ OAuth URL structure is correct
3. ✅ All required parameters are present
4. ✅ PKCE implementation is working
5. ❌ Client ID is still incorrect (causing 401 error)

## 🎯 **Next Steps:**
1. Add `EMR_ECLINICALWORKS_CLIENT_ID` to environment file
2. Clear Next.js cache
3. Restart server
4. Test OAuth URL generation
5. Verify 401 error is resolved

## 🚀 **Expected Result:**
Once the correct client ID is used, the OAuth flow should work without the 401 Unauthorized error, allowing successful authentication with eClinicalWorks.
