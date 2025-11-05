import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Finance Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track your income, expenses, and financial health all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Track Income</h3>
            <p className="text-gray-600 text-sm">
              Monitor all your income sources in one place
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">💸</div>
            <h3 className="font-semibold text-gray-900 mb-2">Manage Expenses</h3>
            <p className="text-gray-600 text-sm">
              Categorize and track where your money goes
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900 mb-2">View Insights</h3>
            <p className="text-gray-600 text-sm">
              Get clear insights into your financial health
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
