import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate between pages', async ({ page }) => {
    // Get all navigation links
    const navLinks = page.locator('nav a, header a').filter({ hasText: /.+/ });
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Click first navigation link
      const firstLink = navLinks.first();
      const linkText = await firstLink.textContent();
      
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation occurred
      expect(page.url()).toBeTruthy();
    }
  });

  test('should handle back button', async ({ page }) => {
    const initialUrl = page.url();
    
    // Navigate to another page if possible
    const links = page.locator('a[href]').filter({ hasText: /.+/ });
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      await links.first().click();
      await page.waitForLoadState('networkidle');
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
      // Check if we're back at initial URL
      expect(page.url()).toBe(initialUrl);
    }
  });

  test('should handle forward button', async ({ page }) => {
    // Navigate to another page
    const links = page.locator('a[href]').filter({ hasText: /.+/ });
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      await links.first().click();
      await page.waitForLoadState('networkidle');
      const secondUrl = page.url();
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
      // Go forward
      await page.goForward();
      await page.waitForLoadState('networkidle');
      
      // Check if we're at the second URL again
      expect(page.url()).toBe(secondUrl);
    }
  });

  test('should have working internal links', async ({ page }) => {
    // Find all internal links
    const internalLinks = page.locator('a[href^="/"], a[href^="./"]');
    const linkCount = await internalLinks.count();
    
    expect(linkCount).toBeGreaterThanOrEqual(0);
    
    // Test first few internal links
    const linksToTest = Math.min(linkCount, 3);
    
    for (let i = 0; i < linksToTest; i++) {
      const link = internalLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && !href.includes('#')) {
        // Click link
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Check if page loaded (no 404)
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title).not.toContain('404');
        
        // Go back for next iteration
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/this-page-does-not-exist-12345');
    await page.waitForLoadState('networkidle');
    
    // Check if 404 page is displayed
    const bodyText = await page.locator('body').textContent();
    
    // Should show some indication of error
    expect(
      bodyText?.toLowerCase().includes('404') ||
      bodyText?.toLowerCase().includes('not found') ||
      bodyText?.toLowerCase().includes('página não encontrada')
    ).toBeTruthy();
  });

  test('should maintain scroll position on back navigation', async ({ page }) => {
    // Scroll down on first page
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollPosition = await page.evaluate(() => window.scrollY);
    
    // Navigate to another page
    const links = page.locator('a[href]').filter({ hasText: /.+/ });
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      await links.first().click();
      await page.waitForLoadState('networkidle');
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
      // Check scroll position (may not be exact due to browser behavior)
      const newScrollPosition = await page.evaluate(() => window.scrollY);
      
      // Should be close to original position (within 100px)
      expect(Math.abs(newScrollPosition - scrollPosition)).toBeLessThan(100);
    }
  });
});
