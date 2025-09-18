#!/usr/bin/env node

/**
 * Debug OAuth 401 Error
 * Analyzes the OAuth request parameters to identify why eClinicalWorks is returning 401
 */

require('dotenv').config({ path: '.env.development' });

console.log('🔍 Debugging eClinicalWorks OAuth 401 Error');
console.log('============================================\n');

// Extract the OAuth URL from the error
const oauthUrl = 'https://oauthserver.eclinicalworks.com/oauth/oauth2/authorize?response_type=code&client_id=p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Femr%2Fcallback%2Feclinicalworks&scope=launch%2Fpatient+openid+profile+offline_access+patient%2FPatient.read&state=eyJ1c2VySWQiOiJkZXYtdXNlci0xIiwic3lzdGVtIjoiZWNsaW5pY2Fsd29ya3MiLCJ0aW1lc3RhbXAiOjE3NTgyMjAzNTEyNzEsIm5vbmNlIjoiZGNjNGNkZGZkNGNmNGNkZGNkZGNkZGNkZGNkZGNkZGMiLCJjb2RlVmVyaWZpZXIiOiJJTGF2ODEtNFdQNDBFVXlBUTlDQnMyc3YtazBzTktHMHI1aTNTVDhQZkNtanpGRnVSblMzY1VoMEVVZnlSUVltSGx4NUhndDJkVWpEZ0tBanBUeXYyZyJ9&aud=https%3A%2F%2Ffhir4.healow.com%2Ffhir%2Fr4%2FDJDIBD&response_mode=query&practice_code=DJDIBD&nonce=dcc4cddfd4cf4cddcddcddcddcddcddc&code_challenge=23hK6_rFy1UwzmZ_7oPUR4zo50W9YRKyOfj0mzntDpU&code_challenge_method=S256';

const url = new URL(oauthUrl);
const params = Object.fromEntries(url.searchParams);

console.log('📋 OAuth Request Parameters:');
console.log('----------------------------');
for (const [key, value] of Object.entries(params)) {
  console.log(`${key}: ${value}`);
}

console.log('\n🔍 Parameter Analysis:');
console.log('----------------------');

// Check each parameter
const checks = [
  {
    name: 'Client ID Format',
    check: () => params.client_id && params.client_id.length > 0,
    value: params.client_id,
    expected: 'Non-empty string'
  },
  {
    name: 'Response Type',
    check: () => params.response_type === 'code',
    value: params.response_type,
    expected: 'code'
  },
  {
    name: 'Redirect URI',
    check: () => params.redirect_uri && params.redirect_uri.includes('localhost:3000'),
    value: decodeURIComponent(params.redirect_uri),
    expected: 'http://localhost:3000/api/emr/callback/eclinicalworks'
  },
  {
    name: 'Scope Format',
    check: () => params.scope && params.scope.includes('openid'),
    value: params.scope,
    expected: 'Contains openid and other SMART scopes'
  },
  {
    name: 'State Present',
    check: () => params.state && params.state.length > 0,
    value: params.state ? '[Present]' : '[Missing]',
    expected: 'Base64 encoded state'
  },
  {
    name: 'PKCE Challenge',
    check: () => params.code_challenge && params.code_challenge_method === 'S256',
    value: `${params.code_challenge ? '[Present]' : '[Missing]'} (${params.code_challenge_method})`,
    expected: 'Present with S256 method'
  },
  {
    name: 'Audience (aud)',
    check: () => params.aud && params.aud.includes('fhir4.healow.com'),
    value: decodeURIComponent(params.aud),
    expected: 'https://fhir4.healow.com/fhir/r4/DJDIBD'
  },
  {
    name: 'Practice Code',
    check: () => params.practice_code === 'DJDIBD',
    value: params.practice_code,
    expected: 'DJDIBD'
  }
];

let allPassed = true;
for (const check of checks) {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}: ${check.value}`);
  if (!passed) {
    console.log(`   Expected: ${check.expected}`);
    allPassed = false;
  }
}

console.log('\n🚨 Potential Issues:');
console.log('--------------------');

// Common eClinicalWorks OAuth issues
const issues = [];

if (!params.client_id || params.client_id !== 'p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M') {
  issues.push('❌ Client ID mismatch or missing');
}

if (params.redirect_uri && !params.redirect_uri.includes('https://')) {
  issues.push('⚠️  Using HTTP redirect URI - eClinicalWorks may require HTTPS');
}

if (!params.scope || !params.scope.includes('launch/patient')) {
  issues.push('❌ Missing required launch/patient scope');
}

if (params.scope && params.scope.includes('launch/patient') && !params.launch) {
  issues.push('⚠️  Using launch/patient scope but no launch parameter (standalone launch)');
}

if (!params.aud || !params.aud.includes('fhir4.healow.com')) {
  issues.push('❌ Missing or incorrect audience (aud) parameter');
}

if (!params.practice_code) {
  issues.push('❌ Missing practice_code parameter');
}

if (issues.length === 0) {
  console.log('✅ No obvious parameter issues found');
} else {
  issues.forEach(issue => console.log(issue));
}

console.log('\n💡 Recommendations:');
console.log('-------------------');

console.log('1. 🔐 Verify credentials are active in eClinicalWorks portal');
console.log('2. 🌐 Check if HTTPS redirect URI is required');
console.log('3. 📋 Confirm practice code DJDIBD is correct');
console.log('4. 🔍 Test with minimal scopes first');
console.log('5. 📞 Contact eClinicalWorks support for credential validation');

console.log('\n🧪 Test Suggestions:');
console.log('--------------------');
console.log('Try these OAuth parameter variations:');
console.log('• Remove launch/patient scope for pure standalone launch');
console.log('• Use HTTPS redirect URI if available');
console.log('• Test with minimal scopes: openid profile');
console.log('• Verify practice_code with eClinicalWorks');
