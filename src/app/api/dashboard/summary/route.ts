import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

// GET /api/dashboard/summary - Get dashboard summary for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authenticatedUserId = session.user.id

    const searchParams = request.nextUrl.searchParams

    // Get date range (default to current month)
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    // Get all transactions for the user in date range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: authenticatedUserId, // Enforce user isolation
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        account: true,
      },
    })

    // Calculate total income and expenses
    let totalIncome = new Prisma.Decimal(0)
    let totalExpense = new Prisma.Decimal(0)

    const incomeByCategory: Record<string, { name: string; amount: Prisma.Decimal }> = {}
    const expenseByCategory: Record<string, { name: string; amount: Prisma.Decimal }> = {}
    const transactionsByAccount: Record<
      string,
      { name: string; count: number; total: Prisma.Decimal }
    > = {}

    transactions.forEach((transaction) => {
      const amount = new Prisma.Decimal(transaction.amount)

      // Track by account
      if (transaction.account) {
        if (!transactionsByAccount[transaction.accountId]) {
          transactionsByAccount[transaction.accountId] = {
            name: transaction.account.name,
            count: 0,
            total: new Prisma.Decimal(0),
          }
        }
        transactionsByAccount[transaction.accountId].count++
        transactionsByAccount[transaction.accountId].total = transactionsByAccount[
          transaction.accountId
        ].total.add(amount)
      }

      // Track by category type
      if (transaction.category) {
        if (transaction.category.type === 'INCOME') {
          totalIncome = totalIncome.add(amount)
          if (!incomeByCategory[transaction.categoryId!]) {
            incomeByCategory[transaction.categoryId!] = {
              name: transaction.category.name,
              amount: new Prisma.Decimal(0),
            }
          }
          incomeByCategory[transaction.categoryId!].amount = incomeByCategory[
            transaction.categoryId!
          ].amount.add(amount)
        } else {
          totalExpense = totalExpense.add(amount)
          if (!expenseByCategory[transaction.categoryId!]) {
            expenseByCategory[transaction.categoryId!] = {
              name: transaction.category.name,
              amount: new Prisma.Decimal(0),
            }
          }
          expenseByCategory[transaction.categoryId!].amount = expenseByCategory[
            transaction.categoryId!
          ].amount.add(amount)
        }
      } else {
        // Uncategorized - assume expense if positive, income if negative
        if (amount.isPositive()) {
          totalExpense = totalExpense.add(amount)
        } else {
          totalIncome = totalIncome.add(amount.abs())
        }
      }
    })

    // Get account count
    const accountCount = await prisma.financeAccount.count({
      where: { userId: authenticatedUserId }, // Enforce user isolation
    })

    // Get category counts
    const categoryCount = await prisma.category.count({
      where: { userId: authenticatedUserId }, // Enforce user isolation
    })

    const incomeCategories = await prisma.category.count({
      where: { userId: authenticatedUserId, type: 'INCOME' }, // Enforce user isolation
    })

    const expenseCategories = await prisma.category.count({
      where: { userId: authenticatedUserId, type: 'EXPENSE' }, // Enforce user isolation
    })

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: authenticatedUserId }, // Enforce user isolation
      include: {
        account: true,
        category: true,
      },
      orderBy: { date: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      summary: {
        totalIncome: totalIncome.toNumber(),
        totalExpense: totalExpense.toNumber(),
        netIncome: totalIncome.sub(totalExpense).toNumber(),
        transactionCount: transactions.length,
        accountCount,
        categoryCount: {
          total: categoryCount,
          income: incomeCategories,
          expense: expenseCategories,
        },
      },
      incomeByCategory: Object.entries(incomeByCategory).map(([id, data]) => ({
        categoryId: id,
        categoryName: data.name,
        amount: data.amount.toNumber(),
      })),
      expenseByCategory: Object.entries(expenseByCategory).map(([id, data]) => ({
        categoryId: id,
        categoryName: data.name,
        amount: data.amount.toNumber(),
      })),
      transactionsByAccount: Object.entries(transactionsByAccount).map(
        ([id, data]) => ({
          accountId: id,
          accountName: data.name,
          transactionCount: data.count,
          total: data.total.toNumber(),
        })
      ),
      recentTransactions,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    )
  }
}
