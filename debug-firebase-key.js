#!/usr/bin/env node

/**
 * Firebase Admin Private Key Validator
 * This script helps debug Firebase Admin SDK private key issues
 */

require('dotenv').config({ path: '.env.development' });

console.log('🔍 Firebase Admin Key Validator\n');

// Check if environment variables exist
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

console.log('📋 Environment Variables:');
console.log(`   Project ID: ${projectId ? '✅ Found' : '❌ Missing'}`);
console.log(`   Client Email: ${clientEmail ? '✅ Found' : '❌ Missing'}`);
console.log(`   Private Key: ${privateKey ? '✅ Found' : '❌ Missing'}\n`);

if (privateKey) {
  console.log('🔑 Private Key Analysis:');
  console.log(`   Raw length: ${privateKey.length} characters`);
  
  // Process the key (replace \\n with actual newlines)
  const processedKey = privateKey.replace(/\\n/g, '\n');
  console.log(`   Processed length: ${processedKey.length} characters`);
  
  // Check if it looks like a valid private key
  const hasBeginMarker = processedKey.includes('-----BEGIN PRIVATE KEY-----');
  const hasEndMarker = processedKey.includes('-----END PRIVATE KEY-----');
  
  console.log(`   Has BEGIN marker: ${hasBeginMarker ? '✅' : '❌'}`);
  console.log(`   Has END marker: ${hasEndMarker ? '✅' : '❌'}`);
  
  if (hasBeginMarker && hasEndMarker) {
    // Extract the key content between markers
    const keyContent = processedKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    console.log(`   Key content length: ${keyContent.length} characters`);
    console.log(`   Expected length: ~1600+ characters for RSA-2048`);
    
    if (keyContent.length < 1000) {
      console.log('   ❌ Key appears to be TRUNCATED');
      console.log('   🔧 You need to generate a new service account key');
    } else {
      console.log('   ✅ Key length looks reasonable');
      
      // Try to test the key with Firebase Admin
      try {
        const admin = require('firebase-admin');
        
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: projectId,
              clientEmail: clientEmail,
              privateKey: processedKey,
            }),
          });
          console.log('   ✅ Firebase Admin initialized successfully!');
        }
      } catch (error) {
        console.log('   ❌ Firebase Admin initialization failed:');
        console.log(`      ${error.message}`);
      }
    }
  } else {
    console.log('   ❌ Invalid private key format');
  }
  
  // Show first and last few characters for debugging
  console.log(`\n📝 Key Preview:`);
  console.log(`   First 50 chars: ${privateKey.substring(0, 50)}...`);
  console.log(`   Last 50 chars: ...${privateKey.substring(privateKey.length - 50)}`);
}

console.log('\n🔧 To fix this issue:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your "headachemd" project');
console.log('3. Go to Project Settings → Service accounts');
console.log('4. Click "Generate new private key"');
console.log('5. Download the JSON file');
console.log('6. Copy the "private_key" field to your .env files');
console.log('7. Make sure to escape newlines as \\n in the .env file');
