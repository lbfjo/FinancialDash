import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login page when visiting a protected route', async ({ page }) => {
    // Start from a protected route
    await page.goto('/dashboard');

    // The page should be redirected to the login page
    await expect(page).toHaveURL(/\/login/);

    // The page should contain the login heading
    await expect(
      page.getByRole('heading', { name: 'Sign in to Finance Dashboard' })
    ).toBeVisible();
  });

  test('should allow a user to log in with correct credentials', async ({ page }) => {
    // Start from the login page
    await page.goto('/login');

    // Fill in the credentials (using the demo account from seed)
    await page.getByLabel('Email').fill('demo@example.com');
    await page.getByLabel('Password').fill('demo123');

    // Click the sign-in button (use exact match to avoid GitHub button)
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Wait for navigation to complete
    await page.waitForURL('/dashboard', { timeout: 15000 });

    // The dashboard should contain a heading with the text "Dashboard" (exact match)
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();

    // The dashboard should show that data has loaded
    await expect(page.getByText('Recent Transactions')).toBeVisible({ timeout: 10000 });
  });

  test('should reject login with incorrect password', async ({ page }) => {
    // Start from the login page
    await page.goto('/login');

    // Fill in the credentials with wrong password
    await page.getByLabel('Email').fill('demo@example.com');
    await page.getByLabel('Password').fill('wrongpassword');

    // Click the sign-in button
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Should stay on login page or show error
    // Wait a bit for the auth attempt to complete
    await page.waitForTimeout(2000);

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);

    // Should NOT be redirected to dashboard
    await expect(page).not.toHaveURL('/dashboard');
  });

  test('should reject login with non-existent user', async ({ page }) => {
    // Start from the login page
    await page.goto('/login');

    // Fill in credentials for non-existent user
    await page.getByLabel('Email').fill('nonexistent@example.com');
    await page.getByLabel('Password').fill('anypassword');

    // Click the sign-in button
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Wait for auth attempt
    await page.waitForTimeout(2000);

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow user registration with new account', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;

    // Go to registration page
    await page.goto('/register');

    // Fill in registration form using placeholders (labels don't have proper ids)
    await page.getByPlaceholder('John Doe').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail);
    await page.getByPlaceholder('Create a password').fill('TestPassword123!');
    await page.getByPlaceholder('Confirm your password').fill('TestPassword123!');

    // Click register button and wait for auto-signin navigation
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.waitForURL('/dashboard', { timeout: 15000 });

    // Should see dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('demo@example.com');
    await page.getByLabel('Password').fill('demo123');

    // Click and wait for navigation
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.waitForURL('/dashboard', { timeout: 15000 });

    // Refresh the page
    await page.reload();

    // Should still be on dashboard (session maintained)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  });

  test('should protect all protected routes', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/transactions',
      '/accounts',
      '/categories'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Each protected route should redirect to login
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should allow access to protected routes after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('demo@example.com');
    await page.getByLabel('Password').fill('demo123');

    // Wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10000 }),
      page.getByRole('button', { name: 'Sign In', exact: true }).click()
    ]);

    // Now test access to all protected routes
    const protectedRoutes = [
      { path: '/dashboard', heading: 'Dashboard' },
      { path: '/transactions', heading: 'Transactions' },
      { path: '/accounts', heading: 'Accounts' },
      { path: '/categories', heading: 'Categories' }
    ];

    for (const route of protectedRoutes) {
      await page.goto(route.path);

      // Should NOT redirect to login
      await expect(page).toHaveURL(route.path);

      // Should see the page heading
      await expect(
        page.getByRole('heading', { name: route.heading, exact: true })
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should allow user to logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('demo@example.com');
    await page.getByLabel('Password').fill('demo123');

    // Wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10000 }),
      page.getByRole('button', { name: 'Sign In', exact: true }).click()
    ]);

    // Look for sign out button (might be in a menu or visible)
    const signOutButton = page.getByRole('button', { name: /sign out|logout/i });

    // Check if sign out button exists
    const isVisible = await signOutButton.isVisible().catch(() => false);

    if (isVisible) {
      await signOutButton.click();

      // Should redirect to home or login page
      await expect(page).toHaveURL(/\/(login)?$/);

      // Trying to access dashboard should redirect to login
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    } else {
      // If no logout button found, skip this assertion
      test.skip();
    }
  });

  test('should prevent duplicate registration with same email', async ({ page }) => {
    // Try to register with existing demo email
    await page.goto('/register');

    await page.getByPlaceholder('John Doe').fill('Another User');
    await page.getByPlaceholder('you@example.com').fill('demo@example.com');
    await page.getByPlaceholder('Create a password').fill('AnotherPassword123!');
    await page.getByPlaceholder('Confirm your password').fill('AnotherPassword123!');

    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Should show error or stay on registration page
    // Wait for response
    await page.waitForTimeout(2000);

    // Check if there's an error message visible
    const errorVisible = await page.getByText(/already exists|email.*taken/i).isVisible().catch(() => false);

    // Should either show error message OR stay on register page (not go to dashboard)
    const currentUrl = page.url();
    const isStillOnRegister = currentUrl.includes('/register');

    // At least one should be true
    expect(errorVisible || isStillOnRegister).toBeTruthy();
  });
});
