import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    let errorMessage = customMessage || 'An unexpected error occurred';
    let errorCode: string | undefined;
    let statusCode: number | undefined;

    // Parse different error types
    if (error instanceof Error) {
      errorMessage = customMessage || error.message;
      
      // Handle Supabase errors
      if ('code' in error) {
        errorCode = (error as any).code;
      }
      
      // Handle fetch/network errors
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
        errorCode = 'NETWORK_ERROR';
      }
    } else if (typeof error === 'object' && error !== null) {
      // Handle structured error objects
      const errorObj = error as any;
      
      if (errorObj.message) {
        errorMessage = customMessage || errorObj.message;
      }
      
      if (errorObj.code) {
        errorCode = errorObj.code;
      }
      
      if (errorObj.status || errorObj.statusCode) {
        statusCode = errorObj.status || errorObj.statusCode;
      }

      // Handle Supabase auth errors
      if (errorObj.error_description) {
        errorMessage = errorObj.error_description;
      }
    }

    // Categorize errors for better user experience
    const getErrorCategory = (code?: string, status?: number) => {
      if (status === 401 || status === 403 || code === 'PGRST301') {
        return 'auth';
      }
      if (status === 404 || code === 'PGRST116') {
        return 'not_found';
      }
      if (status === 429) {
        return 'rate_limit';
      }
      if (status && status >= 500) {
        return 'server';
      }
      if (code === 'NETWORK_ERROR') {
        return 'network';
      }
      return 'unknown';
    };

    const category = getErrorCategory(errorCode, statusCode);

    // Customize message based on error category
    switch (category) {
      case 'auth':
        errorMessage = 'Authentication required. Please sign in again.';
        break;
      case 'not_found':
        errorMessage = 'The requested resource was not found.';
        break;
      case 'rate_limit':
        errorMessage = 'Too many requests. Please wait a moment and try again.';
        break;
      case 'server':
        errorMessage = 'Server error. Please try again later.';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
    }

    // Log error for debugging
    console.error('Error handled:', {
      originalError: error,
      message: errorMessage,
      code: errorCode,
      statusCode,
      category,
      timestamp: new Date().toISOString(),
    });

    // Show user-friendly toast
    toast({
      variant: 'destructive',
      title: 'Error',
      description: errorMessage,
    });

    return {
      message: errorMessage,
      code: errorCode,
      statusCode,
      category,
    };
  }, [toast]);

  return { handleError };
};