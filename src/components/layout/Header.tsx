'use client'

interface HeaderProps {
  title: string
  action?: React.ReactNode
}

export function Header({ title, action }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-8 py-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}
