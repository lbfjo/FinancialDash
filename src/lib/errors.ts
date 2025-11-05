import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { logger } from './logger'

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: string
  message?: string
  statusCode?: number
  timestamp?: string
}

/**
 * Custom application errors
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(401, message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message)
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, message)
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, message, false) // Not operational - unexpected error
  }
}

/**
 * Error handler that returns user-friendly error responses
 * and logs technical details for debugging
 */
export function handleError(error: unknown, context?: string): NextResponse {
  const timestamp = new Date().toISOString()

  // Log error with structured logging
  const log = logger.child({ context: context || 'API', timestamp })

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const firstError = error.errors[0]
    log.warn({ validationErrors: error.errors }, 'Validation error')
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: firstError.message,
        timestamp,
      } as ErrorResponse,
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, timestamp)
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      log.error({ err: error }, error.message)
    } else {
      log.warn({ statusCode: error.statusCode }, error.message)
    }
    return NextResponse.json(
      {
        error: error.message,
        timestamp,
      } as ErrorResponse,
      { status: error.statusCode }
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    log.error({ err: error }, 'Unhandled error')

    // Don't expose internal error details in production
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred'

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message,
        timestamp,
      } as ErrorResponse,
      { status: 500 }
    )
  }

  // Unknown error type
  log.error({ error }, 'Unknown error type')
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      timestamp,
    } as ErrorResponse,
    { status: 500 }
  )
}

/**
 * Handle Prisma-specific errors with user-friendly messages
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  timestamp: string
): NextResponse {
  logger.warn({ err: error, code: error.code }, 'Prisma error')

  switch (error.code) {
    case 'P2002': // Unique constraint violation
      const field = error.meta?.target as string[] | undefined
      const fieldName = field?.[0] || 'field'
      return NextResponse.json(
        {
          error: 'Duplicate Entry',
          message: `A record with this ${fieldName} already exists`,
          timestamp,
        } as ErrorResponse,
        { status: 409 }
      )

    case 'P2003': // Foreign key constraint violation
      return NextResponse.json(
        {
          error: 'Invalid Reference',
          message: 'The referenced resource does not exist',
          timestamp,
        } as ErrorResponse,
        { status: 404 }
      )

    case 'P2025': // Record not found
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'The requested resource was not found',
          timestamp,
        } as ErrorResponse,
        { status: 404 }
      )

    case 'P2014': // Relation violation
      return NextResponse.json(
        {
          error: 'Relation Violation',
          message: 'Cannot delete resource because it is referenced by other records',
          timestamp,
        } as ErrorResponse,
        { status: 409 }
      )

    case 'P2011': // Null constraint violation
      const nullField = error.meta?.target as string | undefined
      return NextResponse.json(
        {
          error: 'Missing Required Field',
          message: nullField
            ? `The field ${nullField} is required`
            : 'A required field is missing',
          timestamp,
        } as ErrorResponse,
        { status: 400 }
      )

    default:
      // Generic Prisma error
      return NextResponse.json(
        {
          error: 'Database Error',
          message:
            process.env.NODE_ENV === 'development'
              ? error.message
              : 'A database error occurred',
          timestamp,
        } as ErrorResponse,
        { status: 500 }
      )
  }
}

/**
 * Async error wrapper for route handlers
 * Usage: export const GET = asyncHandler(async (req) => { ... })
 */
export function asyncHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleError(error, 'API Handler')
    }
  }
}

/**
 * Safe JSON parsing with error handling
 */
export async function safeJsonParse<T>(request: Request): Promise<T> {
  try {
    return await request.json()
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body')
  }
}
