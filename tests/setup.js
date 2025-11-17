// Test setup file for Vitest
import { beforeEach, afterEach } from 'vitest';

// Global test setup
beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();

  // Reset document.documentElement attributes
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  // Clean up after each test
  localStorage.clear();
  document.body.innerHTML = '';
});
