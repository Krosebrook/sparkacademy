import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Route Error Boundary
 * 
 * Wraps individual routes with an error boundary to isolate errors
 * to specific pages without crashing the entire app.
 * 
 * Safe addition: Does not modify routing behavior, only adds protection.
 */
const RouteErrorBoundary = ({ children, routeName }) => {
  return (
    <ErrorBoundary 
      title={`Error in ${routeName || 'Page'}`}
      message="This page encountered an error. You can try refreshing or navigate to another page."
    >
      {children}
    </ErrorBoundary>
  );
};

export default RouteErrorBoundary;
