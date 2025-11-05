import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

// GET /api/accounts - Get all accounts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id

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
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

// POST /api/accounts - Create a new account
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const account = await prisma.financeAccount.create({
      data: {
        name,
        userId: authenticatedUserId, // Enforce user isolation
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error: any) {
    console.error('Error creating account:', error)

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
