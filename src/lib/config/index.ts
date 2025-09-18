import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Application URLs
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
  
  // Firebase Configuration (Public - for client-side)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  
  // Firebase Admin (Server-side)
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
  
  // Google Cloud Configuration
  GOOGLE_CLOUD_PROJECT_ID: z.string().min(1).optional(),
  GOOGLE_CLOUD_REGION: z.string().default('us-central1'),
  
  // Authentication & Security
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1),
  ENCRYPTION_KEY: z.string().length(32).optional().default('123456789012345678901234567890AW'),
  AUDIT_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  AUDIT_LOG_RETENTION_DAYS: z.coerce.number().default(2555), // 7 years for HIPAA
  
  // Development Features
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: z.coerce.boolean().default(false),
  NEXT_PUBLIC_FORCE_REAL_AUTH: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_DEV_MODE: z.coerce.boolean().default(false),
  NEXT_PUBLIC_SKIP_AUTH_IN_DEV: z.coerce.boolean().default(false),
  ENABLE_DEBUG_LOGGING: z.coerce.boolean().default(false),
  SKIP_EMAIL_VERIFICATION: z.coerce.boolean().default(false),
  
  // EMR Integration
  EMR_EPIC_CLIENT_ID: z.string().optional(),
  EMR_EPIC_CLIENT_SECRET: z.string().optional(),
  EMR_EPIC_SANDBOX_URL: z.string().url().optional(),
  EMR_CERNER_CLIENT_ID: z.string().optional(),
  EMR_CERNER_CLIENT_SECRET: z.string().optional(),
  EMR_CERNER_SANDBOX_URL: z.string().url().optional(),
  // eClinicalWorks
  ECLINICALWORKS_CLIENT_ID: z.string().optional(),
  ECLINICALWORKS_CLIENT_SECRET: z.string().optional(),
  ECLINICALWORKS_AUTH_URL: z.string().url().optional(),
  ECLINICALWORKS_TOKEN_URL: z.string().url().optional(),
  ECLINICALWORKS_FHIR_BASE_URL: z.string().url().optional(),
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  
  // Session Configuration
  SESSION_TIMEOUT_MINUTES: z.coerce.number().default(60),
  SESSION_REFRESH_THRESHOLD_MINUTES: z.coerce.number().default(15),
  
  // Application Settings
  NEXT_PUBLIC_APP_NAME: z.string().default('HeadacheMD'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().default('support@headachemd.org'),
  NEXT_PUBLIC_INFO_EMAIL: z.string().email().default('info@headachemd.org'),
});

// Configuration class
class ConfigService {
  private config: z.infer<typeof envSchema>;
  
  constructor() {
    this.config = this.validateEnvironment();
  }
  
  private validateEnvironment(): z.infer<typeof envSchema> {
    try {
      return envSchema.parse(process.env);
    } catch (error) {
      // In development mode or during build, provide fallback values for missing environment variables
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Environment validation failed, using fallback configuration');
        
        // Create a fallback configuration
        const fallbackConfig = {
          NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api`,
          NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCRJHNyiW8NMqa1DEmEsOouA7lIfFwd9XM',
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'headachemd.firebaseapp.com',
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'headachemd',
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'headachemd.firebasestorage.app',
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '109987892469',
          NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:109987892469:web:48875d9a9d65383ff289bc',
          FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID || 'headachemd',
          FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'firebase-adminsdk@headachemd.iam.gserviceaccount.com',
          FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nvVX9ykK/8y4rBEB4UNcwV+2qAzLxuVUiP60jthR+3DxMhWqa7usNn+ctGPR6whhi\nQ4/bOv5ykqQpxbp5cnt4ltXTGiVbb/4mVaWwHDb+dLCOnjCpf+ovWO7uMWThvF2\nciDqHJMxqc8QB8J2oNcClHvKl7Ppx/7Oy1zpLhhX19AKixMORq7O6o0Q0Rms1d/W\nwyxpaD8U3qE0+alp5gqjxo7e+BGfxxUVxf3oABE9SiDkQyEjs1WHg1g7NwqC7e7v\nmzlh9PwRjhNIZSp/Vs1ehbRMcicD/vYxZP3vFcHvWzmb3g6XQjRPI6WYQj/l2Vcs\nN+lsjIT/cZimrua6da5/6pC7T3GDuNU=\n-----END PRIVATE KEY-----',
          GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || 'headachemd',
          GOOGLE_CLOUD_REGION: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-build-only',
          NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
          ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '123456789012345678901234567890AW',
          AUDIT_LOG_LEVEL: (process.env.AUDIT_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
          AUDIT_LOG_RETENTION_DAYS: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '2555'),
          NEXT_PUBLIC_USE_FIREBASE_EMULATORS: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true',
          NEXT_PUBLIC_FORCE_REAL_AUTH: process.env.NEXT_PUBLIC_FORCE_REAL_AUTH === 'true',
          NEXT_PUBLIC_ENABLE_DEV_MODE: process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true',
          NEXT_PUBLIC_SKIP_AUTH_IN_DEV: process.env.NEXT_PUBLIC_SKIP_AUTH_IN_DEV === 'true',
          ENABLE_DEBUG_LOGGING: process.env.ENABLE_DEBUG_LOGGING === 'true',
          SKIP_EMAIL_VERIFICATION: process.env.SKIP_EMAIL_VERIFICATION === 'true',
          EMR_EPIC_CLIENT_ID: process.env.EMR_EPIC_CLIENT_ID || 'dev-epic-client-id',
          EMR_EPIC_CLIENT_SECRET: process.env.EMR_EPIC_CLIENT_SECRET || 'dev-epic-client-secret',
          EMR_EPIC_SANDBOX_URL: process.env.EMR_EPIC_SANDBOX_URL || 'https://sandbox.epic.com',
          EMR_CERNER_CLIENT_ID: process.env.EMR_CERNER_CLIENT_ID || 'dev-cerner-client-id',
          EMR_CERNER_CLIENT_SECRET: process.env.EMR_CERNER_CLIENT_SECRET || 'dev-cerner-client-secret',
          EMR_CERNER_SANDBOX_URL: process.env.EMR_CERNER_SANDBOX_URL || 'https://sandbox.cerner.com',
          ECLINICALWORKS_CLIENT_ID: process.env.ECLINICALWORKS_CLIENT_ID || '',
          ECLINICALWORKS_CLIENT_SECRET: process.env.ECLINICALWORKS_CLIENT_SECRET || '',
          ECLINICALWORKS_AUTH_URL: process.env.ECLINICALWORKS_AUTH_URL || 'https://fhir.eclinicalworks.com/ecwopendev/oauth2/authorize',
          ECLINICALWORKS_TOKEN_URL: process.env.ECLINICALWORKS_TOKEN_URL || 'https://fhir.eclinicalworks.com/ecwopendev/oauth2/token',
          ECLINICALWORKS_FHIR_BASE_URL: process.env.ECLINICALWORKS_FHIR_BASE_URL || 'https://fhir.eclinicalworks.com/ecwopendev/fhir/R4',
          RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
          RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
          SESSION_TIMEOUT_MINUTES: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '60'),
          SESSION_REFRESH_THRESHOLD_MINUTES: parseInt(process.env.SESSION_REFRESH_THRESHOLD_MINUTES || '15'),
          NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'HeadacheMD',
          NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
          NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@headachemd.org',
          NEXT_PUBLIC_INFO_EMAIL: process.env.NEXT_PUBLIC_INFO_EMAIL || 'info@headachemd.org',
        };
        
        return fallbackConfig;
      }
      
      console.error('❌ Environment validation failed:', error);
      throw new Error('Invalid environment configuration');
    }
  }
  
  // Environment helpers
  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }
  
  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }
  
  get isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
  
  // Development mode helpers
  get enableDevMode(): boolean {
    return this.isDevelopment && this.config.NEXT_PUBLIC_ENABLE_DEV_MODE;
  }
  
  get skipAuthInDev(): boolean {
    return this.isDevelopment && this.config.NEXT_PUBLIC_SKIP_AUTH_IN_DEV;
  }
  
  get useFirebaseEmulators(): boolean {
    return this.isDevelopment && this.config.NEXT_PUBLIC_USE_FIREBASE_EMULATORS;
  }
  
  get forceRealAuth(): boolean {
    return this.config.NEXT_PUBLIC_FORCE_REAL_AUTH;
  }
  
  // Firebase configuration
  get firebase() {
    return {
      apiKey: this.config.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: this.config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: this.config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: this.config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: this.config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: this.config.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }
  
  get firebaseAdmin() {
    return {
      projectId: this.config.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: this.config.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: this.config.FIREBASE_ADMIN_PRIVATE_KEY,
    };
  }
  
  // Application configuration
  get app() {
    return {
      name: this.config.NEXT_PUBLIC_APP_NAME,
      version: this.config.NEXT_PUBLIC_APP_VERSION,
      url: this.config.NEXT_PUBLIC_APP_URL,
      apiUrl: this.config.NEXT_PUBLIC_API_URL,
      supportEmail: this.config.NEXT_PUBLIC_SUPPORT_EMAIL,
      infoEmail: this.config.NEXT_PUBLIC_INFO_EMAIL,
    };
  }
  
  // Security configuration
  get security() {
    return {
      encryptionKey: this.config.ENCRYPTION_KEY,
      auditLogLevel: this.config.AUDIT_LOG_LEVEL,
      auditLogRetentionDays: this.config.AUDIT_LOG_RETENTION_DAYS,
      nextAuthSecret: this.config.NEXTAUTH_SECRET,
      nextAuthUrl: this.config.NEXTAUTH_URL,
    };
  }
  
  // Rate limiting
  get rateLimit() {
    return {
      maxRequests: this.config.RATE_LIMIT_MAX_REQUESTS,
      windowMs: this.config.RATE_LIMIT_WINDOW_MS,
    };
  }
  
  // Session configuration
  get session() {
    return {
      timeoutMinutes: this.config.SESSION_TIMEOUT_MINUTES,
      refreshThresholdMinutes: this.config.SESSION_REFRESH_THRESHOLD_MINUTES,
    };
  }
  
  // EMR configuration
  get emr() {
    return {
      epic: {
        clientId: this.config.EMR_EPIC_CLIENT_ID,
        clientSecret: this.config.EMR_EPIC_CLIENT_SECRET,
        sandboxUrl: this.config.EMR_EPIC_SANDBOX_URL,
      },
      cerner: {
        clientId: this.config.EMR_CERNER_CLIENT_ID,
        clientSecret: this.config.EMR_CERNER_CLIENT_SECRET,
        sandboxUrl: this.config.EMR_CERNER_SANDBOX_URL,
      },
    };
  }
  
  // Debug configuration
  get debug() {
    return {
      enableLogging: this.config.ENABLE_DEBUG_LOGGING,
      skipEmailVerification: this.config.SKIP_EMAIL_VERIFICATION,
    };
  }
  
  // Get all configuration (for debugging)
  getAll(): z.infer<typeof envSchema> {
    return { ...this.config };
  }
}

// Export singleton instance
export const config = new ConfigService();

// Export types
export type Config = z.infer<typeof envSchema>;
export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};
export type AppConfig = {
  name: string;
  version: string;
  url: string;
  apiUrl: string;
  supportEmail: string;
  infoEmail: string;
};

// Export individual configs for convenience
export const firebaseConfig = config.firebase;
export const appConfig = config.app;
export const securityConfig = config.security;
export const rateLimitConfig = config.rateLimit;
export const sessionConfig = config.session;
export const emrConfig = config.emr;
export const debugConfig = config.debug;

export default config;
