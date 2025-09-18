#!/usr/bin/env node

/**
 * Debug eClinicalWorks OAuth Response
 * Makes a direct request to eClinicalWorks OAuth server to see the actual error response
 */

const https = require('https');
const { URL } = require('url');

console.log('🔍 Debugging eClinicalWorks OAuth Response');
console.log('==========================================\n');

// The exact URL from your error
const oauthUrl = 'https://oauthserver.eclinicalworks.com/oauth/oauth2/authorize?response_type=code&client_id=p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M&redirect_uri=https%3A%2F%2Fheadachemd-nextjs-sznczbmgha-uc.a.run.app%2Fapi%2Femr%2Fcallback%2Feclinicalworks&scope=launch%2Fpatient+openid+profile+offline_access+patient%2FPatient.read&state=eyJ1c2VySWQiOiJhZG1pbi11c2VyLTEiLCJzeXN0ZW0iOiJlY2xpbmljYWx3b3JrcyIsInRpbWVzdGFtcCI6MTc1ODIyMTUxNzA0NCwibm9uY2UiOiJvajB0amx1cmt2bWZwcnAxNGkiLCJjb2RlVmVyaWZpZXIiOiJGQXNhY0w4U3d2UjlpRU91emZWV0ZaNWlYYlk5cjBsNXhTbm1WU1Bwb0d3Nk5LbU5mbzVrWEJmQ1Zxenk0N1I5eTB6czlJN1FrcjFhN0JhSmdLRTZ4ZyJ9&aud=https%3A%2F%2Ffhir4.healow.com%2Ffhir%2Fr4%2FDJDIBD&response_mode=query&practice_code=DJDIBD&nonce=oj0tjlurkvmfprp14i&code_challenge=LkbPX0Zg8W-07hyNPuP_RIcIwbmBbj1zlY0zuf5prbc&code_challenge_method=S256';

async function debugOAuthRequest() {
  try {
    console.log('📡 Making request to eClinicalWorks OAuth server...');
    console.log('🔗 URL:', oauthUrl);
    console.log('');

    const response = await fetch(oauthUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'HeadacheMD-Debug/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'manual' // Don't follow redirects
    });

    console.log('📊 Response Details:');
    console.log('-------------------');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`URL: ${response.url}`);
    console.log('');

    console.log('📋 Response Headers:');
    console.log('-------------------');
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
    console.log('');

    console.log('📄 Response Body:');
    console.log('----------------');
    const responseText = await response.text();
    console.log(responseText);
    console.log('');

    // Try to parse as JSON if possible
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('📋 Parsed JSON Response:');
      console.log('------------------------');
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('⚠️  Response is not valid JSON');
    }

    console.log('');
    console.log('🔍 Analysis:');
    console.log('------------');

    if (response.status === 401) {
      console.log('❌ 401 Unauthorized - Possible causes:');
      console.log('   • Invalid client_id or client_secret');
      console.log('   • Client not registered with eClinicalWorks');
      console.log('   • Incorrect redirect_uri registration');
      console.log('   • Invalid scope permissions');
      console.log('   • Practice code mismatch');
      console.log('   • OAuth parameters validation failure');
    } else if (response.status === 400) {
      console.log('❌ 400 Bad Request - Invalid OAuth parameters');
    } else if (response.status === 403) {
      console.log('❌ 403 Forbidden - Access denied');
    } else if (response.status === 302 || response.status === 307) {
      console.log('✅ Redirect response - OAuth flow initiated successfully');
      const location = response.headers.get('location');
      if (location) {
        console.log(`🔗 Redirect to: ${location}`);
      }
    }

    return { status: response.status, body: responseText, headers: Object.fromEntries(response.headers.entries()) };

  } catch (error) {
    console.error('❌ Error making request:', error);
    return null;
  }
}

async function testMinimalOAuth() {
  console.log('\n🧪 Testing with Minimal OAuth Parameters');
  console.log('========================================');

  // Test with minimal parameters to isolate the issue
  const minimalParams = new URLSearchParams({
    response_type: 'code',
    client_id: 'p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M',
    redirect_uri: 'https://headachemd-nextjs-sznczbmgha-uc.a.run.app/api/emr/callback/eclinicalworks',
    scope: 'openid profile',
    state: 'test-state-123'
  });

  const minimalUrl = `https://oauthserver.eclinicalworks.com/oauth/oauth2/authorize?${minimalParams.toString()}`;
  
  console.log('🔗 Minimal URL:', minimalUrl);

  try {
    const response = await fetch(minimalUrl, {
      method: 'GET',
      redirect: 'manual'
    });

    console.log(`📊 Minimal Test Result: ${response.status} ${response.statusText}`);
    
    if (response.status !== 401) {
      console.log('✅ Minimal parameters work! The issue is with specific parameters.');
    } else {
      console.log('❌ Even minimal parameters fail - likely credential issue.');
    }

    const body = await response.text();
    console.log('📄 Minimal Response Body:', body.substring(0, 500));

  } catch (error) {
    console.error('❌ Minimal test error:', error.message);
  }
}

async function main() {
  // Test the full OAuth request
  const result = await debugOAuthRequest();
  
  // Test with minimal parameters
  await testMinimalOAuth();

  console.log('\n💡 Recommendations:');
  console.log('-------------------');
  console.log('1. Check the response body above for specific error messages');
  console.log('2. Verify the client_id is correctly registered with eClinicalWorks');
  console.log('3. Confirm the redirect_uri is whitelisted in eClinicalWorks portal');
  console.log('4. Check if the practice_code DJDIBD is correct');
  console.log('5. Contact eClinicalWorks support with the exact error response');
  console.log('6. Verify the credentials are active and not expired');
}

// Add fetch polyfill for older Node.js versions
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main().catch(console.error);
