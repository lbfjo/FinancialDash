import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/accounts - Get all accounts or filter by userId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (userId) {
      const accounts = await prisma.financeAccount.findMany({
        where: { userId },
        include: {
          user: true,
          transactions: {
            orderBy: { date: 'desc' },
            take: 5,
          },
          _count: {
            select: { transactions: true },
          },
        },
      })

      return NextResponse.json(accounts)
    }

    const accounts = await prisma.financeAccount.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
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
    const body = await request.json()
    const { name, userId } = body

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      )
    }

    const account = await prisma.financeAccount.create({
      data: {
        name,
        userId,
      },
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

    return NextResponse.json(account, { status: 201 })
  } catch (error: any) {
    console.error('Error creating account:', error)

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
