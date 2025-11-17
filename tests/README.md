# DollhouseMCP Website Test Suite

Comprehensive test suite for the DollhouseMCP static website, including unit tests, end-to-end tests, and accessibility tests.

## Overview

This test suite ensures the quality, functionality, and accessibility of the DollhouseMCP website. It includes:

- **Unit Tests**: Test individual JavaScript functions in isolation
- **E2E Tests**: Test user interactions and complete workflows
- **Accessibility Tests**: Ensure WCAG 2.1 AA compliance

## Test Stack

- **Vitest**: Fast unit testing framework with excellent DX
- **@testing-library/dom**: DOM testing utilities
- **Playwright**: Modern E2E testing framework
- **Axe-core**: Accessibility testing engine
- **Happy-DOM**: Lightweight DOM implementation for unit tests

## Installation

Install all dependencies:

```bash
npm install
```

Install Playwright browsers (first time only):

```bash
npx playwright install
```

## Running Tests

### All Tests

Run all unit tests:
```bash
npm test
```

Run all E2E tests:
```bash
npm run test:e2e
```

### Watch Mode

Run tests in watch mode (auto-rerun on file changes):
```bash
npm run test:watch
```

### Coverage

Generate code coverage report:
```bash
npm run test:coverage
```

View coverage report:
```bash
open coverage/index.html
```

### Interactive UI

Run tests with Vitest UI:
```bash
npm run test:ui
```

Run E2E tests with Playwright UI:
```bash
npm run test:e2e:ui
```

### Specific Test Suites

Run only accessibility tests:
```bash
npm run test:a11y
```

Run E2E tests in headed mode (see the browser):
```bash
npm run test:e2e:headed
```

## Test Structure

```
tests/
├── README.md                      # This file
├── setup.js                       # Global test setup
├── unit/                          # Unit tests
│   ├── theme-toggle.test.js      # Theme switching functionality
│   ├── modal.test.js             # Modal show/hide functionality
│   └── smooth-scroll.test.js     # Smooth scrolling navigation
└── e2e/                           # End-to-end tests
    ├── index.spec.js             # Homepage tests
    ├── style-guide.spec.js       # Style guide page tests
    └── accessibility.spec.js      # Accessibility tests
```

## Test Coverage

### Unit Tests

#### Theme Toggle (`tests/unit/theme-toggle.test.js`)
- ✅ Toggle from light to dark theme
- ✅ Toggle from dark to light theme
- ✅ Handle null/invalid theme values
- ✅ Persist theme preference to localStorage
- ✅ Load saved theme on page load
- ✅ Handle localStorage being disabled
- ✅ Update theme icon (style-guide version)
- ✅ Handle rapid multiple toggles

#### Modal Functionality (`tests/unit/modal.test.js`)
- ✅ Show modal when triggered
- ✅ Hide modal on cancel
- ✅ Hide modal on confirm
- ✅ Hide modal when clicking overlay
- ✅ Keep modal open when clicking content
- ✅ Handle multiple show/hide cycles
- ✅ Event propagation handling
- ✅ Accessibility considerations (Escape key)

#### Smooth Scroll (`tests/unit/smooth-scroll.test.js`)
- ✅ Prevent default for anchor links
- ✅ Call scrollIntoView with smooth behavior
- ✅ Only handle links starting with #
- ✅ Handle missing targets gracefully
- ✅ Handle special characters in IDs
- ✅ Browser compatibility fallbacks

### E2E Tests

#### Homepage (`tests/e2e/index.spec.js`)
- ✅ Page loads successfully
- ✅ Navigation header and links
- ✅ Theme toggle functionality
- ✅ Theme persistence across reloads
- ✅ Smooth scroll navigation
- ✅ Content sections display
- ✅ External links work correctly
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Security meta tags present
- ✅ SEO meta tags present
- ✅ Favicons present

#### Style Guide (`tests/e2e/style-guide.spec.js`)
- ✅ Page loads successfully
- ✅ Theme toggle with icon update
- ✅ Modal open/close functionality
- ✅ Modal overlay click behavior
- ✅ Component display (colors, buttons, cards, badges, alerts)
- ✅ Form elements display
- ✅ Code blocks display
- ✅ House icons display
- ✅ Theme impact on components
- ✅ Responsive layout

#### Accessibility (`tests/e2e/accessibility.spec.js`)
- ✅ No automatic accessibility violations
- ✅ WCAG 2.1 AA color contrast compliance
- ✅ Proper heading hierarchy
- ✅ Accessible navigation
- ✅ Accessible links and images
- ✅ Accessible form inputs
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Focus management
- ✅ Touch-friendly targets on mobile
- ✅ Responsive accessibility

## Writing New Tests

### Unit Test Example

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('My Feature', () => {
  beforeEach(() => {
    // Setup before each test
    document.body.innerHTML = '<div id="test"></div>';
  });

  it('should do something', () => {
    const element = document.getElementById('test');
    expect(element).toBeTruthy();
  });
});
```

### E2E Test Example

```javascript
import { test, expect } from '@playwright/test';

test('should interact with page', async ({ page }) => {
  await page.goto('/index.html');

  const button = page.locator('button');
  await button.click();

  await expect(page.locator('.result')).toBeVisible();
});
```

### Accessibility Test Example

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/index.html');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Continuous Integration

These tests are designed to run in CI/CD environments. The Playwright configuration automatically:

- Uses 1 worker in CI for stability
- Retries failed tests 2 times in CI
- Generates HTML reports
- Starts a local web server automatically

## Best Practices

1. **Isolation**: Each test should be independent and not rely on others
2. **Cleanup**: Use `beforeEach` and `afterEach` hooks to clean up state
3. **Descriptive Names**: Test names should clearly describe what they test
4. **Fast Tests**: Keep unit tests fast; use E2E tests for integration scenarios
5. **Accessibility**: Always consider accessibility when writing tests
6. **Assertions**: Each test should have clear assertions

## Troubleshooting

### Tests Failing Locally

1. Make sure all dependencies are installed: `npm install`
2. Clear coverage and cache: `rm -rf coverage .nyc_output`
3. Ensure browsers are installed: `npx playwright install`

### E2E Tests Timing Out

1. Increase timeout in playwright.config.js
2. Use `--headed` mode to see what's happening
3. Add more explicit waits: `await page.waitForTimeout()`

### Accessibility Tests Failing

1. Check violations in the test output
2. Use Playwright UI to inspect the page
3. Manually test with screen readers or browser DevTools

## Contributing

When adding new features:

1. Write unit tests first (TDD approach recommended)
2. Add E2E tests for user-facing features
3. Run accessibility tests to ensure compliance
4. Ensure all tests pass before committing
5. Aim for >80% code coverage

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Axe-core](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## License

See LICENSE file in the root directory.
