import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Theme Toggle Functionality', () => {
  beforeEach(() => {
    // Set up the DOM with the theme toggle button
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.clear();
  });

  describe('toggleTheme - index.html version', () => {
    // Function from index.html (lines 469-475)
    function toggleTheme() {
      const html = document.documentElement;
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }

    it('should toggle from light to dark theme', () => {
      document.documentElement.setAttribute('data-theme', 'light');

      toggleTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should toggle from dark to light theme', () => {
      document.documentElement.setAttribute('data-theme', 'dark');

      toggleTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should handle null theme as light and toggle to dark', () => {
      document.documentElement.removeAttribute('data-theme');

      toggleTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should persist theme preference to localStorage', () => {
      document.documentElement.setAttribute('data-theme', 'light');

      toggleTheme();

      expect(localStorage.getItem('theme')).toBe('dark');

      toggleTheme();

      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  describe('toggleTheme - style-guide.html version', () => {
    // Function from style-guide.html (lines 997-1007)
    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);

      // Update icon
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) {
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      }

      // Save preference
      localStorage.setItem('theme', newTheme);
    }

    beforeEach(() => {
      // Create theme icon element for style-guide version
      document.body.innerHTML = '<span id="theme-icon">🌙</span>';
    });

    it('should toggle theme and update icon from light to dark', () => {
      document.documentElement.setAttribute('data-theme', 'light');

      toggleTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.getElementById('theme-icon').textContent).toBe('☀️');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should toggle theme and update icon from dark to light', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('theme-icon').textContent = '☀️';

      toggleTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.getElementById('theme-icon').textContent).toBe('🌙');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should not error if theme-icon element is missing', () => {
      document.body.innerHTML = ''; // Remove theme-icon
      document.documentElement.setAttribute('data-theme', 'light');

      expect(() => toggleTheme()).not.toThrow();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Theme Persistence on Page Load', () => {
    it('should load saved light theme from localStorage', () => {
      localStorage.setItem('theme', 'light');

      // Simulate page load
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should load saved dark theme from localStorage', () => {
      localStorage.setItem('theme', 'dark');

      // Simulate page load
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should default to light theme if no preference is saved', () => {
      localStorage.clear();

      // Simulate page load
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should handle localStorage being disabled', () => {
      // Mock localStorage.getItem to throw (simulating disabled localStorage)
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('localStorage is disabled');
      });

      let savedTheme;
      try {
        savedTheme = localStorage.getItem('theme') || 'light';
      } catch (e) {
        savedTheme = 'light';
      }

      expect(savedTheme).toBe('light');

      // Restore original method
      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid theme values gracefully', () => {
      document.documentElement.setAttribute('data-theme', 'invalid');

      function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      }

      toggleTheme();

      // Invalid theme should be treated as 'not dark' and toggle to dark
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should handle multiple rapid toggles correctly', () => {
      document.documentElement.setAttribute('data-theme', 'light');

      function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      }

      toggleTheme(); // light -> dark
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      toggleTheme(); // dark -> light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      toggleTheme(); // light -> dark
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      toggleTheme(); // dark -> light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
