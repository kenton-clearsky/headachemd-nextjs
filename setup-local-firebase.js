#!/usr/bin/env node

/**
 * Local Firebase Setup Helper
 * This script helps set up Firebase for local development
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Firebase Local Development Setup\n');

// Check if we can use Firebase emulators instead
console.log('Option 1: Use Firebase Emulators (Recommended for local dev)');
console.log('This avoids needing the admin private key for local development.\n');

console.log('To set up Firebase emulators:');
console.log('1. Run: firebase init emulators');
console.log('2. Select: Authentication, Firestore, Functions');
console.log('3. Use default ports or customize');
console.log('4. Run: firebase emulators:start\n');

// Check current environment files
const envFiles = ['.env.local', '.env.development'];
console.log('📋 Current Environment Files:');

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

console.log('\n🔑 Firebase Admin Key Options:');
console.log('Since organization policies prevent generating new keys, you have these options:\n');

console.log('Option A: Use Firebase Emulators (Recommended)');
console.log('- No admin key needed');
console.log('- Perfect for local development');
console.log('- Isolated test environment\n');

console.log('Option B: Request Admin Key from IT/Admin');
console.log('- Contact your Firebase project administrator');
console.log('- Request a service account JSON file');
console.log('- Use the private_key field from that file\n');

console.log('Option C: Use Application Default Credentials');
console.log('- Run: gcloud auth application-default login');
console.log('- This uses your personal Google credentials');
console.log('- May work for development purposes\n');

// Create a sample .env.local template
const envTemplate = `# Firebase Client Configuration (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCRJHNyiW8NMqa1DEmEsOouA7lIfFwd9XM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=headachemd.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=headachemd
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=headachemd.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=109987892469
NEXT_PUBLIC_FIREBASE_APP_ID=1:109987892469:web:48875d9a9d65383ff289bc

# Firebase Admin Configuration (Backend) - NEEDS VALID PRIVATE KEY
FIREBASE_ADMIN_PROJECT_ID=headachemd
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@headachemd.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="REPLACE_WITH_COMPLETE_PRIVATE_KEY_FROM_SERVICE_ACCOUNT_JSON"

# Other Configuration
NEXTAUTH_SECRET=local-development-secret-change-this
NEXTAUTH_URL=http://localhost:3000
ENCRYPTION_KEY=123456789012345678901234567890AW
GOOGLE_CLOUD_PROJECT_ID=headachemd
GOOGLE_CLOUD_REGION=us-central1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# For Firebase Emulators (uncomment if using emulators)
# FIRESTORE_EMULATOR_HOST=localhost:8080
# FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
`;

// Write template if .env.local doesn't exist
const envLocalPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
  fs.writeFileSync(envLocalPath, envTemplate);
  console.log('✅ Created .env.local template file');
  console.log('   Please edit it with your Firebase Admin private key\n');
}

console.log('🚀 Next Steps:');
console.log('1. Choose one of the options above');
console.log('2. If using emulators: firebase emulators:start');
console.log('3. If using real Firebase: update FIREBASE_ADMIN_PRIVATE_KEY in .env.local');
console.log('4. Run: npm run dev');
console.log('5. Test: node debug-firebase-key.js');
