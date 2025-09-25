import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { z } from 'zod';

interface FormErrorState {
  [key: string]: string;
}

export const useFormError = () => {
  const [errors, setErrors] = useState<FormErrorState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError } = useErrorHandler();

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const setFieldErrors = useCallback((fieldErrors: FormErrorState) => {
    setErrors(prev => ({
      ...prev,
      ...fieldErrors
    }));
  }, []);

  const validateField = useCallback(<T>(
    field: string,
    value: unknown,
    schema: z.ZodSchema<T>
  ): T | null => {
    try {
      const validData = schema.parse(value);
      clearError(field);
      return validData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(field, error.issues[0]?.message || 'Invalid value');
      } else {
        setError(field, 'Validation failed');
      }
      return null;
    }
  }, [clearError, setError]);

  const validateForm = useCallback(<T>(
    data: unknown,
    schema: z.ZodSchema<T>
  ): T | null => {
    try {
      const validData = schema.parse(data);
      clearErrors();
      return validData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: FormErrorState = {};
        error.issues.forEach((issue) => {
          const field = issue.path.join('.');
          fieldErrors[field] = issue.message;
        });
        setFieldErrors(fieldErrors);
      } else {
        handleError(error, 'Form validation failed');
      }
      return null;
    }
  }, [clearErrors, setFieldErrors, handleError]);

  const submitForm = useCallback(async <T>(
    formData: unknown,
    schema: z.ZodSchema<T>,
    submitFn: (validData: T) => Promise<void>,
    options?: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
      successMessage?: string;
    }
  ): Promise<boolean> => {
    setIsSubmitting(true);
    clearErrors();

    try {
      // Validate form data
      const validData = validateForm(formData, schema);
      if (!validData) {
        return false;
      }

      // Submit the form
      await submitFn(validData);
      
      options?.onSuccess?.();
      return true;
    } catch (error) {
      // Handle submission errors
      const handledError = handleError(error, 'Failed to submit form');
      options?.onError?.(handledError);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, clearErrors, handleError]);

  const hasErrors = Object.keys(errors).length > 0;
  const getError = useCallback((field: string) => errors[field], [errors]);

  return {
    errors,
    hasErrors,
    isSubmitting,
    getError,
    setError,
    clearError,
    clearErrors,
    setFieldErrors,
    validateField,
    validateForm,
    submitForm,
  };
};