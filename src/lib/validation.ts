import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), {
    message: 'Please enter a valid phone number',
  });

export const zipCodeSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || /^\d{5}(-\d{4})?$/.test(val), {
    message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)',
  });

export const amountSchema = z
  .number()
  .min(0.01, 'Amount must be greater than $0')
  .max(999999.99, 'Amount must be less than $1,000,000')
  .refine((val) => Number.isFinite(val), 'Amount must be a valid number')
  .refine((val) => Number(val.toFixed(2)) === val, 'Amount can only have up to 2 decimal places');

export const dateSchema = z
  .string()
  .trim()
  .min(1, 'Date is required')
  .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date')
  .refine((val) => new Date(val) <= new Date(), 'Date cannot be in the future');

export const textAreaSchema = (maxLength: number = 1000) => z
  .string()
  .trim()
  .max(maxLength, `Text must be less than ${maxLength} characters`)
  .optional();

export const requiredTextSchema = (fieldName: string, maxLength: number = 255) => z
  .string()
  .trim()
  .min(1, `${fieldName} is required`)
  .max(maxLength, `${fieldName} must be less than ${maxLength} characters`);

// Auth form schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Expense form schema
export const expenseSchema = z.object({
  amount: amountSchema,
  date: dateSchema,
  category: requiredTextSchema('Category', 100),
  description: textAreaSchema(500),
  vendor: requiredTextSchema('Vendor', 255),
  notes: textAreaSchema(1000),
});

// Care recipient form schema
export const careRecipientSchema = z.object({
  name: nameSchema,
  relationship: requiredTextSchema('Relationship', 100),
  dateOfBirth: z.string().trim().optional(),
  ssnLastFour: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\d{4}$/.test(val), {
      message: 'SSN last four digits must be exactly 4 numbers',
    }),
  notes: textAreaSchema(1000),
});

// Profile form schema
export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  zipCode: zipCodeSchema,
  householdAgi: z
    .number()
    .min(0, 'Projected AGI must be positive')
    .max(9999999, 'Projected AGI must be less than $10,000,000')
    .optional(),
});

// Financial account schema
export const financialAccountSchema = z.object({
  accountType: z.enum(['bank', 'fsa', 'hsa', 'credit_card'], {
    message: 'Please select an account type',
  }),
  accountName: requiredTextSchema('Account name', 100),
  institutionName: z.string().trim().max(100, 'Institution name must be less than 100 characters').optional(),
});

// Validation helper functions
export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown): { 
  isValid: boolean; 
  error?: string; 
  data?: T; 
} => {
  try {
    const data = schema.parse(value);
    return { isValid: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        error: error.issues[0]?.message || 'Validation failed' 
      };
    }
    return { 
      isValid: false, 
      error: 'Validation failed' 
    };
  }
};

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
} => {
  try {
    const validData = schema.parse(data);
    return { isValid: true, errors: {}, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { 
      isValid: false, 
      errors: { general: 'Validation failed' } 
    };
  }
};