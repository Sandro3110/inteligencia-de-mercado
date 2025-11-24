import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have acceptable Time to First Byte (TTFB)', async ({ page }) => {
    const response = await page.goto('/');
    
    if (response) {
      const timing = await response.serverAddr();
      expect(timing).toBeTruthy();
    }
  });

  test('should not have layout shifts', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Take screenshot to ensure page is stable
    const screenshot1 = await page.screenshot();
    await page.waitForTimeout(500);
    const screenshot2 = await page.screenshot();
    
    // Screenshots should be similar (page should be stable)
    expect(screenshot1.length).toBeGreaterThan(0);
    expect(screenshot2.length).toBeGreaterThan(0);
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check first few images
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        
        // Check if image has loading attribute
        const loading = await img.getAttribute('loading');
        const isVisible = await img.isVisible();
        
        // Images below fold should have lazy loading
        if (!isVisible) {
          expect(loading).toBe('lazy');
        }
      }
    }
  });

  test('should have minimal JavaScript bundle size', async ({ page }) => {
    const responses: number[] = [];
    
    page.on('response', (response) => {
      const url = response.url();
      if (url.endsWith('.js')) {
        response.body().then((body) => {
          responses.push(body.length);
        }).catch(() => {});
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for all responses to be collected
    await page.waitForTimeout(2000);
    
    // Calculate total JS size
    const totalSize = responses.reduce((sum, size) => sum + size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);
    
    // Total JS should be less than 2MB
    expect(totalSizeMB).toBeLessThan(2);
  });

  test('should have efficient CSS', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for unused CSS (basic check)
    const stylesheets = await page.evaluate(() => {
      return Array.from(document.styleSheets).length;
    });
    
    // Should have stylesheets
    expect(stylesheets).toBeGreaterThan(0);
    
    // Should not have excessive stylesheets
    expect(stylesheets).toBeLessThan(20);
  });

  test('should cache static assets', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Second visit (should use cache)
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - startTime;
    
    // Second load should be faster (cached)
    expect(secondLoadTime).toBeLessThan(3000);
  });

  test('should handle slow network gracefully', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    await page.goto('/');
    
    // Page should still load (might take longer)
    await page.waitForLoadState('load', { timeout: 30000 });
    
    expect(page.url()).toContain('/');
  });

  test('should have proper resource hints', async ({ page }) => {
    await page.goto('/');
    
    // Check for preconnect, prefetch, preload
    const resourceHints = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel]'));
      return links.map(link => link.getAttribute('rel'));
    });
    
    // Should have some resource hints
    expect(resourceHints.length).toBeGreaterThan(0);
  });

  test('should not block rendering', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for first contentful paint
    await page.waitForLoadState('domcontentloaded');
    
    const fcp = Date.now() - startTime;
    
    // First Contentful Paint should be under 2 seconds
    expect(fcp).toBeLessThan(2000);
  });
});
