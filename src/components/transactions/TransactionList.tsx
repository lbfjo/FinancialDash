'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TransactionWithRelations } from '@/types/api'
import { Decimal } from '@prisma/client/runtime/library'

interface TransactionListProps {
  transactions: TransactionWithRelations[]
  isLoading?: boolean
  onEdit?: (transaction: TransactionWithRelations) => void
  onDelete?: (id: string) => void
}

export function TransactionList({
  transactions,
  isLoading,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const formatCurrency = (amount: string | number | Decimal) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount))
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Add your first transaction to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Description
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Account
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Category
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Amount
                </th>
                {(onEdit || onDelete) && (
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.description || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.account?.name || '-'}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.category ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.category.type === 'INCOME'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.category.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Uncategorized</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium">
                    <span
                      className={
                        transaction.category?.type === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {transaction.category?.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(transaction)}
                          >
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onDelete(transaction.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
