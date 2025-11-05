# Finance Dashboard API Documentation

This document describes the REST API endpoints available in the Finance Dashboard application.

## Base URL

All API endpoints are prefixed with `/api` when running locally on `http://localhost:3000`.

## Authentication

Currently, the API does not implement authentication. You must provide `userId` in requests to identify the user.

---

## Users

### Get All Users
```
GET /api/users
```

Returns a list of all users with transaction, account, and category counts.

**Response:**
```json
[
  {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-04T12:00:00.000Z",
    "_count": {
      "accounts": 2,
      "categories": 5,
      "transactions": 42
    }
  }
]
```

### Get User by Email
```
GET /api/users?email=user@example.com
```

Returns a specific user with their accounts, categories, and recent transactions.

### Get User by ID
```
GET /api/users/:id
```

Returns a specific user by ID with full relations.

### Create User
```
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:** `201 Created`

### Update User
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Jane Doe"
}
```

### Delete User
```
DELETE /api/users/:id
```

---

## Accounts

### Get All Accounts
```
GET /api/accounts
GET /api/accounts?userId=clx123...
```

Returns all accounts, optionally filtered by user.

**Response:**
```json
[
  {
    "id": "clx456...",
    "name": "Checking Account",
    "userId": "clx123...",
    "createdAt": "2025-11-04T12:00:00.000Z",
    "user": {
      "id": "clx123...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "_count": {
      "transactions": 25
    }
  }
]
```

### Get Account by ID
```
GET /api/accounts/:id
```

Returns account with all transactions.

### Create Account
```
POST /api/accounts
Content-Type: application/json

{
  "name": "Savings Account",
  "userId": "clx123..."
}
```

**Response:** `201 Created`

### Update Account
```
PUT /api/accounts/:id
Content-Type: application/json

{
  "name": "Updated Account Name"
}
```

### Delete Account
```
DELETE /api/accounts/:id
```

**Note:** Cannot delete an account with existing transactions (409 Conflict).

---

## Categories

### Get All Categories
```
GET /api/categories
GET /api/categories?userId=clx123...
GET /api/categories?userId=clx123...&type=EXPENSE
```

Returns categories, optionally filtered by user and type (INCOME or EXPENSE).

**Response:**
```json
[
  {
    "id": "clx789...",
    "name": "Groceries",
    "type": "EXPENSE",
    "userId": "clx123...",
    "createdAt": "2025-11-04T12:00:00.000Z",
    "user": {
      "id": "clx123...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "_count": {
      "transactions": 15
    }
  }
]
```

### Get Category by ID
```
GET /api/categories/:id
```

Returns category with recent transactions.

### Create Category
```
POST /api/categories
Content-Type: application/json

{
  "name": "Salary",
  "type": "INCOME",
  "userId": "clx123..."
}
```

**Response:** `201 Created`

**Note:** Type must be either `INCOME` or `EXPENSE`.

### Update Category
```
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Updated Category Name",
  "type": "EXPENSE"
}
```

### Delete Category
```
DELETE /api/categories/:id
```

**Note:** Cannot delete a category with existing transactions (409 Conflict).

---

## Transactions

### Get All Transactions
```
GET /api/transactions
GET /api/transactions?userId=clx123...
GET /api/transactions?userId=clx123...&accountId=clx456...
GET /api/transactions?startDate=2025-11-01&endDate=2025-11-30
GET /api/transactions?limit=20&offset=0
```

Returns transactions with pagination and optional filters.

**Query Parameters:**
- `userId` - Filter by user
- `accountId` - Filter by account
- `categoryId` - Filter by category
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)
- `limit` - Number of results per page
- `offset` - Pagination offset

**Response:**
```json
{
  "transactions": [
    {
      "id": "clx999...",
      "userId": "clx123...",
      "accountId": "clx456...",
      "categoryId": "clx789...",
      "amount": "50.25",
      "date": "2025-11-04T12:00:00.000Z",
      "description": "Grocery shopping",
      "createdAt": "2025-11-04T12:00:00.000Z",
      "user": {
        "id": "clx123...",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "account": {
        "id": "clx456...",
        "name": "Checking Account"
      },
      "category": {
        "id": "clx789...",
        "name": "Groceries",
        "type": "EXPENSE"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

### Get Transaction by ID
```
GET /api/transactions/:id
```

### Create Transaction
```
POST /api/transactions
Content-Type: application/json

{
  "userId": "clx123...",
  "accountId": "clx456...",
  "categoryId": "clx789...",
  "amount": 50.25,
  "date": "2025-11-04T12:00:00.000Z",
  "description": "Grocery shopping"
}
```

**Response:** `201 Created`

**Note:** `categoryId` is optional. `amount` can be a number or string.

### Update Transaction
```
PUT /api/transactions/:id
Content-Type: application/json

{
  "amount": 55.50,
  "description": "Updated description",
  "categoryId": null
}
```

**Note:** Set `categoryId` to `null` to remove the category.

### Delete Transaction
```
DELETE /api/transactions/:id
```

---

## Dashboard Summary

### Get Dashboard Summary
```
GET /api/dashboard/summary?userId=clx123...
GET /api/dashboard/summary?userId=clx123...&startDate=2025-11-01&endDate=2025-11-30
```

Returns comprehensive dashboard summary including income, expenses, and breakdowns by category and account.

**Query Parameters:**
- `userId` (required) - User ID
- `startDate` (optional) - Start date for summary (defaults to current month start)
- `endDate` (optional) - End date for summary (defaults to current month end)

**Response:**
```json
{
  "summary": {
    "totalIncome": 5000.00,
    "totalExpense": 3500.00,
    "netIncome": 1500.00,
    "transactionCount": 45,
    "accountCount": 3,
    "categoryCount": {
      "total": 10,
      "income": 3,
      "expense": 7
    }
  },
  "incomeByCategory": [
    {
      "categoryId": "clx789...",
      "categoryName": "Salary",
      "amount": 4500.00
    }
  ],
  "expenseByCategory": [
    {
      "categoryId": "clx890...",
      "categoryName": "Groceries",
      "amount": 800.00
    }
  ],
  "transactionsByAccount": [
    {
      "accountId": "clx456...",
      "accountName": "Checking Account",
      "transactionCount": 30,
      "total": 2500.00
    }
  ],
  "recentTransactions": [...],
  "dateRange": {
    "startDate": "2025-11-01T00:00:00.000Z",
    "endDate": "2025-11-30T23:59:59.000Z"
  }
}
```

---

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

**400 Bad Request:**
```json
{
  "error": "userId is required"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**409 Conflict:**
```json
{
  "error": "User with this email already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create user"
}
```

---

## Data Types

### CategoryType Enum
- `INCOME` - Income category
- `EXPENSE` - Expense category

### Decimal Values
All monetary amounts (`amount` fields) use PostgreSQL `DECIMAL(65,30)` for precision. They are returned as strings in API responses to preserve precision.

### Dates
All dates are stored as `DateTime` and returned in ISO 8601 format.

### IDs
All IDs use CUID format for uniqueness and security.
