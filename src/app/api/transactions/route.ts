import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

// GET /api/transactions - Get all transactions with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id

    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('accountId')
    const categoryId = searchParams.get('categoryId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

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
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    })

    // Get total count for pagination
    const total = await prisma.transaction.count({ where })

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit: limit ? parseInt(limit) : total,
        offset: offset ? parseInt(offset) : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id

    const body = await request.json()
    const { accountId, categoryId, amount, date, description } = body

    if (!accountId || !amount || !date) {
      return NextResponse.json(
        { error: 'accountId, amount, and date are required' },
        { status: 400 }
      )
    }

    // Validate amount is a valid number
    const amountDecimal = new Prisma.Decimal(amount)
    if (amountDecimal.isNaN()) {
      return NextResponse.json(
        { error: 'Amount must be a valid number' },
        { status: 400 }
      )
    }

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
  } catch (error: any) {
    console.error('Error creating transaction:', error)

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Account or category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
