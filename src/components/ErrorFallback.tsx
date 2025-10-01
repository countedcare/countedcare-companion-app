import React from 'react';
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
  resetErrorBoundary 
}) => {
  const handleGoHome = () => {
    window.location.href = '/home';
  };

  const isNetworkError = error.message.includes('fetch') || 
                        error.message.includes('network') || 
                        error.message.includes('Failed to fetch');

  const isAuthError = error.message.includes('auth') || 
                     error.message.includes('unauthorized') ||
                     error.message.includes('403') ||
                     error.message.includes('401');

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
            {isNetworkError && "Connection Error"}
            {isAuthError && "Authentication Error"}
            {!isNetworkError && !isAuthError && "Something went wrong"}
          </CardTitle>
          <CardDescription>
            {isNetworkError && "Please check your internet connection and try again."}
            {isAuthError && "You may need to sign in again."}
            {!isNetworkError && !isAuthError && "An unexpected error occurred. Our team has been notified."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
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