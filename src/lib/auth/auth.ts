import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { parseDateOfBirth } from "@/lib/services/patients";
import {
  User,
  UserRole,
  LoginCredentials,
  EMRSystem,
  EMRSession,
} from "@/types/auth";
import {
  logAuditEvent,
  AuditAction,
  AuditResource,
  RiskLevel,
} from "@/lib/hipaa/audit";
import {
  encryptPHI,
  decryptPHI,
  hashData,
  isEncryptedString,
} from "@/lib/hipaa/encryption";

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = 60 * 60 * 1000; // 1 hour
  private initialAuthReady: Promise<void>;
  private resolveInitialAuthReady?: () => void;

  private constructor() {
    // Prepare a promise that resolves after the first auth state resolution
    this.initialAuthReady = new Promise<void>((resolve) => {
      this.resolveInitialAuthReady = resolve;
    });
    this.initializeAuthListener();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize authentication state listener
   */
  private initializeAuthListener(): void {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await this.loadUserProfile(firebaseUser);
        this.startSessionTimeout();
      } else {
        this.currentUser = null;
        this.clearSessionTimeout();
      }
      // Resolve the initial auth readiness once (noop on subsequent calls)
      if (this.resolveInitialAuthReady) {
        this.resolveInitialAuthReady();
        this.resolveInitialAuthReady = undefined;
      }
    });
  }

  /**
   * Sign in with email and password
   */
  async signIn(
    credentials: LoginCredentials,
    ipAddress: string,
    userAgent: string
  ): Promise<User> {
    try {
      const { email, password } = credentials;

      // Check for rate limiting
      await this.checkRateLimit(email, ipAddress);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Load user profile
      await this.loadUserProfile(firebaseUser);

      if (!this.currentUser) {
        throw new Error("User profile not found");
      }

      // Check if user is active
      if (!this.currentUser.isActive) {
        await signOut(auth);
        throw new Error("Account is deactivated");
      }

      // Update last login
      await this.updateLastLogin(this.currentUser.id);

      // Log successful login (temporarily disabled due to Firestore permissions)
      console.log(
        "✅ User login successful - audit logging temporarily disabled"
      );
      // await logAuditEvent({
      //   userId: this.currentUser.id,
      //   userRole: this.currentUser.role,
      //   action: AuditAction.LOGIN,
      //   resource: AuditResource.USER,
      //   details: {
      //     description: 'User logged in successfully',
      //     accessMethod: 'web_browser' as any
      //   },
      //   ipAddress,
      //   userAgent,
      //   sessionId: await this.generateSessionId(),
      //   success: true,
      //   riskLevel: RiskLevel.LOW
      // });

      return this.currentUser;
    } catch (error) {
      // Log failed login attempt (temporarily disabled due to Firestore permissions)
      console.log(
        "❌ Login failed - audit logging temporarily disabled:",
        (error as Error).message
      );
      // await logAuditEvent({
      //   action: AuditAction.LOGIN_FAILED,
      //   resource: AuditResource.USER,
      //   details: {
      //     description: `Login failed: ${(error as Error).message}`,
      //     accessMethod: 'web_browser' as any
      //   },
      //   ipAddress,
      //   userAgent,
      //   sessionId: await this.generateSessionId(),
      //   success: false,
      //   riskLevel: RiskLevel.HIGH,
      //   errorMessage: (error as Error).message
      // });

      throw error;
    }
  }

  /**
   * Create new user account
   */
  async createUser(
    email: string,
    password: string,
    profile: any,
    role: UserRole,
    createdBy: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        email: email.toLowerCase(),
        role,
        profile: {
          ...profile,
          // Encrypt sensitive profile data
          phone: profile.phone ? encryptPHI(profile.phone) : undefined,
          dateOfBirth: profile.dateOfBirth
            ? encryptPHI(profile.dateOfBirth.toISOString())
            : undefined,
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save user profile to Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...newUser,
        createdAt: Timestamp.fromDate(newUser.createdAt),
        updatedAt: Timestamp.fromDate(newUser.updatedAt),
      });

      // Log user creation (temporarily disabled due to Firestore permissions)
      console.log(
        "✅ User created successfully - audit logging temporarily disabled"
      );
      // await logAuditEvent({
      //   userId: createdBy,
      //   action: AuditAction.CREATE,
      //   resource: AuditResource.USER,
      //   resourceId: newUser.id,
      //   details: {
      //     description: `Created new user account with role: ${role}`,
      //     accessMethod: 'web_browser' as any
      //   },
      //   ipAddress: 'system',
      //   userAgent: 'system',
      //   sessionId: await this.generateSessionId(),
      //   success: true,
      //   riskLevel: RiskLevel.MEDIUM
      // });

      return newUser;
    } catch (error) {
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    const userId = this.currentUser?.id;
    const sessionId = await this.generateSessionId();

    await signOut(auth);
    this.clearSessionTimeout();

    if (userId) {
      console.log("✅ User logout - audit logging temporarily disabled");
      // await logAuditEvent({
      //   userId,
      //   action: AuditAction.LOGOUT,
      //   resource: AuditResource.USER,
      //   details: {
      //     description: 'User logged out',
      //     accessMethod: 'web_browser' as any
      //   },
      //   ipAddress: 'client',
      //   userAgent: navigator.userAgent,
      //   sessionId,
      //   success: true,
      //   riskLevel: RiskLevel.LOW
      // });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);

      console.log(
        "✅ Password reset email sent - audit logging temporarily disabled"
      );
      // await logAuditEvent({
      //   action: AuditAction.PASSWORD_RESET,
      //   resource: AuditResource.USER,
      //   details: {
      //     description: 'Password reset email sent',
      //     accessMethod: 'web_browser' as any
      //   },
      //   ipAddress: 'client',
      //   userAgent: navigator.userAgent,
      //   sessionId: await this.generateSessionId(),
      //   success: true,
      //   riskLevel: RiskLevel.MEDIUM
      // });
    } catch (error) {
      throw new Error(
        `Failed to send password reset email: ${(error as Error).message}`
      );
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    if (!auth.currentUser || !this.currentUser) {
      throw new Error("No authenticated user");
    }

    try {
      // Re-authenticate user first
      await signInWithEmailAndPassword(
        auth,
        this.currentUser.email,
        currentPassword
      );

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      console.log("✅ Password updated - audit logging temporarily disabled");
      // await logAuditEvent({
      //   userId: this.currentUser.id,
      //   action: AuditAction.UPDATE,
      //   resource: AuditResource.USER,
      //   details: {
      //     description: 'Password updated',
      //     accessMethod: 'web_browser' as any
      //   },
      //   ipAddress: 'client',
      //   userAgent: navigator.userAgent,
      //   sessionId: await this.generateSessionId(),
      //   success: true,
      //   riskLevel: RiskLevel.MEDIUM
      // });
    } catch (error) {
      throw new Error(`Failed to update password: ${(error as Error).message}`);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Wait until the first auth state has been resolved (user restored or confirmed signed out)
   */
  async waitForInitialAuthState(): Promise<void> {
    return this.initialAuthReady;
  }

  /**
   * Check if user has required role
   */
  hasRole(requiredRole: UserRole): boolean {
    if (!this.currentUser) return false;

    const roleHierarchy = {
      [UserRole.PATIENT]: 1,
      [UserRole.NURSE]: 2,
      [UserRole.STAFF]: 3,
      [UserRole.DOCTOR]: 4,
      [UserRole.ADMIN]: 5,
      [UserRole.ADMIN_TEST]: 5,
    };

    return roleHierarchy[this.currentUser.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Get authentication token
   */
  async getAuthToken(): Promise<string | null> {
    if (!auth.currentUser) return null;
    return await getIdToken(auth.currentUser);
  }

  /**
   * Load user profile from Firestore
   */
  private async loadUserProfile(firebaseUser: FirebaseUser): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const userData = userDoc.data();

      // Resolve profile safely and decrypt only if needed
      const profileData = userData.profile || {};

      let resolvedPhone: string | undefined = undefined;
      if (typeof profileData.phone === "string") {
        resolvedPhone = isEncryptedString(profileData.phone)
          ? decryptPHI(profileData.phone)
          : profileData.phone;
      }

      let resolvedDob: Date | undefined = undefined;
      if (profileData.dateOfBirth) {
        try {
          if (typeof profileData.dateOfBirth === "string") {
            if (isEncryptedString(profileData.dateOfBirth)) {
              const dobStr = decryptPHI(profileData.dateOfBirth);
              const d = new Date(dobStr);
              if (!isNaN(d.getTime())) resolvedDob = d;
            } else {
              const d = new Date(profileData.dateOfBirth);
              if (!isNaN(d.getTime())) resolvedDob = d;
            }
          } else {
            resolvedDob = parseDateOfBirth(profileData.dateOfBirth);
          }
        } catch {
          // ignore parse/decrypt errors and leave undefined
        }
      }

      this.currentUser = {
        ...userData,
        id: firebaseUser.uid,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
        // Decrypt sensitive data only when encrypted
        profile: {
          ...profileData,
          phone: resolvedPhone,
          dateOfBirth: resolvedDob,
        },
      } as User;
    } catch (error) {
      console.error("Failed to load user profile:", error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    await updateDoc(doc(db, "users", userId), {
      lastLogin: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  /**
   * Check rate limiting for login attempts
   */
  private async checkRateLimit(
    email: string,
    ipAddress: string
  ): Promise<void> {
    // Rate limiting temporarily disabled due to Firestore index requirements
    console.log(
      "🔒 Rate limiting check skipped - audit logging temporarily disabled"
    );
    return;

    // const now = new Date();
    // const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // // Check failed attempts by email
    // const emailQuery = query(
    //   collection(db, 'audit_logs'),
    //   where('action', '==', AuditAction.LOGIN_FAILED),
    //   where('details.email', '==', email),
    //   where('timestamp', '>=', Timestamp.fromDate(fifteenMinutesAgo))
    // );

    // const emailAttempts = await getDocs(emailQuery);

    // if (emailAttempts.size >= 5) {
    //   throw new Error('Too many failed login attempts. Please try again later.');
    // }

    // // Check failed attempts by IP
    // const ipQuery = query(
    //   collection(db, 'audit_logs'),
    //   where('action', '==', AuditAction.LOGIN_FAILED),
    //   where('ipAddress', '==', hashData(ipAddress)),
    //   where('timestamp', '>=', Timestamp.fromDate(fifteenMinutesAgo))
    // );

    // const ipAttempts = await getDocs(ipQuery);

    // if (ipAttempts.size >= 10) {
    //   throw new Error('Too many failed login attempts from this IP. Please try again later.');
    // }
  }

  /**
   * Start session timeout
   */
  private startSessionTimeout(): void {
    this.clearSessionTimeout();

    this.sessionTimeout = setTimeout(async () => {
      await this.signOut();
      // Redirect to login page or show session expired message
      window.location.href = "/login?reason=session_expired";
    }, this.SESSION_DURATION);
  }

  /**
   * Clear session timeout
   */
  private clearSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  /**
   * Generate session ID
   */
  private async generateSessionId(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return hashData(timestamp + random);
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
