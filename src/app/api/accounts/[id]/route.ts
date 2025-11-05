import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

// GET /api/accounts/:id - Get a specific account by ID
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

    const account = await prisma.financeAccount.findFirst({
      where: { id, userId: authenticatedUserId }, // Enforce ownership
      include: {
        transactions: {
          include: {
            category: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}

// PUT /api/accounts/:id - Update an account
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

    // First, verify the account belongs to the user
    const existingAccount = await prisma.financeAccount.findFirst({
      where: { id, userId: authenticatedUserId },
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const account = await prisma.financeAccount.update({
      where: { id }, // ID is sufficient here since we already verified ownership
      data: { name },
    })

    return NextResponse.json(account)
  } catch (error: any) {
    console.error('Error updating account:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}

// DELETE /api/accounts/:id - Delete an account
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
    const result = await prisma.financeAccount.deleteMany({
      where: { id, userId: authenticatedUserId }, // Enforce ownership
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Account not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting account:', error)

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete account with existing transactions' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
