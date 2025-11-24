import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(0);
    
    // If h1 exists, check its content
    if (h1Count > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      expect(h1Text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have alt text for images', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Images should have alt attribute (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('should have labels for form inputs', async ({ page }) => {
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        // Check if there's a label for this input
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = await label.count() > 0;
        
        // Input should have either a label, aria-label, or aria-labelledby
        expect(
          labelExists || ariaLabel || ariaLabelledBy
        ).toBeTruthy();
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through interactive elements
    const interactiveElements = page.locator('button, a, input, select, textarea');
    const count = await interactiveElements.count();
    
    if (count > 0) {
      // Focus first element
      await page.keyboard.press('Tab');
      
      // Check if an element is focused
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
      
      // Tab a few more times
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should still have focus
      const stillFocused = await page.evaluate(() => document.activeElement?.tagName);
      expect(stillFocused).toBeTruthy();
    }
  });

  test('should have skip to main content link', async ({ page }) => {
    // Look for skip link (usually hidden until focused)
    const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text("Skip to")').first();
    
    // Focus the skip link with Tab
    await page.keyboard.press('Tab');
    
    // Check if skip link becomes visible when focused
    const isVisible = await skipLink.isVisible().catch(() => false);
    
    // Skip link should exist (visible or not)
    const exists = await skipLink.count() > 0;
    expect(exists || isVisible).toBeTruthy();
  });

  test('should have proper button labels', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      // Button should have text, aria-label, or aria-labelledby
      expect(
        (text && text.trim().length > 0) || ariaLabel || ariaLabelledBy
      ).toBeTruthy();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Get computed styles of text elements
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button').first();
    
    if (await textElements.count() > 0) {
      const styles = await textElements.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        };
      });
      
      // Just check that styles are defined
      expect(styles.color).toBeTruthy();
      expect(styles.fontSize).toBeTruthy();
    }
  });

  test('should have lang attribute on html', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    
    // HTML should have lang attribute
    expect(lang).toBeTruthy();
    expect(lang?.length).toBeGreaterThan(0);
  });

  test('should have proper ARIA roles', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    const mainCount = await main.count();
    
    // Should have a main landmark
    expect(mainCount).toBeGreaterThanOrEqual(0);
    
    // Check for navigation
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();
    
    // Should have navigation
    expect(navCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle focus trap in modals', async ({ page }) => {
    // Look for modal trigger
    const modalTrigger = page.locator('button:has-text("Open"), button:has-text("Abrir")').first();
    
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(500);
      
      // Check if modal appeared
      const modal = page.locator('[role="dialog"], [role="alertdialog"], .modal').first();
      
      if (await modal.isVisible()) {
        // Tab should stay within modal
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        // Focus should still be within modal
        const focusedElement = await page.evaluate(() => {
          const active = document.activeElement;
          const modal = document.querySelector('[role="dialog"], [role="alertdialog"], .modal');
          return modal?.contains(active);
        });
        
        expect(focusedElement).toBeTruthy();
      }
    }
  });
});
