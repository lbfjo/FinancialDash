'use client'

import { SummaryCard } from './SummaryCard'

interface SummaryData {
  totalIncome: number
  totalExpense: number
  netIncome: number
  transactionCount: number
  accountCount: number
}

interface SummaryCardsProps {
  data: SummaryData | null
  isLoading?: boolean
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SummaryCard
        title="Total Income"
        value={formatCurrency(data.totalIncome)}
        icon="💰"
      />
      <SummaryCard
        title="Total Expenses"
        value={formatCurrency(data.totalExpense)}
        icon="💸"
      />
      <SummaryCard
        title="Net Income"
        value={formatCurrency(data.netIncome)}
        icon="📈"
      />
      <SummaryCard
        title="Transactions"
        value={data.transactionCount}
        icon="🔄"
        subtitle={`${data.accountCount} accounts`}
      />
    </div>
  )
}
