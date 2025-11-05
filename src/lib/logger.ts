import pino from 'pino'

/**
 * Structured logger for the application
 * Uses Pino for high-performance JSON logging
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

// Configure logger based on environment
// Use browser option to disable worker threads for Next.js compatibility
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // IMPORTANT: browser: {} with asObject: true disables worker threads
  // This prevents "worker has exited" errors in Next.js
  browser: {
    asObject: true,
    write: {
      fatal: console.error,
      error: console.error,
      warn: console.warn,
      info: console.log,
      debug: console.debug,
      trace: console.trace,
    },
  },

  // Base configuration
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },

  // Redact sensitive information
  redact: {
    paths: [
      'password',
      'req.headers.authorization',
      'req.headers.cookie',
      'access_token',
      'refresh_token',
      'req.body.password',
      'req.body.confirmPassword',
    ],
    remove: true,
  },

  // Disable logging entirely in test environment
  enabled: !isTest,

  // Add timestamp
  timestamp: pino.stdTimeFunctions.isoTime,
})

/**
 * Create a child logger with context
 */
export function createLogger(context: string, metadata?: Record<string, any>) {
  return logger.child({ context, ...metadata })
}

/**
 * Log HTTP request/response
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  const log = logger.child({
    type: 'http',
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    userId,
  })

  if (statusCode >= 500) {
    log.error('HTTP Request failed')
  } else if (statusCode >= 400) {
    log.warn('HTTP Request error')
  } else {
    log.info('HTTP Request')
  }
}

/**
 * Log database query
 */
export function logQuery(
  operation: string,
  model: string,
  duration: number,
  error?: Error
) {
  const log = logger.child({
    type: 'database',
    operation,
    model,
    duration: `${duration}ms`,
  })

  if (error) {
    log.error({ err: error }, 'Database query failed')
  } else {
    log.debug('Database query executed')
  }
}

/**
 * Log authentication event
 */
export function logAuth(
  event: 'login' | 'logout' | 'register' | 'failed_login',
  userId?: string,
  email?: string,
  metadata?: Record<string, any>
) {
  logger.info(
    {
      type: 'auth',
      event,
      userId,
      email,
      ...metadata,
    },
    `Auth event: ${event}`
  )
}

/**
 * Log security event
 */
export function logSecurity(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  metadata?: Record<string, any>
) {
  const log = logger.child({
    type: 'security',
    event,
    severity,
    ...metadata,
  })

  if (severity === 'critical' || severity === 'high') {
    log.error('Security event')
  } else if (severity === 'medium') {
    log.warn('Security event')
  } else {
    log.info('Security event')
  }
}

/**
 * Log performance metric
 */
export function logPerformance(
  metric: string,
  value: number,
  unit: 'ms' | 'seconds' | 'count',
  metadata?: Record<string, any>
) {
  logger.info(
    {
      type: 'performance',
      metric,
      value,
      unit,
      ...metadata,
    },
    `Performance: ${metric}`
  )
}

/**
 * Log business event
 */
export function logBusinessEvent(
  event: string,
  userId: string,
  metadata?: Record<string, any>
) {
  logger.info(
    {
      type: 'business',
      event,
      userId,
      ...metadata,
    },
    `Business event: ${event}`
  )
}

export default logger
