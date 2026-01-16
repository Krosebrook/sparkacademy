/**
 * LazyRoute Component
 * 
 * Wrapper for lazy-loaded routes with loading fallback
 * Provides consistent loading UI across all lazy-loaded components
 * 
 * @component
 * @param {Object} props
 * @param {React.ComponentType} props.component - Lazy-loaded component
 * @param {React.ReactNode} props.fallback - Optional custom fallback
 */

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const DefaultFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

export default function LazyRoute({ component: Component, fallback = <DefaultFallback />, ...props }) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}