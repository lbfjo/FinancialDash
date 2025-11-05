import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

// GET /api/transactions/:id - Get a specific transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id
    const { id } = params

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: authenticatedUserId }, // Enforce ownership
      include: {
        account: true,
        category: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/:id - Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id
    const { id } = params

    // First, verify the transaction belongs to the user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId: authenticatedUserId },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { accountId, categoryId, amount, date, description } = body

    const data: any = {}
    if (accountId) data.accountId = accountId
    if (categoryId !== undefined) data.categoryId = categoryId || null
    if (amount !== undefined) {
      const amountDecimal = new Prisma.Decimal(amount)
      if (amountDecimal.isNaN()) {
        return NextResponse.json(
          { error: 'Amount must be a valid number' },
          { status: 400 }
        )
      }
      data.amount = amountDecimal
    }
    if (date) data.date = new Date(date)
    if (description !== undefined) data.description = description || null

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.update({
      where: { id }, // ID is sufficient here since we already verified ownership
      data,
      include: {
        account: true,
        category: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error: any) {
    console.error('Error updating transaction:', error)

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Account or category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/:id - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id
    const { id } = params

    // Use deleteMany to ensure user ownership in the where clause
    const result = await prisma.transaction.deleteMany({
      where: { id, userId: authenticatedUserId }, // Enforce ownership
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Transaction not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}

