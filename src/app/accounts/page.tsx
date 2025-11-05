'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { AccountList } from '@/components/accounts/AccountList'
import { AccountForm, AccountFormData } from '@/components/accounts/AccountForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { AccountWithRelations } from '@/types/api'

export default function AccountsPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<AccountWithRelations[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountWithRelations | null>(null)

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/accounts')

      if (!response.ok) {
        throw new Error('Failed to fetch accounts')
      }

      const data = await response.json()
      setAccounts(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAccounts()
    }
  }, [status])

  const handleAddAccount = async (data: AccountFormData) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create account')
      }

      setIsAddModalOpen(false)
      fetchAccounts()
    } catch (err: any) {
      alert(err.message || 'Failed to create account')
    }
  }

  const handleEditAccount = async (data: AccountFormData) => {
    if (!editingAccount) return

    try {
      const response = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update account')
      }

      setIsEditModalOpen(false)
      setEditingAccount(null)
      fetchAccounts()
    } catch (err: any) {
      alert(err.message || 'Failed to update account')
    }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      fetchAccounts()
    } catch (err: any) {
      alert(err.message || 'Failed to delete account')
    }
  }

  const handleEdit = (account: AccountWithRelations) => {
    setEditingAccount(account)
    setIsEditModalOpen(true)
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ErrorMessage message={error} onRetry={fetchAccounts} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Header
        title="Accounts"
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            + Add Account
          </Button>
        }
      />

      <div className="p-8">
        {isLoading ? (
          <Loading />
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No accounts yet</p>
            <p className="text-gray-500 mb-6">
              Add your first account to start tracking transactions
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              + Add Your First Account
            </Button>
          </div>
        ) : (
          <AccountList
            accounts={accounts}
            onEdit={handleEdit}
            onDelete={handleDeleteAccount}
          />
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Account"
      >
        <AccountForm
          onSubmit={handleAddAccount}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingAccount(null)
        }}
        title="Edit Account"
      >
        <AccountForm
          onSubmit={handleEditAccount}
          onCancel={() => {
            setIsEditModalOpen(false)
            setEditingAccount(null)
          }}
          initialData={editingAccount ? { name: editingAccount.name } : undefined}
        />
      </Modal>
    </DashboardLayout>
  )
}
