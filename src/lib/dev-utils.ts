import { config } from './config';

/**
 * Development utilities for easier development workflow
 */
export class DevUtils {
  /**
   * Check if development mode is enabled
   */
  static isDevMode(): boolean {
    return config.enableDevMode;
  }

  /**
   * Check if authentication is skipped in development
   */
  static skipAuthInDev(): boolean {
    return config.skipAuthInDev;
  }

  /**
   * Get mock user data for development
   */
  static getMockUser() {
    if (!this.isDevMode()) {
      throw new Error('Mock user only available in development mode');
    }

    return {
      id: 'dev-user-1',
      email: config.app.infoEmail,
      role: 'admin' as const,
      profile: {
        firstName: 'Demo',
        lastName: 'Admin',
        title: 'Development Administrator',
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Log development information
   */
  static logDevInfo(): void {
    if (!this.isDevMode()) return;

    console.group('🔧 Development Mode Information');
    console.log('Environment:', config.isDevelopment ? 'Development' : 'Production');
    console.log('App Name:', config.app.name);
    console.log('App Version:', config.app.version);
    console.log('App URL:', config.app.url);
    console.log('Skip Auth:', config.skipAuthInDev);
    console.log('Use Emulators:', config.useFirebaseEmulators);
    console.log('Force Real Auth:', config.forceRealAuth);
    console.log('Debug Logging:', config.debug.enableLogging);
    console.groupEnd();
  }

  /**
   * Get development configuration summary
   */
  static getDevConfigSummary() {
    return {
      environment: config.isDevelopment ? 'Development' : 'Production',
      appName: config.app.name,
      appVersion: config.app.version,
      appUrl: config.app.url,
      skipAuth: config.skipAuthInDev,
      useEmulators: config.useFirebaseEmulators,
      forceRealAuth: config.forceRealAuth,
      debugLogging: config.debug.enableLogging,
      firebaseProject: config.firebase.projectId,
    };
  }

  /**
   * Validate development setup
   */
  static validateDevSetup(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!config.isDevelopment) {
      issues.push('Not in development environment');
    }

    if (!config.enableDevMode) {
      issues.push('Development mode not enabled');
    }

    if (config.forceRealAuth && config.skipAuthInDev) {
      issues.push('Conflicting auth settings: forceRealAuth and skipAuthInDev both enabled');
    }

    if (config.useFirebaseEmulators && config.forceRealAuth) {
      issues.push('Conflicting settings: useFirebaseEmulators and forceRealAuth both enabled');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get helpful development commands
   */
  static getDevCommands(): Record<string, string> {
    return {
      'Start with dev config': 'npm run dev:config',
      'Start with mock auth': 'npm run dev:mock',
      'Start with real auth': 'npm run dev:real',
      'Start with emulators': 'npm run dev:emulators',
      'Load dev config': 'npm run config:dev',
      'Load prod config': 'npm run config:prod',
      'Show current config': 'npm run config:show',
      'Validate config': 'npm run config:validate',
    };
  }
}

// Export convenience functions
export const isDevMode = DevUtils.isDevMode;
export const skipAuthInDev = DevUtils.skipAuthInDev;
export const getMockUser = DevUtils.getMockUser;
export const logDevInfo = DevUtils.logDevInfo;
export const getDevConfigSummary = DevUtils.getDevConfigSummary;
export const validateDevSetup = DevUtils.validateDevSetup;
export const getDevCommands = DevUtils.getDevCommands;

export default DevUtils;
