'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { CategoryType } from '@prisma/client'

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
  initialData?: CategoryFormData
}

export interface CategoryFormData {
  name: string
  type: CategoryType
}

export function CategoryForm({ onSubmit, onCancel, initialData }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || { name: '', type: 'EXPENSE' }
  )

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }
    if (!formData.type) {
      newErrors.type = 'Category type is required'
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
      <Input
        type="text"
        label="Category Name"
        placeholder="e.g., Groceries, Salary"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      <Select
        label="Type"
        options={[
          { value: 'EXPENSE', label: 'Expense' },
          { value: 'INCOME', label: 'Income' },
        ]}
        value={formData.type}
        onChange={(e) =>
          setFormData({ ...formData, type: e.target.value as CategoryType })
        }
        error={errors.type}
        required
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add Category'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
