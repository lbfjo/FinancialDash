'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CategoryWithRelations } from '@/types/api'

interface CategoryListProps {
  categories: CategoryWithRelations[]
  isLoading?: boolean
  onEdit?: (category: CategoryWithRelations) => void
  onDelete?: (id: string) => void
}

export function CategoryList({ categories, isLoading, onEdit, onDelete }: CategoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const incomeCategories = categories.filter((cat) => cat.type === 'INCOME')
  const expenseCategories = categories.filter((cat) => cat.type === 'EXPENSE')

  const CategorySection = ({
    title,
    items,
    type,
  }: {
    title: string
    items: CategoryWithRelations[]
    type: 'INCOME' | 'EXPENSE'
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              type === 'INCOME'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {items.length} categories
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No {type.toLowerCase()} categories yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <span className="text-xl">🏷️</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {category._count?.transactions || 0} transactions
                </p>
                {(onEdit || onDelete) && (
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(category)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(category.id)}
                        disabled={
                          category._count && category._count.transactions > 0
                        }
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <CategorySection title="Income Categories" items={incomeCategories} type="INCOME" />
      <CategorySection title="Expense Categories" items={expenseCategories} type="EXPENSE" />
    </div>
  )
}
