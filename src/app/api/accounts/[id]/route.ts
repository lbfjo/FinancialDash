import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/accounts/:id - Get a specific account by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        transactions: {
          include: {
            category: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const account = await prisma.account.update({
      where: { id },
      data: { name },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.account.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting account:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

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
