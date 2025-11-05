import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/transactions/:id - Get a specific transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        account: true,
        category: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error: any) {
    console.error('Error updating transaction:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting transaction:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
