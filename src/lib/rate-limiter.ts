import NodeCache from 'node-cache'
import { NextRequest, NextResponse } from 'next/server'
import { logSecurity } from './logger'

// In-memory cache for rate limiting (for production, consider Redis)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 })

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitInfo {
  count: number
  resetTime: number
}

/**
 * Rate limiter utility for API endpoints
 * Uses in-memory cache - for production with multiple instances, use Redis
 */
export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) {
    this.config = config
  }

  /**
   * Get client identifier (IP address or user ID)
   */
  private getIdentifier(request: NextRequest, userId?: string): string {
    if (userId) return `user:${userId}`

    // Get IP from various headers (considering proxies)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'

    return `ip:${ip}`
  }

  /**
   * Check if request should be rate limited
   * Returns null if allowed, or error response if rate limited
   */
  check(request: NextRequest, userId?: string): NextResponse | null {
    // Skip rate limiting if disabled (useful for tests and development)
    if (process.env.DISABLE_RATE_LIMIT === 'true' || process.env.NODE_ENV === 'test') {
      return null
    }

    const identifier = this.getIdentifier(request, userId)
    const key = `ratelimit:${identifier}`

    const now = Date.now()
    const rateLimitInfo = cache.get<RateLimitInfo>(key)

    if (!rateLimitInfo) {
      // First request in this window
      cache.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      }, this.config.windowMs / 1000)

      return null
    }

    if (now > rateLimitInfo.resetTime) {
      // Window expired, reset
      cache.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      }, this.config.windowMs / 1000)

      return null
    }

    if (rateLimitInfo.count >= this.config.maxRequests) {
      // Rate limit exceeded - log security event
      logSecurity('rate_limit_exceeded', 'medium', {
        identifier,
        count: rateLimitInfo.count,
        limit: this.config.maxRequests,
        windowMs: this.config.windowMs,
      })

      const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000)

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitInfo.resetTime).toISOString(),
          },
        }
      )
    }

    // Increment count
    cache.set(
      key,
      {
        ...rateLimitInfo,
        count: rateLimitInfo.count + 1,
      },
      Math.ceil((rateLimitInfo.resetTime - now) / 1000)
    )

    return null
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // per 15 minutes
})

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // per minute
})

export const strictRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 requests
  windowMs: 60 * 1000, // per minute
})
