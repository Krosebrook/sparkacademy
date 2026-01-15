import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

/**
 * Lazy Load Wrapper Component
 * Implements React.lazy with fallback UI for code splitting and performance optimization
 * 
 * Usage:
 * const LazyComponent = lazy(() => import('./HeavyComponent'));
 * <LazyLoadWrapper><LazyComponent /></LazyLoadWrapper>
 */

export function LazyLoadWrapper({ 
  children, 
  fallback = <DefaultLoader />,
  minHeight = "200px" 
}) {
  return (
    <Suspense fallback={fallback}>
      <div style={{ minHeight }}>
        {children}
      </div>
    </Suspense>
  );
}

/**
 * Default loading component with spinner
 */
export function DefaultLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading component...</p>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for better perceived performance
 */
export function SkeletonLoader({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="animate-pulse">
          <div className="h-4 bg-gray-700/30 rounded" style={{ width: `${Math.random() * 30 + 70}%` }} />
        </div>
      ))}
    </div>
  );
}

export default LazyLoadWrapper;