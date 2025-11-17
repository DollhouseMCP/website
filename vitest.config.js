import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/unit/**/*.test.js'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'tests/**',
        'playwright.config.js',
        'vitest.config.js',
        '**/*.config.js',
        'coverage/**',
        'mockups/**',
        'docs/**',
        'content/**'
      ]
    },
    setupFiles: ['./tests/setup.js']
  }
});
