import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { analyticsTracker } from '@/lib/analytics/tracker';

/**
 * Hook for tracking page navigation and user interactions
 */
export function useAnalytics() {
  const router = useRouter();
  const pathname = usePathname();
  const previousPathRef = useRef<string>('');

  // Track page views
  useEffect(() => {
    const currentPath = pathname;
    const previousPath = previousPathRef.current;

    // Track page view
    analyticsTracker.trackPageView(currentPath, previousPath || undefined);
    
    // Update previous path
    previousPathRef.current = currentPath;
  }, [pathname]);

  // Return tracking functions for components to use
  return {
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
}

/**
 * Hook for tracking button clicks and interactions
 */
export function useTrackClick() {
  return (feature: string, component: string, action?: string, data?: Record<string, any>) => {
    analyticsTracker.trackFeatureUsage(feature, component, action, data);
  };
}

/**
 * Hook for tracking search functionality
 */
export function useTrackSearch() {
  return (searchTerm: string, resultsCount?: number) => {
    analyticsTracker.trackSearch(searchTerm, resultsCount);
  };
}
