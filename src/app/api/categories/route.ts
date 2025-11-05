import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CategoryType } from '@prisma/client'

// GET /api/categories - Get all categories or filter by userId and type
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') as CategoryType | null

    const where: any = {}
    if (userId) where.userId = userId
    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      where.type = type
    }

    const categories = await prisma.category.findMany({
      where,
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
    const body = await request.json()
    const { name, type, userId } = body

    if (!name || !type || !userId) {
      return NextResponse.json(
        { error: 'Name, type, and userId are required' },
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

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
