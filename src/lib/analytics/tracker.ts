import { collection, addDoc, query, where, orderBy, limit, onSnapshot, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { adminDb } from '@/lib/firebase/admin';
import { UserEvent, UserSession, UserEventType, UserEventCategory, TrackingConfig, DEFAULT_TRACKING_CONFIG, RealTimeUserActivity } from './events';
import { UserRole } from '@/types/auth';
import { authService } from '@/lib/auth/auth';

export class UserAnalyticsTracker {
  private static instance: UserAnalyticsTracker;
  private config: TrackingConfig;
  private eventQueue: UserEvent[] = [];
  private currentSession: UserSession | null = null;
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private pageStartTime: number = 0;
  private lastActivity: number = Date.now();

  private constructor(config: Partial<TrackingConfig> = {}) {
    this.config = { ...DEFAULT_TRACKING_CONFIG, ...config };
    this.initializeTracker();
  }

  public static getInstance(config?: Partial<TrackingConfig>): UserAnalyticsTracker {
    if (!UserAnalyticsTracker.instance) {
      UserAnalyticsTracker.instance = new UserAnalyticsTracker(config);
    }
    return UserAnalyticsTracker.instance;
  }

  private async initializeTracker(): Promise<void> {
    if (!this.config.enabled || this.isInitialized) return;

    try {
      // Wait for auth to be ready
      await authService.waitForInitialAuthState();
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      // Initialize session
      await this.startSession();
      
      // Set up activity tracking
      this.setupActivityTracking();
      
      // Set up flush timer
      this.startFlushTimer();
      
      this.isInitialized = true;
      console.log('📊 User analytics tracker initialized');
    } catch (error) {
      console.warn('Failed to initialize analytics tracker:', error);
    }
  }

  private async startSession(): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const sessionId = this.generateSessionId();
    const browserInfo = this.getBrowserInfo();
    
    this.currentSession = {
      id: sessionId,
      userId: currentUser.id,
      userRole: currentUser.role,
      startTime: new Date(),
      pageViews: 0,
      interactions: 0,
      lastActivity: new Date(),
      isActive: true,
      entryPage: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      ipAddress: 'client', // Will be resolved server-side
      deviceType: this.getDeviceType(),
      browserInfo,
    };

    // Track session start event
    await this.trackEvent({
      userId: currentUser.id,
      userRole: currentUser.role,
      sessionId,
      eventType: UserEventType.SESSION_START,
      category: UserEventCategory.SYSTEM,
      page: window.location.pathname,
      data: {
        entryPage: window.location.pathname,
        referrer: document.referrer,
      },
    });
  }

  public async trackPageView(page: string, previousPage?: string): Promise<void> {
    if (!this.isTrackingEnabled() || !this.currentSession) return;

    // Update page start time for duration tracking
    if (this.pageStartTime > 0) {
      const duration = Date.now() - this.pageStartTime;
      // Track previous page duration if significant
      if (duration > 1000) { // More than 1 second
        await this.trackEvent({
          userId: this.currentSession.userId,
          userRole: this.currentSession.userRole,
          sessionId: this.currentSession.id,
          eventType: UserEventType.PAGE_VIEW,
          category: UserEventCategory.NAVIGATION,
          page: previousPage || 'unknown',
          data: {
            duration,
            exitType: 'navigation',
          },
        });
      }
    }

    this.pageStartTime = Date.now();
    this.currentSession.pageViews++;
    this.currentSession.lastActivity = new Date();

    await this.trackEvent({
      userId: this.currentSession.userId,
      userRole: this.currentSession.userRole,
      sessionId: this.currentSession.id,
      eventType: UserEventType.PAGE_VIEW,
      category: UserEventCategory.NAVIGATION,
      page,
      data: {
        previousPage,
        timestamp: Date.now(),
      },
    });
  }

  public async trackFeatureUsage(
    feature: string,
    component: string,
    action?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    if (!this.isTrackingEnabled() || !this.currentSession) return;

    this.currentSession.interactions++;
    this.currentSession.lastActivity = new Date();

    await this.trackEvent({
      userId: this.currentSession.userId,
      userRole: this.currentSession.userRole,
      sessionId: this.currentSession.id,
      eventType: UserEventType.FEATURE_CLICK,
      category: UserEventCategory.FEATURE_USAGE,
      page: window.location.pathname,
      component,
      feature,
      action,
      data: additionalData,
    });
  }

  public async trackSearch(searchTerm: string, resultsCount?: number): Promise<void> {
    if (!this.isTrackingEnabled() || !this.currentSession) return;

    await this.trackEvent({
      userId: this.currentSession.userId,
      userRole: this.currentSession.userRole,
      sessionId: this.currentSession.id,
      eventType: UserEventType.SEARCH_QUERY,
      category: UserEventCategory.FEATURE_USAGE,
      page: window.location.pathname,
      data: {
        searchTerm,
        resultsCount,
      },
    });
  }

  public async trackClinicalAction(
    action: string,
    resourceType: string,
    resourceId?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    if (!this.isTrackingEnabled() || !this.currentSession) return;

    await this.trackEvent({
      userId: this.currentSession.userId,
      userRole: this.currentSession.userRole,
      sessionId: this.currentSession.id,
      eventType: UserEventType.PATIENT_VIEW, // Will be mapped based on action
      category: UserEventCategory.CLINICAL_ACTION,
      page: window.location.pathname,
      action,
      data: {
        resourceType,
        resourceId,
        ...additionalData,
      },
    });
  }

  public async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    if (!this.config.enableErrorTracking || !this.currentSession) return;

    await this.trackEvent({
      userId: this.currentSession.userId,
      userRole: this.currentSession.userRole,
      sessionId: this.currentSession.id,
      eventType: UserEventType.ERROR_ENCOUNTERED,
      category: UserEventCategory.SYSTEM,
      page: window.location.pathname,
      data: {
        errorMessage: error.message,
        errorStack: error.stack,
        context,
      },
    });
  }

  private async trackEvent(eventData: Omit<UserEvent, 'timestamp'>): Promise<void> {
    if (!this.isTrackingEnabled()) return;

    // Apply sampling
    if (Math.random() > this.config.sampleRate) return;

    const event: UserEvent = {
      ...eventData,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      browserInfo: this.getBrowserInfo(),
    };

    // Add performance data if enabled
    if (this.config.enablePerformanceTracking) {
      event.performance = this.getPerformanceMetrics();
    }

    // Add to queue
    this.eventQueue.push(event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      await this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const eventsToFlush = [...this.eventQueue];
      this.eventQueue = [];

      // Send events to Firestore
      const batch = eventsToFlush.map(async (event) => {
        const eventDoc = {
          ...event,
          timestamp: Timestamp.fromDate(event.timestamp),
          createdAt: serverTimestamp(),
        };

        // Remove undefined values
        Object.keys(eventDoc).forEach(key => {
          if (eventDoc[key as keyof typeof eventDoc] === undefined) {
            delete eventDoc[key as keyof typeof eventDoc];
          }
        });

        return addDoc(collection(db, 'user_analytics'), eventDoc);
      });

      await Promise.all(batch);
      console.log(`📊 Flushed ${eventsToFlush.length} analytics events`);
    } catch (error) {
      console.warn('Failed to flush analytics events:', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  private setupActivityTracking(): void {
    // Track user activity for session management
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
      if (this.currentSession) {
        this.currentSession.lastActivity = new Date();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for session timeout every minute
    setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - this.lastActivity;
      
      // End session if inactive for 30 minutes
      if (inactiveTime > 30 * 60 * 1000 && this.currentSession?.isActive) {
        this.endSession();
      }
    }, 60000);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushEvents(); // Flush events when page becomes hidden
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
      this.flushEvents();
    });
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  private async endSession(): Promise<void> {
    if (!this.currentSession) return;

    const duration = Date.now() - this.currentSession.startTime.getTime();
    this.currentSession.duration = Math.floor(duration / 1000);
    this.currentSession.endTime = new Date();
    this.currentSession.isActive = false;
    this.currentSession.exitPage = window.location.pathname;

    await this.trackEvent({
      userId: this.currentSession.userId,
      userRole: this.currentSession.userRole,
      sessionId: this.currentSession.id,
      eventType: UserEventType.SESSION_END,
      category: UserEventCategory.SYSTEM,
      page: window.location.pathname,
      data: {
        duration: this.currentSession.duration,
        pageViews: this.currentSession.pageViews,
        interactions: this.currentSession.interactions,
        exitPage: this.currentSession.exitPage,
      },
    });

    // Save session to Firestore
    try {
      await addDoc(collection(db, 'user_sessions'), {
        ...this.currentSession,
        startTime: Timestamp.fromDate(this.currentSession.startTime),
        endTime: Timestamp.fromDate(this.currentSession.endTime!),
        lastActivity: Timestamp.fromDate(this.currentSession.lastActivity),
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Failed to save session:', error);
    }

    await this.flushEvents();
  }

  private isTrackingEnabled(): boolean {
    return this.config.enabled && this.isInitialized && this.currentSession !== null;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getBrowserInfo(): { name?: string; version?: string; os?: string } {
    const userAgent = navigator.userAgent;
    const browserInfo: { name?: string; version?: string; os?: string } = {};

    // Browser detection
    if (userAgent.includes('Chrome')) browserInfo.name = 'Chrome';
    else if (userAgent.includes('Firefox')) browserInfo.name = 'Firefox';
    else if (userAgent.includes('Safari')) browserInfo.name = 'Safari';
    else if (userAgent.includes('Edge')) browserInfo.name = 'Edge';

    // OS detection
    if (userAgent.includes('Windows')) browserInfo.os = 'Windows';
    else if (userAgent.includes('Mac')) browserInfo.os = 'macOS';
    else if (userAgent.includes('Linux')) browserInfo.os = 'Linux';
    else if (userAgent.includes('Android')) browserInfo.os = 'Android';
    else if (userAgent.includes('iOS')) browserInfo.os = 'iOS';

    return browserInfo;
  }

  private getPerformanceMetrics(): { loadTime?: number; renderTime?: number } {
    if (!window.performance) return {};

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return {};

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    };
  }

  // Public methods for configuration
  public updateConfig(newConfig: Partial<TrackingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  public async forceFlush(): Promise<void> {
    await this.flushEvents();
  }
}

// Export singleton instance
export const analyticsTracker = UserAnalyticsTracker.getInstance();
