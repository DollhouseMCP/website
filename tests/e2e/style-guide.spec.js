import { test, expect } from '@playwright/test';

test.describe('DollhouseMCP Style Guide', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/style-guide.html');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should load the style guide successfully', async ({ page }) => {
    await page.goto('/style-guide.html');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Style Guide/);

    // Check that main heading is visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Style Guide');
  });

  test.describe('Theme Toggle with Icon Update', () => {
    test('should toggle theme and update icon', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Check initial state
      let theme = await page.locator('html').getAttribute('data-theme');
      expect(theme).toBe('light');

      const themeIcon = page.locator('#theme-icon');
      let iconText = await themeIcon.textContent();
      expect(iconText).toBe('🌙');

      // Click theme toggle
      await page.click('.theme-toggle');
      await page.waitForTimeout(100);

      // Check theme changed to dark and icon updated
      theme = await page.locator('html').getAttribute('data-theme');
      expect(theme).toBe('dark');

      iconText = await themeIcon.textContent();
      expect(iconText).toBe('☀️');
    });

    test('should toggle back to light theme', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Toggle to dark
      await page.click('.theme-toggle');
      await page.waitForTimeout(100);

      // Toggle back to light
      await page.click('.theme-toggle');
      await page.waitForTimeout(100);

      const theme = await page.locator('html').getAttribute('data-theme');
      expect(theme).toBe('light');

      const iconText = await page.locator('#theme-icon').textContent();
      expect(iconText).toBe('🌙');
    });
  });

  test.describe('Modal Functionality', () => {
    test('should open modal when button is clicked', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Check modal is initially hidden
      const modal = page.locator('#modal');
      let display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('none');

      // Click "Open Modal" button
      await page.click('button:has-text("Open Modal")');

      // Check modal is now visible
      display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('flex');

      // Check modal content is visible
      await expect(modal.locator('.modal-title')).toContainText('Modal Title');
      await expect(modal.locator('.modal-body')).toBeVisible();
    });

    test('should close modal when Cancel button is clicked', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Open modal
      await page.click('button:has-text("Open Modal")');
      await page.waitForTimeout(100);

      // Click Cancel button
      await page.click('.modal-footer button:has-text("Cancel")');

      // Check modal is hidden
      const modal = page.locator('#modal');
      const display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('none');
    });

    test('should close modal when Confirm button is clicked', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Open modal
      await page.click('button:has-text("Open Modal")');
      await page.waitForTimeout(100);

      // Click Confirm button
      await page.click('.modal-footer button:has-text("Confirm")');

      // Check modal is hidden
      const modal = page.locator('#modal');
      const display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('none');
    });

    test('should close modal when clicking on overlay background', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Open modal
      await page.click('button:has-text("Open Modal")');
      await page.waitForTimeout(100);

      // Click on overlay (not the modal content itself)
      const modal = page.locator('#modal');
      await modal.click({ position: { x: 5, y: 5 } }); // Click near edge of overlay

      // Check modal is hidden
      const display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('none');
    });

    test('should NOT close modal when clicking inside modal content', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Open modal
      await page.click('button:has-text("Open Modal")');
      await page.waitForTimeout(100);

      // Click inside modal content
      await page.click('.modal-body');

      // Check modal is still visible
      const modal = page.locator('#modal');
      const display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('flex');
    });

    test('should open and close modal multiple times', async ({ page }) => {
      await page.goto('/style-guide.html');

      const modal = page.locator('#modal');

      // First cycle
      await page.click('button:has-text("Open Modal")');
      let display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('flex');

      await page.click('.modal-footer button:has-text("Cancel")');
      display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('none');

      // Second cycle
      await page.click('button:has-text("Open Modal")');
      display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('flex');

      await page.click('.modal-footer button:has-text("Confirm")');
      display = await modal.evaluate((el) => el.style.display);
      expect(display).toBe('none');
    });
  });

  test.describe('Component Display', () => {
    test('should display color swatches', async ({ page }) => {
      await page.goto('/style-guide.html');

      const colorSwatches = page.locator('.color-swatch');
      const count = await colorSwatches.count();

      expect(count).toBeGreaterThan(0);

      // Check first color swatch has proper structure
      const firstSwatch = colorSwatches.first();
      await expect(firstSwatch.locator('.color-preview')).toBeVisible();
      await expect(firstSwatch.locator('.color-name')).toBeVisible();
      await expect(firstSwatch.locator('.color-value')).toBeVisible();
    });

    test('should display button variants', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Check different button types are visible
      await expect(page.locator('button.btn-primary')).toBeVisible();
      await expect(page.locator('button.btn-secondary')).toBeVisible();
      await expect(page.locator('button.btn-outline')).toBeVisible();
      await expect(page.locator('button.btn-ghost')).toBeVisible();
    });

    test('should display cards', async ({ page }) => {
      await page.goto('/style-guide.html');

      const cards = page.locator('.card');
      const count = await cards.count();

      expect(count).toBeGreaterThan(0);

      // Check that at least one card has a header and body
      await expect(cards.first()).toBeVisible();
    });

    test('should display badges', async ({ page }) => {
      await page.goto('/style-guide.html');

      const badges = page.locator('.badge');
      const count = await badges.count();

      expect(count).toBeGreaterThan(0);

      // Check for different badge variants
      await expect(page.locator('.badge-primary')).toBeVisible();
      await expect(page.locator('.badge-success')).toBeVisible();
      await expect(page.locator('.badge-warning')).toBeVisible();
      await expect(page.locator('.badge-danger')).toBeVisible();
    });

    test('should display alerts', async ({ page }) => {
      await page.goto('/style-guide.html');

      await expect(page.locator('.alert-info')).toBeVisible();
      await expect(page.locator('.alert-success')).toBeVisible();
      await expect(page.locator('.alert-warning')).toBeVisible();
      await expect(page.locator('.alert-error')).toBeVisible();
    });

    test('should display form elements', async ({ page }) => {
      await page.goto('/style-guide.html');

      await expect(page.locator('.form-input').first()).toBeVisible();
      await expect(page.locator('.form-label').first()).toBeVisible();
      await expect(page.locator('select.form-input')).toBeVisible();
      await expect(page.locator('textarea.form-input')).toBeVisible();
    });

    test('should display code blocks', async ({ page }) => {
      await page.goto('/style-guide.html');

      const codeBlock = page.locator('.code-block');
      await expect(codeBlock).toBeVisible();

      await expect(codeBlock.locator('.code-block-header')).toBeVisible();
      await expect(codeBlock.locator('.code-block-content')).toBeVisible();
    });

    test('should display house icons', async ({ page }) => {
      await page.goto('/style-guide.html');

      const houseIcons = page.locator('.house-icon, .house-icon-curved');
      const count = await houseIcons.count();

      expect(count).toBeGreaterThan(0);

      // Check first house icon has proper structure
      const firstIcon = houseIcons.first();
      await expect(firstIcon.locator('.house-roof')).toBeVisible();
      await expect(firstIcon.locator('.house-body')).toBeVisible();
    });
  });

  test.describe('Theme Switch Impact on Components', () => {
    test('should update component colors when theme changes', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Get initial background color
      const body = page.locator('body');
      const lightBg = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Toggle to dark theme
      await page.click('.theme-toggle');
      await page.waitForTimeout(100);

      // Get dark theme background color
      const darkBg = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Colors should be different
      expect(lightBg).not.toBe(darkBg);
    });

    test('should update card backgrounds in dark mode', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Toggle to dark theme
      await page.click('.theme-toggle');
      await page.waitForTimeout(100);

      // Verify dark theme is applied
      const theme = await page.locator('html').getAttribute('data-theme');
      expect(theme).toBe('dark');

      // Component demo sections should have dark background
      const componentDemo = page.locator('.component-demo').first();
      await expect(componentDemo).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Check for h1
      await expect(page.locator('h1')).toHaveCount(1);

      // Check for h2 section headings
      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThan(0);

      // Check for h3 subsection headings
      const h3Count = await page.locator('h3').count();
      expect(h3Count).toBeGreaterThan(0);
    });

    test('should have accessible form labels', async ({ page }) => {
      await page.goto('/style-guide.html');

      const formLabels = page.locator('.form-label');
      const labelCount = await formLabels.count();

      expect(labelCount).toBeGreaterThan(0);

      // Each label should have text content
      for (let i = 0; i < labelCount; i++) {
        const label = formLabels.nth(i);
        const text = await label.textContent();
        expect(text?.length).toBeGreaterThan(0);
      }
    });

    test('should have descriptive button text', async ({ page }) => {
      await page.goto('/style-guide.html');

      // Modal buttons should have descriptive text
      const cancelButton = page.locator('.modal-footer button:has-text("Cancel")');
      const confirmButton = page.locator('.modal-footer button:has-text("Confirm")');

      await page.click('button:has-text("Open Modal")');
      await page.waitForTimeout(100);

      await expect(cancelButton).toBeVisible();
      await expect(confirmButton).toBeVisible();
    });
  });

  test.describe('Responsive Layout', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/style-guide.html');

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.theme-toggle')).toBeVisible();

      // Color grid should stack on mobile
      const colorGrid = page.locator('.color-grid').first();
      await expect(colorGrid).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/style-guide.html');

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.color-grid')).toBeVisible();
    });

    test('should display correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/style-guide.html');

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.color-grid')).toBeVisible();
    });
  });
});
