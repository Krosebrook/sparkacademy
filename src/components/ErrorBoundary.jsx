import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree, logs them,
 * and displays a fallback UI instead of crashing the whole app.
 * 
 * Safe addition: Does not modify any existing behavior, only adds protection
 * against uncaught errors that would otherwise crash the app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error info in state for display (development only)
    this.setState({
      error,
      errorInfo
    });

    // Placeholder for future Sentry integration
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl border border-red-100 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {this.props.title || 'Something went wrong'}
              </h1>
              <p className="text-slate-600 mb-4">
                {this.props.message || "We're sorry, but something unexpected happened. Please try refreshing the page or return to the home page."}
              </p>
            </div>

            <div className="flex gap-3 justify-center mb-6">
              <Button
                onClick={this.handleReset}
                className="flex items-center gap-2"
                variant="default"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-4 bg-slate-50 rounded-md text-sm">
                <summary className="cursor-pointer font-semibold text-slate-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong className="text-red-600">Error:</strong>
                    <pre className="mt-1 text-xs overflow-auto text-slate-600 bg-white p-2 rounded border">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong className="text-red-600">Component Stack:</strong>
                      <pre className="mt-1 text-xs overflow-auto text-slate-600 bg-white p-2 rounded border max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
