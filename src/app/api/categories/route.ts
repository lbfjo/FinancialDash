import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CategoryType } from '@prisma/client'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

// GET /api/categories - Get all categories for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as CategoryType | null

    const where: any = { userId: authenticatedUserId } // Enforce user isolation
    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
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
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id

    const body = await request.json()
    const { name, type } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return NextResponse.json(
        { error: 'Type must be either INCOME or EXPENSE' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId: authenticatedUserId, // Enforce user isolation
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
