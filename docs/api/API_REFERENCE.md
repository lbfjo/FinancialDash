# API Reference

Complete API documentation for the Finance Dashboard application.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints require authentication except for registration and login. Authentication is handled via NextAuth.js sessions.

### Headers

```
Authorization: Bearer <session-token>
Content-Type: application/json
```

---

## Users API

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `409 Conflict` - User already exists

---

## Accounts API

### List Accounts

Get all financial accounts for a user.

**Endpoint:** `GET /api/accounts?userId={userId}`

**Query Parameters:**
- `userId` (required) - User ID to filter accounts

**Response:** `200 OK`
```json
[
  {
    "id": "clxxxxx",
    "name": "Checking Account",
    "userId": "clxxxxx",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "transactions": [
      {
        "id": "clxxxxx",
        "amount": "100.50",
        "date": "2025-01-15T00:00:00.000Z",
        "description": "Grocery shopping"
      }
    ],
    "_count": {
      "transactions": 25
    }
  }
]
```

**Error Responses:**
- `500 Internal Server Error` - Failed to fetch accounts

### Create Account

Create a new financial account.

**Endpoint:** `POST /api/accounts`

**Request Body:**
```json
{
  "name": "Savings Account",
  "userId": "clxxxxx"
}
```

**Response:** `201 Created`
```json
{
  "id": "clxxxxx",
  "name": "Savings Account",
  "userId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Name and userId are required
- `404 Not Found` - User not found

### Get Account

Get a specific account by ID.

**Endpoint:** `GET /api/accounts/{id}`

**Response:** `200 OK`
```json
{
  "id": "clxxxxx",
  "name": "Checking Account",
  "userId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "transactions": [
    {
      "id": "clxxxxx",
      "amount": "100.50",
      "date": "2025-01-15T00:00:00.000Z",
      "description": "Grocery shopping",
      "category": {
        "id": "clxxxxx",
        "name": "Groceries",
        "type": "EXPENSE"
      }
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Account not found

### Update Account

Update an existing account.

**Endpoint:** `PUT /api/accounts/{id}`

**Request Body:**
```json
{
  "name": "Updated Account Name"
}
```

**Response:** `200 OK`
```json
{
  "id": "clxxxxx",
  "name": "Updated Account Name",
  "userId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Name is required
- `404 Not Found` - Account not found

### Delete Account

Delete an account.

**Endpoint:** `DELETE /api/accounts/{id}`

**Response:** `200 OK`
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Account not found
- `409 Conflict` - Cannot delete account with existing transactions

---

## Categories API

### List Categories

Get all categories for a user.

**Endpoint:** `GET /api/categories?userId={userId}&type={type}`

**Query Parameters:**
- `userId` (required) - User ID to filter categories
- `type` (optional) - Filter by type: `INCOME` or `EXPENSE`

**Response:** `200 OK`
```json
[
  {
    "id": "clxxxxx",
    "name": "Salary",
    "type": "INCOME",
    "userId": "clxxxxx",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "transactions": 12
    }
  },
  {
    "id": "clxxxxx",
    "name": "Groceries",
    "type": "EXPENSE",
    "userId": "clxxxxx",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "transactions": 48
    }
  }
]
```

### Create Category

Create a new category.

**Endpoint:** `POST /api/categories`

**Request Body:**
```json
{
  "name": "Freelance Income",
  "type": "INCOME",
  "userId": "clxxxxx"
}
```

**Response:** `201 Created`
```json
{
  "id": "clxxxxx",
  "name": "Freelance Income",
  "type": "INCOME",
  "userId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Name, type, and userId are required
- `404 Not Found` - User not found

### Get Category

Get a specific category by ID.

**Endpoint:** `GET /api/categories/{id}`

**Response:** `200 OK`
```json
{
  "id": "clxxxxx",
  "name": "Groceries",
  "type": "EXPENSE",
  "userId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "transactions": [
    {
      "id": "clxxxxx",
      "amount": "45.50",
      "date": "2025-01-15T00:00:00.000Z",
      "description": "Whole Foods"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Category not found

### Update Category

Update an existing category.

**Endpoint:** `PUT /api/categories/{id}`

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "type": "EXPENSE"
}
```

**Response:** `200 OK`
```json
{
  "id": "clxxxxx",
  "name": "Updated Category Name",
  "type": "EXPENSE",
  "userId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - Category not found

### Delete Category

Delete a category.

**Endpoint:** `DELETE /api/categories/{id}`

**Response:** `200 OK`
```json
{
  "message": "Category deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Category not found
- `409 Conflict` - Cannot delete category with existing transactions

---

## Transactions API

### List Transactions

Get all transactions with optional filters.

**Endpoint:** `GET /api/transactions`

**Query Parameters:**
- `userId` (required) - User ID to filter transactions
- `accountId` (optional) - Filter by account
- `categoryId` (optional) - Filter by category
- `startDate` (optional) - Filter by start date (ISO 8601)
- `endDate` (optional) - Filter by end date (ISO 8601)
- `limit` (optional) - Limit number of results (default: 100)

**Response:** `200 OK`
```json
[
  {
    "id": "clxxxxx",
    "userId": "clxxxxx",
    "accountId": "clxxxxx",
    "categoryId": "clxxxxx",
    "amount": "125.50",
    "date": "2025-01-15T00:00:00.000Z",
    "description": "Grocery shopping",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "account": {
      "id": "clxxxxx",
      "name": "Checking Account"
    },
    "category": {
      "id": "clxxxxx",
      "name": "Groceries",
      "type": "EXPENSE"
    }
  }
]
```

### Create Transaction

Create a new transaction.

**Endpoint:** `POST /api/transactions`

**Request Body:**
```json
{
  "userId": "clxxxxx",
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "amount": 125.50,
  "date": "2025-01-15T00:00:00.000Z",
  "description": "Grocery shopping"
}
```

**Response:** `201 Created`
```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "amount": "125.50",
  "date": "2025-01-15T00:00:00.000Z",
  "description": "Grocery shopping",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Required fields missing
- `404 Not Found` - Account or category not found

### Get Transaction

Get a specific transaction by ID.

**Endpoint:** `GET /api/transactions/{id}`

**Response:** `200 OK`
```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "amount": "125.50",
  "date": "2025-01-15T00:00:00.000Z",
  "description": "Grocery shopping",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "account": {
    "id": "clxxxxx",
    "name": "Checking Account"
  },
  "category": {
    "id": "clxxxxx",
    "name": "Groceries",
    "type": "EXPENSE"
  },
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `404 Not Found` - Transaction not found

### Update Transaction

Update an existing transaction.

**Endpoint:** `PUT /api/transactions/{id}`

**Request Body:**
```json
{
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "amount": 150.00,
  "date": "2025-01-15T00:00:00.000Z",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "amount": "150.00",
  "date": "2025-01-15T00:00:00.000Z",
  "description": "Updated description",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - Transaction not found

### Delete Transaction

Delete a transaction.

**Endpoint:** `DELETE /api/transactions/{id}`

**Response:** `200 OK`
```json
{
  "message": "Transaction deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Transaction not found

---

## Dashboard API

### Get Dashboard Summary

Get comprehensive financial summary for a user.

**Endpoint:** `GET /api/dashboard/summary`

**Query Parameters:**
- `userId` (required) - User ID
- `startDate` (optional) - Start date for summary (ISO 8601, defaults to current month start)
- `endDate` (optional) - End date for summary (ISO 8601, defaults to current month end)

**Response:** `200 OK`
```json
{
  "summary": {
    "totalIncome": 5000.00,
    "totalExpense": 3250.75,
    "netIncome": 1749.25,
    "transactionCount": 48,
    "accountCount": 3,
    "categoryCount": {
      "total": 20,
      "income": 5,
      "expense": 15
    }
  },
  "incomeByCategory": [
    {
      "categoryId": "clxxxxx",
      "categoryName": "Salary",
      "amount": 5000.00
    }
  ],
  "expenseByCategory": [
    {
      "categoryId": "clxxxxx",
      "categoryName": "Groceries",
      "amount": 450.50
    },
    {
      "categoryId": "clxxxxx",
      "categoryName": "Rent",
      "amount": 1500.00
    }
  ],
  "transactionsByAccount": [
    {
      "accountId": "clxxxxx",
      "accountName": "Checking Account",
      "transactionCount": 35,
      "total": 7850.25
    }
  ],
  "recentTransactions": [
    {
      "id": "clxxxxx",
      "amount": "125.50",
      "date": "2025-01-15T00:00:00.000Z",
      "description": "Grocery shopping",
      "account": {
        "id": "clxxxxx",
        "name": "Checking Account"
      },
      "category": {
        "id": "clxxxxx",
        "name": "Groceries",
        "type": "EXPENSE"
      }
    }
  ],
  "dateRange": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - userId is required
- `500 Internal Server Error` - Failed to fetch dashboard summary

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email, cannot delete)
- `500 Internal Server Error` - Server error

---

## Data Types

### Category Types

```typescript
enum CategoryType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE"
}
```

### Decimal Precision

All monetary amounts are stored as `Decimal` types with high precision. They are returned as strings in API responses to prevent floating-point precision issues.

---

## Rate Limiting

Currently, there are no rate limits enforced. Consider implementing rate limiting for production deployments.

---

## Examples

### cURL Examples

**Create a Transaction:**
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxxxxx",
    "accountId": "clxxxxx",
    "categoryId": "clxxxxx",
    "amount": 125.50,
    "date": "2025-01-15T00:00:00.000Z",
    "description": "Grocery shopping"
  }'
```

**Get Dashboard Summary:**
```bash
curl "http://localhost:3000/api/dashboard/summary?userId=clxxxxx&startDate=2025-01-01&endDate=2025-01-31"
```

### JavaScript/TypeScript Examples

**Fetch Transactions:**
```typescript
const response = await fetch(`/api/transactions?userId=${userId}&limit=100`);
const transactions = await response.json();
```

**Create Account:**
```typescript
const response = await fetch('/api/accounts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Savings Account',
    userId: userId,
  }),
});

const account = await response.json();
```

---

## Changelog

### Version 1.0.0 (Initial Release)
- Complete REST API for finance management
- User authentication with NextAuth.js
- CRUD operations for accounts, categories, and transactions
- Dashboard summary endpoint with financial analytics
