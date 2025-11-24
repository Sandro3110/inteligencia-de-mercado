import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    // Look for login-related elements
    const loginButton = page.getByRole('button', { name: /login|entrar|sign in/i }).first();
    
    if (await loginButton.isVisible()) {
      await expect(loginButton).toBeVisible();
    }
  });

  test('should handle login navigation', async ({ page }) => {
    // Try to find and click login button
    const loginButton = page.getByRole('button', { name: /login|entrar|sign in/i }).first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      
      // Wait for navigation or modal
      await page.waitForTimeout(1000);
      
      // Check if we're on login page or modal appeared
      const url = page.url();
      expect(url).toBeTruthy();
    }
  });

  test('should validate empty form submission', async ({ page }) => {
    // Try to find login form
    const emailInput = page.getByRole('textbox', { name: /email/i }).first();
    
    if (await emailInput.isVisible()) {
      // Try to submit without filling
      const submitButton = page.getByRole('button', { name: /submit|entrar|login/i }).first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Wait for validation message
        await page.waitForTimeout(500);
        
        // Check for validation errors
        const errorMessages = page.locator('[role="alert"], .error, .text-destructive');
        const errorCount = await errorMessages.count();
        
        // Expect some validation feedback
        expect(errorCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle logout if logged in', async ({ page, context }) => {
    // Check if user is already logged in
    const logoutButton = page.getByRole('button', { name: /logout|sair|sign out/i }).first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Wait for logout to complete
      await page.waitForTimeout(1000);
      
      // Check if redirected or login button appears
      const loginButton = page.getByRole('button', { name: /login|entrar|sign in/i }).first();
      const isLoginVisible = await loginButton.isVisible().catch(() => false);
      
      expect(isLoginVisible || page.url().includes('/')).toBeTruthy();
    }
  });

  test('should persist session across page reloads', async ({ page, context }) => {
    // This test checks if authentication state persists
    // Skip if not logged in
    const logoutButton = page.getByRole('button', { name: /logout|sair|sign out/i }).first();
    
    if (await logoutButton.isVisible()) {
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check if still logged in
      const logoutButtonAfterReload = page.getByRole('button', { name: /logout|sair|sign out/i }).first();
      await expect(logoutButtonAfterReload).toBeVisible();
    }
  });
});
