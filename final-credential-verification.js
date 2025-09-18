#!/usr/bin/env node

/**
 * Final Credential Verification Test
 * Verifies the exact credentials provided by the user
 */

require('dotenv').config({ path: '.env.development' });

console.log('🔐 Final eClinicalWorks Credential Verification');
console.log('===============================================\n');

// Confirmed credentials from user
const CONFIRMED_CREDENTIALS = {
  clientId: 'p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M',
  clientSecret: 'S8otD2UmerYQ4aCBpHZboByPLR-5cMKnKl4xlTqUHFYlGf3w-XVL0GZpRapWEkkV',
  baseUrl: 'https://fhir4.healow.com/fhir/r4/DJDIBD',
  practiceCode: 'DJDIBD'
};

console.log('✅ Confirmed Credentials:');
console.log('========================');
console.log(`Client ID: ${CONFIRMED_CREDENTIALS.clientId}`);
console.log(`Client Secret: ${CONFIRMED_CREDENTIALS.clientSecret.substring(0, 20)}...`);
console.log(`Base URL: ${CONFIRMED_CREDENTIALS.baseUrl}`);
console.log(`Practice Code: ${CONFIRMED_CREDENTIALS.practiceCode}`);

console.log('\n🔍 Environment Variable Verification:');
console.log('=====================================');

const envClientId = process.env.ECLINICALWORKS_CLIENT_ID || process.env.EMR_ECLINICALWORKS_CLIENT_ID;
const envClientSecret = process.env.ECLINICALWORKS_CLIENT_SECRET || process.env.EMR_ECLINICALWORKS_CLIENT_SECRET;
const envBaseUrl = process.env.ECLINICALWORKS_FHIR_BASE_URL;
const envPracticeCode = process.env.ECLINICALWORKS_PRACTICE_CODE;

const checks = [
  {
    name: 'Client ID',
    expected: CONFIRMED_CREDENTIALS.clientId,
    actual: envClientId,
    match: envClientId === CONFIRMED_CREDENTIALS.clientId
  },
  {
    name: 'Client Secret',
    expected: CONFIRMED_CREDENTIALS.clientSecret,
    actual: envClientSecret,
    match: envClientSecret === CONFIRMED_CREDENTIALS.clientSecret
  },
  {
    name: 'Base URL',
    expected: CONFIRMED_CREDENTIALS.baseUrl,
    actual: envBaseUrl,
    match: envBaseUrl === CONFIRMED_CREDENTIALS.baseUrl
  },
  {
    name: 'Practice Code',
    expected: CONFIRMED_CREDENTIALS.practiceCode,
    actual: envPracticeCode,
    match: envPracticeCode === CONFIRMED_CREDENTIALS.practiceCode
  }
];

let allMatch = true;

checks.forEach(check => {
  const icon = check.match ? '✅' : '❌';
  console.log(`${icon} ${check.name}: ${check.match ? 'MATCH' : 'MISMATCH'}`);
  
  if (!check.match) {
    console.log(`   Expected: ${check.expected}`);
    console.log(`   Actual: ${check.actual || 'NOT SET'}`);
    allMatch = false;
  }
});

console.log(`\n📊 Overall Status: ${allMatch ? '✅ ALL CREDENTIALS MATCH' : '❌ CREDENTIAL MISMATCH'}`);

if (allMatch) {
  console.log('\n🎉 Perfect! All credentials are correctly configured.');
  console.log('📋 Summary of what we accomplished:');
  console.log('');
  console.log('✅ Identified root cause: aud parameter rejection in authorization code flow');
  console.log('✅ Implemented backend services (client credentials) flow');
  console.log('✅ Generated RSA key pair for JWT authentication');
  console.log('✅ Created comprehensive test suite');
  console.log('✅ Deployed to production with HTTPS');
  console.log('✅ Verified all credentials match exactly');
  console.log('');
  console.log('🚀 Ready for eClinicalWorks backend services registration!');
  console.log('');
  console.log('📞 Next step: Contact eClinicalWorks support with:');
  console.log('   • Client ID: p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M');
  console.log('   • Public key: keys/eclinicalworks-public.pem');
  console.log('   • Request: Enable client_credentials grant type');
  console.log('   • Request: Register public key for JWT validation');
  console.log('   • Request: Whitelist system/Patient.read and other system scopes');
} else {
  console.log('\n⚠️  Please update your .env.development file with the correct credentials.');
}

console.log('\n📋 Files Ready for eClinicalWorks Support:');
console.log('=========================================');
console.log('📄 Public Key: keys/eclinicalworks-public.pem');
console.log('📄 Setup Instructions: keys/KEY_SETUP_INSTRUCTIONS.md');
console.log('📄 Implementation Guide: OAUTH2_BACKEND_SERVICES_GUIDE.md');
console.log('📄 Final Summary: EMR_INTEGRATION_FINAL_SUMMARY.md');

console.log('\n🎯 Expected Timeline:');
console.log('====================');
console.log('📞 Contact eClinicalWorks: Today');
console.log('⏳ eClinicalWorks Response: 1-2 business days');
console.log('🔐 Backend Services Enabled: 2-3 business days');
console.log('🧪 Testing & Go-Live: Same day as enablement');
console.log('');
console.log('🎉 Total time to resolution: 2-3 business days!');
