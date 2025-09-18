import { UserRole } from '@/types/auth';

// User interaction event types
export enum UserEventType {
  // Navigation events
  PAGE_VIEW = 'page_view',
  NAVIGATION = 'navigation',
  ROUTE_CHANGE = 'route_change',
  
  // Feature usage events
  FEATURE_CLICK = 'feature_click',
  SEARCH_QUERY = 'search_query',
  FILTER_APPLIED = 'filter_applied',
  EXPORT_DATA = 'export_data',
  
  // Dashboard interactions
  DASHBOARD_WIDGET_VIEW = 'dashboard_widget_view',
  DASHBOARD_FILTER_CHANGE = 'dashboard_filter_change',
  CHART_INTERACTION = 'chart_interaction',
  
  // Patient management
  PATIENT_VIEW = 'patient_view',
  PATIENT_SEARCH = 'patient_search',
  PATIENT_EDIT = 'patient_edit',
  
  // Clinical actions
  TREATMENT_VIEW = 'treatment_view',
  APPOINTMENT_SCHEDULE = 'appointment_schedule',
  PRESCRIPTION_CREATE = 'prescription_create',
  
  // System events
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  ERROR_ENCOUNTERED = 'error_encountered',
}

export enum UserEventCategory {
  NAVIGATION = 'navigation',
  FEATURE_USAGE = 'feature_usage',
  CLINICAL_ACTION = 'clinical_action',
  SYSTEM = 'system',
  DASHBOARD = 'dashboard',
}

export interface UserEvent {
  id?: string;
  userId: string;
  userRole: UserRole;
  sessionId: string;
  eventType: UserEventType;
  category: UserEventCategory;
  timestamp: Date;
  
  // Event context
  page?: string;
  component?: string;
  feature?: string;
  action?: string;
  
  // Event data
  data?: {
    [key: string]: any;
    duration?: number; // For timed events
    value?: string | number;
    previousPage?: string;
    searchTerm?: string;
    filterType?: string;
    patientId?: string;
    appointmentId?: string;
    treatmentId?: string;
  };
  
  // Technical context
  userAgent?: string;
  ipAddress?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  browserInfo?: {
    name?: string;
    version?: string;
    os?: string;
  };
  
  // Performance metrics
  performance?: {
    loadTime?: number;
    renderTime?: number;
    responseTime?: number;
  };
}

export interface UserSession {
  id: string;
  userId: string;
  userRole: UserRole;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  pageViews: number;
  interactions: number;
  lastActivity: Date;
  isActive: boolean;
  
  // Session context
  entryPage: string;
  exitPage?: string;
  referrer?: string;
  
  // Device/browser info
  userAgent: string;
  ipAddress: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browserInfo: {
    name?: string;
    version?: string;
    os?: string;
  };
}

export interface RealTimeUserActivity {
  activeUsers: number;
  activeSessions: UserSession[];
  recentEvents: UserEvent[];
  topPages: PageActivity[];
  topFeatures: FeatureActivity[];
  usersByRole: Record<UserRole, number>;
  averageSessionDuration: number;
  lastUpdated: Date;
}

export interface PageActivity {
  page: string;
  views: number;
  uniqueUsers: number;
  averageDuration: number;
  bounceRate: number;
}

export interface FeatureActivity {
  feature: string;
  component: string;
  interactions: number;
  uniqueUsers: number;
  averageUsageTime: number;
}

export interface UserBehaviorMetrics {
  userId: string;
  userRole: UserRole;
  totalSessions: number;
  totalPageViews: number;
  totalInteractions: number;
  averageSessionDuration: number;
  mostVisitedPages: string[];
  mostUsedFeatures: string[];
  lastActivity: Date;
  engagementScore: number; // 0-100
}

// Event tracking configuration
export interface TrackingConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, for performance sampling
  excludePages?: string[];
  excludeEvents?: UserEventType[];
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  batchSize: number;
  flushInterval: number; // milliseconds
}

export const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  enabled: true,
  sampleRate: 1.0,
  excludePages: ['/health', '/api'],
  excludeEvents: [],
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
};

// Utility functions for event creation
export function createPageViewEvent(
  userId: string,
  userRole: UserRole,
  sessionId: string,
  page: string,
  previousPage?: string
): Omit<UserEvent, 'timestamp'> {
  return {
    userId,
    userRole,
    sessionId,
    eventType: UserEventType.PAGE_VIEW,
    category: UserEventCategory.NAVIGATION,
    page,
    data: {
      previousPage,
    },
  };
}

export function createFeatureClickEvent(
  userId: string,
  userRole: UserRole,
  sessionId: string,
  feature: string,
  component: string,
  page: string,
  additionalData?: Record<string, any>
): Omit<UserEvent, 'timestamp'> {
  return {
    userId,
    userRole,
    sessionId,
    eventType: UserEventType.FEATURE_CLICK,
    category: UserEventCategory.FEATURE_USAGE,
    page,
    component,
    feature,
    data: additionalData,
  };
}

export function createSearchEvent(
  userId: string,
  userRole: UserRole,
  sessionId: string,
  searchTerm: string,
  page: string,
  resultsCount?: number
): Omit<UserEvent, 'timestamp'> {
  return {
    userId,
    userRole,
    sessionId,
    eventType: UserEventType.SEARCH_QUERY,
    category: UserEventCategory.FEATURE_USAGE,
    page,
    data: {
      searchTerm,
      resultsCount,
    },
  };
}
