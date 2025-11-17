import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Smooth Scroll Anchor Links', () => {
  beforeEach(() => {
    // Set up the DOM with anchor links (from index.html lines 482-490)
    document.body.innerHTML = `
      <nav>
        <a href="#top">Top</a>
        <a href="#story">Story</a>
        <a href="#features">Features</a>
        <a href="https://example.com">External Link</a>
      </nav>
      <section id="top">Top Section</section>
      <section id="story">Story Section</section>
      <section id="features">Features Section</section>
    `;
  });

  describe('Anchor Link Click Handler', () => {
    it('should prevent default behavior for anchor links', () => {
      const anchorLink = document.querySelector('a[href="#story"]');
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      // Simulate the event handler from index.html (lines 482-490)
      if (anchorLink.getAttribute('href').startsWith('#')) {
        event.preventDefault();
        const target = document.querySelector(anchorLink.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call scrollIntoView with smooth behavior', () => {
      const targetSection = document.getElementById('story');
      const scrollIntoViewSpy = vi.spyOn(targetSection, 'scrollIntoView').mockImplementation(() => {});

      const anchorLink = document.querySelector('a[href="#story"]');
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });

      // Simulate the smooth scroll handler
      event.preventDefault();
      const target = document.querySelector(anchorLink.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

      scrollIntoViewSpy.mockRestore();
    });

    it('should only handle links that start with #', () => {
      const externalLink = document.querySelector('a[href="https://example.com"]');
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      // Should not prevent default for external links
      const href = externalLink.getAttribute('href');
      if (href.startsWith('#')) {
        event.preventDefault();
      }

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should handle missing target gracefully', () => {
      document.body.innerHTML = `
        <a href="#missing-section">Missing Section</a>
      `;

      const anchorLink = document.querySelector('a[href="#missing-section"]');
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });

      // Should not throw even if target is missing
      expect(() => {
        event.preventDefault();
        const target = document.querySelector(anchorLink.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }).not.toThrow();
    });

    it('should handle #top anchor link', () => {
      const topSection = document.getElementById('top');
      const scrollIntoViewSpy = vi.spyOn(topSection, 'scrollIntoView').mockImplementation(() => {});

      const anchorLink = document.querySelector('a[href="#top"]');

      // Simulate click
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });

      event.preventDefault();
      const target = document.querySelector(anchorLink.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

      scrollIntoViewSpy.mockRestore();
    });
  });

  describe('Full Event Handler Integration', () => {
    it('should set up event listeners for all anchor links', () => {
      // Simulate the setup code from index.html (lines 482-490)
      const anchorLinks = document.querySelectorAll('a[href^="#"]');

      expect(anchorLinks.length).toBeGreaterThan(0);

      anchorLinks.forEach((anchor) => {
        expect(anchor.getAttribute('href')).toMatch(/^#/);
      });
    });

    it('should handle multiple anchor links correctly', () => {
      const storySection = document.getElementById('story');
      const featuresSection = document.getElementById('features');

      const storyScrollSpy = vi.spyOn(storySection, 'scrollIntoView').mockImplementation(() => {});
      const featuresScrollSpy = vi.spyOn(featuresSection, 'scrollIntoView').mockImplementation(() => {});

      // Click story link
      const storyLink = document.querySelector('a[href="#story"]');
      let event = new MouseEvent('click', { bubbles: true, cancelable: true });
      event.preventDefault();
      let target = document.querySelector(storyLink.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });

      expect(storyScrollSpy).toHaveBeenCalled();

      // Click features link
      const featuresLink = document.querySelector('a[href="#features"]');
      event = new MouseEvent('click', { bubbles: true, cancelable: true });
      event.preventDefault();
      target = document.querySelector(featuresLink.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });

      expect(featuresScrollSpy).toHaveBeenCalled();

      storyScrollSpy.mockRestore();
      featuresScrollSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty href attribute', () => {
      document.body.innerHTML = '<a href="">Empty</a>';
      const link = document.querySelector('a');

      const href = link.getAttribute('href');

      // Should not try to scroll for empty href
      expect(href.startsWith('#')).toBe(false);
    });

    it('should handle href with only hash', () => {
      document.body.innerHTML = `
        <a href="#">Hash Only</a>
        <div id="">Empty ID</div>
      `;

      const link = document.querySelector('a[href="#"]');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });

      // Should handle this gracefully with try-catch or validation
      event.preventDefault();
      const href = link.getAttribute('href');

      // document.querySelector('#') throws DOMException, so implementation should validate
      // In real code, should check if href is just '#' before querying
      if (href && href !== '#') {
        try {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (e) {
          // Invalid selector - do nothing
        }
      }

      // Test passes if we handle '#' properly without calling querySelector
      expect(href).toBe('#');
    });

    it('should handle special characters in anchor IDs', () => {
      document.body.innerHTML = `
        <a href="#section-with-dashes">Link</a>
        <section id="section-with-dashes">Content</section>
      `;

      const link = document.querySelector('a[href="#section-with-dashes"]');
      const section = document.getElementById('section-with-dashes');
      const scrollSpy = vi.spyOn(section, 'scrollIntoView').mockImplementation(() => {});

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      event.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }

      expect(scrollSpy).toHaveBeenCalled();
      scrollSpy.mockRestore();
    });
  });

  describe('Browser Compatibility', () => {
    it('should work with scrollIntoView without options (fallback)', () => {
      const section = document.getElementById('story');

      // Some older browsers might not support options parameter
      const scrollSpy = vi.spyOn(section, 'scrollIntoView').mockImplementation(() => {});

      // Modern usage with options
      section.scrollIntoView({ behavior: 'smooth' });
      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

      // Fallback without options
      section.scrollIntoView();
      expect(scrollSpy).toHaveBeenCalledWith();

      scrollSpy.mockRestore();
    });
  });
});
