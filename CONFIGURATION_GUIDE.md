# HeadacheMD Configuration Guide

This guide explains how to use the centralized configuration system for the HeadacheMD Next.js application.

## 🏗️ Architecture Overview

The application now uses a centralized configuration service that:
- **Validates environment variables** using Zod schemas
- **Provides type-safe access** to configuration values
- **Supports multiple environments** (development, production, test)
- **Centralizes all hardcoded values** into environment variables
- **Enables easy development mode** with mock authentication

## 📁 Configuration Files

### Environment Files
- `.env.development` - Development environment configuration
- `.env.production` - Production environment configuration
- `.env.local` - Local overrides (gitignored)
- `.env.example` - Template for environment variables

### Configuration Service
- `src/lib/config/index.ts` - Centralized configuration service
- `src/lib/dev-utils.ts` - Development utilities

## 🚀 Quick Start

### 1. Development Mode (Recommended for Development)
```bash
# Start with development configuration and mock authentication
npm run dev:config

# Or use the mock authentication mode
npm run dev:mock
```

### 2. Production Mode
```bash
# Load production configuration
npm run config:prod

# Start the application
npm run start
```

### 3. Switch Between Environments
```bash
# Switch to development
npm run config:dev

# Switch to production
npm run config:prod

# Check current environment
npm run config:show
```

## 🔧 Development Mode Features

When `NEXT_PUBLIC_ENABLE_DEV_MODE=true` and `NEXT_PUBLIC_SKIP_AUTH_IN_DEV=true`:

- **Auto-authentication** with mock admin user
- **No Firebase authentication required** for testing
- **Extended session timeouts** (2 hours vs 1 hour)
- **Relaxed rate limiting** (1000 requests vs 100)
- **Debug logging enabled**
- **Mock user data** for testing

### Mock User Details
- **Email**: `dev-info@headachemd.org` (configurable)
- **Role**: Admin
- **Profile**: Demo Admin with full access

## 📋 Available Scripts

### Development Scripts
```bash
npm run dev:config      # Start with dev config
npm run dev:mock        # Start with mock auth
npm run dev:real        # Start with real auth
npm run dev:emulators   # Start with Firebase emulators
```

### Configuration Scripts
```bash
npm run config:dev      # Load development config
npm run config:prod     # Load production config
npm run config:show     # Show current environment
npm run config:validate # Validate environment
```

### Build Scripts
```bash
npm run build:dev       # Build with dev config
npm run build:prod      # Build with prod config
npm run start:dev       # Start with dev config
npm run start:prod      # Start with prod config
```

## 🔐 Authentication Modes

### 1. Mock Authentication (Development)
- **Purpose**: Quick development and testing
- **Authentication**: Automatic mock user login
- **Firebase**: Not required
- **Use Case**: UI development, testing layouts

### 2. Real Authentication (Development)
- **Purpose**: Test real Firebase authentication
- **Authentication**: Firebase Auth required
- **Firebase**: Cloud or emulators
- **Use Case**: Authentication testing, integration testing

### 3. Production Authentication
- **Purpose**: Production deployment
- **Authentication**: Firebase Auth required
- **Firebase**: Cloud only
- **Use Case**: Live application

## 🌍 Environment Variables

### Required Variables
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

# Security
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=your_url
ENCRYPTION_KEY=your_32_char_key
```

### Development Variables
```bash
# Development Features
NEXT_PUBLIC_ENABLE_DEV_MODE=true
NEXT_PUBLIC_SKIP_AUTH_IN_DEV=true
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
NEXT_PUBLIC_FORCE_REAL_AUTH=false
ENABLE_DEBUG_LOGGING=true
SKIP_EMAIL_VERIFICATION=true
```

### Application Variables
```bash
# Application Settings
NEXT_PUBLIC_APP_NAME=HeadacheMD
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPPORT_EMAIL=support@headachemd.org
NEXT_PUBLIC_INFO_EMAIL=info@headachemd.org
```

## 🛠️ Using the Configuration Service

### Basic Usage
```typescript
import { config } from '@/lib/config';

// Environment checks
if (config.isDevelopment) {
  console.log('Running in development mode');
}

// Firebase configuration
const firebaseConfig = config.firebase;
console.log('Firebase project:', firebaseConfig.projectId);

// Application settings
console.log('App name:', config.app.name);
console.log('App URL:', config.app.url);

// Security settings
console.log('Encryption key length:', config.security.encryptionKey.length);
```

### Development Utilities
```typescript
import { DevUtils, logDevInfo, getMockUser } from '@/lib/dev-utils';

// Check development mode
if (DevUtils.isDevMode()) {
  // Development-only code
}

// Log development information
logDevInfo();

// Get mock user for testing
const mockUser = getMockUser();

// Validate development setup
const validation = DevUtils.validateDevSetup();
if (!validation.valid) {
  console.error('Development setup issues:', validation.issues);
}
```

## 🔍 Configuration Validation

The configuration service automatically validates:
- **Required environment variables** are present
- **Email addresses** are valid
- **URLs** are properly formatted
- **Boolean values** are correctly parsed
- **Number values** are valid numbers

### Validation Errors
If validation fails, the application will:
1. Log detailed error information
2. Throw an error preventing startup
3. Show which variables are missing or invalid

## 🚨 Security Considerations

### Development Mode
- **Mock authentication** bypasses security
- **Debug logging** may expose sensitive information
- **Extended timeouts** reduce security
- **Only use in development environments**

### Production Mode
- **Real authentication** required
- **Debug logging** disabled
- **Strict rate limiting** enabled
- **Standard session timeouts** enforced

## 🔄 Migration from Hardcoded Values

### Before (Hardcoded)
```typescript
const email = 'admin@headachemd.org';
const projectId = 'headachemd';
const appName = 'HeadacheMD';
```

### After (Centralized Config)
```typescript
import { config } from '@/lib/config';

const email = config.app.infoEmail;
const projectId = config.firebase.projectId;
const appName = config.app.name;
```

## 📊 Configuration Monitoring

### Development Information
```typescript
import { getDevConfigSummary } from '@/lib/dev-utils';

const summary = getDevConfigSummary();
console.table(summary);
```

### Environment Status
```typescript
import { config } from '@/lib/config';

console.log('Environment:', config.isDevelopment ? 'Development' : 'Production');
console.log('Dev mode enabled:', config.enableDevMode);
console.log('Skip auth in dev:', config.skipAuthInDev);
console.log('Use emulators:', config.useFirebaseEmulators);
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Configuration Validation Failed
```bash
# Check environment variables
npm run config:show

# Validate configuration
npm run config:validate
```

#### 2. Development Mode Not Working
```bash
# Ensure development config is loaded
npm run config:dev

# Check environment variables
grep "NEXT_PUBLIC_ENABLE_DEV_MODE" .env.local
```

#### 3. Authentication Issues
```bash
# For mock authentication
npm run dev:mock

# For real authentication
npm run dev:real

# For emulator testing
npm run dev:emulators
```

### Debug Information
```typescript
import { logDevInfo } from '@/lib/dev-utils';

// Log all development information
logDevInfo();

// Check configuration summary
import { getDevConfigSummary } from '@/lib/dev-utils';
console.table(getDevConfigSummary());
```

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Configuration](https://firebase.google.com/docs/web/setup)
- [Zod Schema Validation](https://zod.dev/)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Local Development Guide](./LOCAL_DEVELOPMENT_GUIDE.md)

## 🤝 Contributing

When adding new configuration options:
1. **Add to the Zod schema** in `src/lib/config/index.ts`
2. **Update environment files** (`.env.development`, `.env.production`)
3. **Add to the configuration service** with appropriate getters
4. **Update this documentation**
5. **Add validation** if needed

## 📞 Support

For configuration issues:
1. Check the troubleshooting section above
2. Validate your environment setup
3. Review the configuration files
4. Check the console for validation errors
5. Contact the development team
