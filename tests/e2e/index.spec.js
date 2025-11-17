import { test, expect } from '@playwright/test';

test.describe('DollhouseMCP Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/index.html');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/DollhouseMCP/);

    // Check that main heading is visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('DollhouseMCP');
  });

  test('should display navigation header with logo and links', async ({ page }) => {
    await page.goto('/index.html');

    // Check navigation elements
    await expect(page.locator('.nav-header')).toBeVisible();
    await expect(page.locator('.logo')).toBeVisible();

    // Check navigation links
    const homeLink = page.locator('nav a[href="#top"]');
    const aboutLink = page.locator('nav a[href="#story"]');
    const githubLink = page.locator('nav a[href*="github.com"]');

    await expect(homeLink).toBeVisible();
    await expect(aboutLink).toBeVisible();
    await expect(githubLink).toBeVisible();
  });

  test('should have theme toggle button', async ({ page }) => {
    await page.goto('/index.html');

    const themeButton = page.locator('button.btn-secondary', { hasText: /🌙|☀️/ });
    await expect(themeButton).toBeVisible();
  });

  test.describe('Theme Toggle', () => {
    test('should toggle theme from light to dark', async ({ page }) => {
      await page.goto('/index.html');

      // Check initial theme is light
      const htmlElement = page.locator('html');
      let theme = await htmlElement.getAttribute('data-theme');
      expect(theme).toBe('light');

      // Click theme toggle button
      await page.click('button.btn-secondary');

      // Wait for theme to change
      await page.waitForTimeout(100);

      // Check theme changed to dark
      theme = await htmlElement.getAttribute('data-theme');
      expect(theme).toBe('dark');

      // Verify localStorage was updated
      const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(storedTheme).toBe('dark');
    });

    test('should toggle theme from dark to light', async ({ page }) => {
      await page.goto('/index.html');

      // Set initial theme to dark
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      });

      // Click theme toggle button
      await page.click('button.btn-secondary');

      // Wait for theme to change
      await page.waitForTimeout(100);

      // Check theme changed to light
      const theme = await page.locator('html').getAttribute('data-theme');
      expect(theme).toBe('light');
    });

    test('should persist theme preference across page reloads', async ({ page }) => {
      await page.goto('/index.html');

      // Toggle to dark theme
      await page.click('button.btn-secondary');
      await page.waitForTimeout(100);

      // Reload page
      await page.reload();

      // Check theme is still dark
      const theme = await page.locator('html').getAttribute('data-theme');
      expect(theme).toBe('dark');
    });
  });

  test.describe('Smooth Scroll Navigation', () => {
    test('should scroll to story section when clicking About link', async ({ page }) => {
      await page.goto('/index.html');

      // Click the About/Story link
      await page.click('a[href="#story"]');

      // Wait for scroll animation
      await page.waitForTimeout(500);

      // Check that story section is in viewport
      const storySection = page.locator('#story');
      await expect(storySection).toBeInViewport();
    });

    test('should scroll to top when clicking Home link', async ({ page }) => {
      await page.goto('/index.html');

      // First scroll down to story section
      await page.click('a[href="#story"]');
      await page.waitForTimeout(500);

      // Then click Home to scroll back to top
      await page.click('nav a[href="#top"]');
      await page.waitForTimeout(500);

      // Check that hero section is in viewport
      const heroSection = page.locator('.hero');
      await expect(heroSection).toBeInViewport();
    });

    test('should handle logo click to scroll to top', async ({ page }) => {
      await page.goto('/index.html');

      // Scroll down first
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(300);

      // Click logo
      await page.click('.logo');
      await page.waitForTimeout(500);

      // Should be back at top
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(100);
    });
  });

  test.describe('Content Sections', () => {
    test('should display hero section with CTA buttons', async ({ page }) => {
      await page.goto('/index.html');

      const heroSection = page.locator('.hero');
      await expect(heroSection).toBeVisible();

      // Check subtitle
      const subtitle = page.locator('.hero-subtitle');
      await expect(subtitle).toBeVisible();
      await expect(subtitle).toContainText(/customizations/i);

      // Check CTA buttons
      const githubButton = page.locator('.hero-buttons a.btn-primary');
      const storyButton = page.locator('.hero-buttons a.btn-secondary');

      await expect(githubButton).toBeVisible();
      await expect(storyButton).toBeVisible();
    });

    test('should display feature cards', async ({ page }) => {
      await page.goto('/index.html');

      // Check that feature grid exists and has cards
      const featureCards = page.locator('.feature-card');
      const count = await featureCards.count();

      expect(count).toBeGreaterThan(0);

      // Check that first feature card has expected structure
      const firstCard = featureCards.first();
      await expect(firstCard.locator('.feature-icon')).toBeVisible();
      await expect(firstCard.locator('.feature-title')).toBeVisible();
      await expect(firstCard.locator('.feature-description')).toBeVisible();
    });

    test('should display story section', async ({ page }) => {
      await page.goto('/index.html');

      const storySection = page.locator('#story');
      await expect(storySection).toBeVisible();

      const storyContent = storySection.locator('.story-content');
      await expect(storyContent).toBeVisible();

      // Check for key story content
      await expect(storyContent).toContainText(/DollhouseMCP/i);
    });

    test('should display code example section', async ({ page }) => {
      await page.goto('/index.html');

      const codeExample = page.locator('.code-example');
      await expect(codeExample).toBeVisible();

      // Check for installation commands
      await expect(codeExample).toContainText(/npm install/i);
    });

    test('should display footer with links', async ({ page }) => {
      await page.goto('/index.html');

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Check for GitHub and LinkedIn links
      const githubLink = footer.locator('a[href*="github.com"]');
      const linkedinLink = footer.locator('a[href*="linkedin.com"]');

      await expect(githubLink).toBeVisible();
      await expect(linkedinLink).toBeVisible();
    });
  });

  test.describe('External Links', () => {
    test('should have correct GitHub repository links', async ({ page }) => {
      await page.goto('/index.html');

      // Check all GitHub links point to the correct repository
      const githubLinks = page.locator('a[href*="github.com/DollhouseMCP"]');
      const count = await githubLinks.count();

      expect(count).toBeGreaterThan(0);

      // Verify first GitHub link has target="_blank" for external opening
      const firstGithubLink = githubLinks.first();
      const target = await firstGithubLink.getAttribute('target');
      expect(target).toBe('_blank');
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      await page.goto('/index.html');

      // Check that content is visible and layout adapts
      await expect(page.locator('.hero')).toBeVisible();
      await expect(page.locator('.nav-header')).toBeVisible();

      // Feature cards should stack vertically on mobile
      const featureGrid = page.locator('.feature-grid');
      await expect(featureGrid).toBeVisible();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
      await page.goto('/index.html');

      await expect(page.locator('.hero')).toBeVisible();
      await expect(page.locator('.feature-grid')).toBeVisible();
    });

    test('should be responsive on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size
      await page.goto('/index.html');

      await expect(page.locator('.hero')).toBeVisible();
      await expect(page.locator('.feature-grid')).toBeVisible();
    });
  });

  test.describe('Security and Metadata', () => {
    test('should have security meta tags', async ({ page }) => {
      await page.goto('/index.html');

      // Check for security-related meta tags
      const contentType = page.locator('meta[http-equiv="X-Content-Type-Options"]');
      await expect(contentType).toHaveCount(1);

      const frameOptions = page.locator('meta[http-equiv="X-Frame-Options"]');
      await expect(frameOptions).toHaveCount(1);

      const csp = page.locator('meta[http-equiv="Content-Security-Policy"]');
      await expect(csp).toHaveCount(1);
    });

    test('should have proper SEO meta tags', async ({ page }) => {
      await page.goto('/index.html');

      // Check description meta tag
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveCount(1);

      const content = await description.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
    });

    test('should have favicon links', async ({ page }) => {
      await page.goto('/index.html');

      // Check for favicon links
      const favicon32 = page.locator('link[rel="icon"][sizes="32x32"]');
      await expect(favicon32).toHaveCount(1);

      const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
      await expect(appleTouchIcon).toHaveCount(1);
    });
  });
});
