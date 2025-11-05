import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { apiRateLimiter } from '@/lib/rate-limiter'
import { validateData, createAccountSchema } from '@/lib/validation'
import { handleError, UnauthorizedError, safeJsonParse } from '@/lib/errors'

export const runtime = 'nodejs'

// GET /api/accounts - Get all accounts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }
    const authenticatedUserId = session.user.id

    // Apply rate limiting
    const rateLimitResponse = apiRateLimiter.check(request, authenticatedUserId)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const accounts = await prisma.financeAccount.findMany({
      where: { userId: authenticatedUserId }, // Enforce user isolation
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    return handleError(error, 'GET /api/accounts')
  }
}

// POST /api/accounts - Create a new account
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }
    const authenticatedUserId = session.user.id

    // Apply rate limiting
    const rateLimitResponse = apiRateLimiter.check(request, authenticatedUserId)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await safeJsonParse(request)

    // Validate and sanitize input
    const validation = validateData(createAccountSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { name } = validation.data!

    const account = await prisma.financeAccount.create({
      data: {
        name,
        userId: authenticatedUserId, // Enforce user isolation
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    return handleError(error, 'POST /api/accounts')
  }
}
