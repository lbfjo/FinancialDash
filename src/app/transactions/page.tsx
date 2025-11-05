'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm, TransactionFormData } from '@/components/transactions/TransactionForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { TransactionWithRelations, AccountWithRelations, CategoryWithRelations } from '@/types/api'

export default function TransactionsPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([])
  const [accounts, setAccounts] = useState<AccountWithRelations[]>([])
  const [categories, setCategories] = useState<CategoryWithRelations[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithRelations | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [transactionsRes, accountsRes, categoriesRes] = await Promise.all([
        fetch('/api/transactions?limit=100'),
        fetch('/api/accounts'),
        fetch('/api/categories'),
      ])

      if (!transactionsRes.ok || !accountsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const transactionsData = await transactionsRes.json()
      const accountsData = await accountsRes.json()
      const categoriesData = await categoriesRes.json()

      setTransactions(transactionsData.transactions || [])
      setAccounts(accountsData)
      setCategories(categoriesData)
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const handleAddTransaction = async (data: TransactionFormData) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // API gets userId from session
      })

      if (!response.ok) {
        throw new Error('Failed to create transaction')
      }

      setIsAddModalOpen(false)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Failed to create transaction')
    }
  }

  const handleEditTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return

    try {
      const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update transaction')
      }

      setIsEditModalOpen(false)
      setEditingTransaction(null)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Failed to update transaction')
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      fetchData()
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction')
    }
  }

  const handleEdit = (transaction: TransactionWithRelations) => {
    setEditingTransaction(transaction)
    setIsEditModalOpen(true)
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ErrorMessage message={error} onRetry={fetchData} />
        </div>
      </DashboardLayout>
    )
  }

  const canAddTransaction = accounts.length > 0

  return (
    <DashboardLayout>
      <Header
        title="Transactions"
        action={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!canAddTransaction}
          >
            + Add Transaction
          </Button>
        }
      />

      <div className="p-8">
        {!canAddTransaction && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Note:</strong> You need to create at least one account before adding transactions.{' '}
              <a href="/accounts" className="underline font-medium">
                Add an account now
              </a>
            </p>
          </div>
        )}

        {isLoading ? (
          <Loading />
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No transactions yet</p>
            <p className="text-gray-500 mb-6">
              {canAddTransaction
                ? 'Add your first transaction to start tracking your finances'
                : 'Create an account first, then add transactions'}
            </p>
            {canAddTransaction && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                + Add Your First Transaction
              </Button>
            )}
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Transaction"
      >
        <TransactionForm
          accounts={accounts}
          categories={categories}
          userId={session?.user?.id || ''}
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingTransaction(null)
        }}
        title="Edit Transaction"
      >
        <TransactionForm
          accounts={accounts}
          categories={categories}
          userId={session?.user?.id || ''}
          onSubmit={handleEditTransaction}
          onCancel={() => {
            setIsEditModalOpen(false)
            setEditingTransaction(null)
          }}
          initialData={
            editingTransaction
              ? {
                  accountId: editingTransaction.accountId,
                  categoryId: editingTransaction.categoryId || '',
                  amount: editingTransaction.amount.toString(),
                  date: new Date(editingTransaction.date).toISOString().split('T')[0],
                  description: editingTransaction.description || '',
                }
              : undefined
          }
        />
      </Modal>
    </DashboardLayout>
  )
}
