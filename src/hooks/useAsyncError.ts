import { useCallback, useState } from 'react';
import { useErrorHandler } from './useErrorHandler';

export const useAsyncError = () => {
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  const executeAsync = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    options?: {
      loadingState?: boolean;
      errorMessage?: string;
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
    }
  ): Promise<T | null> => {
    const { 
      loadingState = true, 
      errorMessage, 
      onSuccess, 
      onError 
    } = options || {};

    if (loadingState) {
      setLoading(true);
    }

    try {
      const result = await asyncFunction();
      onSuccess?.(result);
      return result;
    } catch (error) {
      const handledError = handleError(error, errorMessage);
      onError?.(handledError);
      return null;
    } finally {
      if (loadingState) {
        setLoading(false);
      }
    }
  }, [handleError]);

  return {
    loading,
    executeAsync,
  };
};