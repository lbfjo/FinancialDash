'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { CategoryList } from '@/components/categories/CategoryList'
import { CategoryForm, CategoryFormData } from '@/components/categories/CategoryForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { CategoryWithRelations } from '@/types/api'

// Temporary hardcoded user ID - replace with actual auth later
const TEMP_USER_ID = 'temp-user-id'

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryWithRelations[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithRelations | null>(null)

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/categories?userId=${TEMP_USER_ID}`)

      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data = await response.json()
      setCategories(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = async (data: CategoryFormData) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: TEMP_USER_ID,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      setIsAddModalOpen(false)
      fetchCategories()
    } catch (err: any) {
      alert(err.message || 'Failed to create category')
    }
  }

  const handleEditCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      setIsEditModalOpen(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (err: any) {
      alert(err.message || 'Failed to update category')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete category')
      }

      fetchCategories()
    } catch (err: any) {
      alert(err.message || 'Failed to delete category')
    }
  }

  const handleEdit = (category: CategoryWithRelations) => {
    setEditingCategory(category)
    setIsEditModalOpen(true)
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ErrorMessage message={error} onRetry={fetchCategories} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Header
        title="Categories"
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            + Add Category
          </Button>
        }
      />

      <div className="p-8">
        {isLoading ? (
          <Loading />
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No categories yet</p>
            <p className="text-gray-500 mb-6">
              Add categories to organize your income and expenses
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              + Add Your First Category
            </Button>
          </div>
        ) : (
          <CategoryList
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDeleteCategory}
          />
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Category"
      >
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingCategory(null)
        }}
        title="Edit Category"
      >
        <CategoryForm
          onSubmit={handleEditCategory}
          onCancel={() => {
            setIsEditModalOpen(false)
            setEditingCategory(null)
          }}
          initialData={
            editingCategory
              ? { name: editingCategory.name, type: editingCategory.type }
              : undefined
          }
        />
      </Modal>
    </DashboardLayout>
  )
}
