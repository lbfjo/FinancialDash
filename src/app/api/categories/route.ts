import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CategoryType } from '@prisma/client'
import { auth } from '@/lib/auth'
import { apiRateLimiter } from '@/lib/rate-limiter'
import { validateData, createCategorySchema, categoryFiltersSchema } from '@/lib/validation'
import { handleError, UnauthorizedError, safeJsonParse } from '@/lib/errors'

export const runtime = 'nodejs'

// GET /api/categories - Get all categories for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id

    // Apply rate limiting
    const rateLimitResponse = apiRateLimiter.check(request, authenticatedUserId)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Validate query parameters
    const filters = {
      type: request.nextUrl.searchParams.get('type'),
    }

    const validation = validateData(categoryFiltersSchema, filters)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { type } = validation.data!

    const where: any = { userId: authenticatedUserId } // Enforce user isolation
    if (type) {
      where.type = type
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    return handleError(error, 'GET /api/categories')
  }
}

// POST /api/categories - Create a new category
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
    const validation = validateData(createCategorySchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { name, type } = validation.data!

    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId: authenticatedUserId, // Enforce user isolation
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return handleError(error, 'POST /api/categories')
  }
}
