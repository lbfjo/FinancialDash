import { PrismaClient, CategoryType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'temp-user-id', // Use the hardcoded ID from the app
      email: 'demo@example.com',
      name: 'Demo User',
    },
  })

  console.log('✅ Created demo user:', user.email)

  // Create default accounts
  const checkingAccount = await prisma.financeAccount.upsert({
    where: { id: 'default-checking' },
    update: {},
    create: {
      id: 'default-checking',
      name: 'Checking Account',
      userId: user.id,
    },
  })

  const savingsAccount = await prisma.financeAccount.upsert({
    where: { id: 'default-savings' },
    update: {},
    create: {
      id: 'default-savings',
      name: 'Savings Account',
      userId: user.id,
    },
  })

  console.log('✅ Created default accounts')

  // Income categories
  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investment Income',
    'Bonus',
    'Gift',
    'Refund',
  ]

  for (const name of incomeCategories) {
    await prisma.category.upsert({
      where: { id: `income-${name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `income-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        type: CategoryType.INCOME,
        userId: user.id,
      },
    })
  }

  console.log('✅ Created income categories')

  // Expense categories
  const expenseCategories = [
    'Groceries',
    'Dining Out',
    'Transportation',
    'Utilities',
    'Rent',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Travel',
    'Insurance',
    'Education',
    'Subscriptions',
    'Personal Care',
    'Home Maintenance',
    'Other',
  ]

  for (const name of expenseCategories) {
    await prisma.category.upsert({
      where: { id: `expense-${name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `expense-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        type: CategoryType.EXPENSE,
        userId: user.id,
      },
    })
  }

  console.log('✅ Created expense categories')

  // Create some sample transactions
  const salaryCategory = await prisma.category.findFirst({
    where: { name: 'Salary', userId: user.id },
  })

  const groceriesCategory = await prisma.category.findFirst({
    where: { name: 'Groceries', userId: user.id },
  })

  const diningCategory = await prisma.category.findFirst({
    where: { name: 'Dining Out', userId: user.id },
  })

  if (salaryCategory && groceriesCategory && diningCategory) {
    // Create sample transactions for the last 30 days
    const transactions = [
      {
        accountId: checkingAccount.id,
        categoryId: salaryCategory.id,
        amount: 5000,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: 'Monthly salary',
      },
      {
        accountId: checkingAccount.id,
        categoryId: groceriesCategory.id,
        amount: 120.50,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        description: 'Whole Foods',
      },
      {
        accountId: checkingAccount.id,
        categoryId: diningCategory.id,
        amount: 45.00,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: 'Dinner at Italian restaurant',
      },
      {
        accountId: checkingAccount.id,
        categoryId: groceriesCategory.id,
        amount: 85.25,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        description: 'Trader Joes',
      },
    ]

    for (const transaction of transactions) {
      await prisma.transaction.create({
        data: {
          ...transaction,
          userId: user.id,
        },
      })
    }

    console.log('✅ Created sample transactions')
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
