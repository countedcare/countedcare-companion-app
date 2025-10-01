import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  resetKeys?: string[];
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Safe dev-mode check for Vite/Lovable (no runtime throw)
  const isDev =
    (typeof import.meta !== 'undefined' &&
      (import.meta as any)?.env?.MODE === 'development') ||
    (typeof process !== 'undefined' &&
      (process as any)?.env?.NODE_ENV === 'development');

  const message = String(error?.message ?? '');
  const isNetworkError = /fetch|network|Failed to fetch/i.test(message);
  const isAuthError = /auth|unauthorized|403|401/i.test(message);

  const handleGoHome = React.useCallback(() => {
    // ✅ SPA navigation (no full reload)
    try {
      navigate('/home', { replace: true, state: { from: location } });
    } catch {
      // fallback if router not available
      window.location.assign('/home');
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-lg">
            {isNetworkError && 'Connection Error'}
            {isAuthError && 'Authentication Error'}
            {!isNetworkError && !isAuthError && 'Something went wrong'}
          </CardTitle>
          <CardDescription>
            {isNetworkError && 'Please check your internet connection and try again.'}
            {isAuthError && 'You may need to sign in again.'}
            {!isNetworkError &&
              !isAuthError &&
              'An unexpected error occurred. Our team has been notified.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isDev && (
            <details className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap break-words">
                {message}
                {error?.stack ? `\n\n${error.stack}` : ''}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={resetErrorBoundary} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
