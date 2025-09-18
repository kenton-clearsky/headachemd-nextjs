import { collection, query, where, orderBy, limit, onSnapshot, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { RealTimeUserActivity, UserSession, UserEvent, PageActivity, FeatureActivity, UserBehaviorMetrics } from './events';
import { UserRole } from '@/types/auth';

export class RealTimeAnalytics {
  private static instance: RealTimeAnalytics;
  private listeners: (() => void)[] = [];
  private currentActivity: RealTimeUserActivity | null = null;
  private updateCallbacks: ((activity: RealTimeUserActivity) => void)[] = [];

  private constructor() {}

  public static getInstance(): RealTimeAnalytics {
    if (!RealTimeAnalytics.instance) {
      RealTimeAnalytics.instance = new RealTimeAnalytics();
    }
    return RealTimeAnalytics.instance;
  }

  /**
   * Start real-time monitoring of user activity
   */
  public startMonitoring(): void {
    this.setupActiveSessionsListener();
    this.setupRecentEventsListener();
    console.log('📊 Real-time analytics monitoring started');
  }

  /**
   * Stop all real-time listeners
   */
  public stopMonitoring(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
    console.log('📊 Real-time analytics monitoring stopped');
  }

  /**
   * Subscribe to real-time activity updates
   */
  public subscribe(callback: (activity: RealTimeUserActivity) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Send current data immediately if available
    if (this.currentActivity) {
      callback(this.currentActivity);
    }

    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current real-time activity snapshot
   */
  public getCurrentActivity(): RealTimeUserActivity | null {
    return this.currentActivity;
  }

  /**
   * Get active user sessions
   */
  public async getActiveSessions(): Promise<UserSession[]> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const sessionsQuery = query(
        collection(db, 'user_sessions'),
        where('isActive', '==', true),
        where('lastActivity', '>=', Timestamp.fromDate(fiveMinutesAgo)),
        orderBy('lastActivity', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(sessionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime?.toDate(),
        lastActivity: doc.data().lastActivity.toDate(),
      })) as UserSession[];
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      return [];
    }
  }

  /**
   * Get recent user events
   */
  public async getRecentEvents(minutes: number = 30): Promise<UserEvent[]> {
    try {
      const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
      const eventsQuery = query(
        collection(db, 'user_analytics'),
        where('timestamp', '>=', Timestamp.fromDate(timeAgo)),
        orderBy('timestamp', 'desc'),
        limit(200)
      );

      const snapshot = await getDocs(eventsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as UserEvent[];
    } catch (error) {
      console.error('Failed to get recent events:', error);
      return [];
    }
  }

  /**
   * Get page activity metrics
   */
  public async getPageActivity(hours: number = 24): Promise<PageActivity[]> {
    try {
      const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      const eventsQuery = query(
        collection(db, 'user_analytics'),
        where('eventType', '==', 'page_view'),
        where('timestamp', '>=', Timestamp.fromDate(timeAgo))
      );

      const snapshot = await getDocs(eventsQuery);
      const pageStats = new Map<string, {
        views: number;
        users: Set<string>;
        totalDuration: number;
        bounces: number;
      }>();

      snapshot.docs.forEach(doc => {
        const event = doc.data() as UserEvent;
        const page = event.page || 'unknown';
        
        if (!pageStats.has(page)) {
          pageStats.set(page, {
            views: 0,
            users: new Set(),
            totalDuration: 0,
            bounces: 0,
          });
        }

        const stats = pageStats.get(page)!;
        stats.views++;
        stats.users.add(event.userId);
        
        if (event.data?.duration) {
          stats.totalDuration += event.data.duration;
        }
        
        // Count as bounce if duration is less than 10 seconds
        if (event.data?.duration && event.data.duration < 10000) {
          stats.bounces++;
        }
      });

      return Array.from(pageStats.entries()).map(([page, stats]) => ({
        page,
        views: stats.views,
        uniqueUsers: stats.users.size,
        averageDuration: stats.totalDuration / stats.views,
        bounceRate: (stats.bounces / stats.views) * 100,
      })).sort((a, b) => b.views - a.views);
    } catch (error) {
      console.error('Failed to get page activity:', error);
      return [];
    }
  }

  /**
   * Get feature usage metrics
   */
  public async getFeatureActivity(hours: number = 24): Promise<FeatureActivity[]> {
    try {
      const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      const eventsQuery = query(
        collection(db, 'user_analytics'),
        where('eventType', '==', 'feature_click'),
        where('timestamp', '>=', Timestamp.fromDate(timeAgo))
      );

      const snapshot = await getDocs(eventsQuery);
      const featureStats = new Map<string, {
        interactions: number;
        users: Set<string>;
        totalTime: number;
        component: string;
      }>();

      snapshot.docs.forEach(doc => {
        const event = doc.data() as UserEvent;
        const feature = event.feature || 'unknown';
        
        if (!featureStats.has(feature)) {
          featureStats.set(feature, {
            interactions: 0,
            users: new Set(),
            totalTime: 0,
            component: event.component || 'unknown',
          });
        }

        const stats = featureStats.get(feature)!;
        stats.interactions++;
        stats.users.add(event.userId);
        
        if (event.data?.duration) {
          stats.totalTime += event.data.duration;
        }
      });

      return Array.from(featureStats.entries()).map(([feature, stats]) => ({
        feature,
        component: stats.component,
        interactions: stats.interactions,
        uniqueUsers: stats.users.size,
        averageUsageTime: stats.totalTime / stats.interactions,
      })).sort((a, b) => b.interactions - a.interactions);
    } catch (error) {
      console.error('Failed to get feature activity:', error);
      return [];
    }
  }

  /**
   * Get user behavior metrics for a specific user
   */
  public async getUserBehaviorMetrics(userId: string, days: number = 30): Promise<UserBehaviorMetrics | null> {
    try {
      const timeAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Get user events
      const eventsQuery = query(
        collection(db, 'user_analytics'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(timeAgo))
      );

      // Get user sessions
      const sessionsQuery = query(
        collection(db, 'user_sessions'),
        where('userId', '==', userId),
        where('startTime', '>=', Timestamp.fromDate(timeAgo))
      );

      const [eventsSnapshot, sessionsSnapshot] = await Promise.all([
        getDocs(eventsQuery),
        getDocs(sessionsQuery)
      ]);

      const events = eventsSnapshot.docs.map(doc => doc.data() as UserEvent);
      const sessions = sessionsSnapshot.docs.map(doc => ({
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime?.toDate(),
      })) as UserSession[];

      if (events.length === 0) return null;

      // Calculate metrics
      const pageViews = events.filter(e => e.eventType === 'page_view').length;
      const interactions = events.filter(e => e.eventType === 'feature_click').length;
      const totalSessionDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const averageSessionDuration = sessions.length > 0 ? totalSessionDuration / sessions.length : 0;

      // Get most visited pages
      const pageVisits = new Map<string, number>();
      events.filter(e => e.eventType === 'page_view').forEach(e => {
        const page = e.page || 'unknown';
        pageVisits.set(page, (pageVisits.get(page) || 0) + 1);
      });
      const mostVisitedPages = Array.from(pageVisits.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([page]) => page);

      // Get most used features
      const featureUsage = new Map<string, number>();
      events.filter(e => e.eventType === 'feature_click').forEach(e => {
        const feature = e.feature || 'unknown';
        featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1);
      });
      const mostUsedFeatures = Array.from(featureUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature]) => feature);

      // Calculate engagement score (0-100)
      const engagementScore = Math.min(100, Math.floor(
        (pageViews * 2 + interactions * 3 + sessions.length * 5) / days
      ));

      return {
        userId,
        userRole: events[0].userRole,
        totalSessions: sessions.length,
        totalPageViews: pageViews,
        totalInteractions: interactions,
        averageSessionDuration,
        mostVisitedPages,
        mostUsedFeatures,
        lastActivity: new Date(Math.max(...events.map(e => e.timestamp.getTime()))),
        engagementScore,
      };
    } catch (error) {
      console.error('Failed to get user behavior metrics:', error);
      return null;
    }
  }

  private setupActiveSessionsListener(): void {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const sessionsQuery = query(
      collection(db, 'user_sessions'),
      where('isActive', '==', true),
      where('lastActivity', '>=', Timestamp.fromDate(fiveMinutesAgo)),
      orderBy('lastActivity', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const activeSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime?.toDate(),
        lastActivity: doc.data().lastActivity.toDate(),
      })) as UserSession[];

      this.updateActivityData({ activeSessions });
    }, (error) => {
      console.error('Active sessions listener error:', error);
    });

    this.listeners.push(unsubscribe);
  }

  private setupRecentEventsListener(): void {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const eventsQuery = query(
      collection(db, 'user_analytics'),
      where('timestamp', '>=', Timestamp.fromDate(tenMinutesAgo)),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const recentEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as UserEvent[];

      this.updateActivityData({ recentEvents });
    }, (error) => {
      console.error('Recent events listener error:', error);
    });

    this.listeners.push(unsubscribe);
  }

  private async updateActivityData(partialData: Partial<RealTimeUserActivity>): Promise<void> {
    try {
      // Get current data or initialize
      if (!this.currentActivity) {
        this.currentActivity = {
          activeUsers: 0,
          activeSessions: [],
          recentEvents: [],
          topPages: [],
          topFeatures: [],
          usersByRole: {} as Record<UserRole, number>,
          averageSessionDuration: 0,
          lastUpdated: new Date(),
        };
      }

      // Update with new data
      Object.assign(this.currentActivity, partialData);

      // Recalculate derived metrics
      if (partialData.activeSessions) {
        this.currentActivity.activeUsers = partialData.activeSessions.length;
        
        // Calculate users by role
        const usersByRole = {} as Record<UserRole, number>;
        partialData.activeSessions.forEach(session => {
          usersByRole[session.userRole] = (usersByRole[session.userRole] || 0) + 1;
        });
        this.currentActivity.usersByRole = usersByRole;

        // Calculate average session duration
        const totalDuration = partialData.activeSessions.reduce((sum, session) => {
          const duration = session.duration || (Date.now() - session.startTime.getTime()) / 1000;
          return sum + duration;
        }, 0);
        this.currentActivity.averageSessionDuration = partialData.activeSessions.length > 0 
          ? totalDuration / partialData.activeSessions.length 
          : 0;
      }

      // Update page and feature activity periodically
      if (Math.random() < 0.1) { // 10% chance to update these expensive calculations
        const [topPages, topFeatures] = await Promise.all([
          this.getPageActivity(1), // Last hour
          this.getFeatureActivity(1), // Last hour
        ]);
        
        this.currentActivity.topPages = topPages.slice(0, 10);
        this.currentActivity.topFeatures = topFeatures.slice(0, 10);
      }

      this.currentActivity.lastUpdated = new Date();

      // Notify subscribers
      this.updateCallbacks.forEach(callback => {
        try {
          callback(this.currentActivity!);
        } catch (error) {
          console.error('Error in analytics callback:', error);
        }
      });
    } catch (error) {
      console.error('Failed to update activity data:', error);
    }
  }
}

// Export singleton instance
export const realTimeAnalytics = RealTimeAnalytics.getInstance();
