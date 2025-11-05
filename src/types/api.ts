import { User, Account, Category, Transaction, CategoryType } from '@prisma/client'

// API Request types
export interface CreateUserRequest {
  email: string
  name?: string
}

export interface UpdateUserRequest {
  email?: string
  name?: string
}

export interface CreateAccountRequest {
  name: string
  userId: string
}

export interface UpdateAccountRequest {
  name: string
}

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  userId: string
}

export interface UpdateCategoryRequest {
  name?: string
  type?: CategoryType
}

export interface CreateTransactionRequest {
  userId: string
  accountId: string
  categoryId?: string
  amount: number | string
  date: string | Date
  description?: string
}

export interface UpdateTransactionRequest {
  accountId?: string
  categoryId?: string | null
  amount?: number | string
  date?: string | Date
  description?: string | null
}

// API Response types with relations
export interface UserWithRelations extends User {
  accounts?: Account[]
  categories?: Category[]
  transactions?: TransactionWithRelations[]
  _count?: {
    accounts: number
    categories: number
    transactions: number
  }
}

export interface AccountWithRelations extends Account {
  user?: {
    id: string
    email: string
    name: string | null
  }
  transactions?: TransactionWithRelations[]
  _count?: {
    transactions: number
  }
}

export interface CategoryWithRelations extends Category {
  user?: {
    id: string
    email: string
    name: string | null
  }
  transactions?: TransactionWithRelations[]
  _count?: {
    transactions: number
  }
}

export interface TransactionWithRelations extends Transaction {
  user?: {
    id: string
    email: string
    name: string | null
  }
  account?: Account
  category?: Category | null
}

// Pagination types
export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

// Filter types
export interface TransactionFilters {
  userId?: string
  accountId?: string
  categoryId?: string
  startDate?: string
  endDate?: string
}

export interface CategoryFilters {
  userId?: string
  type?: CategoryType
}

// API Error type
export interface ApiError {
  error: string
}
