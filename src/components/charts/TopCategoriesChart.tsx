'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface CategoryData {
  categoryId: string
  categoryName: string
  amount: number
}

interface TopCategoriesChartProps {
  expenseData: CategoryData[]
}

export function TopCategoriesChart({ expenseData }: TopCategoriesChartProps) {
  // Get top 5 expense categories
  const topCategories = expenseData
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((item) => ({
      name: item.categoryName.length > 15
        ? item.categoryName.substring(0, 15) + '...'
        : item.categoryName,
      fullName: item.categoryName,
      amount: item.amount,
    }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (topCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No expense data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCategories} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => {
                const item = topCategories.find((cat) => cat.name === label)
                return item?.fullName || label
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="amount" fill="#ef4444" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
