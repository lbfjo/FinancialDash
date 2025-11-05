'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { AccountWithRelations, CategoryWithRelations } from '@/types/api'

interface TransactionFormProps {
  accounts: AccountWithRelations[]
  categories: CategoryWithRelations[]
  userId: string
  onSubmit: (data: TransactionFormData) => Promise<void>
  onCancel: () => void
  initialData?: TransactionFormData
}

export interface TransactionFormData {
  accountId: string
  categoryId: string
  amount: string
  date: string
  description: string
}

export function TransactionForm({
  accounts,
  categories,
  userId,
  onSubmit,
  onCancel,
  initialData,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<TransactionFormData>(
    initialData || {
      accountId: '',
      categoryId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    }
  )

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountId) {
      newErrors.accountId = 'Account is required'
    }
    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Account"
        options={[
          { value: '', label: 'Select an account' },
          ...accounts.map((acc) => ({ value: acc.id, label: acc.name })),
        ]}
        value={formData.accountId}
        onChange={(e) =>
          setFormData({ ...formData, accountId: e.target.value })
        }
        error={errors.accountId}
        required
      />

      <Select
        label="Category"
        options={[
          { value: '', label: 'Select a category (optional)' },
          ...categories.map((cat) => ({
            value: cat.id,
            label: `${cat.name} (${cat.type})`,
          })),
        ]}
        value={formData.categoryId}
        onChange={(e) =>
          setFormData({ ...formData, categoryId: e.target.value })
        }
        error={errors.categoryId}
      />

      <Input
        type="number"
        label="Amount"
        placeholder="0.00"
        step="0.01"
        min="0"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        error={errors.amount}
        required
      />

      <Input
        type="date"
        label="Date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
        required
      />

      <Input
        type="text"
        label="Description (optional)"
        placeholder="e.g., Grocery shopping"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add Transaction'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
