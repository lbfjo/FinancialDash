# E2E Tests Documentation

This directory contains end-to-end tests for the Finance Dashboard application using Playwright.

## Test Files

### 1. `e2e/auth.spec.ts` - Authentication Tests

Comprehensive tests for the authentication system:

✅ **Authentication Flow Tests:**
- Redirects unauthenticated users to login
- Successful login with correct credentials
- Rejects login with incorrect password
- Rejects login with non-existent user
- User registration and subsequent login
- Session persistence after page refresh
- Protection of all routes (dashboard, transactions, accounts, categories)
- Access to protected routes after authentication
- User logout functionality
- Prevention of duplicate email registration

**Key Test:**
```typescript
test('should allow a user to log in with correct credentials')
```
This test verifies the password hashing fix by logging in with the demo user (demo@example.com / demo123).

### 2. `e2e/security.spec.ts` - Security Tests

Tests for security vulnerabilities and IDOR prevention:

🔒 **IDOR Prevention Tests:**
- Prevents access to other users' transactions via API manipulation
- Prevents access to other users' accounts via API manipulation
- Prevents access to other users' categories via API manipulation
- Prevents access to other users' dashboard data via API manipulation
- Prevents creating transactions for other users

🛡️ **Authentication Hardening Tests:**
- Verifies password hashing is working correctly
- Enforces case-sensitive passwords
- Does not expose user existence through error messages

**Critical Test:**
```typescript
test('should NOT allow users to access other users transactions via API')
```
This test will **FAIL** until the IDOR vulnerability is fixed (Issue #3 in SECURITY_ISSUES.md).

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Specific Test
```bash
npx playwright test -g "should allow a user to log in"
```

### Debug Tests
```bash
npx playwright test --debug
```

## Test Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL:** http://localhost:3000
- **Browsers:** Chromium, Firefox, WebKit
- **Test Directory:** `./tests/e2e`
- **Auto-start dev server:** Yes (runs `npm run dev`)
- **Parallel execution:** Yes (in CI)
- **Retries:** 2 in CI, 0 locally

## Prerequisites

Before running tests:

1. **Database must be set up and seeded:**
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

2. **Environment variables must be configured:**
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `GITHUB_CLIENT_ID` (for OAuth tests)
   - `GITHUB_CLIENT_SECRET` (for OAuth tests)

3. **Dev server can be started manually or auto-started by Playwright**

## Test Data

Tests use the following demo account (created by seed script):
- **Email:** demo@example.com
- **Password:** demo123

Some tests also create unique users on-the-fly using timestamps:
```typescript
const uniqueEmail = `test-${Date.now()}@example.com`;
```

## Current Test Status

### ✅ Passing Tests (Expected)
- All authentication flow tests should pass
- Password hashing tests should pass
- Session management tests should pass

### ⚠️ Failing Tests (Expected Until Fixed)
The following tests will **FAIL** until the IDOR vulnerability is fixed:

```
tests/e2e/security.spec.ts:
  ❌ should NOT allow users to access other users transactions via API
  ❌ should NOT allow users to access other users accounts via API
  ❌ should NOT allow users to access other users categories via API
  ❌ should NOT allow users to access other users dashboard data via API
  ❌ should NOT allow creating transactions for other users
```

**These failures are expected** because the application currently has an IDOR vulnerability (Issue #3 in `SECURITY_ISSUES.md`).

Once the IDOR fix is implemented (enforcing user isolation in API endpoints), these tests should pass.

## Coverage

### Authentication Coverage
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Registration flow
- ✅ Session persistence
- ✅ Route protection
- ✅ Password hashing verification
- ⚠️ OAuth flow (basic test only)

### Security Coverage
- ✅ IDOR vulnerability detection
- ✅ Password case sensitivity
- ✅ User enumeration prevention
- ⚠️ Rate limiting (not yet implemented)
- ⚠️ Input validation (not yet implemented)

## Adding New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');

    // Act
    await page.getByLabel('Email').fill('test@example.com');

    // Assert
    await expect(page).toHaveURL('/expected-url');
  });
});
```

### Best Practices
1. Use descriptive test names starting with "should"
2. Group related tests in `test.describe()` blocks
3. Clean up test data after tests (if needed)
4. Use `page.waitForTimeout()` sparingly - prefer specific element waits
5. Test both happy paths and error cases
6. Use unique identifiers for test data (timestamps)

## CI/CD Integration

Tests are designed to run in CI with:
- Automatic retries (2 attempts)
- Single worker for consistency
- HTML report generation
- Automatic dev server startup

Example GitHub Actions workflow:
```yaml
- name: Run E2E Tests
  run: npm run test:e2e
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests fail with "Target closed"
- Increase timeout in test: `{ timeout: 10000 }`
- Check if dev server is running

### Tests fail with "Timeout waiting for element"
- Verify element selector is correct
- Check if data has loaded
- Increase timeout if needed

### Authentication tests fail
- Verify database is seeded
- Check demo user credentials (demo@example.com / demo123)
- Verify AUTH_SECRET is set

### IDOR tests fail
- **This is expected** until Issue #3 is fixed
- See `SECURITY_ISSUES.md` for the fix

## Next Steps

1. **Fix IDOR Vulnerability** - Implement user isolation in API endpoints
2. **Add Rate Limiting Tests** - Once rate limiting is implemented
3. **Add Input Validation Tests** - Once Zod validation is added
4. **Add Performance Tests** - Test response times
5. **Add Accessibility Tests** - Use Playwright's accessibility features

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Runner](https://playwright.dev/docs/test-runners)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Security Issues Tracker](../SECURITY_ISSUES.md)
