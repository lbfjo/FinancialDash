# Development Plan & User Stories

This document outlines the development plan and user stories for the Finance Dashboard application.

## ✅ Completed

### Phase 0: Security & Stability Hardening ✅

#### Security Fixes
*   **Fix Critical Access Control Vulnerability (IDOR):** Patched all API endpoints (`transactions`, `accounts`, `categories`, `dashboard`) to ensure users can only access their own data.
*   **Stabilize Application Runtime:** Refactored the NextAuth.js configuration to be compatible with both Edge and Node.js runtimes, resolving critical startup errors.

#### API Security Measures
*   **Rate Limiting:** Implemented comprehensive rate limiting on all API endpoints:
  - Auth endpoints: 5 requests per 15 minutes
  - API endpoints: 100 requests per minute
  - Security logging for rate limit violations
*   **Input Validation & Sanitization:** Added Zod schemas for all inputs with:
  - Email format validation
  - Password strength requirements (8+ chars, uppercase, lowercase, number)
  - String length limits to prevent DoS
  - Proper decimal/date validation
*   **Error Handling:** Implemented centralized error handling:
  - User-friendly error messages
  - No internal details exposed in production
  - Structured error responses with timestamps
  - Proper Prisma error handling

#### Performance & Maintainability
*   **Database Indexes:** Added performance indexes on:
  - All userId fields for user isolation
  - Transaction date with DESC ordering
  - Compound indexes for common query patterns (userId + accountId, userId + categoryId, userId + type)
*   **N+1 Query Fixes:** Optimized queries with:
  - Proper use of Prisma `include` to prevent N+1
  - Parallel query execution with `Promise.all`
  - Efficient aggregations with `groupBy`
*   **Logging Infrastructure:** Implemented structured logging with Pino:
  - JSON logging in production, pretty-print in development
  - HTTP request/response logging
  - Security event tracking
  - Performance monitoring
  - Sensitive data redaction
*   **API Versioning:** Created versioning infrastructure:
  - Version header support
  - Deprecation warning system
  - API documentation (API.md)

---

## Phase 1: Foundational User Features & UX

### 1. Profile & Logout Page
*   **As a registered user, I want to view my profile information so that I can confirm my account details.**
*   **As a logged-in user, I want a clear and accessible logout button so that I can securely end my session.**
*   **As a user, I want to navigate to my profile page from the main application layout so that I can easily access my account settings.**

### 2. Budgeting Module
*   **As a user, I want to create a monthly budget for my entire household so that I can track my overall spending against my income.**
*   **As a user, I want to set budgets for specific spending categories (e.g., "Groceries," "Entertainment") so that I can monitor and control my spending in key areas.**
*   **As a user, I want to see a visual representation (e.g., a progress bar) of my spending against my budget so that I can quickly understand my financial status.**
*   **As a user, I want to be notified when I am approaching or have exceeded my budget so that I can take corrective action.**

### 3. Recurring Transactions
*   **As a user, I want to mark a transaction as recurring (e.g., weekly, monthly, yearly) so that I don't have to enter it manually each time.**
*   **As a user, I want to manage my recurring transactions (view, edit, delete) from a dedicated interface so that I can keep my automated entries up to date.**

### 4. Advanced Transaction Filtering & Search
*   **As a user, I want to filter my transactions by a specific date range so that I can analyze my spending over a certain period.**
*   **As a user, I want to filter my transactions by category and account so that I can narrow down my view to specific financial contexts.**
*   **As a user, I want to search for transactions using keywords or amounts so that I can quickly find a specific transaction.**

## Phase 2: Collaboration & Testing

### 1. Household Feature
*   **As a user, I want to create a household and invite other users to join so that we can manage our finances together.**
*   **As an invited user, I want to accept or decline an invitation to join a household.**
*   **As a member of a household, I want to view and manage the same set of accounts, transactions, and categories as other members so that we have a shared financial picture.**
*   **As the owner of a household, I want to be able to remove members from the household.**

### 2. Unit & Integration Testing
*   **As a developer, I want a comprehensive test suite so that I can ensure new features don't break existing functionality.**
*   **As a developer, I want tests for critical UI components and API endpoints so that I can refactor code with confidence and maintain application stability.**

## Phase 3: Advanced Financial Tools

### 1. Investment Tracking
*   **As a user, I want to add my investment accounts (e.g., brokerage, 401k) to the dashboard so that I can see my complete financial net worth.**
*   **As a user, I want to add and track different types of assets (stocks, ETFs, cryptocurrencies) so that I can monitor my portfolio's composition.**
*   **As a user, I want to see the current value of my investments, updated with real-time or near-real-time market data, so that I can track performance.**

### 2. Financial Goals
*   **As a user, I want to create financial goals (e.g., "Save for a down payment," "Pay off credit card debt") with a target amount and deadline so that I can work towards specific objectives.**
*   **As a user, I want to link specific accounts or savings to a goal so that I can track my progress automatically.**
*   **As a user, I want to see a visual representation of my progress towards each goal so that I stay motivated.**
