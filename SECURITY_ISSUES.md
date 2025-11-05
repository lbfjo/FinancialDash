# Security & Code Quality Issues Tracker

**Project:** Finance Dashboard
**Last Updated:** January 2025
**Status:** 🔴 **BLOCKING PRODUCTION** - Critical issues must be fixed

---

## Issue Summary

| Priority | Count | Status |
|----------|-------|--------|
| ✅ Fixed | 2 | Completed |
| 🔴 Critical | 1 | **Must Fix** |
| 🟠 High | 4 | Should Fix |
| 🟡 Medium | 7 | Nice to Have |
| ⚪ Low | 1 | Optional |
| **TOTAL** | **15** | **13 Remaining** |

---

## ✅ Fixed Issues

### ✅ 1. Authentication Bypass Vulnerability
- **Severity:** CRITICAL (CVSS 9.8)
- **File:** `src/lib/auth.ts:40-43`
- **Status:** ✅ **FIXED** - January 2025
- **Solution:** Implemented bcrypt password verification with `bcrypt.compare()`
- **CWE:** CWE-287 (Improper Authentication)

### ✅ 2. Password Storage Without Hashing
- **Severity:** CRITICAL (CVSS 8.1)
- **File:** `src/app/api/auth/register/route.ts:30`
- **Status:** ✅ **FIXED** - January 2025
- **Solution:** Added password hashing with bcrypt (10 rounds), added password field to User model
- **CWE:** CWE-256 (Plaintext Storage of Password)

---

## 🔴 Critical Issues (BLOCKING PRODUCTION)

### 🔴 3. Insecure Direct Object Reference (IDOR)
- **Severity:** CRITICAL (CVSS 8.2)
- **Category:** Security - Broken Access Control
- **CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)
- **Status:** ❌ **NOT FIXED**
- **Priority:** **P0 - Must fix before production**

**Problem:**
API endpoints accept `userId` from query parameters without verifying it matches the authenticated user. This allows users to access OTHER users' financial data.

**Attack Example:**
```bash
# Attacker logged in as user "abc123" can access victim's data:
GET /api/transactions?userId=victim-user-id
# Returns victim's private financial transactions!
```

**Affected Files:**
- `src/app/api/transactions/route.ts` (GET, POST)
- `src/app/api/accounts/route.ts` (GET, POST)
- `src/app/api/categories/route.ts` (GET, POST)
- `src/app/api/dashboard/summary/route.ts` (GET)
- All PUT/DELETE endpoints

**Impact:**
- ☠️ Complete privacy breach
- ☠️ Access to all users' financial data
- ☠️ GDPR/CCPA violations
- ☠️ OWASP A01:2021 - Broken Access Control

**Solution:**
```typescript
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Get authenticated user from session
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // ALWAYS use authenticated user's ID, NEVER from query params
  const authenticatedUserId = session.user.id

  const where: Prisma.TransactionWhereInput = {
    userId: authenticatedUserId, // Enforce user isolation
  }

  const transactions = await prisma.transaction.findMany({ where })
  return NextResponse.json({ transactions })
}
```

**Effort:** Easy (1-2 hours)
**Files to Update:** ~8 API route files

---

## 🟠 High Severity Issues

### 🟠 4. Missing Rate Limiting
- **Severity:** HIGH
- **Category:** Security
- **CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)
- **Status:** ❌ **NOT FIXED**
- **Priority:** P1 - Next sprint

**Problem:**
No rate limiting on any endpoints allows:
- Brute force attacks on authentication
- Credential stuffing attacks
- API abuse and DoS
- Resource exhaustion

**Solution:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 min
})

export const apiLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
})
```

**Apply to:**
- Login endpoint: 5 requests/15 minutes
- Register endpoint: 3 requests/15 minutes
- All API endpoints: 100 requests/minute
- Dashboard: 50 requests/minute

**Effort:** Medium (2-3 hours)

---

### 🟠 5. SQL Injection Risk via Date Parameters
- **Severity:** HIGH
- **Category:** Security
- **CWE:** CWE-89 (SQL Injection)
- **File:** `src/app/api/transactions/route.ts:23-27`
- **Status:** ❌ **NOT FIXED**
- **Priority:** P1 - Next sprint

**Problem:**
User-provided date strings passed directly to `new Date()` without validation.

**Current Code:**
```typescript
if (startDate) where.date.gte = new Date(startDate) // ⚠️ Unvalidated
if (endDate) where.date.lte = new Date(endDate)     // ⚠️ Unvalidated
```

**Solution:**
```typescript
import { z } from 'zod'

const dateSchema = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))

function parseDate(dateString: string): Date | null {
  try {
    dateSchema.parse(dateString)
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null

    // Ensure reasonable date range
    const minDate = new Date('1900-01-01')
    const maxDate = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)

    if (date < minDate || date > maxDate) return null
    return date
  } catch {
    return null
  }
}
```

**Effort:** Easy (30 minutes)

---

### 🟠 6. Missing Input Validation
- **Severity:** HIGH
- **Category:** Security
- **Status:** ❌ **NOT FIXED**
- **Priority:** P1 - Next sprint

**Problem:**
No schema validation with Zod or similar library. All user input accepted without validation.

**Solution:**
```bash
npm install zod
```

```typescript
// src/lib/validations/transaction.ts
import { z } from 'zod'

export const createTransactionSchema = z.object({
  accountId: z.string().cuid(),
  categoryId: z.string().cuid().optional(),
  amount: z.number().positive().max(999999999),
  date: z.string().datetime().or(z.date()),
  description: z.string().max(500).optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()
```

**Apply to all endpoints:**
- Transaction creation/update
- Account creation/update
- Category creation/update
- Registration (email format, password strength)

**Effort:** Medium (3-4 hours)

---

### 🟠 7. Poor Error Handling
- **Severity:** HIGH
- **Category:** Security / Maintainability
- **Status:** ❌ **NOT FIXED**
- **Priority:** P1 - Next sprint

**Problem:**
Generic error messages expose stack traces and internal details.

**Current Code:**
```typescript
catch (error: any) {
  console.error('Registration error:', error)
  return NextResponse.json(
    { error: 'Failed to create user' }, // ⚠️ Too generic
    { status: 500 }
  )
}
```

**Solution:**
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
  }
}

// In API routes
catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  // Log full error server-side
  console.error('Unexpected error:', error)

  // Return generic message to client
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}
```

**Effort:** Medium (2-3 hours)

---

## 🟡 Medium Severity Issues

### 🟡 8. N+1 Query Problem in Dashboard
- **Severity:** MEDIUM
- **Category:** Performance
- **File:** `src/app/api/dashboard/summary/route.ts`
- **Status:** ❌ **NOT FIXED**
- **Priority:** P2

**Problem:**
Multiple sequential database queries instead of using joins/includes.

**Current:**
```typescript
const accounts = await prisma.financeAccount.findMany({ where: { userId } })
// Then for each account...
const transactions = await prisma.transaction.findMany({ where: { accountId } })
```

**Solution:**
```typescript
const accounts = await prisma.financeAccount.findMany({
  where: { userId },
  include: {
    _count: { select: { transactions: true } },
    transactions: {
      take: 10,
      orderBy: { date: 'desc' },
    },
  },
})
```

**Effort:** Easy (1 hour)

---

### 🟡 9. Missing Database Indexes
- **Severity:** MEDIUM
- **Category:** Performance
- **File:** `prisma/schema.prisma`
- **Status:** ❌ **NOT FIXED**
- **Priority:** P2

**Problem:**
No indexes on frequently queried fields.

**Solution:**
```prisma
model Transaction {
  // ... existing fields

  @@index([userId])
  @@index([accountId])
  @@index([categoryId])
  @@index([date])
  @@index([userId, date])
}

model FinanceAccount {
  // ... existing fields

  @@index([userId])
}

model Category {
  // ... existing fields

  @@index([userId, type])
}
```

**Effort:** Easy (30 minutes)

---

### 🟡 10. No API Versioning
- **Severity:** MEDIUM
- **Category:** Architecture
- **Status:** ❌ **NOT FIXED**
- **Priority:** P2

**Problem:**
API routes have no versioning strategy. Breaking changes will affect all clients.

**Solution:**
```
src/app/api/
  └── v1/
      ├── transactions/
      ├── accounts/
      └── categories/
```

**Effort:** Medium (2-3 hours to refactor)

---

### 🟡 11. Hardcoded User ID in Seed
- **Severity:** MEDIUM
- **Category:** Maintainability
- **File:** `prisma/seed.ts:13`
- **Status:** ❌ **NOT FIXED**
- **Priority:** P2

**Problem:**
```typescript
id: 'temp-user-id', // ⚠️ Hardcoded
```

**Solution:**
Remove hardcoded ID, let Prisma generate CUIDs.

**Effort:** Easy (10 minutes)

---

### 🟡 12. Missing TypeScript Strict Null Checks
- **Severity:** MEDIUM
- **Category:** Maintainability
- **File:** `tsconfig.json`
- **Status:** ❌ **NOT FIXED**
- **Priority:** P2

**Problem:**
TypeScript strict mode not fully enabled.

**Solution:**
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Effort:** Medium (1-2 hours to fix resulting errors)

---

### 🟡 13. No Request Logging
- **Severity:** MEDIUM
- **Category:** Maintainability
- **Status:** ❌ **NOT FIXED**
- **Priority:** P2

**Problem:**
No structured logging for debugging production issues.

**Solution:**
```bash
npm install pino pino-pretty
```

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
})
```

**Effort:** Easy (1 hour)

---

### 🟡 14. Missing API Documentation
- **Severity:** MEDIUM
- **Category:** Maintainability
- **Status:** ❌ **NOT FIXED**
- **Priority:** P2

**Problem:**
No inline JSDoc comments for API functions.

**Solution:**
```typescript
/**
 * Fetches all transactions for the authenticated user
 * @param request - Next.js request object
 * @returns JSON response with transactions array
 * @throws 401 if user not authenticated
 * @throws 400 if invalid query parameters
 */
export async function GET(request: NextRequest) {
  // ...
}
```

**Effort:** Medium (2-3 hours)

---

## ⚪ Low Severity Issues

### ⚪ 15. Inconsistent Error Messages
- **Severity:** LOW
- **Category:** Maintainability
- **Status:** ❌ **NOT FIXED**
- **Priority:** P3

**Problem:**
Error messages use different formats across endpoints.

**Examples:**
- `"Email and password are required"`
- `"Failed to create user"`
- `"Unauthorized"`

**Solution:**
Create consistent error message constants.

**Effort:** Easy (30 minutes)

---

## Action Plan

### Phase 1: Critical (Before Production) ⚠️
- [ ] **Fix IDOR vulnerability** (All API endpoints)
  - Estimated: 2 hours
  - Files: 8 API routes

### Phase 2: High Priority (Next Sprint)
- [ ] Implement rate limiting
- [ ] Add input validation with Zod
- [ ] Fix date parameter validation
- [ ] Improve error handling

### Phase 3: Medium Priority (Future Sprint)
- [ ] Fix N+1 queries
- [ ] Add database indexes
- [ ] Implement API versioning
- [ ] Add request logging
- [ ] Enable strict TypeScript

### Phase 4: Low Priority (Nice to Have)
- [ ] Standardize error messages
- [ ] Add inline documentation

---

## Testing Checklist

After fixing each issue, verify:

- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Security scan shows no vulnerabilities
- [ ] Performance benchmarks acceptable
- [ ] Documentation updated

---

## Resources

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CWE Database](https://cwe.mitre.org/)
- [CVSS Calculator](https://www.first.org/cvss/calculator/3.1)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/routing/middleware#security)

---

**Last Updated:** January 2025
**Maintainer:** Finance Dashboard Team
