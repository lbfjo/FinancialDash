'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AccountWithRelations } from '@/types/api'

interface AccountListProps {
  accounts: AccountWithRelations[]
  isLoading?: boolean
  onEdit?: (account: AccountWithRelations) => void
  onDelete?: (id: string) => void
}

export function AccountList({ accounts, isLoading, onEdit, onDelete }: AccountListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">No accounts yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Add your first account to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{account.name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {account._count?.transactions || 0} transactions
                </p>
              </div>
              <span className="text-2xl">🏦</span>
            </div>
          </CardHeader>
          <CardContent>
            {(onEdit || onDelete) && (
              <div className="flex gap-2 mt-4">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit(account)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(account.id)}
                    disabled={account._count && account._count.transactions > 0}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
