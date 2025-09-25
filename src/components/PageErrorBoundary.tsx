import React from 'react';
import { AppErrorBoundary } from './AppErrorBoundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PageErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const PageErrorFallback: React.FC<PageErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="min-h-96 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-lg">Page Error</CardTitle>
          <CardDescription>
            There was an error loading this page. Please try refreshing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-muted-foreground bg-muted p-3 rounded-md mb-4">
              <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </details>
          )}
          
          <Button onClick={resetErrorBoundary} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

interface PageErrorBoundaryProps {
  children: React.ReactNode;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({ children }) => {
  return (
    <AppErrorBoundary fallback={PageErrorFallback}>
      {children}
    </AppErrorBoundary>
  );
};