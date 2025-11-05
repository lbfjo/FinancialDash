import { z } from 'zod'
import { CategoryType } from '@prisma/client'

/**
 * Common validation schemas
 */

// Email validation with proper format check
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(3, 'Email must be at least 3 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim()

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name must be at least 1 character')
  .max(255, 'Name must not exceed 255 characters')
  .trim()
  .optional()

// Description validation with sanitization
export const descriptionSchema = z
  .string()
  .max(1000, 'Description must not exceed 1000 characters')
  .trim()
  .optional()

// CUID validation
export const cuidSchema = z
  .string()
  .cuid('Invalid ID format')

// Positive number validation
export const positiveNumberSchema = z
  .number()
  .positive('Must be a positive number')
  .finite('Must be a finite number')

// Decimal string validation for amounts
export const amountSchema = z
  .string()
  .or(z.number())
  .transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Invalid amount')
    }
    return num
  })
  .refine((val) => val !== 0, 'Amount cannot be zero')

// Date validation
export const dateSchema = z
  .string()
  .or(z.date())
  .transform((val) => (typeof val === 'string' ? new Date(val) : val))
  .refine((date) => !isNaN(date.getTime()), 'Invalid date')

// Pagination parameters
export const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (val > 0 && val <= 100), {
      message: 'Limit must be between 1 and 100',
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || val >= 0, {
      message: 'Offset must be non-negative',
    }),
})

/**
 * User/Auth schemas
 */

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'), // Don't validate password strength on login
})

/**
 * Transaction schemas
 */

export const createTransactionSchema = z.object({
  accountId: cuidSchema,
  categoryId: cuidSchema.optional().nullable(),
  amount: amountSchema,
  date: dateSchema,
  description: descriptionSchema.nullable(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const transactionFiltersSchema = z.object({
  accountId: cuidSchema.optional(),
  categoryId: cuidSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  ...paginationSchema.shape,
})

/**
 * Account schemas
 */

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(255, 'Account name must not exceed 255 characters')
    .trim(),
})

export const updateAccountSchema = createAccountSchema.partial()

/**
 * Category schemas
 */

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(255, 'Category name must not exceed 255 characters')
    .trim(),
  type: z.enum([CategoryType.INCOME, CategoryType.EXPENSE], {
    errorMap: () => ({ message: 'Type must be either INCOME or EXPENSE' }),
  }),
})

export const updateCategorySchema = createCategorySchema.partial()

export const categoryFiltersSchema = z.object({
  type: z.enum([CategoryType.INCOME, CategoryType.EXPENSE]).optional(),
})

/**
 * Validation helper
 */

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: string
} {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError.message,
      }
    }
    return {
      success: false,
      error: 'Validation failed',
    }
  }
}
