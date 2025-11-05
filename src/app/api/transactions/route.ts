import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { apiRateLimiter } from '@/lib/rate-limiter'
import { validateData, transactionFiltersSchema, createTransactionSchema } from '@/lib/validation'
import { handleError, UnauthorizedError, safeJsonParse } from '@/lib/errors'

export const runtime = 'nodejs'

// GET /api/transactions - Get all transactions with filters
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

    // Validate query parameters
    const filters = {
      accountId: request.nextUrl.searchParams.get('accountId'),
      categoryId: request.nextUrl.searchParams.get('categoryId'),
      startDate: request.nextUrl.searchParams.get('startDate'),
      endDate: request.nextUrl.searchParams.get('endDate'),
      limit: request.nextUrl.searchParams.get('limit'),
      offset: request.nextUrl.searchParams.get('offset'),
    }

    const validation = validateData(transactionFiltersSchema, filters)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { accountId, categoryId, startDate, endDate, limit, offset } = validation.data!

    const where: Prisma.TransactionWhereInput = {
      userId: authenticatedUserId, // Enforce user isolation
    }

    if (accountId) where.accountId = accountId
    if (categoryId) where.categoryId = categoryId

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: true,
        category: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const total = await prisma.transaction.count({ where })

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit: limit || total,
        offset: offset || 0,
      },
    })
  } catch (error) {
    return handleError(error, 'GET /api/transactions')
  }
}

// POST /api/transactions - Create a new transaction
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
    const validation = validateData(createTransactionSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { accountId, categoryId, amount, date, description } = validation.data!
    const amountDecimal = new Prisma.Decimal(amount)

    const transaction = await prisma.transaction.create({
      data: {
        userId: authenticatedUserId, // Enforce user isolation
        accountId,
        categoryId: categoryId || null,
        amount: amountDecimal,
        date: new Date(date),
        description: description || null,
      },
      include: {
        account: true,
        category: true,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    return handleError(error, 'POST /api/transactions')
  }
}
