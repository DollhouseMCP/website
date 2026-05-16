/*
 * Mermaid bootstrap for DollhouseMCP security deep-dive pages.
 *
 * Loaded only on pages with `mermaid: true` in front matter (see default.html).
 * Self-hosted, no inline script, no CDN — keeps the strict `script-src 'self'`
 * CSP intact, which matters most on the security section itself.
 *
 * Handles the site's light/dark theme toggle: site.js flips
 * document.documentElement.dataset.theme, so we re-render diagrams with the
 * matching Mermaid theme when that attribute changes.
 *
 * Mirrors the proven Merview (MerviewIDE/js/renderer.js) approach:
 * startOnLoad:false, securityLevel:'strict', and the 'dark' / 'default'
 * theme pair driven by the active light/dark mode.
 */
(function () {
  "use strict";

  if (typeof window.mermaid === "undefined") {
    return;
  }

  var nodes = Array.prototype.slice.call(
    document.querySelectorAll(".mermaid")
  );
  if (nodes.length === 0) {
    return;
  }

  // Preserve the original diagram source so we can re-render on theme change.
  nodes.forEach(function (el) {
    if (!el.hasAttribute("data-src")) {
      el.setAttribute("data-src", el.textContent);
    }
  });

  function mermaidThemeForSite() {
    // Merview parity: dark mode -> 'dark', otherwise 'default'.
    return document.documentElement.dataset.theme === "dark"
      ? "dark"
      : "default";
  }

  function render() {
    nodes.forEach(function (el) {
      el.removeAttribute("data-processed");
      el.textContent = el.getAttribute("data-src");
      el.innerHTML = el.getAttribute("data-src");
    });

    window.mermaid.initialize({
      startOnLoad: false,
      // Diagrams are authored in-repo, never user input, but 'strict' is the
      // right default to demonstrate on a security page (Merview parity).
      // 'strict' disables htmlLabels, so labels render as safe SVG text.
      securityLevel: "strict",
      theme: mermaidThemeForSite(),
      flowchart: { useMaxWidth: true },
      sequence: { useMaxWidth: true },
      fontFamily: 'Manrope, system-ui, sans-serif'
    });

    try {
      window.mermaid.run({ nodes: nodes });
    } catch (err) {
      /* Leave the source text visible if a diagram fails to parse. */
    }
  }

  render();

  // Re-render when the site theme toggles.
  var lastTheme = document.documentElement.dataset.theme;
  var observer = new MutationObserver(function () {
    var current = document.documentElement.dataset.theme;
    if (current !== lastTheme) {
      lastTheme = current;
      render();
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
})();
