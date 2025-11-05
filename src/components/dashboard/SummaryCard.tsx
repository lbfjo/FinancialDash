import { Card, CardContent } from '@/components/ui/Card'

interface SummaryCardProps {
  title: string
  value: string | number
  icon?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
}

export function SummaryCard({ title, value, icon, trend, subtitle }: SummaryCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 text-3xl">{icon}</div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="ml-2 text-sm text-gray-600">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
