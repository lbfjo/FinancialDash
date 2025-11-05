import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

// GET /api/categories/:id - Get a specific category by ID
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

    const category = await prisma.category.findFirst({
      where: { id, userId: authenticatedUserId }, // Enforce ownership
      include: {
        transactions: {
          include: {
            account: true,
          },
          orderBy: { date: 'desc' },
          take: 20,
        },
        _count: {
          select: { transactions: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/:id - Update a category
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

    // First, verify the category belongs to the user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId: authenticatedUserId },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, type } = body

    const data: any = {}
    if (name) data.name = name
    if (type) {
      if (type !== 'INCOME' && type !== 'EXPENSE') {
        return NextResponse.json(
          { error: 'Type must be either INCOME or EXPENSE' },
          { status: 400 }
        )
      }
      data.type = type
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const category = await prisma.category.update({
      where: { id }, // ID is sufficient here since we already verified ownership
      data,
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error updating category:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/:id - Delete a category
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
    const result = await prisma.category.deleteMany({
      where: { id, userId: authenticatedUserId }, // Enforce ownership
    })

    if (result.count === 0) {
      return NextResponse.json(
        {
          error:
            'Category not found or you do not have permission to delete it',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting category:', error)

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete category with existing transactions' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
