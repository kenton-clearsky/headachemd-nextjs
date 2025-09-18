#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 HeadacheMD Development Setup');
console.log('===============================\n');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envDevPath = path.join(process.cwd(), '.env.development');

if (!fs.existsSync(envDevPath)) {
  console.error('❌ .env.development file not found!');
  console.error('Please ensure you have the development environment file.');
  process.exit(1);
}

// Copy development config to .env.local
try {
  fs.copyFileSync(envDevPath, envLocalPath);
  console.log('✅ Development configuration loaded to .env.local');
} catch (error) {
  console.error('❌ Failed to copy development configuration:', error.message);
  process.exit(1);
}

// Validate the configuration
console.log('\n🔍 Validating configuration...');

try {
  require('dotenv').config({ path: envLocalPath });
  
  const requiredVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_ENABLE_DEV_MODE',
    'NEXT_PUBLIC_SKIP_AUTH_IN_DEV'
  ];
  
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  console.log('✅ Configuration validation passed');
  
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

// Show configuration summary
console.log('\n📋 Development Configuration Summary:');
console.log('=====================================');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`App Name: ${process.env.NEXT_PUBLIC_APP_NAME || 'HeadacheMD'}`);
console.log(`App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
console.log(`Firebase Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
console.log(`Dev Mode: ${process.env.NEXT_PUBLIC_ENABLE_DEV_MODE}`);
console.log(`Skip Auth: ${process.env.NEXT_PUBLIC_SKIP_AUTH_IN_DEV}`);
console.log(`Use Emulators: ${process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS}`);

// Show next steps
console.log('\n🚀 Next Steps:');
console.log('==============');
console.log('1. Start development server: npm run dev:mock');
console.log('2. Open browser to: http://localhost:3000');
console.log('3. You should be automatically logged in as a mock admin user');
console.log('4. Access admin dashboard: http://localhost:3000/admin');
console.log('5. Access patient portal: http://localhost:3000/patient');

console.log('\n📚 Available Commands:');
console.log('=======================');
console.log('npm run dev:mock        - Start with mock authentication');
console.log('npm run dev:real        - Start with real Firebase auth');
console.log('npm run dev:emulators   - Start with Firebase emulators');
console.log('npm run config:show     - Show current configuration');
console.log('npm run config:validate - Validate configuration');

console.log('\n✅ Development environment setup complete!');
console.log('Happy coding! 🎉');
