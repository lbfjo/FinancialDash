'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { IncomeVsExpenseChart } from '@/components/charts/IncomeVsExpenseChart'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { TopCategoriesChart } from '@/components/charts/TopCategoriesChart'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

// Temporary hardcoded user ID - replace with actual auth later
const TEMP_USER_ID = 'temp-user-id'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [summaryRes, transactionsRes, accountsRes, categoriesRes] = await Promise.all([
        fetch(`/api/dashboard/summary?userId=${TEMP_USER_ID}`),
        fetch(`/api/transactions?userId=${TEMP_USER_ID}&limit=10`),
        fetch(`/api/accounts?userId=${TEMP_USER_ID}`),
        fetch(`/api/categories?userId=${TEMP_USER_ID}`),
      ])

      if (!summaryRes.ok || !transactionsRes.ok || !accountsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const summaryData = await summaryRes.json()
      const transactionsData = await transactionsRes.json()
      const accountsData = await accountsRes.json()
      const categoriesData = await categoriesRes.json()

      setDashboardData(summaryData)
      setTransactions(transactionsData.transactions || [])
      setAccounts(accountsData)
      setCategories(categoriesData)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleAddTransaction = async (data: any) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: TEMP_USER_ID,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create transaction')
      }

      setIsAddModalOpen(false)
      fetchDashboardData()
    } catch (err: any) {
      alert(err.message || 'Failed to create transaction')
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

      fetchDashboardData()
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction')
    }
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ErrorMessage message={error} onRetry={fetchDashboardData} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Header
        title="Dashboard"
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            + Add Transaction
          </Button>
        }
      />

      <div className="p-8 space-y-8">
        {/* Summary Cards */}
        <SummaryCards data={dashboardData?.summary} isLoading={isLoading} />

        {/* Charts Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[400px] bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : dashboardData ? (
          <>
            {/* Income vs Expense Chart */}
            <IncomeVsExpenseChart
              totalIncome={dashboardData.summary.totalIncome}
              totalExpense={dashboardData.summary.totalExpense}
            />

            {/* Category Breakdown Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart
                data={dashboardData.expenseByCategory || []}
                title="Expense Breakdown"
                type="expense"
              />
              <CategoryPieChart
                data={dashboardData.incomeByCategory || []}
                title="Income Breakdown"
                type="income"
              />
            </div>

            {/* Top Spending Categories */}
            <TopCategoriesChart expenseData={dashboardData.expenseByCategory || []} />
          </>
        ) : null}

        {/* Recent Transactions */}
        {isLoading ? (
          <Loading />
        ) : (
          <TransactionList
            transactions={transactions}
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
          userId={TEMP_USER_ID}
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </DashboardLayout>
  )
}
