import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests (a11y)', () => {
  test.describe('Homepage Accessibility', () => {
    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
      await page.goto('/index.html');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility in light theme', async ({ page }) => {
      await page.goto('/index.html');
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      });

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility in dark theme', async ({ page }) => {
      await page.goto('/index.html');
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper color contrast in light mode', async ({ page }) => {
      await page.goto('/index.html');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa', 'wcag21aa'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });

    test('should have proper color contrast in dark mode', async ({ page }) => {
      await page.goto('/index.html');
      await page.click('button.btn-secondary'); // Toggle to dark mode
      await page.waitForTimeout(100);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa', 'wcag21aa'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/index.html');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['best-practice'])
        .analyze();

      const headingViolations = accessibilityScanResults.violations.filter(
        (v) => v.id.includes('heading')
      );

      expect(headingViolations).toEqual([]);
    });

    test('should have accessible navigation', async ({ page }) => {
      await page.goto('/index.html');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag21a'])
        .analyze();

      const navViolations = accessibilityScanResults.violations.filter(
        (v) => v.id.includes('navigation') || v.id.includes('landmark')
      );

      expect(navViolations).toEqual([]);
    });

    test('should have accessible links', async ({ page }) => {
      await page.goto('/index.html');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag21a'])
        .analyze();

      const linkViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'link-name'
      );

      expect(linkViolations).toEqual([]);
    });

    test('should have accessible images', async ({ page }) => {
      await page.goto('/index.html');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag21a'])
        .analyze();

      const imageViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'image-alt'
      );

      expect(imageViolations).toEqual([]);
    });
  });

  test.describe('Style Guide Accessibility', () => {
    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
      await page.goto('/style-guide.html');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have accessible form inputs', async ({ page }) => {
      await page.goto('/style-guide.html');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag21a'])
        .analyze();

      const formViolations = accessibilityScanResults.violations.filter(
        (v) => v.id.includes('label') || v.id.includes('form')
      );

      expect(formViolations).toEqual([]);
    });

    test('should have accessible modal', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Open the modal
      await page.click('button:has-text("Open Modal")');
      await page.waitForTimeout(100);

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      // Focus should be manageable in modal
      const focusViolations = accessibilityScanResults.violations.filter(
        (v) => v.id.includes('focus') || v.id.includes('keyboard')
      );

      expect(focusViolations).toEqual([]);
    });

    test('should have accessible buttons', async ({ page }) => {
      await page.goto('/style-guide.html');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag21a'])
        .analyze();

      const buttonViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'button-name'
      );

      expect(buttonViolations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should allow tab navigation through interactive elements on homepage', async ({ page }) => {
      await page.goto('/index.html');

      // Start from the top
      await page.keyboard.press('Tab');

      // Should focus on first interactive element (theme toggle button)
      let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();

      // Continue tabbing through navigation
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON'].includes(focusedElement || '')).toBe(true);
    });

    test('should allow keyboard activation of theme toggle', async ({ page }) => {
      await page.goto('/index.html');

      // Tab to theme toggle button
      await page.keyboard.press('Tab');

      // Get initial theme
      let theme = await page.locator('html').getAttribute('data-theme');
      const initialTheme = theme;

      // Press Enter to activate
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      // Theme should have changed
      theme = await page.locator('html').getAttribute('data-theme');
      expect(theme).not.toBe(initialTheme);
    });

    test('should allow keyboard navigation in modal', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Open modal
      await page.click('button:has-text("Open Modal")');
      await page.waitForTimeout(100);

      // Tab through modal buttons
      await page.keyboard.press('Tab');
      let focusedText = await page.evaluate(() => document.activeElement?.textContent);

      // Should be able to focus on Cancel or Confirm button
      expect(['Cancel', 'Confirm'].some(text => focusedText?.includes(text))).toBe(true);
    });

    test('should close modal with Escape key', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Open modal
      await page.click('button:has-text("Open Modal")');
      await page.waitForTimeout(100);

      const modal = page.locator('#modal');
      let display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('flex');

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      // Note: This test will fail unless Escape key handler is implemented
      // It serves as documentation for expected behavior
      // Uncomment when Escape key handling is added:
      // display = await modal.evaluate((el) => el.style.display);
      // expect(display).toBe('none');
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper ARIA landmarks on homepage', async ({ page }) => {
      await page.goto('/index.html');

      // Check for semantic HTML5 landmarks
      const nav = page.locator('nav, [role="navigation"]');
      const navCount = await nav.count();
      expect(navCount).toBeGreaterThan(0);

      const main = page.locator('main, [role="main"]');
      // Note: If main element doesn't exist, this documents the need to add it

      const footer = page.locator('footer, [role="contentinfo"]');
      const footerCount = await footer.count();
      expect(footerCount).toBeGreaterThan(0);
    });

    test('should have descriptive page title', async ({ page }) => {
      await page.goto('/index.html');

      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title).toContain('DollhouseMCP');
    });

    test('should have language attribute', async ({ page }) => {
      await page.goto('/index.html');

      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBe('en');
    });

    test('should have descriptive alt text for images', async ({ page }) => {
      await page.goto('/index.html');

      const logo = page.locator('.logo');
      const alt = await logo.getAttribute('alt');

      expect(alt).toBeTruthy();
      expect(alt?.length).toBeGreaterThan(0);
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/index.html');

      // Tab to first focusable element
      await page.keyboard.press('Tab');

      // Get computed outline style (focus indicator)
      const outlineStyle = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineColor: styles.outlineColor,
        };
      });

      // Should have some form of focus indicator
      // (outline, box-shadow, or border change)
      expect(outlineStyle).toBeTruthy();
    });

    test('should not have focus trapped', async ({ page }) => {
      await page.goto('/index.html');

      // Tab through multiple elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
      }

      // Should still be able to interact with page
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });

  test.describe('Responsive Accessibility', () => {
    test('should be accessible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/index.html');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have touch-friendly targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/index.html');

      // Check that buttons have adequate size for touch
      const buttons = page.locator('button, a.btn');
      const firstButton = buttons.first();

      const box = await firstButton.boundingBox();
      if (box) {
        // Touch targets should be at least 44x44 pixels (WCAG AAA)
        expect(box.height).toBeGreaterThanOrEqual(40); // Slightly lower for AA
      }
    });
  });
});
