(() => {
  const storageKey = "dollhousemcp-theme";
  const root = document.documentElement;
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const themeToggleIcon = document.getElementById("theme-toggle-icon");
  const themeToggleLabel = document.getElementById("theme-toggle-label");
  const mediaDark = globalThis.matchMedia("(prefers-color-scheme: dark)");
  const interactiveSelector = "a, button, input, textarea, select";

  const closeNavigation = () => {
    if (!menuToggle || !siteNav) {
      return;
    }
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("open");
  };

  const parseSafeSameOriginUrl = (value) => {
    if (!value) {
      return null;
    }

    try {
      const url = new URL(value, globalThis.location.href);
      if ((url.protocol !== "http:" && url.protocol !== "https:") || url.origin !== globalThis.location.origin) {
        return null;
      }
      return url;
    } catch {
      return null;
    }
  };

  const getStoredTheme = () => localStorage.getItem(storageKey);

  const getPreferredTheme = () => {
    const savedTheme = getStoredTheme();
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return mediaDark.matches ? "dark" : "light";
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    const nextThemeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    if (themeToggleIcon) {
      themeToggleIcon.textContent = theme === "dark" ? "☀" : "☾";
    }
    if (themeToggleLabel) {
      themeToggleLabel.textContent = nextThemeLabel;
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", nextThemeLabel);
      themeToggle.setAttribute("title", nextThemeLabel);
    }
  };

  const initNavigation = () => {
    if (!menuToggle || !siteNav) {
      return;
    }

    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeNavigation();
        return;
      }

      menuToggle.setAttribute("aria-expanded", "true");
      siteNav.classList.add("open");
    });

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Node) || !siteNav.classList.contains("open")) {
        return;
      }

      if (menuToggle.contains(event.target) || siteNav.contains(event.target)) {
        return;
      }

      closeNavigation();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !siteNav.classList.contains("open")) {
        return;
      }

      closeNavigation();
      menuToggle.focus();
    });
  };

  const initThemeToggle = () => {
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    const syncSystemTheme = () => {
      const savedTheme = getStoredTheme();
      if (savedTheme === "light" || savedTheme === "dark") {
        return;
      }
      applyTheme(mediaDark.matches ? "dark" : "light");
    };

    if (typeof mediaDark.addEventListener === "function") {
      mediaDark.addEventListener("change", syncSystemTheme);
    } else if (typeof mediaDark.addListener === "function") {
      mediaDark.addListener(syncSystemTheme);
    }

    if (!themeToggle) {
      return;
    }

    themeToggle.addEventListener("click", () => {
      const current = root.dataset.theme === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  };

  const initClickableCard = (card) => {
    const target = card.dataset.cardLink;
    const targetUrl = parseSafeSameOriginUrl(target);
    if (!targetUrl) {
      return;
    }

    const go = () => {
      globalThis.location.assign(targetUrl.href);
    };

    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");

    card.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest(interactiveSelector)) {
        return;
      }
      go();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      go();
    });
  };

  const initClickableCards = () => {
    const clickableCards = document.querySelectorAll("[data-card-link]");
    clickableCards.forEach(initClickableCard);
  };

  const bindClick = (element, handler) => {
    if (!element) {
      return;
    }
    element.addEventListener("click", handler);
  };

  const initScreenshotViewer = (viewer) => {
    const stage = viewer.querySelector("[data-viewer-stage]");
    const image = viewer.querySelector("[data-viewer-image]");
    const status = viewer.querySelector("[data-viewer-status]");
    const thumbs = Array.from(viewer.querySelectorAll("[data-viewer-thumb]"));
    if (!stage || !image || thumbs.length === 0) {
      return;
    }

    let currentIndex = 0;
    let sizeMode = "fit";
    let resizeFrame = null;
    let disconnectObserver = null;

    const updateStatus = () => {
      if (status) {
        status.textContent = `Page ${currentIndex + 1} of ${thumbs.length}`;
      }
    };

    const resetStageScroll = () => {
      stage.scrollLeft = 0;
      stage.scrollTop = 0;
    };

    const applySizeMode = () => {
      if (sizeMode === "fit") {
        image.style.width = "100%";
        image.style.maxWidth = "100%";
        image.style.height = "auto";
        resetStageScroll();
        return;
      }

      if (sizeMode === "fit-height") {
        image.style.height = `${Math.max(stage.clientHeight, 1)}px`;
        image.style.width = "auto";
        image.style.maxWidth = "none";
        resetStageScroll();
        return;
      }

      image.style.width = "";
      image.style.maxWidth = "none";
      image.style.height = "auto";
      resetStageScroll();
    };

    const setSizeMode = (nextMode) => {
      sizeMode = nextMode;
      applySizeMode();
    };

    const updateThumbState = () => {
      thumbs.forEach((thumb, idx) => {
        thumb.classList.toggle("is-active", idx === currentIndex);
      });
    };

    const loadPage = (nextIndex) => {
      currentIndex = (nextIndex + thumbs.length) % thumbs.length;
      const active = thumbs[currentIndex];
      const { src, alt = "" } = active.dataset;
      const imageUrl = parseSafeSameOriginUrl(src);
      if (!imageUrl) {
        return;
      }

      updateThumbState();
      image.src = imageUrl.href;
      image.alt = alt;
      applySizeMode();
      updateStatus();
    };

    const onArrowKeyNav = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        loadPage(currentIndex + 1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        loadPage(currentIndex - 1);
      }
    };

    const onResize = () => {
      if (sizeMode === "actual" || resizeFrame !== null) {
        return;
      }

      resizeFrame = globalThis.requestAnimationFrame(() => {
        resizeFrame = null;
        applySizeMode();
      });
    };

    const cleanup = () => {
      if (resizeFrame !== null) {
        globalThis.cancelAnimationFrame(resizeFrame);
        resizeFrame = null;
      }
      globalThis.removeEventListener("resize", onResize);
      disconnectObserver?.disconnect();
    };

    thumbs.forEach((thumb, idx) => {
      thumb.addEventListener("click", () => loadPage(idx));
    });

    bindClick(viewer.querySelector("[data-action='prev']"), () => loadPage(currentIndex - 1));
    bindClick(viewer.querySelector("[data-action='next']"), () => loadPage(currentIndex + 1));
    bindClick(viewer.querySelector("[data-action='fit']"), () => setSizeMode("fit"));
    bindClick(viewer.querySelector("[data-action='fit-height']"), () => setSizeMode("fit-height"));
    bindClick(viewer.querySelector("[data-action='actual']"), () => setSizeMode("actual"));

    viewer.addEventListener("keydown", onArrowKeyNav);
    stage.addEventListener("click", () => stage.focus());
    globalThis.addEventListener("resize", onResize);
    if (document.body && "MutationObserver" in globalThis) {
      disconnectObserver = new MutationObserver(() => {
        if (viewer.isConnected) {
          return;
        }
        cleanup();
      });
      disconnectObserver.observe(document.body, { childList: true, subtree: true });
    }

    loadPage(0);
  };

  const initScreenshotViewers = () => {
    const viewers = document.querySelectorAll("[data-screenshot-viewer]");
    viewers.forEach(initScreenshotViewer);
  };

  const handleRevealEntries = (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  };

  const initRevealAnimations = () => {
    const revealItems = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in globalThis) || revealItems.length === 0) {
      revealItems.forEach((item) => item.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => handleRevealEntries(entries, obs),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
  };

  initNavigation();
  initThemeToggle();
  initClickableCards();
  initScreenshotViewers();
  initRevealAnimations();
})();
