import { handlers } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { authRateLimiter } from '@/lib/rate-limiter'

// Wrap POST with rate limiting for login attempts
const originalPost = handlers.POST

export const GET = handlers.GET

export async function POST(request: NextRequest) {
  // Apply rate limiting to authentication POST requests
  const rateLimitResponse = authRateLimiter.check(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  return originalPost(request)
}
