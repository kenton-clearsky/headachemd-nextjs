'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { analyticsTracker } from '@/lib/analytics/tracker';
import { authService } from '@/lib/auth/auth';

interface AnalyticsContextType {
  trackFeature: (feature: string, component: string, action?: string, data?: Record<string, any>) => void;
  trackSearch: (searchTerm: string, resultsCount?: number) => void;
  trackClinicalAction: (action: string, resourceType: string, resourceId?: string, data?: Record<string, any>) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        await authService.waitForInitialAuthState();
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          console.log('📊 Analytics provider initialized for user:', currentUser.role);
        }
      } catch (error) {
        console.warn('Failed to initialize analytics:', error);
      }
    };

    initializeAnalytics();

    return () => {
      analyticsTracker.forceFlush();
    };
  }, []);

  const contextValue: AnalyticsContextType = {
    trackFeature: (feature: string, component: string, action?: string, data?: Record<string, any>) => {
      analyticsTracker.trackFeatureUsage(feature, component, action, data);
    },
    
    trackSearch: (searchTerm: string, resultsCount?: number) => {
      analyticsTracker.trackSearch(searchTerm, resultsCount);
    },
    
    trackClinicalAction: (action: string, resourceType: string, resourceId?: string, data?: Record<string, any>) => {
      analyticsTracker.trackClinicalAction(action, resourceType, resourceId, data);
    },
    
    trackError: (error: Error, context?: Record<string, any>) => {
      analyticsTracker.trackError(error, context);
    },
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}
