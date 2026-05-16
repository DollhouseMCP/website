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
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  /*
   * Mermaid 'base' theme tuned to the Atelier design tokens (assets/css/
   * atelier.css) so diagrams read as part of the site, not a bolted-on
   * widget. Values mirror the light/dark token sets verbatim.
   */
  function atelierThemeVariables() {
    var dark = mermaidThemeForSite() === "dark";
    return dark
      ? {
          background: "#0f1522",
          primaryColor: "#161b24",
          primaryTextColor: "#f6f9fd",
          primaryBorderColor: "#7aa7f5",
          lineColor: "#7b93a7",
          secondaryColor: "#37271d",
          tertiaryColor: "#161b24",
          mainBkg: "#161b24",
          nodeBorder: "#7aa7f5",
          clusterBkg: "#0f1522",
          titleColor: "#f6f9fd",
          edgeLabelBackground: "#0f1522",
          fontFamily: "Manrope, system-ui, sans-serif"
        }
      : {
          background: "#ffffff",
          primaryColor: "#eef4ff",
          primaryTextColor: "#0a1020",
          primaryBorderColor: "#1e40af",
          lineColor: "#677893",
          secondaryColor: "#fff2e8",
          tertiaryColor: "#ffffff",
          mainBkg: "#eef4ff",
          nodeBorder: "#1e40af",
          clusterBkg: "#ffffff",
          titleColor: "#0a1020",
          edgeLabelBackground: "#ffffff",
          fontFamily: "Manrope, system-ui, sans-serif"
        };
  }

  function render() {
    nodes.forEach(function (el) {
      el.removeAttribute("data-processed");
      // Restore the original diagram source as text. Mermaid reads the
      // node's textContent, so this is the correct and complete restore;
      // assigning innerHTML as well was redundant (and misleading, since
      // it would re-parse rather than sanitize). securityLevel:'strict'
      // is what handles XSS on Mermaid's side.
      el.textContent = el.getAttribute("data-src");
    });

    window.mermaid.initialize({
      startOnLoad: false,
      // Diagrams are authored in-repo, never user input, but 'strict' is the
      // right default to demonstrate on a security page (Merview parity).
      // 'strict' disables htmlLabels, so labels render as safe SVG text.
      securityLevel: "strict",
      theme: "base",
      themeVariables: atelierThemeVariables(),
      flowchart: { useMaxWidth: true, curve: "basis", padding: 14 },
      sequence: { useMaxWidth: true },
      fontFamily: "Manrope, system-ui, sans-serif"
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
